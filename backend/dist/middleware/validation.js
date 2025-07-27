"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: '请求参数验证失败',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};
exports.validateRequest = validateRequest;
exports.validationSchemas = {
    hardwareSearch: joi_1.default.object({
        query: joi_1.default.string().optional(),
        category: joi_1.default.string().valid('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler').optional(),
        brand: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string())).optional(),
        minPrice: joi_1.default.number().min(0).optional(),
        maxPrice: joi_1.default.number().min(0).optional(),
        platform: joi_1.default.string().valid('taobao', 'jd', 'all').optional(),
        inStock: joi_1.default.boolean().optional(),
        sortBy: joi_1.default.string().valid('price', 'rating', 'sales', 'newest').optional(),
        sortOrder: joi_1.default.string().valid('asc', 'desc').optional(),
        page: joi_1.default.number().integer().min(1).optional(),
        limit: joi_1.default.number().integer().min(1).max(100).optional()
    }),
    hardwareId: joi_1.default.object({
        id: joi_1.default.string().required()
    })
};
//# sourceMappingURL=validation.js.map