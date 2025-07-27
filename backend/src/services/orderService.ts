import { HardwareItem } from '../types/hardware';

export interface OrderResult {
  success: boolean;
  message: string;
  cartUrl?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  platform: 'taobao' | 'jd';
  url: string;
}

export class OrderService {
  // 生成淘宝购物车URL
  static generateTaobaoCartUrl(items: HardwareItem[]): string {
    const itemIds = items.map(item => item.platform.taobao?.itemId).filter(Boolean);
    const shopIds = items.map(item => item.platform.taobao?.shopId).filter(Boolean);
    
    // 模拟淘宝购物车URL格式
    const cartParams = new URLSearchParams();
    cartParams.append('items', itemIds.join(','));
    cartParams.append('shops', shopIds.join(','));
    cartParams.append('source', 'nearbuild');
    
    return `https://cart.taobao.com/cart.htm?${cartParams.toString()}`;
  }
  
  // 生成京东购物车URL
  static generateJDCartUrl(items: HardwareItem[]): string {
    const skuIds = items.map(item => item.platform.jd?.skuId).filter(Boolean);
    
    // 模拟京东购物车URL格式
    const cartParams = new URLSearchParams();
    cartParams.append('skus', skuIds.join(','));
    cartParams.append('source', 'nearbuild');
    
    return `https://cart.jd.com/cart.action?${cartParams.toString()}`;
  }
  
  // 一键下单到淘宝
  static async orderToTaobao(config: HardwareItem[]): Promise<OrderResult> {
    try {
      console.log('🛒 模拟淘宝下单:', config.length, '件商品');
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const validItems = config.filter(item => item.platform.taobao);
      
      if (validItems.length === 0) {
        return {
          success: false,
          message: '没有找到可用的淘宝商品'
        };
      }
      
      const cartUrl = this.generateTaobaoCartUrl(validItems);
      const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
      
      return {
        success: true,
        message: `成功添加 ${validItems.length} 件商品到淘宝购物车，总价：¥${totalPrice.toLocaleString()}`,
        cartUrl,
        items: validItems.map(item => ({
          id: item.platform.taobao!.itemId,
          name: item.name,
          price: item.price,
          quantity: 1,
          platform: 'taobao' as const,
          url: item.platform.taobao!.url
        }))
      };
    } catch (error) {
      console.error('淘宝下单失败:', error);
      return {
        success: false,
        message: '淘宝下单失败，请重试'
      };
    }
  }
  
  // 一键下单到京东
  static async orderToJD(config: HardwareItem[]): Promise<OrderResult> {
    try {
      console.log('🛒 模拟京东下单:', config.length, '件商品');
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
      
      const validItems = config.filter(item => item.platform.jd);
      
      if (validItems.length === 0) {
        return {
          success: false,
          message: '没有找到可用的京东商品'
        };
      }
      
      const cartUrl = this.generateJDCartUrl(validItems);
      const totalPrice = validItems.reduce((sum, item) => sum + item.price, 0);
      
      return {
        success: true,
        message: `成功添加 ${validItems.length} 件商品到京东购物车，总价：¥${totalPrice.toLocaleString()}`,
        cartUrl,
        items: validItems.map(item => ({
          id: item.platform.jd!.skuId,
          name: item.name,
          price: item.price,
          quantity: 1,
          platform: 'jd' as const,
          url: item.platform.jd!.url
        }))
      };
    } catch (error) {
      console.error('京东下单失败:', error);
      return {
        success: false,
        message: '京东下单失败，请重试'
      };
    }
  }
  
  // 一键下单到所有平台
  static async orderToAllPlatforms(config: HardwareItem[]): Promise<OrderResult> {
    try {
      console.log('🛒 模拟全平台下单:', config.length, '件商品');
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
      
      const taobaoItems = config.filter(item => item.platform.taobao);
      const jdItems = config.filter(item => item.platform.jd);
      
      if (taobaoItems.length === 0 && jdItems.length === 0) {
        return {
          success: false,
          message: '没有找到可用的商品'
        };
      }
      
      const results = [];
      let totalPrice = 0;
      
      if (taobaoItems.length > 0) {
        const taobaoResult = await this.orderToTaobao(taobaoItems);
        if (taobaoResult.success) {
          results.push(`淘宝: ${taobaoItems.length}件商品`);
          totalPrice += taobaoItems.reduce((sum, item) => sum + item.price, 0);
        }
      }
      
      if (jdItems.length > 0) {
        const jdResult = await this.orderToJD(jdItems);
        if (jdResult.success) {
          results.push(`京东: ${jdItems.length}件商品`);
          totalPrice += jdItems.reduce((sum, item) => sum + item.price, 0);
        }
      }
      
      if (results.length === 0) {
        return {
          success: false,
          message: '下单失败，请重试'
        };
      }
      
      return {
        success: true,
        message: `成功下单到 ${results.join(', ')}，总价：¥${totalPrice.toLocaleString()}`,
        items: [
          ...taobaoItems.map(item => ({
            id: item.platform.taobao!.itemId,
            name: item.name,
            price: item.price,
            quantity: 1,
            platform: 'taobao' as const,
            url: item.platform.taobao!.url
          })),
          ...jdItems.map(item => ({
            id: item.platform.jd!.skuId,
            name: item.name,
            price: item.price,
            quantity: 1,
            platform: 'jd' as const,
            url: item.platform.jd!.url
          }))
        ]
      };
    } catch (error) {
      console.error('全平台下单失败:', error);
      return {
        success: false,
        message: '全平台下单失败，请重试'
      };
    }
  }
  
  // 获取商品库存信息
  static async getStockInfo(items: HardwareItem[]): Promise<{ [key: string]: number }> {
    const stockInfo: { [key: string]: number } = {};
    
    for (const item of items) {
      // 模拟库存检查
      const stock = Math.floor(Math.random() * 50) + 5;
      stockInfo[item.name] = stock;
    }
    
    return stockInfo;
  }
  
  // 检查商品价格变化
  static async checkPriceChanges(items: HardwareItem[]): Promise<{ [key: string]: { oldPrice: number; newPrice: number; change: number } }> {
    const priceChanges: { [key: string]: { oldPrice: number; newPrice: number; change: number } } = {};
    
    for (const item of items) {
      // 模拟价格变化（±10%）
      const changePercent = (Math.random() - 0.5) * 0.2; // -10% to +10%
      const newPrice = Math.round(item.price * (1 + changePercent));
      const change = newPrice - item.price;
      
      priceChanges[item.name] = {
        oldPrice: item.price,
        newPrice,
        change
      };
    }
    
    return priceChanges;
  }
} 