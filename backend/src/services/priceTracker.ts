import { HardwareItem } from '../types/hardware';

export interface PriceHistory {
  date: Date;
  price: number;
  platform: 'taobao' | 'jd';
}

export interface PriceTrend {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: 'buy' | 'wait' | 'hold';
  history: PriceHistory[];
}

export class PriceTracker {
  // 生成模拟价格历史数据
  static generatePriceHistory(
    currentPrice: number,
    days: number = 30
  ): PriceHistory[] {
    const history: PriceHistory[] = [];
    const baseDate = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      
      // 模拟价格波动 (±10%)
      const volatility = 0.1;
      const randomFactor = 1 + (Math.random() - 0.5) * volatility * 2;
      const price = Math.round(currentPrice * randomFactor);
      
      // 随机选择平台
      const platform = Math.random() > 0.5 ? 'taobao' : 'jd';
      
      history.push({
        date,
        price,
        platform
      });
    }
    
    return history;
  }

  // 分析价格趋势
  static analyzePriceTrend(history: PriceHistory[]): PriceTrend {
    if (history.length === 0) {
      throw new Error('价格历史数据为空');
    }

    const prices = history.map(h => h.price);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2] || currentPrice;
    
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = Math.round((priceChange / previousPrice) * 100);
    
    // 判断趋势
    let trend: 'up' | 'down' | 'stable';
    if (priceChangePercent > 2) {
      trend = 'up';
    } else if (priceChangePercent < -2) {
      trend = 'down';
    } else {
      trend = 'stable';
    }
    
    // 生成购买建议
    let recommendation: 'buy' | 'wait' | 'hold';
    if (currentPrice <= lowestPrice * 1.05) {
      recommendation = 'buy';
    } else if (trend === 'up' && currentPrice > averagePrice * 1.1) {
      recommendation = 'wait';
    } else {
      recommendation = 'hold';
    }
    
    return {
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice,
      priceChange,
      priceChangePercent,
      trend,
      recommendation,
      history
    };
  }

  // 获取硬件价格趋势
  static async getPriceTrend(hardware: HardwareItem): Promise<PriceTrend> {
    const history = this.generatePriceHistory(hardware.price);
    return this.analyzePriceTrend(history);
  }

  // 获取价格警报
  static getPriceAlerts(trend: PriceTrend): string[] {
    const alerts: string[] = [];
    
    if (trend.recommendation === 'buy') {
      alerts.push('当前价格接近历史最低价，建议购买');
    }
    
    if (trend.trend === 'up' && trend.priceChangePercent > 5) {
      alerts.push('价格快速上涨，建议尽快购买');
    }
    
    if (trend.trend === 'down' && trend.priceChangePercent < -5) {
      alerts.push('价格持续下跌，可以等待更低价格');
    }
    
    if (trend.currentPrice > trend.averagePrice * 1.2) {
      alerts.push('当前价格明显高于平均价格，建议等待');
    }
    
    return alerts;
  }

  // 比较不同平台价格
  static comparePlatformPrices(hardware: HardwareItem): {
    taobao: number;
    jd: number;
    difference: number;
    cheaperPlatform: 'taobao' | 'jd';
  } {
    // 使用硬件本身的价格，因为平台信息中没有价格字段
    const taobaoPrice = hardware.price;
    const jdPrice = hardware.price;
    const difference = Math.abs(taobaoPrice - jdPrice);
    const cheaperPlatform = taobaoPrice <= jdPrice ? 'taobao' : 'jd';
    
    return {
      taobao: taobaoPrice,
      jd: jdPrice,
      difference,
      cheaperPlatform
    };
  }
} 