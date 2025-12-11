export interface Song {
    id: string;
    url: string;
    extractedUrl: string;
    platform: 'youtube' | 'spotify' | 'soundcloud' | 'bandlab' | 'other';
    status: 'pending' | 'approved' | 'rejected';
    artistName: string;
    songName: string;
    submitterEmail?: string;
    socialHandles?: string;
    featurePermission?: string;
    nominations?: string;
    submissionCategory?: string;
    submissionReason?: string;
    votes: Vote[];
    notes?: string;
    createdAt: number; // timestamp
}

export interface Vote {
    userId: string;
    userName: string;
    vote: 'approve' | 'reject';
    timestamp: number;
}
