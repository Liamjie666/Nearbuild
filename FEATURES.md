# NeraBuild 核心功能增强

基于 [buildcores.com](https://buildcores.com/builds/Ox9dD7dvH) 的功能分析，我们为 NeraBuild 项目添加了以下核心功能：

## 🎯 新增功能概览

### 1. **配置分享系统** 
- ✅ 独特的配置ID生成 (如 `Ox9dD7dvH`)
- ✅ 可分享的配置链接
- ✅ 配置版本控制
- ✅ 公开/私有配置设置

### 2. **性能预测系统**
- ✅ 游戏性能预测 (FPS + 画质等级)
- ✅ 生产力性能评分
- ✅ 性价比分析
- ✅ 详细组件分数 (CPU/GPU/内存/存储)

### 3. **增强的兼容性检查**
- ✅ 实时冲突检测
- ✅ 详细的兼容性报告
- ✅ 替代方案推荐
- ✅ 电源功率检查

### 4. **价格追踪系统**
- ✅ 历史价格图表
- ✅ 价格趋势分析
- ✅ 最佳购买时机提醒
- ✅ 平台价格比较

## 📁 新增文件结构

```
backend/
├── src/
│   ├── models/
│   │   └── Configuration.ts          # 配置分享模型
│   ├── services/
│   │   ├── performancePredictor.ts   # 性能预测服务
│   │   ├── compatibility.ts          # 兼容性检查服务
│   │   └── priceTracker.ts           # 价格追踪服务
│   └── routes/
│       └── configurations.ts         # 配置分享API

frontend/
├── src/
│   └── components/
│       ├── ConfigurationShare.tsx    # 配置分享组件
│       └── PerformancePredictor.tsx  # 性能预测组件
```

## 🔧 技术实现

### 后端 API 接口

#### 配置分享接口
```bash
# 保存配置
POST /api/configurations
{
  "name": "游戏主机配置",
  "description": "高性能游戏配置",
  "items": [...],
  "isPublic": true
}

# 获取配置详情
GET /api/configurations/:id

# 通过分享ID获取配置
GET /api/configurations/share/:shareId

# 获取配置列表
GET /api/configurations?page=1&limit=20&isPublic=true

# 更新配置
PUT /api/configurations/:id

# 删除配置
DELETE /api/configurations/:id

# 获取性能预测
GET /api/configurations/:id/performance

# 创建配置新版本
POST /api/configurations/:id/version
```

#### 性能预测接口
```bash
# 计算性能分数
POST /api/performance/calculate
{
  "config": {
    "cpu": {...},
    "gpu": {...},
    "ram": [...],
    "storage": [...]
  }
}
```

### 前端组件

#### ConfigurationShare 组件
- 配置保存和分享功能
- 公开/私有设置
- 分享链接生成和复制
- 配置概览显示

#### PerformancePredictor 组件
- 实时性能分数计算
- 游戏性能预测 (8款热门游戏)
- 详细组件分数分析
- 性能优化建议

## 🎮 游戏性能预测

支持以下游戏的性能预测：

1. **Cyberpunk 2077** - 高画质要求
2. **Red Dead Redemption 2** - 开放世界
3. **Assassin's Creed Valhalla** - 动作冒险
4. **Call of Duty: Warzone** - 竞技射击
5. **Fortnite** - 大逃杀
6. **League of Legends** - MOBA
7. **Minecraft** - 沙盒游戏
8. **GTA V** - 开放世界

每个游戏都会显示：
- 预测FPS
- 推荐画质等级 (Low/Medium/High/Ultra)
- 分辨率设置

## 📊 性能评分算法

### CPU 评分 (权重分配)
- 核心数: 30%
- 线程数: 20%
- 基础频率: 25%
- 加速频率: 25%

### GPU 评分 (权重分配)
- 显存容量: 20%
- 显存类型: 15%
- 加速频率: 30%
- TDP: 10%
- 尺寸: 25%

### 内存评分 (权重分配)
- 容量: 60%
- 频率: 40%

### 存储评分 (权重分配)
- 容量: 40%
- 类型 (SSD/HDD): 30%
- 读取速度: 30%

## 🔍 兼容性检查规则

### CPU + 主板
- 插槽类型匹配检查
- 芯片组兼容性

### GPU + 机箱
- 显卡长度限制
- 电源接口要求

### 内存 + 主板
- 内存容量限制
- 内存插槽数量
- 内存频率兼容

### 散热器 + 机箱
- 散热器高度限制
- 风扇尺寸检查

### 电源功率
- 总功耗计算
- 电源功率建议

## 💰 价格追踪功能

### 价格趋势分析
- 30天价格历史
- 最高/最低价格
- 平均价格计算
- 价格变化百分比

### 购买建议
- **Buy**: 接近历史最低价
- **Wait**: 价格快速上涨
- **Hold**: 价格稳定

### 平台价格比较
- 淘宝 vs 京东价格对比
- 差价计算
- 更便宜平台推荐

## 🚀 使用指南

### 1. 创建配置
1. 在3D装机页面选择硬件
2. 点击"分享配置"按钮
3. 填写配置名称和描述
4. 选择公开或私有
5. 保存配置

### 2. 查看性能预测
1. 选择硬件后自动计算
2. 查看游戏性能预测
3. 查看详细分数分析
4. 参考性能优化建议

### 3. 分享配置
1. 保存配置后获得分享链接
2. 复制链接分享给他人
3. 他人可通过链接查看配置
4. 支持导入配置到自己的账户

## 🎯 与 buildcores.com 的对比

| 功能 | buildcores.com | NeraBuild |
|------|----------------|-----------|
| 配置分享 | ✅ | ✅ |
| 性能预测 | ✅ | ✅ |
| 兼容性检查 | ✅ | ✅ |
| 价格追踪 | ✅ | ✅ |
| 3D可视化 | ❌ | ✅ |
| 中文界面 | ❌ | ✅ |
| 淘宝/京东数据 | ❌ | ✅ |

## 🔮 未来计划

### 短期目标
- [ ] 用户账户系统
- [ ] 配置收藏功能
- [ ] 价格监控提醒
- [ ] 移动端适配

### 长期目标
- [ ] 社区功能
- [ ] 配置评分系统
- [ ] 硬件推荐算法
- [ ] 实时价格推送

---

**NeraBuild** - All in Black, Build in 3D 🖤 