import express from 'express';
import { Hardware } from '../models/Hardware';
import { validateRequest } from '../middleware/validation';
import { rateLimiter } from '../middleware/rateLimiter';
import { DataCrawler } from '../services/crawler';

const router = express.Router();

// 获取所有硬件分类
router.get('/categories', rateLimiter, async (req, res) => {
  try {
    const categories = await Hardware.distinct('category');
    return res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取硬件分类失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取硬件分类失败'
    });
  }
});

// 根据分类获取硬件列表
router.get('/category/:category', rateLimiter, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort = 'price', order = 'asc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const sortObj: any = {};
    sortObj[sort as string] = order === 'desc' ? -1 : 1;
    
    const [hardware, total] = await Promise.all([
      Hardware.find({ category })
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Hardware.countDocuments({ category })
    ]);
    
    return res.json({
      success: true,
      data: {
        hardware,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取硬件列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取硬件列表失败'
    });
  }
});

// 搜索硬件
router.get('/search', rateLimiter, async (req, res) => {
  try {
    const { 
      q = '', 
      category = '', 
      platform = 'all',
      minPrice = 0,
      maxPrice = 99999,
      page = 1, 
      limit = 20,
      liveSearch = 'false' // 新增：是否启用实时搜索
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // 如果启用实时搜索且有搜索关键词
    if (liveSearch === 'true' && q && category) {
      console.log(`🔍 实时搜索: ${q} (${category})`);
      
      try {
        // 并行搜索淘宝和京东
        const [taobaoResults, jdResults] = await Promise.all([
          DataCrawler.searchTaobao(q as string, category as any),
          DataCrawler.searchJD(q as string, category as any)
        ]);
        
        // 转换搜索结果
        const liveResults = [
          ...taobaoResults.map(item => DataCrawler.convertToHardwareItem(item, category as any)),
          ...jdResults.map(item => DataCrawler.convertToHardwareItem(item, category as any))
        ];
        
        // 应用价格筛选
        const filteredResults = liveResults.filter(item => 
          item.price >= Number(minPrice) && item.price <= Number(maxPrice)
        );
        
        // 分页
        const paginatedResults = filteredResults.slice(skip, skip + Number(limit));
        
        return res.json({
          success: true,
          data: {
            hardware: paginatedResults,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: filteredResults.length,
              pages: Math.ceil(filteredResults.length / Number(limit))
            },
            source: 'live'
          }
        });
      } catch (liveError) {
        console.error('实时搜索失败，回退到数据库搜索:', liveError);
      }
    }
    
    // 数据库搜索（原有逻辑）
    const query: any = {};
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    
    // 平台筛选
    if (platform !== 'all') {
      query[`platform.${platform}.stock`] = { $gt: 0 };
    }
    
    const [hardware, total] = await Promise.all([
      Hardware.find(query)
        .sort({ price: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Hardware.countDocuments(query)
    ]);
    
    return res.json({
      success: true,
      data: {
        hardware,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        source: 'database'
      }
    });
  } catch (error) {
    console.error('搜索硬件失败:', error);
    return res.status(500).json({
      success: false,
      message: '搜索硬件失败'
    });
  }
});

// 获取硬件详情
router.get('/:id', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const hardware = await Hardware.findById(id);
    
    if (!hardware) {
      return res.status(404).json({
        success: false,
        message: '硬件不存在'
      });
    }
    
    return res.json({
      success: true,
      data: hardware
    });
  } catch (error) {
    console.error('获取硬件详情失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取硬件详情失败'
    });
  }
});

// 获取推荐硬件
router.get('/recommendations/:category', rateLimiter, async (req, res) => {
  try {
    const { category } = req.params;
    const { budget = 99999 } = req.query;
    
    const recommendations = await Hardware.find({
      category,
      price: { $lte: Number(budget) }
    })
    .sort({ price: 1 })
    .limit(5);
    
    return res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('获取推荐硬件失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取推荐硬件失败'
    });
  }
});

// 获取价格趋势
router.get('/price-trend/:id', rateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const hardware = await Hardware.findById(id);
    
    if (!hardware) {
      return res.status(404).json({
        success: false,
        message: '硬件不存在'
      });
    }
    
    // 模拟价格趋势数据
    const priceTrend = [
      { date: '2024-01-01', price: hardware.originalPrice },
      { date: '2024-01-15', price: hardware.price + 100 },
      { date: '2024-02-01', price: hardware.price },
      { date: '2024-02-15', price: hardware.price - 50 }
    ];
    
    return res.json({
      success: true,
      data: priceTrend
    });
  } catch (error) {
    console.error('获取价格趋势失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取价格趋势失败'
    });
  }
});

export default router; 