import mongoose from 'mongoose';
declare function connectDB(): Promise<typeof mongoose>;
export default connectDB;
