// 硬件类型定义
export interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image?: string;
  specs: HardwareSpecs;
  model3D: Model3DConfig;
}

export interface HardwareSpecs {
  // CPU 规格
  cores?: number;
  threads?: number;
  baseClock?: number;
  cpuBoostClock?: number;
  cpuTdp?: number;
  socket?: string;
  architecture?: string;
  integratedGraphics?: string;
  
  // GPU 规格
  gpuMemory?: number;
  gpuMemoryType?: string;
  gpuBoostClock?: number;
  gpuTdp?: number;
  length?: number;
  width?: number;
  height?: number;
  powerConnector?: string;
  displayPorts?: string[];
  hdmiPorts?: string[];
  
  // 主板规格
  chipset?: string;
  mbFormFactor?: string;
  memorySlots?: number;
  maxMemory?: number;
  mbMemoryType?: string;
  pciSlots?: number;
  m2Slots?: number;
  sataPorts?: number;
  
  // 内存规格
  ramCapacity?: number;
  speed?: number;
  modules?: number;
  timing?: string;
  voltage?: number;
  memoryType?: string;
  
  // 存储规格
  storageCapacity?: number;
  type?: 'SSD' | 'HDD';
  interface?: string;
  readSpeed?: number;
  writeSpeed?: number;
  formFactor?: string;
  
  // 电源规格
  wattage?: number;
  efficiency?: string;
  modular?: 'Full' | 'Semi' | 'Non';
  certification?: string;
  
  // 机箱规格
  caseFormFactor?: string;
  maxGpuLength?: number;
  maxCpuCoolerHeight?: number;
  maxPsuLength?: number;
  fanMounts?: number;
  includedFans?: number;
  
  // 散热器规格
  coolerType?: 'Air' | 'Liquid';
  fanSize?: number;
  noiseLevel?: number;
  rgb?: boolean;
  coolerHeight?: number;
}

export interface Model3DConfig {
  type: 'box' | 'cylinder' | 'complex';
  dimensions: [number, number, number]; // [width, height, depth]
  color: string;
  material: 'metal' | 'plastic' | 'glass';
  features: string[]; // ['rgb', 'fans', 'heatsink']
  position: [number, number, number];
  rotation: [number, number, number];
}

// 硬件类别
export type HardwareCategory = 
  | 'cpu' 
  | 'gpu' 
  | 'motherboard' 
  | 'ram' 
  | 'storage' 
  | 'psu' 
  | 'case' 
  | 'cooler';

// 用户配置
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

