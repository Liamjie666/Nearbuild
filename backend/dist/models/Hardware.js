"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardware = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const HardwareSpecsSchema = new mongoose_1.Schema({
    cores: Number,
    threads: Number,
    baseClock: Number,
    cpuBoostClock: Number,
    cpuTdp: Number,
    socket: String,
    architecture: String,
    integratedGraphics: String,
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
    chipset: String,
    mbFormFactor: String,
    memorySlots: Number,
    maxMemory: Number,
    mbMemoryType: String,
    pciSlots: Number,
    m2Slots: Number,
    sataPorts: Number,
    ramCapacity: Number,
    speed: Number,
    modules: Number,
    timing: String,
    voltage: Number,
    storageCapacity: Number,
    type: { type: String, enum: ['SSD', 'HDD'] },
    interface: String,
    readSpeed: Number,
    writeSpeed: Number,
    formFactor: String,
    wattage: Number,
    efficiency: String,
    modular: { type: String, enum: ['Full', 'Semi', 'Non'] },
    certification: String,
    caseFormFactor: String,
    maxGpuLength: Number,
    maxCpuCoolerHeight: Number,
    maxPsuLength: Number,
    fanMounts: Number,
    includedFans: Number,
    coolerType: { type: String, enum: ['Air', 'Liquid'] },
    fanSize: Number,
    noiseLevel: Number,
    rgb: Boolean,
}, { _id: false });
const Model3DConfigSchema = new mongoose_1.Schema({
    type: { type: String, enum: ['box', 'cylinder', 'complex'], default: 'box' },
    dimensions: {
        type: [Number],
        validate: {
            validator: function (v) {
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
            validator: function (v) {
                return v.length === 3;
            },
            message: 'Position must be an array of 3 numbers'
        }
    },
    rotation: {
        type: [Number],
        validate: {
            validator: function (v) {
                return v.length === 3;
            },
            message: 'Rotation must be an array of 3 numbers'
        }
    }
}, { _id: false });
const PlatformInfoSchema = new mongoose_1.Schema({
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
const HardwareSchema = new mongoose_1.Schema({
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
HardwareSchema.index({
    name: 'text',
    brand: 'text',
    model: 'text'
});
HardwareSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});
HardwareSchema.virtual('discountPercentage').get(function () {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});
HardwareSchema.methods.updatePrice = function (newPrice) {
    this.originalPrice = this.price;
    this.price = newPrice;
    return this.save();
};
HardwareSchema.statics.findByCategory = function (category) {
    return this.find({ category });
};
HardwareSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
    return this.find({
        price: { $gte: minPrice, $lte: maxPrice }
    });
};
HardwareSchema.statics.search = function (query) {
    return this.find({
        $text: { $search: query }
    }, {
        score: { $meta: 'textScore' }
    }).sort({
        score: { $meta: 'textScore' }
    });
};
HardwareSchema.statics.getBrands = function (category) {
    const match = category ? { category } : {};
    return this.aggregate([
        { $match: match },
        { $group: { _id: '$brand' } },
        { $sort: { _id: 1 } }
    ]);
};
HardwareSchema.statics.getPriceStats = function (category) {
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
exports.Hardware = mongoose_1.default.model('Hardware', HardwareSchema);
//# sourceMappingURL=Hardware.js.map