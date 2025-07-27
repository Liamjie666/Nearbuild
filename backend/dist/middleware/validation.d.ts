import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validationSchemas: {
    hardwareSearch: Joi.ObjectSchema<any>;
    hardwareId: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map