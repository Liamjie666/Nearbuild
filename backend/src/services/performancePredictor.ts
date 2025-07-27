import { HardwareItem, HardwareCategory } from '../types/hardware';

export interface UserConfig {
  cpu?: HardwareItem;
  gpu?: HardwareItem;
  motherboard?: HardwareItem;
  ram?: HardwareItem[];
  storage?: HardwareItem[];
  psu?: HardwareItem;
  case?: HardwareItem;
  cooler?: HardwareItem;
}

export interface PerformanceScore {
  gamingScore: number;
  productivityScore: number;
  valueScore: number;
  details: {
    cpuScore: number;
    gpuScore: number;
    ramScore: number;
    storageScore: number;
  };
}

export interface GamePerformance {
  game: string;
  fps: number;
  quality: 'Low' | 'Medium' | 'High' | 'Ultra';
  resolution: string;
}

export class PerformancePredictor {
  private static readonly CPU_WEIGHTS = {
    cores: 0.3,
    threads: 0.2,
    baseClock: 0.25,
    boostClock: 0.25
  };

  private static readonly GPU_WEIGHTS = {
    memory: 0.2,
    memoryType: 0.15,
    boostClock: 0.3,
    tdp: 0.1,
    length: 0.05,
    height: 0.05,
    width: 0.15
  };

  private static readonly RAM_WEIGHTS = {
    capacity: 0.6,
    speed: 0.4
  };

  private static readonly STORAGE_WEIGHTS = {
    capacity: 0.4,
    type: 0.3,
    readSpeed: 0.3
  };

  // 计算CPU性能分数
  private static calculateCpuScore(cpu: any): number {
    if (!cpu || !cpu.specs) return 0;

    const specs = cpu.specs;
    let score = 0;

    // 核心数评分 (0-100)
    const coreScore = Math.min(specs.cores * 5, 100);
    score += coreScore * this.CPU_WEIGHTS.cores;

    // 线程数评分
    const threadScore = Math.min(specs.threads * 3, 100);
    score += threadScore * this.CPU_WEIGHTS.threads;

    // 基础频率评分
    const baseClockScore = Math.min(specs.baseClock * 10, 100);
    score += baseClockScore * this.CPU_WEIGHTS.baseClock;

    // 加速频率评分
    const boostClockScore = Math.min(specs.boostClock * 8, 100);
    score += boostClockScore * this.CPU_WEIGHTS.boostClock;

    return Math.round(score);
  }

  // 计算GPU性能分数
  private static calculateGpuScore(gpu: any): number {
    if (!gpu || !gpu.specs) return 0;

    const specs = gpu.specs;
    let score = 0;

    // 显存评分
    const memoryScore = Math.min(specs.gpuMemory * 5, 100);
    score += memoryScore * this.GPU_WEIGHTS.memory;

    // 显存类型评分
    const memoryTypeScore = specs.gpuMemoryType === 'GDDR6X' ? 100 : 
                           specs.gpuMemoryType === 'GDDR6' ? 80 :
                           specs.gpuMemoryType === 'GDDR5X' ? 60 : 40;
    score += memoryTypeScore * this.GPU_WEIGHTS.memoryType;

    // 加速频率评分
    const boostClockScore = Math.min(specs.gpuBoostClock * 20, 100);
    score += boostClockScore * this.GPU_WEIGHTS.boostClock;

    // TDP评分 (越低越好，但要有一定功率)
    const tdpScore = specs.gpuTdp > 0 ? Math.min(100 - specs.gpuTdp / 2, 100) : 50;
    score += tdpScore * this.GPU_WEIGHTS.tdp;

    return Math.round(score);
  }

  // 计算内存性能分数
  private static calculateRamScore(ram: HardwareItem[] | undefined): number {
    if (!ram || ram.length === 0) return 0;

    const totalCapacity = ram.reduce((sum, item) => sum + (item.specs.ramCapacity || 0), 0);
    const avgSpeed = ram.reduce((sum, item) => sum + (item.specs.speed || 0), 0) / ram.length;

    let score = 0;

    // 容量评分
    const capacityScore = Math.min(totalCapacity * 2, 100);
    score += capacityScore * this.RAM_WEIGHTS.capacity;

    // 速度评分
    const speedScore = Math.min(avgSpeed / 10, 100);
    score += speedScore * this.RAM_WEIGHTS.speed;

    return Math.round(score);
  }

