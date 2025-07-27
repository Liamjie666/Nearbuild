"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Hardware_1 = require("../models/Hardware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
router.get('/categories', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const categories = await Hardware_1.Hardware.distinct('category');
        return res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        console.error('获取硬件分类失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取硬件分类失败'
        });
    }
});
router.get('/category/:category', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20, sort = 'price', order = 'asc' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;
        const [hardware, total] = await Promise.all([
            Hardware_1.Hardware.find({ category })
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit)),
            Hardware_1.Hardware.countDocuments({ category })
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
    }
    catch (error) {
        console.error('获取硬件列表失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取硬件列表失败'
        });
    }
});
router.get('/search', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const { q = '', category = '', platform = 'all', minPrice = 0, maxPrice = 99999, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {};
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
        if (platform !== 'all') {
            query[`platform.${platform}.stock`] = { $gt: 0 };
        }
        const [hardware, total] = await Promise.all([
            Hardware_1.Hardware.find(query)
                .sort({ price: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Hardware_1.Hardware.countDocuments(query)
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
    }
    catch (error) {
        console.error('搜索硬件失败:', error);
        return res.status(500).json({
            success: false,
            message: '搜索硬件失败'
        });
    }
});
router.get('/:id', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const hardware = await Hardware_1.Hardware.findById(id);
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
    }
    catch (error) {
        console.error('获取硬件详情失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取硬件详情失败'
        });
    }
});
router.get('/recommendations/:category', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const { category } = req.params;
        const { budget = 99999 } = req.query;
        const recommendations = await Hardware_1.Hardware.find({
            category,
            price: { $lte: Number(budget) }
        })
            .sort({ price: 1 })
            .limit(5);
        return res.json({
            success: true,
            data: recommendations
        });
    }
    catch (error) {
        console.error('获取推荐硬件失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取推荐硬件失败'
        });
    }
});
router.get('/price-trend/:id', rateLimiter_1.rateLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const hardware = await Hardware_1.Hardware.findById(id);
        if (!hardware) {
            return res.status(404).json({
                success: false,
                message: '硬件不存在'
            });
        }
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
    }
    catch (error) {
        console.error('获取价格趋势失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取价格趋势失败'
        });
    }
});
exports.default = router;
//# sourceMappingURL=hardware.js.map