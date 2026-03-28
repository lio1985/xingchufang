export interface QuickNote {
    id: string;
    user_id: string;
    title: string;
    content: string;
    tags: string[];
    images: string[];
    is_starred: boolean;
    is_pinned: boolean;
    visibility?: string;
    team_id?: string;
    created_at: string;
    updated_at: string;
    userNickname?: string;
    userAvatar?: string;
}
export interface QuickNoteListResponse {
    notes: QuickNote[];
    total: number;
    page: number;
    pageSize: number;
}
export interface CreateQuickNoteDto {
    title: string;
    content: string;
    tags?: string[];
    images?: string[];
    is_starred?: boolean;
    is_pinned?: boolean;
    visibility?: string;
}
export interface UpdateQuickNoteDto {
    title?: string;
    content?: string;
    tags?: string[];
    images?: string[];
    is_starred?: boolean;
    is_pinned?: boolean;
    visibility?: string;
}
