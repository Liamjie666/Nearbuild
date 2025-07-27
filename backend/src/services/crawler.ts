import axios from 'axios';
import { HardwareItem, HardwareCategory } from '../types/hardware';

export interface CrawlerResult {
  success: boolean;
  data: HardwareItem[];
  message?: string;
}

export interface PlatformItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  shop: string;
  sales: number;
  rating: number;
  url: string;
  image: string;
  specs: any;
}

export class DataCrawler {
  private static readonly TAOBAO_API_BASE = 'https://s.taobao.com/api';
  private static readonly JD_API_BASE = 'https://search.jd.com/api';
  
  // 模拟淘宝搜索
  static async searchTaobao(query: string, category: string): Promise<PlatformItem[]> {
    console.log(`🔍 模拟淘宝搜索: ${query} (${category})`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const mockData: PlatformItem[] = [];
    const brands = ['华硕', '微星', '技嘉', '七彩虹', '影驰', '索泰', '铭瑄', '盈通'];
    const shops = ['华硕官方旗舰店', '微星官方旗舰店', '技嘉官方旗舰店', '七彩虹官方旗舰店'];
    
    // 根据分类生成不同的模拟数据
    for (let i = 1; i <= 10; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const shop = shops[Math.floor(Math.random() * shops.length)];
      const basePrice = this.getBasePrice(category);
      const price = basePrice + Math.floor(Math.random() * 500);
      const originalPrice = price + Math.floor(Math.random() * 200);
      
      mockData.push({
        id: `taobao-${category}-${i}`,
        title: `${brand} ${query} ${this.getModelSuffix(category)}`,
        price,
        originalPrice,
        shop,
        sales: Math.floor(Math.random() * 1000) + 100,
        rating: 4.5 + Math.random() * 0.5,
        url: `https://item.taobao.com/item.htm?id=${Math.random().toString(36).substr(2, 9)}`,
        image: `https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=${encodeURIComponent(brand)}`,
        specs: this.generateSpecs(category)
      });
    }
    
    return mockData.sort((a, b) => a.price - b.price);
  }
  
  // 模拟京东搜索
  static async searchJD(query: string, category: string): Promise<PlatformItem[]> {
    console.log(`🔍 模拟京东搜索: ${query} (${category})`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 800));
    
    const mockData: PlatformItem[] = [];
    const brands = ['华硕', '微星', '技嘉', '七彩虹', '影驰', '索泰', '铭瑄', '盈通'];
    const shops = ['华硕京东自营旗舰店', '微星京东自营旗舰店', '技嘉京东自营旗舰店'];
    
    // 根据分类生成不同的模拟数据
    for (let i = 1; i <= 8; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const shop = shops[Math.floor(Math.random() * shops.length)];
      const basePrice = this.getBasePrice(category);
      const price = basePrice + Math.floor(Math.random() * 400);
      const originalPrice = price + Math.floor(Math.random() * 150);
      
      mockData.push({
        id: `jd-${category}-${i}`,
        title: `${brand} ${query} ${this.getModelSuffix(category)}`,
        price,
        originalPrice,
        shop,
        sales: Math.floor(Math.random() * 800) + 200,
        rating: 4.6 + Math.random() * 0.4,
        url: `https://item.jd.com/${Math.random().toString(36).substr(2, 9)}.html`,
        image: `https://via.placeholder.com/200x200/E74C3C/FFFFFF?text=${encodeURIComponent(brand)}`,
        specs: this.generateSpecs(category)
      });
    }
    
    return mockData.sort((a, b) => a.price - b.price);
  }
  
