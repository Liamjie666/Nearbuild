import mongoose, { Schema, Document } from 'mongoose';
import { HardwareItem, HardwareCategory, HardwareSpecs, Model3DConfig, PlatformInfo } from '../types/hardware';

// 硬件规格子文档
const HardwareSpecsSchema = new Schema<HardwareSpecs>({
  // CPU 规格
  cores: Number,
  threads: Number,
  baseClock: Number,
  cpuBoostClock: Number,
  cpuTdp: Number,
  socket: String,
  architecture: String,
  integratedGraphics: String,
  
  // GPU 规格
  gpuMemory: Number,
  gpuMemoryType: String,
  gpuBoostClock: Number,
  gpuTdp: Number,
  length: Number,
  width: Number,
  height: Number,
  powerConnector: String,
  displayPorts: [String],
  hdmiPorts: [String],
  
  // 主板规格
  chipset: String,
  mbFormFactor: String,
  memorySlots: Number,
  maxMemory: Number,
  mbMemoryType: String,
  pciSlots: Number,
  m2Slots: Number,
  sataPorts: Number,
  
  // 内存规格
  ramCapacity: Number,
  speed: Number,
  modules: Number,
  timing: String,
  voltage: Number,
  
  // 存储规格
  storageCapacity: Number,
  type: { type: String, enum: ['SSD', 'HDD'] },
  interface: String,
  readSpeed: Number,
  writeSpeed: Number,
  formFactor: String,
  
  // 电源规格
  wattage: Number,
  efficiency: String,
  modular: { type: String, enum: ['Full', 'Semi', 'Non'] },
  certification: String,
  
  // 机箱规格
  caseFormFactor: String,
  maxGpuLength: Number,
  maxCpuCoolerHeight: Number,
  maxPsuLength: Number,
  fanMounts: Number,
  includedFans: Number,
  
  // 散热器规格
  coolerType: { type: String, enum: ['Air', 'Liquid'] },
  fanSize: Number,
  noiseLevel: Number,
  rgb: Boolean,
}, { _id: false });

// 3D模型配置子文档
const Model3DConfigSchema = new Schema<Model3DConfig>({
  type: { type: String, enum: ['box', 'cylinder', 'complex'], default: 'box' },
  dimensions: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return v.length === 3;
      },
      message: 'Dimensions must be an array of 3 numbers'
    }
  },
  color: String,
  material: { type: String, enum: ['metal', 'plastic', 'glass'], default: 'metal' },
  features: [String],
  position: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return v.length === 3;
      },
      message: 'Position must be an array of 3 numbers'
    }
  },
  rotation: {
    type: [Number],
    validate: {
      validator: function(v: number[]) {
        return v.length === 3;
      },
      message: 'Rotation must be an array of 3 numbers'
    }
  }
}, { _id: false });

// 平台信息子文档
const PlatformInfoSchema = new Schema<PlatformInfo>({
  taobao: {
    itemId: String,
    shopId: String,
    shopName: String,
    url: String,
    rating: Number,
    salesCount: Number
  },
  jd: {
    skuId: String,
    shopId: String,
    shopName: String,
    url: String,
    rating: Number,
    salesCount: Number
  }
}, { _id: false });

// 主硬件文档
export type HardwareDocument = HardwareItem & Document;

const HardwareSchema = new Schema<HardwareDocument>({
  name: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    required: true,
    index: true
  },
  // model 字段已在 specs 或 model3D 中体现，无需重复定义
  // model: {
  //   type: String,
  //   required: true,
  //   index: true
  // },
  category: {
    type: String,
    enum: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'],
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    index: true
  },
  image: String,
  images: [String],
  specs: {
    type: HardwareSpecsSchema,
    required: true
  },
  model3D: {
    type: Model3DConfigSchema,
    required: true
  },
  platform: {
    type: PlatformInfoSchema,
    required: true
  }
}, {
  timestamps: true,
  collection: 'hardware'
});

// 创建复合索引以提高查询性能
HardwareSchema.index({ category: 1, brand: 1, price: 1 });
HardwareSchema.index({ category: 1, 'specs.cores': 1 });
HardwareSchema.index({ category: 1, 'specs.gpuMemory': 1 });
HardwareSchema.index({ category: 1, 'specs.ramCapacity': 1 });
HardwareSchema.index({ category: 1, 'specs.storageCapacity': 1 });
HardwareSchema.index({ category: 1, 'specs.wattage': 1 });
HardwareSchema.index({ 'platform.taobao.itemId': 1 });
HardwareSchema.index({ 'platform.jd.skuId': 1 });
HardwareSchema.index({ createdAt: -1 });
HardwareSchema.index({ updatedAt: -1 });

// 文本搜索索引
HardwareSchema.index({
  name: 'text',
  brand: 'text',
  model: 'text'
});

// 虚拟字段：是否有库存
HardwareSchema.virtual('inStock').get(function(this: HardwareDocument) {
  return this.stock > 0;
});

// 虚拟字段：折扣百分比
HardwareSchema.virtual('discountPercentage').get(function(this: HardwareDocument) {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// 实例方法：更新价格
HardwareSchema.methods.updatePrice = function(this: HardwareDocument, newPrice: number) {
  this.originalPrice = this.price;
  this.price = newPrice;
  return this.save();
};

// 静态方法：按类别查找
HardwareSchema.statics.findByCategory = function(category: HardwareCategory) {
  return this.find({ category });
};

// 静态方法：按价格范围查找
HardwareSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice }
  });
};

// 静态方法：搜索硬件
HardwareSchema.statics.search = function(query: string) {
  return this.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

// 静态方法：获取品牌列表
HardwareSchema.statics.getBrands = function(category?: HardwareCategory) {
  const match = category ? { category } : {};
  return this.aggregate([
    { $match: match },
    { $group: { _id: '$brand' } },
    { $sort: { _id: 1 } }
  ]);
};

// 静态方法：获取价格统计
HardwareSchema.statics.getPriceStats = function(category?: HardwareCategory) {
  const match = category ? { category } : {};
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' },
        count: { $sum: 1 }
      }
    }
  ]);
};

export const Hardware = mongoose.model<HardwareDocument>('Hardware', HardwareSchema); 