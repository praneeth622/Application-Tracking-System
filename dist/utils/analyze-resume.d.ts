interface SavedResumeResponse {
    _id: string;
    filename: string;
    filelink: string;
    fileHash: string;
    analysis: any;
    vendor_id?: string;
    vendor_name?: string;
    user_id: string;
    uploaded_at: string;
    [key: string]: any;
}
export declare function analyzeResume(file: File, userId: string, userEmail: string, vendorId?: string | null, vendorName?: string | null): Promise<{
    analysis: any;
    savedData: SavedResumeResponse;
}>;
export {};
