# NeraBuild 黑匣装机

专业的3D可视化装机平台，为DIY游戏玩家提供全硬件数据库、性能模拟器和一键下单服务。

## 🎯 产品特色

- **3D 可视化装机** - 实时渲染机箱内部，支持360°旋转、悬停高亮
- **全硬件数据库** - 覆盖CPU、GPU、主板等全品类硬件，实时价格更新
- **性能模拟器** - 基于真实跑分数据，精准预测游戏性能表现
- **冲突检测** - 实时检测尺寸、接口、供电冲突，避免装机错误
- **一键下单** - 生成淘宝+京东购物车链接，保留优惠券逻辑

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装依赖

```bash
# 安装基础依赖
npm install

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# 安装 3D 和动效依赖
npm install @react-three/fiber @react-three/drei framer-motion
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + TypeScript
- **3D 渲染**: React-Three-Fiber + Three.js
- **动效库**: Framer Motion
- **样式**: Tailwind CSS + 自定义 CSS
- **字体**: Poppins + 思源黑体

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   └── components/         # 组件
│       └── ThreeViewer.tsx # 3D 视窗组件
├── public/                 # 静态资源
├── tailwind.config.js      # Tailwind 配置
└── package.json
```

## 🎨 设计规范

### 色彩方案
- **主背景**: #000000 (纯黑)
- **卡片背景**: #1E1E1E (深灰)
- **主文字**: #FFFFFF (纯白)
- **强调色**: #00FFB3 (霓虹青)
- **边框**: #333333 (中灰)

### 字体
- **英文**: Poppins (300-700)
- **中文**: 思源黑体 (300-700)

### 动效
- **页面切换**: 60fps 滑动 (translateX 100% → 0)
- **悬停效果**: 800ms 霓虹描边
- **按钮交互**: 缩放 + 阴影

## 🔧 开发指南

### 添加新组件

1. 在 `src/components/` 创建新组件
2. 使用 TypeScript 和 React Hooks
3. 遵循 NeraBuild 设计规范

### 3D 模型开发

1. 使用 React-Three-Fiber 组件
2. 支持悬停高亮和交互
3. 优化性能，保持 60fps

### 样式开发

1. 优先使用 Tailwind CSS 类
2. 自定义样式使用 CSS 变量
3. 响应式设计，支持移动端

## 🚀 部署

### Vercel 部署

```bash
# 构建项目
npm run build

# 部署到 Vercel
vercel --prod
```

### 其他平台

项目支持部署到任何支持 Next.js 的平台：
- Netlify
- AWS Amplify
- Railway
- 自建服务器

## 📝 开发计划

- [ ] 硬件数据库 API 集成
- [ ] 性能模拟器算法
- [ ] 购物车链接生成
- [ ] 用户账户系统
- [ ] 移动端优化
- [ ] PWA 支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**NeraBuild** - All in Black, Build in 3D
