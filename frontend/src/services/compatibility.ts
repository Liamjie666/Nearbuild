// 硬件兼容性检查和跑分预测服务

export interface CompatibilityResult {
  isCompatible: boolean;
  conflicts: string[];
  warnings: string[];
  missingComponents: string[];
}

export interface BenchmarkResult {
  hasCpu: boolean;
  hasGpu: boolean;
  cpuScore?: number;
  gpuScore?: number;
  totalScore?: number;
  timeSpyScore?: number;
  fireStrikeScore?: number;
  portRoyalScore?: number;
  estimatedFps: {
    [game: string]: number;
  };
}

export interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category?: string;
  specs: any;
}

export interface UserConfig {
  cpu?: HardwareItem;
  motherboard?: HardwareItem;
  gpu?: HardwareItem;
  ram?: HardwareItem[];
  storage?: HardwareItem[];
  psu?: HardwareItem;
  case?: HardwareItem;
  cooler?: HardwareItem;
}

// 兼容性检查
export function checkCompatibility(config: UserConfig): CompatibilityResult {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  const missingComponents: string[] = [];

  // 检查必需组件
  if (!config.cpu) missingComponents.push('CPU');
  if (!config.motherboard) missingComponents.push('主板');
  if (!config.gpu) missingComponents.push('显卡');
  if (!config.ram || config.ram.length === 0) missingComponents.push('内存');
  if (!config.storage || config.storage.length === 0) missingComponents.push('存储');
  if (!config.psu) missingComponents.push('电源');
  if (!config.case) missingComponents.push('机箱');

  // CPU 和主板兼容性检查
  if (config.cpu && config.motherboard) {
    const cpuSocket = config.cpu.specs.socket;
    const mbSocket = config.motherboard.specs.socket;
    
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      conflicts.push(`CPU ${config.cpu.name} 与主板 ${config.motherboard.name} 接口不兼容 (CPU: ${cpuSocket}, 主板: ${mbSocket})`);
    }
  }

  // 内存和主板兼容性检查
  if (config.ram && config.ram.length > 0 && config.motherboard) {
    const mbMemoryType = config.motherboard.specs.mbMemoryType;
    const ramMemoryType = config.ram[0].specs.memoryType;
    
    if (mbMemoryType && ramMemoryType && mbMemoryType !== ramMemoryType) {
      conflicts.push(`内存 ${config.ram[0].name} 与主板 ${config.motherboard.name} 内存类型不兼容`);
    }

    const totalRam = config.ram.reduce((sum, ram) => sum + (ram.specs.ramCapacity || 0), 0);
    const maxRam = config.motherboard.specs.maxMemory;
    
    if (maxRam && totalRam > maxRam) {
      conflicts.push(`内存总容量 ${totalRam}GB 超过主板最大支持 ${maxRam}GB`);
    }
  }

  // 显卡和机箱兼容性检查
  if (config.gpu && config.case) {
    const gpuLength = config.gpu.specs.length;
    const maxGpuLength = config.case.specs.maxGpuLength;
    
    if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
      conflicts.push(`显卡 ${config.gpu.name} 长度 ${gpuLength}mm 超过机箱最大支持 ${maxGpuLength}mm`);
    }
  }

  // 散热器和机箱兼容性检查
  if (config.cooler && config.case) {
    const coolerHeight = config.cooler.specs.height || 0;
    const maxCoolerHeight = config.case.specs.maxCpuCoolerHeight;
    
    if (maxCoolerHeight && coolerHeight > maxCoolerHeight) {
      conflicts.push(`散热器 ${config.cooler.name} 高度超过机箱最大支持 ${maxCoolerHeight}mm`);
    }
  }

  // 电源功率检查
  if (config.psu && config.cpu && config.gpu) {
    const psuWattage = config.psu.specs.wattage;
    const cpuTdp = config.cpu.specs.cpuTdp;
    const gpuTdp = config.gpu.specs.gpuTdp;
    
    if (psuWattage && cpuTdp && gpuTdp) {
      const estimatedPower = cpuTdp + gpuTdp + 200; // 其他组件约200W
      
      if (estimatedPower > psuWattage) {
        conflicts.push(`电源功率 ${psuWattage}W 可能不足以支持当前配置 (预估需求: ${estimatedPower}W)`);
      } else if (estimatedPower > psuWattage * 0.8) {
        warnings.push(`电源功率接近极限，建议选择更高功率的电源`);
      }
    }
  }

  // 主板和机箱兼容性检查
  if (config.motherboard && config.case) {
    const mbFormFactor = config.motherboard.specs.mbFormFactor;
    const caseFormFactor = config.case.specs.caseFormFactor;
    
    if (mbFormFactor && caseFormFactor) {
      const formFactorCompatibility = {
        'ATX': ['ATX', 'E-ATX'],
        'M-ATX': ['ATX', 'M-ATX', 'E-ATX'],
        'ITX': ['ATX', 'M-ATX', 'ITX', 'E-ATX'],
        'E-ATX': ['E-ATX']
      };
      
      const supportedFormFactors = formFactorCompatibility[mbFormFactor as keyof typeof formFactorCompatibility] || [];
      if (!supportedFormFactors.includes(caseFormFactor)) {
        conflicts.push(`主板 ${config.motherboard.name} (${mbFormFactor}) 与机箱 ${config.case.name} (${caseFormFactor}) 不兼容`);
      }
    }
  }

  return {
    isCompatible: conflicts.length === 0,
    conflicts,
    warnings,
    missingComponents
  };
}

