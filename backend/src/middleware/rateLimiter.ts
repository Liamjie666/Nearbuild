import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// 通用速率限制器
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 每个IP最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 更严格的限制器（用于搜索等消耗资源的操作）
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 20, // 每个IP最多20个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 