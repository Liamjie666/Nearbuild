"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const hardware_1 = __importDefault(require("./routes/hardware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nerabuild')
    .then(() => {
    console.log('✅ 数据库连接成功');
    initializeSampleData();
})
    .catch((error) => {
    console.error('❌ 数据库连接失败:', error);
    console.log('⚠️  使用内存数据模式');
});
async function initializeSampleData() {
    try {
        const Hardware = require('./models/Hardware').default;
        const count = await Hardware.countDocuments();
        if (count === 0) {
            console.log('📦 初始化示例硬件数据...');
            const sampleData = [
                {
                    category: 'cpu',
                    name: 'Intel Core i7-13700K',
                    brand: 'Intel',
                    model: 'i7-13700K',
                    price: 2899,
                    originalPrice: 2999,
                    stock: 50,
                    image: 'https://img.alicdn.com/imgextra/i4/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
                    specs: {
                        cores: 16,
                        threads: 24,
                        baseClock: 3.4,
                        boostClock: 5.4,
                        tdp: 125,
                        socket: 'LGA1700'
                    },
                    platform: {
                        taobao: {
                            url: 'https://item.taobao.com/item.htm?id=123456',
                            price: 2899,
                            stock: 50
                        },
                        jd: {
                            url: 'https://item.jd.com/123456.html',
                            price: 2899,
                            stock: 45
                        }
                    }
                },
                {
                    category: 'cpu',
                    name: 'AMD Ryzen 7 7700X',
                    brand: 'AMD',
                    model: 'Ryzen 7 7700X',
                    price: 2599,
                    originalPrice: 2699,
                    stock: 30,
                    image: 'https://img.alicdn.com/imgextra/i1/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
                    specs: {
                        cores: 8,
                        threads: 16,
                        baseClock: 4.5,
                        boostClock: 5.4,
                        tdp: 105,
                        socket: 'AM5'
                    },
                    platform: {
                        taobao: {
                            url: 'https://item.taobao.com/item.htm?id=123457',
                            price: 2599,
                            stock: 30
                        },
                        jd: {
                            url: 'https://item.jd.com/123457.html',
                            price: 2599,
                            stock: 25
                        }
                    }
                },
                {
                    category: 'gpu',
                    name: 'NVIDIA RTX 4070',
                    brand: 'NVIDIA',
                    model: 'RTX 4070',
                    price: 4299,
                    originalPrice: 4399,
                    stock: 20,
                    image: 'https://img.alicdn.com/imgextra/i2/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
                    specs: {
                        memory: 12,
                        memoryType: 'GDDR6X',
                        boostClock: 2.48,
                        tdp: 200,
                        length: 285,
                        height: 112
                    },
                    platform: {
                        taobao: {
                            url: 'https://item.taobao.com/item.htm?id=123458',
                            price: 4299,
                            stock: 20
                        },
                        jd: {
                            url: 'https://item.jd.com/123458.html',
                            price: 4299,
                            stock: 15
                        }
                    }
                },
                {
                    category: 'motherboard',
                    name: 'MSI MPG B760I EDGE WIFI',
                    brand: 'MSI',
                    model: 'MPG B760I EDGE WIFI',
                    price: 1299,
                    originalPrice: 1399,
                    stock: 15,
                    image: 'https://img.alicdn.com/imgextra/i3/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
                    specs: {
                        socket: 'LGA1700',
                        chipset: 'B760',
                        formFactor: 'ITX',
                        memorySlots: 2,
                        memoryType: 'DDR4',
                        maxMemory: 64
                    },
                    platform: {
                        taobao: {
                            url: 'https://item.taobao.com/item.htm?id=123459',
                            price: 1299,
                            stock: 15
                        },
                        jd: {
                            url: 'https://item.jd.com/123459.html',
                            price: 1299,
                            stock: 10
                        }
                    }
                },
                {
                    category: 'ram',
                    name: 'Kingston Fury Beast 32GB (2x16GB)',
                    brand: 'Kingston',
                    model: 'Fury Beast',
                    price: 699,
                    originalPrice: 799,
                    stock: 100,
                    image: 'https://img.alicdn.com/imgextra/i4/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
                    specs: {
                        capacity: 32,
                        modules: 2,
                        memoryType: 'DDR4',
                        speed: 3200,
                        latency: 16
                    },
                    platform: {
                        taobao: {
                            url: 'https://item.taobao.com/item.htm?id=123460',
                            price: 699,
                            stock: 100
                        },
                        jd: {
                            url: 'https://item.jd.com/123460.html',
                            price: 699,
                            stock: 80
                        }
                    }
                }
            ];
            await Hardware.insertMany(sampleData);
            console.log('✅ 示例数据初始化完成');
        }
    }
    catch (error) {
        console.error('❌ 初始化示例数据失败:', error);
    }
}
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/hardware', hardware_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        error: '接口不存在',
        path: req.originalUrl
    });
});
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(error.status || 500).json({
        error: error.message || '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在端口 ${PORT}`);
    console.log(`📊 API 文档: http://localhost:${PORT}/api/hardware`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});
process.on('SIGTERM', async () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    try {
        await mongoose_1.default.connection.close();
        console.log('数据库连接已关闭');
        process.exit(0);
    }
    catch (error) {
        console.error('关闭数据库连接时出错:', error);
        process.exit(1);
    }
});
process.on('SIGINT', async () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    try {
        await mongoose_1.default.connection.close();
        console.log('数据库连接已关闭');
        process.exit(0);
    }
    catch (error) {
        console.error('关闭数据库连接时出错:', error);
        process.exit(1);
    }
});
//# sourceMappingURL=index.js.map