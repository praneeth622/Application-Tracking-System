import mongoose from 'mongoose';
export interface IUser extends mongoose.Document {
    uid: string;
    email: string;
    name?: string;
    role: 'user' | 'admin' | 'recruiter';
    created_at: Date;
    updated_at: Date;
}
declare const User: mongoose.Model<any, {}, {}, {}, any, any>;
export default User;
