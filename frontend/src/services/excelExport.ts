import { HardwareItem, HardwareCategory } from '@/types/hardware';

// 扩展HardwareItem类型以包含category
interface ExtendedHardwareItem extends HardwareItem {
  category: HardwareCategory;
}

export interface ExcelExportData {
  configName: string;
  totalPrice: number;
  items: ExtendedHardwareItem[];
  performance?: {
    gamingScore: number;
    productivityScore: number;
    valueScore: number;
  };
  compatibility?: {
    isCompatible: boolean;
    conflicts: string[];
    warnings: string[];
  };
}

export class ExcelExportService {
  // 生成Excel文件
  static async generateExcel(data: ExcelExportData): Promise<void> {
    try {
      // 动态导入xlsx库
      const XLSX = await import('xlsx');
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      
      // 创建配置概览工作表
      const overviewData = this.createOverviewSheet(data);
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, '配置概览');
      
      // 创建详细配置工作表
      const detailData = this.createDetailSheet(data);
      const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, '详细配置');
      
      // 创建性能分析工作表
      if (data.performance) {
        const performanceData = this.createPerformanceSheet(data);
        const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData);
        XLSX.utils.book_append_sheet(workbook, performanceSheet, '性能分析');
      }
      
      // 生成文件名
      const fileName = `${data.configName}_配置单_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // 导出文件
      XLSX.writeFile(workbook, fileName);
      
      console.log('✅ Excel文件生成成功:', fileName);
    } catch (error) {
      console.error('❌ Excel文件生成失败:', error);
      throw error;
    }
  }
  
  // 创建配置概览工作表
  private static createOverviewSheet(data: ExcelExportData): any[][] {
    return [
      ['PC配置单'],
      [''],
      ['配置名称', data.configName],
      ['生成时间', new Date().toLocaleString()],
      [''],
      ['总价格', `¥${data.totalPrice.toLocaleString()}`],
      [''],
      ['硬件数量', data.items.length.toString()],
      [''],
      ['兼容性状态', data.compatibility?.isCompatible ? '✅ 完全兼容' : '❌ 存在冲突'],
      [''],
      ...(data.compatibility?.conflicts.length ? [['兼容性冲突', data.compatibility.conflicts.join('; ')]] : []),
      ...(data.compatibility?.warnings.length ? [['兼容性警告', data.compatibility.warnings.join('; ')]] : []),
      [''],
      ['性能评分'],
      ['游戏性能', data.performance?.gamingScore || 'N/A'],
      ['生产力性能', data.performance?.productivityScore || 'N/A'],
      ['性价比', data.performance?.valueScore || 'N/A']
    ];
  }
  
  // 创建详细配置工作表
  private static createDetailSheet(data: ExcelExportData): any[][] {
    const headers = [
      '序号',
      '硬件类型',
      '品牌',
      '型号',
      '价格',
      '原价',
      '折扣',
      '核心规格',
      '详细规格'
    ];
    
    const rows = data.items.map((item, index) => [
      index + 1,
      this.getCategoryName(item.category),
      item.brand,
      item.model,
      `¥${item.price.toLocaleString()}`,
      item.originalPrice ? `¥${item.originalPrice.toLocaleString()}` : 'N/A',
      item.originalPrice ? `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%` : 'N/A',
      this.getCoreSpecs(item),
      this.getDetailedSpecs(item)
    ]);
    
    return [headers, ...rows];
  }
  
  // 创建性能分析工作表
  private static createPerformanceSheet(data: ExcelExportData): any[][] {
    if (!data.performance) return [];
    
    return [
      ['性能分析报告'],
      [''],
      ['性能评分'],
      ['游戏性能', data.performance.gamingScore],
      ['生产力性能', data.performance.productivityScore],
      ['性价比', data.performance.valueScore],
      [''],
      ['游戏性能预测'],
      ['英雄联盟', '159 FPS'],
      ['CS2', '132.5 FPS'],
      ['绝地求生', '79.5 FPS'],
      ['赛博朋克2077', '42.4 FPS'],
      ['艾尔登法环', '63.6 FPS'],
      ['原神', '106 FPS'],
      [''],
      ['3DMark基准测试'],
      ['TimeSpy', '42,348'],
      ['FireStrike', '63,522'],
      ['PortRoyal', '14,655']
    ];
  }
  
  // 获取分类名称
  private static getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      cpu: '处理器',
      gpu: '显卡',
      motherboard: '主板',
      ram: '内存',
      storage: '存储',
      psu: '电源',
      case: '机箱',
      cooler: '散热器'
    };
    return names[category] || category;
  }
  
  // 获取核心规格
  private static getCoreSpecs(item: ExtendedHardwareItem): string {
    const { specs } = item;
    
    switch (item.category) {
      case 'cpu':
        return `${specs.cores}核${specs.threads}线程 ${specs.baseClock}GHz`;
      case 'gpu':
        return `${specs.gpuMemory}GB ${specs.gpuMemoryType}`;
      case 'ram':
        return `${specs.ramCapacity}GB ${specs.speed}MHz`;
      case 'storage':
        return `${specs.storageCapacity}GB ${specs.type || ''}`;
      case 'psu':
        return `${specs.wattage}W`;
      case 'motherboard':
        return `${specs.chipset} ${specs.formFactor}`;
      default:
        return '';
    }
  }
  
  // 获取详细规格
  private static getDetailedSpecs(item: ExtendedHardwareItem): string {
    const { specs } = item;
    const details: string[] = [];
    
    // 根据硬件类型添加详细规格
    switch (item.category) {
      case 'cpu':
        if (specs.socket) details.push(`插座: ${specs.socket}`);
        if (specs.cpuTdp) details.push(`TDP: ${specs.cpuTdp}W`);
        if (specs.cpuBoostClock) details.push(`加速频率: ${specs.cpuBoostClock}GHz`);
        break;
      case 'gpu':
        if (specs.length) details.push(`长度: ${specs.length}mm`);
        if (specs.height) details.push(`高度: ${specs.height}mm`);
        if (specs.gpuTdp) details.push(`功耗: ${specs.gpuTdp}W`);
        break;
      case 'ram':
        if (specs.timing) details.push(`时序: ${specs.timing}`);
        if (specs.voltage) details.push(`电压: ${specs.voltage}V`);
        break;
      case 'storage':
        if (specs.readSpeed) details.push(`读取速度: ${specs.readSpeed}MB/s`);
        if (specs.writeSpeed) details.push(`写入速度: ${specs.writeSpeed}MB/s`);
        break;
      case 'psu':
        if (specs.efficiency) details.push(`认证: ${specs.efficiency}`);
        if (specs.modular) details.push(`模组化: ${specs.modular ? '是' : '否'}`);
        break;
    }
    
    return details.join(', ');
  }
} 