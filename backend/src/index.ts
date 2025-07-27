import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import hardwareRoutes from './routes/hardware';
import configurationRoutes from './routes/configurations';
import orderRoutes from './routes/orders';
import { Hardware } from './models/Hardware';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nerabuild')
  .then(() => {
    console.log('✅ 数据库连接成功');
    // 初始化示例数据
    initializeSampleData();
  })
  .catch((error) => {
    console.error('❌ 数据库连接失败:', error);
    console.log('⚠️  使用内存数据模式');
  });

// 初始化示例数据函数
async function initializeSampleData() {
  try {
    console.log('🔍 检查数据库中的硬件数据...');
    const count = await Hardware.countDocuments();
    console.log(`📊 当前数据库中有 ${count} 条硬件数据`);
    
    if (count === 0) {
      console.log('📦 开始初始化示例硬件数据...');
      
      const sampleData = [
        // CPU 示例数据
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
          model3D: {
            type: 'box',
            dimensions: [0.12, 0.12, 0.03],
            color: '#FFE066',
            material: 'metal',
            features: ['rgb'],
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          },
          platform: {
            taobao: {
              itemId: '123456',
              shopId: 'shop001',
              shopName: 'Intel官方旗舰店',
              url: 'https://item.taobao.com/item.htm?id=123456',
              rating: 4.8,
              salesCount: 1000
            },
            jd: {
              skuId: '123456',
              shopId: 'jd001',
              shopName: '京东自营',
              url: 'https://item.jd.com/123456.html',
              rating: 4.9,
              salesCount: 800
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
          model3D: {
            type: 'box',
            dimensions: [0.12, 0.12, 0.03],
            color: '#FF6B6B',
            material: 'metal',
            features: ['rgb'],
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          },
          platform: {
            taobao: {
              itemId: '123457',
              shopId: 'shop002',
              shopName: 'AMD官方旗舰店',
              url: 'https://item.taobao.com/item.htm?id=123457',
              rating: 4.7,
              salesCount: 600
            },
            jd: {
              skuId: '123457',
              shopId: 'jd002',
              shopName: '京东自营',
              url: 'https://item.jd.com/123457.html',
              rating: 4.8,
              salesCount: 500
            }
          }
        },
        // GPU 示例数据
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
            gpuMemory: 12,
            gpuMemoryType: 'GDDR6X',
            gpuBoostClock: 2.48,
            gpuTdp: 200,
            length: 285,
            height: 112,
            width: 50
          },
          model3D: {
            type: 'box',
            dimensions: [0.9, 0.18, 0.08],
            color: '#FF6B6B',
            material: 'metal',
            features: ['rgb', 'fans'],
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          },
          platform: {
            taobao: {
              itemId: '123458',
              shopId: 'shop003',
              shopName: 'NVIDIA官方旗舰店',
              url: 'https://item.taobao.com/item.htm?id=123458',
              rating: 4.9,
              salesCount: 300
            },
            jd: {
              skuId: '123458',
              shopId: 'jd003',
              shopName: '京东自营',
              url: 'https://item.jd.com/123458.html',
              rating: 4.9,
              salesCount: 250
            }
          }
        },
        // 主板示例数据
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
          model3D: {
            type: 'box',
            dimensions: [0.17, 0.17, 0.02],
            color: '#45B7D1',
            material: 'metal',
            features: ['rgb'],
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          },
          platform: {
            taobao: {
              itemId: '123459',
              shopId: 'shop004',
              shopName: 'MSI官方旗舰店',
              url: 'https://item.taobao.com/item.htm?id=123459',
              rating: 4.6,
              salesCount: 200
            },
            jd: {
              skuId: '123459',
              shopId: 'jd004',
              shopName: '京东自营',
              url: 'https://item.jd.com/123459.html',
              rating: 4.7,
              salesCount: 180
            }
          }
        },
        // 内存示例数据
        {
          category: 'ram',
          name: 'Kingston Fury Beast 32GB (2x16GB)',
          brand: 'Kingston',
          model: 'Fury Beast 32GB',
          price: 699,
          originalPrice: 799,
          stock: 100,
          image: 'https://img.alicdn.com/imgextra/i4/2206686532409/O1CN01Z6pXyA1TfMnZ7Yz1O_!!2206686532409.jpg',
          specs: {
            ramCapacity: 32,
            speed: 3200,
            modules: 2,
            timing: 'CL16',
            voltage: 1.35
          },
          model3D: {
            type: 'box',
            dimensions: [0.12, 0.5, 0.03],
            color: '#45B7D1',
            material: 'metal',
            features: ['rgb'],
            position: [0, 0, 0],
            rotation: [0, 0, 0]
          },
          platform: {
            taobao: {
              itemId: '123460',
              shopId: 'shop005',
              shopName: 'Kingston官方旗舰店',
              url: 'https://item.taobao.com/item.htm?id=123460',
              rating: 4.8,
              salesCount: 500
            },
            jd: {
              skuId: '123460',
              shopId: 'jd005',
              shopName: '京东自营',
              url: 'https://item.jd.com/123460.html',
              rating: 4.8,
              salesCount: 450
            }
          }
        }
      ];
      
      console.log(`📝 准备插入 ${sampleData.length} 条示例数据...`);
      const result = await Hardware.insertMany(sampleData);
      console.log(`✅ 成功插入 ${result.length} 条示例数据`);
      console.log('✅ 示例数据初始化完成');
    } else {
      console.log('✅ 数据库中已有硬件数据，跳过初始化');
    }
  } catch (error: any) {
    console.error('❌ 初始化示例数据失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 中间件
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // 压缩响应
app.use(morgan('combined')); // 日志
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 路由
app.use('/api/hardware', hardwareRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/orders', orderRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', error);
  
  res.status(error.status || 500).json({
    error: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📊 API 文档: http://localhost:${PORT}/api/hardware`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  try {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭数据库连接时出错:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  try {
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭数据库连接时出错:', error);
    process.exit(1);
  }
}); 