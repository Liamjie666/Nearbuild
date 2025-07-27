#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NeraBuild 硬件数据爬虫
支持淘宝和京东官方自营硬件数据抓取
"""

import os
import sys
import time
import json
import logging
import asyncio
import schedule
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
import pymongo
from redis import Redis
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class HardwareItem:
    """硬件商品数据结构"""
    name: str
    brand: str
    model: str
    category: str
    price: float
    original_price: Optional[float] = None
    stock: int = 0
    image: Optional[str] = None
    images: List[str] = None
    specs: Dict[str, Any] = None
    platform: Dict[str, Any] = None
    url: str = ""
    
    def __post_init__(self):
        if self.images is None:
            self.images = []
        if self.specs is None:
            self.specs = {}
        if self.platform is None:
            self.platform = {}

class TaobaoCrawler:
    """淘宝硬件数据爬虫"""
    
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.base_url = "https://s.taobao.com"
        self.headers = {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
    def search_hardware(self, category: str, keywords: List[str]) -> List[HardwareItem]:
        """搜索硬件商品"""
        items = []
        
        for keyword in keywords:
            try:
                # 构建搜索URL
                search_url = f"{self.base_url}/search"
                params = {
                    'q': keyword,
                    'sort': 'sale-desc',  # 按销量排序
                    'filter': 'reserve_price[0,]',  # 价格过滤
                    'tab': 'all'
                }
                
                response = self.session.get(search_url, params=params, headers=self.headers)
                response.raise_for_status()
                
                # 解析搜索结果
                soup = BeautifulSoup(response.text, 'html.parser')
                product_cards = soup.find_all('div', class_='item')
                
                for card in product_cards[:20]:  # 限制每个关键词最多20个商品
                    try:
                        item = self._parse_taobao_item(card, category)
                        if item:
                            items.append(item)
                    except Exception as e:
                        logger.error(f"解析淘宝商品失败: {e}")
                        continue
                        
                time.sleep(2)  # 避免请求过快
                
            except Exception as e:
                logger.error(f"淘宝搜索失败 {keyword}: {e}")
                continue
                
        return items
    
    def _parse_taobao_item(self, card, category: str) -> Optional[HardwareItem]:
        """解析淘宝商品卡片"""
        try:
            # 提取商品信息
            title_elem = card.find('div', class_='title')
            if not title_elem:
                return None
                
            title = title_elem.get_text(strip=True)
            
            # 提取价格
            price_elem = card.find('div', class_='price')
            price = 0.0
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = self._extract_price(price_text)
            
            # 提取图片
            img_elem = card.find('img')
            image = ""
            if img_elem and img_elem.get('src'):
                image = urljoin(self.base_url, img_elem['src'])
            
            # 提取链接
            link_elem = card.find('a')
            url = ""
            if link_elem and link_elem.get('href'):
                url = urljoin(self.base_url, link_elem['href'])
            
            # 解析品牌和型号
            brand, model = self._parse_brand_model(title)
            
            # 解析规格
            specs = self._parse_specs(title, category)
            
            return HardwareItem(
                name=title,
                brand=brand,
                model=model,
                category=category,
                price=price,
                image=image,
                url=url,
                specs=specs,
                platform={
                    'taobao': {
                        'itemId': self._extract_item_id(url),
                        'shopId': '',
                        'shopName': '',
                        'url': url,
                        'rating': 0.0,
                        'salesCount': 0
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"解析淘宝商品卡片失败: {e}")
            return None
    
    def _extract_price(self, price_text: str) -> float:
        """提取价格"""
        import re
        price_match = re.search(r'[\d,]+\.?\d*', price_text)
        if price_match:
            return float(price_match.group().replace(',', ''))
        return 0.0
    
    def _parse_brand_model(self, title: str) -> tuple:
        """解析品牌和型号"""
        # 常见硬件品牌
        brands = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'ASRock', 
                 'Corsair', 'Kingston', 'Samsung', 'Western Digital', 'Seagate',
                 'EVGA', 'Cooler Master', 'NZXT', 'Fractal Design', 'be quiet!',
                 'Thermaltake', 'Phanteks', 'Lian Li', '华硕', '微星', '技嘉',
                 '七彩虹', '影驰', '索泰', '铭瑄', '华擎', '金士顿', '海盗船',
                 '三星', '西数', '希捷', '酷冷至尊', '恩杰', '分形工艺']
        
        brand = "未知"
        model = title
        
        for b in brands:
            if b.lower() in title.lower():
                brand = b
                model = title.replace(b, '').strip()
                break
                
        return brand, model
    
    def _parse_specs(self, title: str, category: str) -> Dict[str, Any]:
        """解析硬件规格"""
        specs = {}
        
        if category == 'cpu':
            # 解析CPU规格
            import re
            cores_match = re.search(r'(\d+)核', title)
            if cores_match:
                specs['cores'] = int(cores_match.group(1))
                
            threads_match = re.search(r'(\d+)线程', title)
            if threads_match:
                specs['threads'] = int(threads_match.group(1))
                
            clock_match = re.search(r'(\d+\.?\d*)GHz', title)
            if clock_match:
                specs['baseClock'] = float(clock_match.group(1))
                
        elif category == 'gpu':
            # 解析GPU规格
            memory_match = re.search(r'(\d+)GB', title)
            if memory_match:
                specs['gpuMemory'] = int(memory_match.group(1))
                
        elif category == 'ram':
            # 解析内存规格
            capacity_match = re.search(r'(\d+)GB', title)
            if capacity_match:
                specs['ramCapacity'] = int(capacity_match.group(1))
                
            speed_match = re.search(r'(\d+)MHz', title)
            if speed_match:
                specs['speed'] = int(speed_match.group(1))
                
        elif category == 'storage':
            # 解析存储规格
            capacity_match = re.search(r'(\d+)GB', title)
            if capacity_match:
                specs['storageCapacity'] = int(capacity_match.group(1))
                
            if 'SSD' in title.upper():
                specs['type'] = 'SSD'
            elif 'HDD' in title.upper() or '机械' in title:
                specs['type'] = 'HDD'
                
        return specs
    
    def _extract_item_id(self, url: str) -> str:
        """提取商品ID"""
        import re
        item_match = re.search(r'id=(\d+)', url)
        if item_match:
            return item_match.group(1)
        return ""

class JDCrawler:
    """京东硬件数据爬虫"""
    
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.base_url = "https://search.jd.com"
        self.headers = {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
    def search_hardware(self, category: str, keywords: List[str]) -> List[HardwareItem]:
        """搜索硬件商品"""
        items = []
        
        for keyword in keywords:
            try:
                # 构建搜索URL
                search_url = f"{self.base_url}/Search"
                params = {
                    'keyword': keyword,
                    'enc': 'utf-8',
                    'wq': keyword,
                    'pvid': str(int(time.time() * 1000))
                }
                
                response = self.session.get(search_url, params=params, headers=self.headers)
                response.raise_for_status()
                
                # 解析搜索结果
                soup = BeautifulSoup(response.text, 'html.parser')
                product_items = soup.find_all('div', class_='gl-item')
                
                for item in product_items[:20]:  # 限制每个关键词最多20个商品
                    try:
                        hardware_item = self._parse_jd_item(item, category)
                        if hardware_item:
                            items.append(hardware_item)
                    except Exception as e:
                        logger.error(f"解析京东商品失败: {e}")
                        continue
                        
                time.sleep(2)  # 避免请求过快
                
            except Exception as e:
                logger.error(f"京东搜索失败 {keyword}: {e}")
                continue
                
        return items
    
    def _parse_jd_item(self, item, category: str) -> Optional[HardwareItem]:
        """解析京东商品"""
        try:
            # 提取商品信息
            title_elem = item.find('em')
            if not title_elem:
                return None
                
            title = title_elem.get_text(strip=True)
            
            # 提取价格
            price_elem = item.find('div', class_='p-price')
            price = 0.0
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = self._extract_price(price_text)
            
            # 提取图片
            img_elem = item.find('img')
            image = ""
            if img_elem and img_elem.get('src'):
                image = urljoin(self.base_url, img_elem['src'])
            
            # 提取链接
            link_elem = item.find('a')
            url = ""
            if link_elem and link_elem.get('href'):
                url = urljoin(self.base_url, link_elem['href'])
            
            # 解析品牌和型号
            brand, model = self._parse_brand_model(title)
            
            # 解析规格
            specs = self._parse_specs(title, category)
            
            return HardwareItem(
                name=title,
                brand=brand,
                model=model,
                category=category,
                price=price,
                image=image,
                url=url,
                specs=specs,
                platform={
                    'jd': {
                        'skuId': self._extract_sku_id(url),
                        'shopId': '',
                        'shopName': '',
                        'url': url,
                        'rating': 0.0,
                        'salesCount': 0
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"解析京东商品失败: {e}")
            return None
    
    def _extract_price(self, price_text: str) -> float:
        """提取价格"""
        import re
        price_match = re.search(r'[\d,]+\.?\d*', price_text)
        if price_match:
            return float(price_match.group().replace(',', ''))
        return 0.0
    
    def _parse_brand_model(self, title: str) -> tuple:
        """解析品牌和型号"""
        # 常见硬件品牌
        brands = ['Intel', 'AMD', 'NVIDIA', 'ASUS', 'MSI', 'GIGABYTE', 'ASRock', 
                 'Corsair', 'Kingston', 'Samsung', 'Western Digital', 'Seagate',
                 'EVGA', 'Cooler Master', 'NZXT', 'Fractal Design', 'be quiet!',
                 'Thermaltake', 'Phanteks', 'Lian Li', '华硕', '微星', '技嘉',
                 '七彩虹', '影驰', '索泰', '铭瑄', '华擎', '金士顿', '海盗船',
                 '三星', '西数', '希捷', '酷冷至尊', '恩杰', '分形工艺']
        
        brand = "未知"
        model = title
        
        for b in brands:
            if b.lower() in title.lower():
                brand = b
                model = title.replace(b, '').strip()
                break
                
        return brand, model
    
    def _parse_specs(self, title: str, category: str) -> Dict[str, Any]:
        """解析硬件规格"""
        specs = {}
        
        if category == 'cpu':
            # 解析CPU规格
            import re
            cores_match = re.search(r'(\d+)核', title)
            if cores_match:
                specs['cores'] = int(cores_match.group(1))
                
            threads_match = re.search(r'(\d+)线程', title)
            if threads_match:
                specs['threads'] = int(threads_match.group(1))
                
            clock_match = re.search(r'(\d+\.?\d*)GHz', title)
            if clock_match:
                specs['baseClock'] = float(clock_match.group(1))
                
        elif category == 'gpu':
            # 解析GPU规格
            memory_match = re.search(r'(\d+)GB', title)
            if memory_match:
                specs['gpuMemory'] = int(memory_match.group(1))
                
        elif category == 'ram':
            # 解析内存规格
            capacity_match = re.search(r'(\d+)GB', title)
            if capacity_match:
                specs['ramCapacity'] = int(capacity_match.group(1))
                
            speed_match = re.search(r'(\d+)MHz', title)
            if speed_match:
                specs['speed'] = int(speed_match.group(1))
                
        elif category == 'storage':
            # 解析存储规格
            capacity_match = re.search(r'(\d+)GB', title)
            if capacity_match:
                specs['storageCapacity'] = int(capacity_match.group(1))
                
            if 'SSD' in title.upper():
                specs['type'] = 'SSD'
            elif 'HDD' in title.upper() or '机械' in title:
                specs['type'] = 'HDD'
                
        return specs
    
    def _extract_sku_id(self, url: str) -> str:
        """提取SKU ID"""
        import re
        sku_match = re.search(r'/(\d+)\.html', url)
        if sku_match:
            return sku_match.group(1)
        return ""

class HardwareCrawler:
    """硬件数据爬虫主类"""
    
    def __init__(self):
        # 初始化数据库连接
        self.mongo_client = pymongo.MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        self.db = self.mongo_client['nerabuild']
        self.hardware_collection = self.db['hardware']
        
        # 初始化Redis连接
        self.redis_client = Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/'))
        
        # 初始化爬虫
        self.taobao_crawler = TaobaoCrawler()
        self.jd_crawler = JDCrawler()
        
        # 硬件类别和关键词
        self.hardware_keywords = {
            'cpu': ['Intel i7', 'Intel i9', 'AMD Ryzen 7', 'AMD Ryzen 9', 'CPU处理器'],
            'gpu': ['RTX 4090', 'RTX 4080', 'RTX 4070', 'RX 7900', 'RX 7800', '显卡'],
            'motherboard': ['Z790', 'B760', 'X670', 'B650', '主板'],
            'ram': ['DDR5', 'DDR4', '内存条', '16GB', '32GB'],
            'storage': ['SSD', 'NVMe', '固态硬盘', '机械硬盘'],
            'psu': ['电源', '850W', '1000W', '金牌电源'],
            'case': ['机箱', 'ATX机箱', 'ITX机箱'],
            'cooler': ['散热器', '水冷', '风冷', 'CPU散热']
        }
        
    def crawl_all_hardware(self):
        """爬取所有硬件数据"""
        logger.info("开始爬取硬件数据...")
        
        for category, keywords in self.hardware_keywords.items():
            logger.info(f"爬取 {category} 类别...")
            
            # 爬取淘宝数据
            taobao_items = self.taobao_crawler.search_hardware(category, keywords)
            logger.info(f"淘宝 {category}: 找到 {len(taobao_items)} 个商品")
            
            # 爬取京东数据
            jd_items = self.jd_crawler.search_hardware(category, keywords)
            logger.info(f"京东 {category}: 找到 {len(jd_items)} 个商品")
            
            # 合并数据并去重
            all_items = taobao_items + jd_items
            unique_items = self._deduplicate_items(all_items)
            
            # 保存到数据库
            self._save_items(unique_items)
            
            logger.info(f"{category} 类别完成，保存 {len(unique_items)} 个商品")
            
            # 避免请求过快
            time.sleep(5)
    
    def _deduplicate_items(self, items: List[HardwareItem]) -> List[HardwareItem]:
        """去重商品"""
        seen = set()
        unique_items = []
        
        for item in items:
            # 使用品牌+型号作为唯一标识
            key = f"{item.brand}_{item.model}"
            if key not in seen:
                seen.add(key)
                unique_items.append(item)
                
        return unique_items
    
    def _save_items(self, items: List[HardwareItem]):
        """保存商品到数据库"""
        for item in items:
            try:
                # 转换为字典格式
                item_dict = {
                    'name': item.name,
                    'brand': item.brand,
                    'model': item.model,
                    'category': item.category,
                    'price': item.price,
                    'originalPrice': item.original_price,
                    'stock': item.stock,
                    'image': item.image,
                    'images': item.images,
                    'specs': item.specs,
                    'platform': item.platform,
                    'model3D': self._generate_3d_config(item),
                    'createdAt': datetime.now(),
                    'updatedAt': datetime.now()
                }
                
                # 检查是否已存在
                existing = self.hardware_collection.find_one({
                    'brand': item.brand,
                    'model': item.model,
                    'category': item.category
                })
                
                if existing:
                    # 更新现有记录
                    self.hardware_collection.update_one(
                        {'_id': existing['_id']},
                        {
                            '$set': {
                                'price': item.price,
                                'originalPrice': item.original_price,
                                'stock': item.stock,
                                'image': item.image,
                                'updatedAt': datetime.now()
                            }
                        }
                    )
                else:
                    # 插入新记录
                    self.hardware_collection.insert_one(item_dict)
                    
            except Exception as e:
                logger.error(f"保存商品失败 {item.name}: {e}")
                continue
    
    def _generate_3d_config(self, item: HardwareItem) -> Dict[str, Any]:
        """生成3D模型配置"""
        # 根据类别生成不同的3D配置
        configs = {
            'cpu': {
                'type': 'box',
                'dimensions': [0.04, 0.04, 0.04],
                'color': '#808080',
                'material': 'metal',
                'features': ['heatsink'],
                'position': [0, 0.05, 0],
                'rotation': [0, 0, 0]
            },
            'gpu': {
                'type': 'box',
                'dimensions': [0.25, 0.12, 0.04],
                'color': '#404040',
                'material': 'metal',
                'features': ['fans', 'rgb'],
                'position': [0, 0.06, 0.15],
                'rotation': [0, 0, 0]
            },
            'motherboard': {
                'type': 'box',
                'dimensions': [0.3, 0.24, 0.02],
                'color': '#202020',
                'material': 'plastic',
                'features': ['rgb'],
                'position': [0, 0, 0],
                'rotation': [0, 0, 0]
            },
            'ram': {
                'type': 'box',
                'dimensions': [0.13, 0.03, 0.01],
                'color': '#606060',
                'material': 'plastic',
                'features': ['rgb'],
                'position': [-0.05, 0.03, 0.05],
                'rotation': [0, 0, 0]
            },
            'storage': {
                'type': 'box',
                'dimensions': [0.1, 0.07, 0.02],
                'color': '#505050',
                'material': 'metal',
                'features': [],
                'position': [0.1, 0.02, 0.05],
                'rotation': [0, 0, 0]
            },
            'psu': {
                'type': 'box',
                'dimensions': [0.15, 0.08, 0.14],
                'color': '#303030',
                'material': 'metal',
                'features': [],
                'position': [0.2, -0.1, 0],
                'rotation': [0, 0, 0]
            },
            'case': {
                'type': 'box',
                'dimensions': [0.4, 0.4, 0.2],
                'color': '#101010',
                'material': 'metal',
                'features': ['fans'],
                'position': [0, 0, 0],
                'rotation': [0, 0, 0]
            },
            'cooler': {
                'type': 'cylinder',
                'dimensions': [0.08, 0.08, 0.08],
                'color': '#707070',
                'material': 'metal',
                'features': ['fans'],
                'position': [0, 0.08, 0],
                'rotation': [0, 0, 0]
            }
        }
        
        return configs.get(item.category, configs['cpu'])

def main():
    """主函数"""
    crawler = HardwareCrawler()
    
    try:
        crawler.crawl_all_hardware()
        logger.info("硬件数据爬取完成！")
    except Exception as e:
        logger.error(f"爬取失败: {e}")
    finally:
        crawler.mongo_client.close()
        crawler.redis_client.close()

if __name__ == "__main__":
    main() 