// 预设硬件数据
export const PRESET_HARDWARE: Record<HardwareCategory, HardwareItem[]> = {
  cpu: [
    {
      id: 'cpu-1',
      name: 'Intel Core i7-13700K',
      brand: 'Intel',
      model: 'i7-13700K',
      price: 2899,
      specs: {
        cores: 16,
        threads: 24,
        baseClock: 3.4,
        cpuBoostClock: 5.4,
        cpuTdp: 253
      },
      model3D: {
        type: 'box',
        dimensions: [0.4, 0.4, 0.1],
        color: '#2A2A2A',
        material: 'metal',
        features: ['heatsink'],
        position: [0, 0.2, 0.02],
        rotation: [0, 0, 0]
      }
    },
    {
      id: 'cpu-2',
      name: 'AMD Ryzen 7 7700X',
      brand: 'AMD',
      model: 'Ryzen 7 7700X',
      price: 2599,
      specs: {
        cores: 8,
        threads: 16,
        baseClock: 4.5,
        cpuBoostClock: 5.4,
        cpuTdp: 105
      },
      model3D: {
        type: 'box',
        dimensions: [0.4, 0.4, 0.1],
        color: '#1A1A1A',
        material: 'metal',
        features: ['heatsink'],
        position: [0, 0.2, 0.02],
        rotation: [0, 0, 0]
      }
    }
  ],
  gpu: [
    {
      id: 'gpu-1',
      name: 'NVIDIA RTX 4070 Ti',
      brand: 'NVIDIA',
      model: 'RTX 4070 Ti',
      price: 4999,
      specs: {
        gpuMemory: 12,
        memoryType: 'GDDR6X',
        gpuBoostClock: 2610,
        gpuTdp: 285,
        length: 285,
        width: 112,
        height: 40
      },
      model3D: {
        type: 'box',
        dimensions: [0.8, 0.4, 0.05],
        color: '#1A1A1A',
        material: 'metal',
        features: ['rgb', 'fans'],
        position: [0, -0.2, 0.2],
        rotation: [0, 0, 0]
      }
    },
    {
      id: 'gpu-2',
      name: 'AMD RX 7800 XT',
      brand: 'AMD',
      model: 'RX 7800 XT',
      price: 3999,
      specs: {
        gpuMemory: 16,
        memoryType: 'GDDR6',
        gpuBoostClock: 2430,
        gpuTdp: 263,
        length: 267,
        width: 110,
        height: 40
      },
      model3D: {
        type: 'box',
        dimensions: [0.75, 0.4, 0.05],
        color: '#2A2A2A',
        material: 'metal',
        features: ['rgb', 'fans'],
        position: [0, -0.2, 0.2],
        rotation: [0, 0, 0]
      }
    }
  ],
  motherboard: [
    {
      id: 'mb-1',
      name: 'MSI MPG B760I EDGE',
      brand: 'MSI',
      model: 'MPG B760I EDGE',
      price: 1299,
      specs: {
        chipset: 'B760',
        socket: 'LGA1700',
        mbFormFactor: 'ITX'
      },
      model3D: {
        type: 'box',
        dimensions: [1.2, 0.8, 0.02],
        color: '#2A2A2A',
        material: 'metal',
        features: ['rgb'],
        position: [0, 0, 0.2],
        rotation: [0, 0, 0]
      }
    }
  ],
  ram: [
    {
      id: 'ram-1',
      name: 'Kingston Fury Beast 32GB',
      brand: 'Kingston',
      model: 'Fury Beast',
      price: 899,
      specs: {
        ramCapacity: 32,
        speed: 6000,
        modules: 2
      },
      model3D: {
        type: 'box',
        dimensions: [0.1, 0.6, 0.01],
        color: '#333333',
        material: 'plastic',
        features: ['rgb'],
        position: [0.3, 0.2, 0.02],
        rotation: [0, 0, 0]
      }
    }
  ],
  storage: [
    {
      id: 'ssd-1',
      name: 'Samsung 970 EVO Plus 1TB',
      brand: 'Samsung',
      model: '970 EVO Plus',
      price: 599,
      specs: {
        storageCapacity: 1000,
        type: 'SSD',
        interface: 'NVMe'
      },
      model3D: {
        type: 'box',
        dimensions: [0.8, 0.2, 0.01],
        color: '#444444',
        material: 'plastic',
        features: [],
        position: [0, -0.3, 0.02],
        rotation: [0, 0, 0]
      }
    }
  ],
  psu: [
    {
      id: 'psu-1',
      name: 'Corsair RM850x',
      brand: 'Corsair',
      model: 'RM850x',
      price: 899,
      specs: {
        wattage: 850,
        efficiency: '80+ Gold'
      },
      model3D: {
        type: 'box',
        dimensions: [0.6, 0.4, 0.3],
        color: '#2A2A2A',
        material: 'metal',
        features: [],
        position: [0, -0.6, 0],
        rotation: [0, 0, 0]
      }
    }
  ],
  case: [
    {
      id: 'case-1',
      name: 'NZXT H510 Flow',
      brand: 'NZXT',
      model: 'H510 Flow',
      price: 699,
      specs: {
        caseFormFactor: 'ATX',
        maxGpuLength: 360,
        maxCpuCoolerHeight: 165
      },
      model3D: {
        type: 'box',
        dimensions: [2, 1.5, 0.8],
        color: '#1E1E1E',
        material: 'metal',
        features: ['glass'],
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      }
    }
  ],
  cooler: [
    {
      id: 'cooler-1',
      name: 'Noctua NH-D15',
      brand: 'Noctua',
      model: 'NH-D15',
      price: 699,
      specs: {
        cpuTdp: 220
      },
      model3D: {
        type: 'box',
        dimensions: [0.3, 0.3, 0.2],
        color: '#333333',
        material: 'metal',
        features: ['fans'],
        position: [0, 0.2, 0.05],
        rotation: [0, 0, 0]
      }
    }
  ]
}; 