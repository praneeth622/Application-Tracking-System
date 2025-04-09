import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        uid: string;
        email: string;
        role?: string;
        [key: string]: any;
    };
}
export declare const checkDuplicateResume: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const saveResume: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUserResumes: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getResumeById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteResume: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllResumes: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
