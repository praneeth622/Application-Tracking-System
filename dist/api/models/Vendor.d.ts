import mongoose, { Document } from 'mongoose';
export interface IVendor extends Document {
    name: string;
    address?: string;
    contact_person?: string;
    country?: string;
    email?: string;
    phone?: string;
    state?: string;
    status?: string;
    created_at: Date;
    updated_at: Date;
    metadata?: {
        created_by?: string;
        created_by_id?: string;
        last_modified_by?: string;
    };
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any>;
export default _default;
