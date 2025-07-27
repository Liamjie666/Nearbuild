# NeraBuild 黑匣装机

**All in Black, Build in 3D** - 专业的3D可视化装机平台

## 🎯 项目简介

NeraBuild 是一个专为 DIY 游戏玩家设计的硬件配置平台，提供全硬件数据库、3D 可视化组装、性能模拟器和一键下单服务。

### 核心功能

- **🖥️ 3D 可视化装机** - 实时渲染所选机箱内部，支持 360° 旋转、悬浮高亮
- **📊 全硬件数据库** - 淘宝/京东官方自营数据，每30分钟更新价格
- **⚡ 性能模拟器** - 基于鲁大师和3DMark的跑分预测
- **🛒 一键下单** - 生成淘宝/京东购物车链接，支持导出配置

## 🏗️ 技术架构

### 前端技术栈
- **Next.js 14** - React 框架，App Router
- **TypeScript** - 类型安全
- **React Three Fiber** - 3D 渲染
- **Framer Motion** - 动画效果
- **Tailwind CSS** - 样式框架

### 后端技术栈
- **Node.js + Express** - API 服务
- **TypeScript** - 类型安全
- **MongoDB** - 数据存储
- **Redis** - 缓存和速率限制
- **Python** - 爬虫脚本

## 🚀 快速开始

### 前置要求

1. **Node.js** (v16+)
2. **Python** (v3.8+)
3. **MongoDB** (v4.4+)
4. **Redis** (v6.0+)

### 一键启动

```bash
# Windows 用户
start-project.bat

# 或手动启动
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

### 访问地址

- **前端**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health

## 📁 项目结构

```
NeraBuild/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React 组件
│   │   ├── contexts/        # React Context
│   │   ├── services/        # API 服务
│   │   └── types/           # TypeScript 类型
│   ├── package.json
│   └── README.md
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── index.ts         # 主应用文件
│   │   ├── models/          # MongoDB 模型
│   │   ├── routes/          # API 路由
│   │   ├── middleware/      # 中间件
│   │   └── types/           # TypeScript 类型
│   ├── scripts/
│   │   └── crawler/         # Python 爬虫
│   ├── package.json
│   └── README.md
├── start-project.bat        # 项目启动脚本
└── README.md               # 项目总览
```

## 🎨 设计规范

### 色彩方案
- **主色**: #000000 (背景)
- **辅色**: #1E1E1E (卡片)
- **强调色**: #00FFB3 (霓虹点缀)
- **文字**: #FFFFFF (白色)

### 字体
- **英文**: Poppins
- **中文**: 思源黑体 (Noto Sans SC)

### 动效
- **页面切换**: 60fps 滑动动画
- **价格刷新**: 数字翻牌动效
- **3D 载入**: fade-in 600ms

## 📊 API 接口

### 硬件数据接口

```bash
# 获取硬件列表
GET /api/hardware?category=cpu&minPrice=1000&maxPrice=5000

# 获取硬件详情
GET /api/hardware/:id

# 获取类别硬件
GET /api/hardware/categories/:category

# 获取品牌列表
GET /api/hardware/brands/:category?

# 获取价格统计
GET /api/hardware/stats/:category?

# 搜索建议
GET /api/hardware/suggestions/search?q=关键词

# 获取新品硬件
GET /api/hardware/new-arrivals?limit=10

# 获取热门硬件
GET /api/hardware/popular?category=cpu&limit=10
```

## 🕷️ 爬虫系统

### 数据源
- **淘宝开放平台** - 官方自营硬件数据
- **京东宙斯开放平台** - 官方自营硬件数据

### 更新频率
- **价格更新**: 每30分钟
- **库存更新**: 每2小时
- **新品扫描**: 每天凌晨2点

### 手动运行爬虫
```bash
cd backend/scripts/crawler
python main.py
```

## 🔧 开发指南

### 前端开发
```bash
cd frontend
npm run dev          # 开发模式
npm run build        # 构建项目
npm run lint         # 代码检查
```

### 后端开发
```bash
cd backend
npm run dev          # 开发模式
npm run build        # 构建项目
npm run test         # 运行测试
npm run lint         # 代码检查
```

### 环境配置
```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 后端环境变量
PORT=3001
MONGODB_URI=mongodb://localhost:27017/nerabuild
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

## 📈 性能优化

### 前端优化
- **代码分割** - 按路由和组件分割
- **图片优化** - Next.js Image 组件
- **缓存策略** - SWR 数据缓存
- **3D 渲染优化** - LOD 和视锥剔除

### 后端优化
- **数据库索引** - 为常用查询创建索引
- **Redis 缓存** - 缓存热门查询结果
- **压缩响应** - gzip 压缩
- **速率限制** - 防止 API 滥用

## 🔒 安全措施

- **CORS 配置** - 跨域请求控制
- **速率限制** - 防止 DDoS 攻击
- **输入验证** - Joi 参数验证
- **安全头** - Helmet 安全头设置
- **错误处理** - 统一错误响应

## 📝 开发计划

### 已完成 ✅
- [x] 前端基础框架
- [x] 3D 可视化界面
- [x] 硬件选择器组件
- [x] 后端 API 框架
- [x] 硬件数据模型
- [x] 爬虫系统
- [x] 搜索和过滤接口

### 进行中 🚧
- [ ] 性能模拟器算法
- [ ] 用户认证系统
- [ ] 一键下单功能

### 计划中 📋
- [ ] 实时价格推送
- [ ] 移动端适配
- [ ] PWA 支持
- [ ] 数据统计分析
- [ ] 社区功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **项目主页**: [https://github.com/nerabuild/nerabuild](https://github.com/nerabuild/nerabuild)
- **问题反馈**: [Issues](https://github.com/nerabuild/nerabuild/issues)
- **功能建议**: [Discussions](https://github.com/nerabuild/nerabuild/discussions)

---

**NeraBuild** - All in Black, Build in 3D 🖤 