// 跑分预测
export function predictBenchmarks(config: UserConfig): BenchmarkResult {
  const hasCpu = !!config.cpu;
  const hasGpu = !!config.gpu;
  
  let cpuScore = 0;
  let gpuScore = 0;
  let totalScore = 0;
  let timeSpyScore = 0;
  let fireStrikeScore = 0;
  let portRoyalScore = 0;

  // CPU 跑分预测
  if (hasCpu) {
    const { specs } = config.cpu!;
    const cores = specs.cores || 0;
    const threads = specs.threads || cores;
    const baseClock = specs.baseClock || 0;
    const boostClock = specs.cpuBoostClock || baseClock;
    
    // 基于核心数、线程数和频率计算CPU分数
    cpuScore = Math.round(
      (cores * 1000) + 
      (threads * 500) + 
      (baseClock * 100) + 
      (boostClock * 50)
    );
  }

  // GPU 跑分预测
  if (hasGpu) {
    const { specs } = config.gpu!;
    const memory = specs.gpuMemory || 0;
    const boostClock = specs.gpuBoostClock || 0;
    const tdp = specs.gpuTdp || 0;
    
    // 基于显存、频率和功耗计算GPU分数
    gpuScore = Math.round(
      (memory * 2000) + 
      (boostClock * 10) + 
      (tdp * 2)
    );
  }

  // 总分计算
  totalScore = cpuScore + gpuScore;

  // 3DMark 分数预测
  if (hasCpu && hasGpu) {
    timeSpyScore = Math.round(totalScore * 0.8);
    fireStrikeScore = Math.round(totalScore * 1.2);
    portRoyalScore = Math.round(gpuScore * 0.6);
  }

  // 游戏帧率预测
  const estimatedFps: { [game: string]: number } = {};
  
  if (hasCpu && hasGpu) {
    const baseFps = Math.round(totalScore / 1000);
    
    estimatedFps['英雄联盟'] = Math.min(baseFps * 3, 300);
    estimatedFps['CS2'] = Math.min(baseFps * 2.5, 400);
    estimatedFps['绝地求生'] = Math.min(baseFps * 1.5, 200);
    estimatedFps['赛博朋克2077'] = Math.min(baseFps * 0.8, 120);
    estimatedFps['艾尔登法环'] = Math.min(baseFps * 1.2, 150);
    estimatedFps['原神'] = Math.min(baseFps * 2, 200);
  }

  return {
    hasCpu,
    hasGpu,
    cpuScore: hasCpu ? cpuScore : undefined,
    gpuScore: hasGpu ? gpuScore : undefined,
    totalScore: (hasCpu || hasGpu) ? totalScore : undefined,
    timeSpyScore: (hasCpu && hasGpu) ? timeSpyScore : undefined,
    fireStrikeScore: (hasCpu && hasGpu) ? fireStrikeScore : undefined,
    portRoyalScore: (hasCpu && hasGpu) ? portRoyalScore : undefined,
    estimatedFps
  };
}

// 获取兼容性状态颜色
export function getCompatibilityColor(isCompatible: boolean, hasConflicts: boolean): string {
  if (isCompatible && !hasConflicts) return 'text-green-400';
  if (hasConflicts) return 'text-red-400';
  return 'text-yellow-400';
}

// 获取跑分等级
export function getBenchmarkGrade(score: number): { grade: string; color: string } {
  if (score >= 200000) return { grade: 'S+', color: 'text-purple-400' };
  if (score >= 150000) return { grade: 'S', color: 'text-red-400' };
  if (score >= 100000) return { grade: 'A', color: 'text-orange-400' };
  if (score >= 70000) return { grade: 'B', color: 'text-yellow-400' };
  if (score >= 50000) return { grade: 'C', color: 'text-green-400' };
  return { grade: 'D', color: 'text-gray-400' };
} 