  // 转换为硬件项目格式
  static convertToHardwareItem(item: PlatformItem, category: string): HardwareItem {
    const brand = this.extractBrand(item.title);
    const model = this.extractModel(item.title);
    
          return {
        name: item.title,
        brand,
        model,
        category: category as any,
        price: item.price,
        originalPrice: item.originalPrice,
        stock: Math.floor(Math.random() * 50) + 10,
        image: item.image,
        specs: this.generateSpecs(category),
        model3D: this.generateModel3D(category),
        platform: {
          taobao: {
            itemId: item.id,
            shopId: `shop_${Math.random().toString(36).substr(2, 6)}`,
            shopName: item.shop,
            url: item.url,
            rating: item.rating,
            salesCount: item.sales
          },
          jd: {
            skuId: item.id,
            shopId: `jd_shop_${Math.random().toString(36).substr(2, 6)}`,
            shopName: item.shop,
            url: item.url,
            rating: item.rating,
            salesCount: item.sales
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
  }
  
  // 获取基础价格
  private static getBasePrice(category: string): number {
    const prices: { [key: string]: number } = {
      cpu: 1500,
      gpu: 2000,
      motherboard: 800,
      ram: 300,
      storage: 400,
      psu: 500,
      case: 300,
      cooler: 200
    };
    return prices[category] || 1000;
  }
  
  // 获取型号后缀
  private static getModelSuffix(category: string): string {
    const suffixes: { [key: string]: string[] } = {
      cpu: ['K', 'KF', 'X', 'KS', 'F'],
      gpu: ['OC', 'Gaming', 'AORUS', 'ROG', 'Gaming X'],
      motherboard: ['Gaming', 'AORUS', 'ROG', 'Pro', 'Elite'],
      ram: ['RGB', 'Gaming', 'Vengeance', 'Dominator'],
      storage: ['Pro', 'Plus', 'Ultra', 'Gaming'],
      psu: ['Gaming', 'Pro', 'Plus', 'Gold'],
      case: ['Gaming', 'Pro', 'Elite', 'RGB'],
      cooler: ['RGB', 'Gaming', 'Pro', 'Elite']
    };
    const categorySuffixes = suffixes[category] || ['Standard'];
    return categorySuffixes[Math.floor(Math.random() * categorySuffixes.length)];
  }
  
  // 生成规格信息
  private static generateSpecs(category: string): any {
    const specs: { [key: string]: any } = {
      cpu: {
        cores: 8 + Math.floor(Math.random() * 8),
        threads: 16 + Math.floor(Math.random() * 16),
        baseClock: 3.0 + Math.random() * 2.0,
        cpuBoostClock: 4.0 + Math.random() * 2.0,
        cpuTdp: 65 + Math.floor(Math.random() * 100),
        socket: 'LGA1700',
        architecture: 'Intel 13th Gen'
      },
      gpu: {
        gpuMemory: 8 + Math.floor(Math.random() * 8),
        gpuMemoryType: 'GDDR6',
        gpuBoostClock: 1800 + Math.floor(Math.random() * 400),
        gpuTdp: 200 + Math.floor(Math.random() * 150),
        length: 250 + Math.floor(Math.random() * 100),
        width: 120 + Math.floor(Math.random() * 20),
        height: 40 + Math.floor(Math.random() * 20)
      },
      motherboard: {
        chipset: 'B760',
        mbFormFactor: 'ATX',
        memorySlots: 4,
        maxMemory: 128,
        mbMemoryType: 'DDR4',
        pciSlots: 3,
        m2Slots: 2,
        sataPorts: 6
      },
      ram: {
        ramCapacity: 16,
        speed: 3200 + Math.floor(Math.random() * 800),
        timing: 'CL16',
        voltage: 1.35,
        memoryType: 'DDR4'
      },
      storage: {
        storageCapacity: 1000,
        type: 'SSD',
        interface: 'NVMe',
        readSpeed: 3000 + Math.floor(Math.random() * 2000),
        writeSpeed: 2000 + Math.floor(Math.random() * 1500)
      },
      psu: {
        wattage: 650 + Math.floor(Math.random() * 350),
        efficiency: '80+ Gold',
        modular: 'Full',
        certification: '80+ Gold'
      },
      case: {
        caseFormFactor: 'ATX',
        maxGpuLength: 350,
        maxCpuCoolerHeight: 165,
        maxPsuLength: 180,
        fanMounts: 6,
        includedFans: 2
      },
      cooler: {
        coolerType: 'Air',
        fanSize: 120,
        noiseLevel: 25 + Math.floor(Math.random() * 15),
        rgb: Math.random() > 0.5,
        coolerHeight: 160
      }
    };
    
    return specs[category] || {};
  }
  
  // 生成3D模型配置
  private static generateModel3D(category: string): any {
    const models: { [key: string]: any } = {
      cpu: {
        type: 'box',
        dimensions: [0.4, 0.4, 0.1],
        color: '#2A2A2A',
        material: 'metal',
        features: ['heatsink'],
        position: [0, 0.2, 0.02],
        rotation: [0, 0, 0]
      },
      gpu: {
        type: 'box',
        dimensions: [0.3, 0.15, 0.05],
        color: '#1E3A8A',
        material: 'metal',
        features: ['fans', 'rgb'],
        position: [0, 0.1, 0.05],
        rotation: [0, 0, 0]
      },
      motherboard: {
        type: 'box',
        dimensions: [0.3, 0.25, 0.02],
        color: '#374151',
        material: 'plastic',
        features: ['slots', 'connectors'],
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      },
      ram: {
        type: 'box',
        dimensions: [0.13, 0.03, 0.005],
        color: '#7C3AED',
        material: 'plastic',
        features: ['rgb'],
        position: [0, 0.15, 0.01],
        rotation: [0, 0, 0]
      },
      storage: {
        type: 'box',
        dimensions: [0.08, 0.22, 0.02],
        color: '#059669',
        material: 'metal',
        features: ['connector'],
        position: [0.1, 0.05, 0.01],
        rotation: [0, 0, 0]
      },
      psu: {
        type: 'box',
        dimensions: [0.15, 0.08, 0.15],
        color: '#DC2626',
        material: 'metal',
        features: ['cables'],
        position: [0.2, -0.1, 0.05],
        rotation: [0, 0, 0]
      },
      case: {
        type: 'box',
        dimensions: [0.4, 0.8, 0.4],
        color: '#1F2937',
        material: 'metal',
        features: ['fans', 'rgb', 'glass'],
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      },
      cooler: {
        type: 'cylinder',
        dimensions: [0.12, 0.12, 0.08],
        color: '#F59E0B',
        material: 'metal',
        features: ['fan', 'rgb'],
        position: [0, 0.25, 0.02],
        rotation: [0, 0, 0]
      }
    };
    
    return models[category] || models.cpu;
  }
  
  // 提取品牌
  private static extractBrand(title: string): string {
    const brands = ['华硕', '微星', '技嘉', '七彩虹', '影驰', '索泰', '铭瑄', '盈通', 'Intel', 'AMD', 'NVIDIA'];
    for (const brand of brands) {
      if (title.includes(brand)) {
        return brand;
      }
    }
    return '未知品牌';
  }
  
  // 提取型号
  private static extractModel(title: string): string {
    const parts = title.split(' ');
    return parts[1] || '未知型号';
  }
} 