  // 计算存储性能分数
  private static calculateStorageScore(storage: HardwareItem[] | undefined): number {
    if (!storage || storage.length === 0) return 0;

    const totalCapacity = storage.reduce((sum, item) => sum + (item.specs.storageCapacity || 0), 0);
    const avgReadSpeed = storage.reduce((sum, item) => sum + (item.specs.readSpeed || 0), 0) / storage.length;

    let score = 0;

    // 容量评分
    const capacityScore = Math.min(totalCapacity / 100, 100);
    score += capacityScore * this.STORAGE_WEIGHTS.capacity;

    // 类型评分 (SSD vs HDD)
    const ssdCount = storage.filter(item => item.specs.type === 'SSD').length;
    const typeScore = (ssdCount / storage.length) * 100;
    score += typeScore * this.STORAGE_WEIGHTS.type;

    // 读取速度评分
    const readSpeedScore = Math.min(avgReadSpeed / 100, 100);
    score += readSpeedScore * this.STORAGE_WEIGHTS.readSpeed;

    return Math.round(score);
  }

  // 预测游戏性能
  public static predictGamePerformance(config: UserConfig): GamePerformance[] {
    const cpuScore = this.calculateCpuScore(config.cpu);
    const gpuScore = this.calculateGpuScore(config.gpu);
    const ramScore = this.calculateRamScore(config.ram);
    const storageScore = this.calculateStorageScore(config.storage);

    const totalScore = (cpuScore * 0.2 + gpuScore * 0.6 + ramScore * 0.15 + storageScore * 0.05);

    const games = [
      { name: 'Cyberpunk 2077', baseFps: 60, cpuWeight: 0.3, gpuWeight: 0.7 },
      { name: 'Red Dead Redemption 2', baseFps: 70, cpuWeight: 0.25, gpuWeight: 0.75 },
      { name: 'Assassin\'s Creed Valhalla', baseFps: 65, cpuWeight: 0.35, gpuWeight: 0.65 },
      { name: 'Call of Duty: Warzone', baseFps: 80, cpuWeight: 0.4, gpuWeight: 0.6 },
      { name: 'Fortnite', baseFps: 120, cpuWeight: 0.3, gpuWeight: 0.7 },
      { name: 'League of Legends', baseFps: 200, cpuWeight: 0.5, gpuWeight: 0.5 },
      { name: 'Minecraft', baseFps: 300, cpuWeight: 0.7, gpuWeight: 0.3 },
      { name: 'GTA V', baseFps: 90, cpuWeight: 0.3, gpuWeight: 0.7 }
    ];

    return games.map(game => {
      const gameScore = (cpuScore * game.cpuWeight + gpuScore * game.gpuWeight) / 100;
      const fps = Math.round(game.baseFps * gameScore);
      
      let quality: 'Low' | 'Medium' | 'High' | 'Ultra';
      if (fps >= 120) quality = 'Ultra';
      else if (fps >= 80) quality = 'High';
      else if (fps >= 60) quality = 'Medium';
      else quality = 'Low';

      return {
        game: game.name,
        fps,
        quality,
        resolution: '1920x1080'
      };
    });
  }

  // 计算总体性能分数
  public static calculatePerformanceScore(config: UserConfig): PerformanceScore {
    const cpuScore = this.calculateCpuScore(config.cpu);
    const gpuScore = this.calculateGpuScore(config.gpu);
    const ramScore = this.calculateRamScore(config.ram);
    const storageScore = this.calculateStorageScore(config.storage);

    // 游戏性能分数 (GPU权重更高)
    const gamingScore = Math.round(
      cpuScore * 0.2 + gpuScore * 0.6 + ramScore * 0.15 + storageScore * 0.05
    );

    // 生产力性能分数 (CPU权重更高)
    const productivityScore = Math.round(
      cpuScore * 0.5 + gpuScore * 0.2 + ramScore * 0.25 + storageScore * 0.05
    );

    // 性价比分数 (基于价格和性能)
    const totalPrice = this.calculateTotalPrice(config);
    const valueScore = Math.round(
      (gamingScore + productivityScore) / 2 / (totalPrice / 10000)
    );

    return {
      gamingScore,
      productivityScore,
      valueScore: Math.min(valueScore, 100),
      details: {
        cpuScore,
        gpuScore,
        ramScore,
        storageScore
      }
    };
  }

  // 计算总价格
  private static calculateTotalPrice(config: UserConfig): number {
    let total = 0;
    if (config.cpu) total += config.cpu.price;
    if (config.gpu) total += config.gpu.price;
    if (config.motherboard) total += config.motherboard.price;
    if (config.psu) total += config.psu.price;
    if (config.case) total += config.case.price;
    if (config.cooler) total += config.cooler.price;
    if (config.ram) {
      config.ram.forEach(item => total += item.price);
    }
    if (config.storage) {
      config.storage.forEach(item => total += item.price);
    }
    return total;
  }
} 