import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: '请求参数验证失败',
        details: error.details.map(detail => detail.message)
      });
    }
    
    return next();
  };
};

// 常用验证模式
export const validationSchemas = {
  hardwareSearch: Joi.object({
    query: Joi.string().optional(),
    category: Joi.string().valid('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler').optional(),
    brand: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    platform: Joi.string().valid('taobao', 'jd', 'all').optional(),
    inStock: Joi.boolean().optional(),
    sortBy: Joi.string().valid('price', 'rating', 'sales', 'newest').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),
  
  hardwareId: Joi.object({
    id: Joi.string().required()
  })
}; 