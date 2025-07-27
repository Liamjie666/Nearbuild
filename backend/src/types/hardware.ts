// 硬件数据类型定义
export interface HardwareItem {
  // id: string; // Removed to avoid conflict with Mongoose Document
  name: string;
  brand: string;
  model: string;
  category: HardwareCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  specs: HardwareSpecs;
  model3D: Model3DConfig;
  platform: PlatformInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformInfo {
  taobao?: {
    itemId: string;
    shopId: string;
    shopName: string;
    url: string;
    rating: number;
    salesCount: number;
  };
  jd?: {
    skuId: string;
    shopId: string;
    shopName: string;
    url: string;
    rating: number;
    salesCount: number;
  };
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

// 搜索和过滤选项
export interface HardwareFilters {
  category?: HardwareCategory;
  brand?: string[];
  priceRange?: [number, number];
  specs?: Partial<HardwareSpecs>;
  platform?: 'taobao' | 'jd' | 'all';
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'sales' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface HardwareSearchParams {
  query?: string;
  filters?: HardwareFilters;
  page?: number;
  limit?: number;
}

// API 响应类型
export interface HardwareListResponse {
  items: HardwareItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HardwareDetailResponse {
  item: HardwareItem;
  relatedItems?: HardwareItem[];
  priceHistory?: PriceHistory[];
}

export interface PriceHistory {
  date: Date;
  price: number;
  platform: 'taobao' | 'jd';
}

// 爬虫相关类型
export interface CrawlerConfig {
  taobao: {
    appKey: string;
    appSecret: string;
    accessToken: string;
  };
  jd: {
    appKey: string;
    appSecret: string;
    accessToken: string;
  };
  schedule: {
    priceUpdate: string; // cron expression
    stockUpdate: string;
    newProductScan: string;
  };
}

export interface CrawlerTask {
  id: string;
  type: 'price_update' | 'stock_update' | 'new_product_scan';
  platform: 'taobao' | 'jd';
  category?: HardwareCategory;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: {
    itemsProcessed: number;
    itemsUpdated: number;
    itemsAdded: number;
  };
} 