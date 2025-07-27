import express from 'express';
import { Configuration } from '../models/Configuration';
import { PerformancePredictor } from '../services/performancePredictor';
import { checkCompatibility } from '../services/compatibility';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// 保存配置
router.post('/', rateLimiter, async (req, res) => {
  try {
    const { name, description, items, isPublic = false } = req.body;

    if (!name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '配置名称和硬件项目不能为空'
      });
    }

    // 计算总价格
    const totalPrice = items.reduce((sum: number, item: any) => sum + item.price, 0);

    // 检查兼容性
    const compatibility = checkCompatibility(items);

    // 计算性能分数
    const performance = PerformancePredictor.calculatePerformanceScore(items);

    const configuration = new Configuration({
      name,
      description,
      items,
      totalPrice,
      performance,
      compatibility,
      isPublic
    });

    await configuration.save();

    return res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
});

// 获取配置详情
router.get('/:id', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await Configuration.findById(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '配置不存在'
      });
    }

    return res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    console.error('获取配置详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取配置详情失败'
    });
  }
});

// 通过分享ID获取配置
router.get('/share/:shareId', rateLimiter, async (req, res) => {
  try {
    const { shareId } = req.params;
    const configuration = await (Configuration as any).findByShareId(shareId);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '分享的配置不存在或已设为私有'
      });
    }

    return res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    console.error('获取分享配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取分享配置失败'
    });
  }
});

// 获取配置列表
router.get('/', rateLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 20, isPublic } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const [configurations, total] = await Promise.all([
      Configuration.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Configuration.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: {
        configurations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取配置列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取配置列表失败'
    });
  }
});

// 更新配置
router.put('/:id', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, items, isPublic } = req.body;

    const configuration = await Configuration.findById(id);
    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '配置不存在'
      });
    }

    // 更新字段
    if (name) configuration.name = name;
    if (description !== undefined) configuration.description = description;
    if (isPublic !== undefined) configuration.isPublic = isPublic;

    if (items && items.length > 0) {
      configuration.items = items;
      configuration.totalPrice = items.reduce((sum: number, item: any) => sum + item.price, 0);
      
      // 重新计算兼容性和性能
      configuration.compatibility = checkCompatibility(items);
      configuration.performance = PerformancePredictor.calculatePerformanceScore(items);
    }

    await configuration.save();

    return res.json({
      success: true,
      data: configuration
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新配置失败'
    });
  }
});

// 删除配置
router.delete('/:id', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await Configuration.findByIdAndDelete(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '配置不存在'
      });
    }

    return res.json({
      success: true,
      message: '配置删除成功'
    });
  } catch (error) {
    console.error('删除配置失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除配置失败'
    });
  }
});

// 获取配置性能预测
router.get('/:id/performance', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await Configuration.findById(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '配置不存在'
      });
    }

    // 将ConfigurationItem[]转换为UserConfig格式
    const userConfig = {
      cpu: configuration.items.find((item: any) => item.category === 'cpu') as any,
      gpu: configuration.items.find((item: any) => item.category === 'gpu') as any,
      motherboard: configuration.items.find((item: any) => item.category === 'motherboard') as any,
      ram: configuration.items.filter((item: any) => item.category === 'ram') as any,
      storage: configuration.items.filter((item: any) => item.category === 'storage') as any,
      psu: configuration.items.find((item: any) => item.category === 'psu') as any,
      case: configuration.items.find((item: any) => item.category === 'case') as any,
      cooler: configuration.items.find((item: any) => item.category === 'cooler') as any
    };
    
    // 预测游戏性能
    const gamePerformance = PerformancePredictor.predictGamePerformance(userConfig);

    return res.json({
      success: true,
      data: {
        performance: configuration.performance,
        gamePerformance
      }
    });
  } catch (error) {
    console.error('获取性能预测失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取性能预测失败'
    });
  }
});

// 创建配置新版本
router.post('/:id/version', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const configuration = await Configuration.findById(id);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: '配置不存在'
      });
    }

    const newVersion = await (configuration as any).createNewVersion();

    return res.json({
      success: true,
      data: newVersion
    });
  } catch (error) {
    console.error('创建配置新版本失败:', error);
    return res.status(500).json({
      success: false,
      message: '创建配置新版本失败'
    });
  }
});

export default router; 