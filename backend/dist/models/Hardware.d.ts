import mongoose, { Document } from 'mongoose';
import { HardwareItem } from '../types/hardware';
export type HardwareDocument = HardwareItem & Document;
export declare const Hardware: mongoose.Model<HardwareDocument, {}, {}, {}, mongoose.Document<unknown, {}, HardwareDocument, {}> & HardwareItem & mongoose.Document<unknown, any, any, Record<string, any>> & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Hardware.d.ts.map