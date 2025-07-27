import { HardwareItem } from '../types/hardware';

export interface CompatibilityResult {
  isCompatible: boolean;
  conflicts: string[];
  warnings: string[];
}

export function checkCompatibility(items: HardwareItem[]): CompatibilityResult {
  const conflicts: string[] = [];
  const warnings: string[] = [];

  // 按类别分组
  const cpu = items.find(item => item.category === 'cpu');
  const gpu = items.find(item => item.category === 'gpu');
  const motherboard = items.find(item => item.category === 'motherboard');
  const ram = items.filter(item => item.category === 'ram');
  const storage = items.filter(item => item.category === 'storage');
  const psu = items.find(item => item.category === 'psu');
  const caseItem = items.find(item => item.category === 'case');
  const cooler = items.find(item => item.category === 'cooler');

  // CPU 和主板兼容性检查
  if (cpu && motherboard) {
    if (cpu.specs.socket && motherboard.specs.socket && 
        cpu.specs.socket !== motherboard.specs.socket) {
      conflicts.push(`CPU插槽类型 (${cpu.specs.socket}) 与主板插槽类型 (${motherboard.specs.socket}) 不匹配`);
    }
  }

  // GPU 和机箱兼容性检查
  if (gpu && caseItem) {
    if (gpu.specs.length && caseItem.specs.maxGpuLength && 
        gpu.specs.length > caseItem.specs.maxGpuLength) {
      conflicts.push(`显卡长度 (${gpu.specs.length}mm) 超过机箱最大支持长度 (${caseItem.specs.maxGpuLength}mm)`);
    }
  }

  // CPU 散热器和机箱兼容性检查
  if (cooler && caseItem) {
    if (cooler.specs.fanSize && caseItem.specs.maxCpuCoolerHeight && 
        cooler.specs.fanSize > caseItem.specs.maxCpuCoolerHeight) {
      conflicts.push(`散热器高度 (${cooler.specs.fanSize}mm) 超过机箱最大支持高度 (${caseItem.specs.maxCpuCoolerHeight}mm)`);
    }
  }

  // 内存和主板兼容性检查
  if (ram.length > 0 && motherboard) {
    const totalRam = ram.reduce((sum, item) => sum + (item.specs.ramCapacity || 0), 0);
    if (motherboard.specs.maxMemory && totalRam > motherboard.specs.maxMemory) {
      conflicts.push(`内存总容量 (${totalRam}GB) 超过主板最大支持容量 (${motherboard.specs.maxMemory}GB)`);
    }

    if (motherboard.specs.memorySlots && ram.length > motherboard.specs.memorySlots) {
      conflicts.push(`内存条数量 (${ram.length}) 超过主板内存插槽数量 (${motherboard.specs.memorySlots})`);
    }
  }

  // 电源功率检查
  if (psu) {
    let totalPower = 0;
    if (cpu) totalPower += (cpu.specs.cpuTdp || 0);
    if (gpu) totalPower += (gpu.specs.gpuTdp || 0);
    
    // 其他组件估算功率
    totalPower += 50; // 主板、内存、存储等

    if (psu.specs.wattage && totalPower > psu.specs.wattage * 0.8) {
      warnings.push(`建议电源功率至少 ${Math.ceil(totalPower / 0.8)}W，当前电源功率为 ${psu.specs.wattage}W`);
    }
  }

  // 存储接口检查
  if (storage.length > 0 && motherboard) {
    const m2Count = storage.filter(item => item.specs.interface === 'M.2').length;
    const sataCount = storage.filter(item => item.specs.interface === 'SATA').length;

    if (motherboard.specs.m2Slots && m2Count > motherboard.specs.m2Slots) {
      conflicts.push(`M.2存储设备数量 (${m2Count}) 超过主板M.2插槽数量 (${motherboard.specs.m2Slots})`);
    }

    if (motherboard.specs.sataPorts && sataCount > motherboard.specs.sataPorts) {
      conflicts.push(`SATA存储设备数量 (${sataCount}) 超过主板SATA接口数量 (${motherboard.specs.sataPorts})`);
    }
  }

  // 内存类型检查
  if (ram.length > 0 && motherboard) {
    const ramTypes = [...new Set(ram.map(item => item.specs.speed))];
    if (ramTypes.length > 1) {
      warnings.push('不同内存条的频率不同，可能影响性能');
    }
  }

  // 显卡电源接口检查
  if (gpu && psu) {
    if (gpu.specs.powerConnector && !psu.specs.modular) {
      warnings.push('显卡需要专用电源接口，建议使用模组化电源');
    }
  }

  return {
    isCompatible: conflicts.length === 0,
    conflicts,
    warnings
  };
} 