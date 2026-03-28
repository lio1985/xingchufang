export interface ReportSection {
    title: string;
    content: string;
    icon?: string;
}
export interface ReportData {
    sections: ReportSection[];
    generatedAt: string;
    timeRange: string;
}
export interface ReportGenerationRequest {
    timeRange: 'week' | 'month' | 'quarter' | 'year';
}
export interface OperationStatistics {
    loginCount: number;
    conversationCount: number;
    messageCount: number;
    lexiconCount: number;
    fileCount: number;
    quickNoteCount: number;
    viralRemixCount: number;
    searchCount: number;
}
export interface UserBehaviorStatistics {
    activeUsers: number;
    newUsers: number;
    avgSessionDuration: number;
    peakActiveTime: string;
    topFeatures: Array<{
        feature: string;
        usageCount: number;
    }>;
}
export interface ContentStatistics {
    totalLexicons: number;
    totalQuickNotes: number;
    avgLexiconLength: number;
    avgQuickNoteLength: number;
    popularCategories: Array<{
        category: string;
        count: number;
    }>;
}
