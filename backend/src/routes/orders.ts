import express from 'express';
import { rateLimiter } from '../middleware/rateLimiter';
import { OrderService } from '../services/orderService';
import { HardwareItem } from '../types/hardware';

const router = express.Router();

// 一键下单到淘宝
router.post('/taobao', rateLimiter, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !Array.isArray(config)) {
      return res.status(400).json({
        success: false,
        message: '配置数据格式错误'
      });
    }
    
    const result = await OrderService.orderToTaobao(config as HardwareItem[]);
    
    return res.json({
      success: result.success,
      message: result.message,
      cartUrl: result.cartUrl,
      items: result.items
    });
  } catch (error) {
    console.error('淘宝下单失败:', error);
    return res.status(500).json({
      success: false,
      message: '淘宝下单失败'
    });
  }
});

// 一键下单到京东
router.post('/jd', rateLimiter, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !Array.isArray(config)) {
      return res.status(400).json({
        success: false,
        message: '配置数据格式错误'
      });
    }
    
    const result = await OrderService.orderToJD(config as HardwareItem[]);
    
    return res.json({
      success: result.success,
      message: result.message,
      cartUrl: result.cartUrl,
      items: result.items
    });
  } catch (error) {
    console.error('京东下单失败:', error);
    return res.status(500).json({
      success: false,
      message: '京东下单失败'
    });
  }
});

// 一键下单到所有平台
router.post('/all', rateLimiter, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !Array.isArray(config)) {
      return res.status(400).json({
        success: false,
        message: '配置数据格式错误'
      });
    }
    
    const result = await OrderService.orderToAllPlatforms(config as HardwareItem[]);
    
    return res.json({
      success: result.success,
      message: result.message,
      cartUrl: result.cartUrl,
      items: result.items
    });
  } catch (error) {
    console.error('一键下单失败:', error);
    return res.status(500).json({
      success: false,
      message: '一键下单失败'
    });
  }
});

export default router; 