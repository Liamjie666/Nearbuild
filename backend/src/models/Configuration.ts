import mongoose, { Schema, Document } from 'mongoose';

export interface ConfigurationItem {
  category: string;
  hardwareId: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  specs: any;
}

export interface Configuration {
  id: string;
  name: string;
  description?: string;
  items: ConfigurationItem[];
  totalPrice: number;
  performance: {
    gamingScore: number;
    productivityScore: number;
    valueScore: number;
  };
  compatibility: {
    isCompatible: boolean;
    conflicts: string[];
    warnings: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isPublic: boolean;
  shareId?: string;
}

export type ConfigurationDocument = Configuration & Document;

const ConfigurationItemSchema = new Schema<ConfigurationItem>({
  category: { type: String, required: true },
  hardwareId: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  specs: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const ConfigurationSchema = new Schema<ConfigurationDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  items: [ConfigurationItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  performance: {
    gamingScore: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    valueScore: { type: Number, default: 0 }
  },
  compatibility: {
    isCompatible: { type: Boolean, default: true },
    conflicts: [String],
    warnings: [String]
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  collection: 'configurations'
});

// 生成分享ID
ConfigurationSchema.pre('save', function(next) {
  if (this.isPublic && !this.shareId) {
    this.shareId = generateShareId();
  }
  next();
});

// 生成唯一分享ID
function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 静态方法：通过分享ID查找配置
ConfigurationSchema.statics.findByShareId = function(shareId: string) {
  return this.findOne({ shareId, isPublic: true });
};

// 静态方法：获取用户配置列表
ConfigurationSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ updatedAt: -1 });
};

// 实例方法：创建新版本
ConfigurationSchema.methods.createNewVersion = function(this: ConfigurationDocument) {
  const newConfig = new Configuration({
    ...this.toObject(),
    _id: undefined,
    version: this.version + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return newConfig.save();
};

export const Configuration = mongoose.model<ConfigurationDocument>('Configuration', ConfigurationSchema) as any; 