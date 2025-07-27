# NeraBuild 后端 API 服务

NeraBuild 硬件数据库后端服务，提供完整的硬件数据 API 接口。

## 🚀 功能特性

- **硬件数据库 API** - 提供完整的硬件搜索、过滤、详情接口
- **多平台数据源** - 支持淘宝和京东官方自营数据
- **实时价格更新** - 每30分钟自动更新价格和库存
- **智能搜索** - 支持文本搜索、品牌过滤、价格范围等
- **性能优化** - 使用 MongoDB 索引和 Redis 缓存
- **安全防护** - 速率限制、CORS 配置、安全头

## 📋 技术栈

### 后端框架
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** - 数据存储
- **Redis** - 缓存和速率限制

### 爬虫系统
- **Python** - 爬虫脚本
- **Selenium** - 网页自动化
- **BeautifulSoup** - HTML 解析
- **Celery** - 任务队列

## 🛠️ 安装和运行

### 前置要求

1. **Node.js** (v16+)
2. **Python** (v3.8+)
3. **MongoDB** (v4.4+)
4. **Redis** (v6.0+)

### 快速启动

#### Windows 用户
```bash
# 运行启动脚本
start.bat
```

#### 手动安装
```bash
# 1. 安装 Node.js 依赖
npm install

# 2. 安装 Python 依赖
cd scripts/crawler
pip install -r requirements.txt
cd ../..

# 3. 配置环境变量
copy env.example .env
# 编辑 .env 文件

# 4. 启动开发服务器
npm run dev
```

### 环境配置

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/nerabuild
REDIS_URL=redis://localhost:6379

# 前端 URL
FRONTEND_URL=http://localhost:3000

# 淘宝开放平台配置
TAOBAO_APP_KEY=your_taobao_app_key
TAOBAO_APP_SECRET=your_taobao_app_secret
TAOBAO_ACCESS_TOKEN=your_taobao_access_token

# 京东宙斯开放平台配置
JD_APP_KEY=your_jd_app_key
JD_APP_SECRET=your_jd_app_secret
JD_ACCESS_TOKEN=your_jd_access_token
```

## 📊 API 接口

### 基础信息
- **基础URL**: `http://localhost:3001/api`
- **健康检查**: `GET /health`

### 硬件接口

#### 获取硬件列表
```
GET /api/hardware
```

**查询参数:**
- `query` - 搜索关键词
- `category` - 硬件类别 (cpu, gpu, motherboard, ram, storage, psu, case, cooler)
- `brand` - 品牌过滤
- `minPrice` / `maxPrice` - 价格范围
- `platform` - 平台过滤 (taobao, jd, all)
- `inStock` - 是否有库存
- `sortBy` - 排序方式 (price, rating, sales, newest)
- `sortOrder` - 排序方向 (asc, desc)
- `page` - 页码
- `limit` - 每页数量

**示例:**
```bash
curl "http://localhost:3001/api/hardware?category=cpu&minPrice=1000&maxPrice=5000&sortBy=price&sortOrder=asc"
```

#### 获取硬件详情
```
GET /api/hardware/:id
```

#### 获取类别硬件
```
GET /api/hardware/categories/:category
```

#### 获取品牌列表
```
GET /api/hardware/brands/:category?
```

#### 获取价格统计
```
GET /api/hardware/stats/:category?
```

#### 搜索建议
```
GET /api/hardware/suggestions/search?q=关键词
```

#### 获取新品硬件
```
GET /api/hardware/new-arrivals?limit=10
```

#### 获取热门硬件
```
GET /api/hardware/popular?category=cpu&limit=10
```

## 🕷️ 爬虫系统

### 手动运行爬虫
```bash
cd scripts/crawler
python main.py
```

### 定时任务配置
```bash
# 价格更新 (每30分钟)
*/30 * * * * cd /path/to/backend/scripts/crawler && python main.py

# 库存更新 (每2小时)
0 */2 * * * cd /path/to/backend/scripts/crawler && python main.py

# 新品扫描 (每天凌晨2点)
0 2 * * * cd /path/to/backend/scripts/crawler && python main.py
```

## 📁 项目结构

```
backend/
├── src/
│   ├── index.ts              # 主应用文件
│   ├── types/
│   │   └── hardware.ts       # 硬件数据类型
│   ├── models/
│   │   └── Hardware.ts       # MongoDB 模型
│   ├── routes/
│   │   └── hardware.ts       # API 路由
│   └── middleware/
│       ├── rateLimiter.ts    # 速率限制
│       └── validation.ts     # 请求验证
├── scripts/
│   └── crawler/
│       ├── main.py           # 爬虫主程序
│       └── requirements.txt  # Python 依赖
├── package.json
├── tsconfig.json
├── env.example
├── start.bat
└── README.md
```

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 运行测试
npm test

# 代码检查
npm run lint
```

## 🚀 部署

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
EXPOSE 3001

CMD ["npm", "start"]
```

### 环境变量
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-mongo-uri
REDIS_URL=redis://your-redis-uri
```

## 📈 性能优化

- **数据库索引** - 为常用查询字段创建索引
- **Redis 缓存** - 缓存热门查询结果
- **压缩响应** - 启用 gzip 压缩
- **速率限制** - 防止 API 滥用
- **连接池** - 数据库连接复用

## 🔒 安全措施

- **Helmet** - 安全头设置
- **CORS** - 跨域请求控制
- **速率限制** - 防止 DDoS 攻击
- **输入验证** - Joi 参数验证
- **错误处理** - 统一错误响应

## 📝 开发计划

- [x] 基础 API 框架
- [x] 硬件数据模型
- [x] 搜索和过滤接口
- [x] 爬虫系统
- [ ] 用户认证系统
- [ ] 性能模拟器
- [ ] 一键下单功能
- [ ] 实时价格推送
- [ ] 数据统计分析

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目主页: [https://github.com/nerabuild/backend](https://github.com/nerabuild/backend)
- 问题反馈: [Issues](https://github.com/nerabuild/backend/issues)
- 功能建议: [Discussions](https://github.com/nerabuild/backend/discussions) 