"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimediaService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
const supabase_client_1 = require("../storage/database/supabase-client");
const coze_coding_dev_sdk_2 = require("coze-coding-dev-sdk");
const user_service_1 = require("../user/user.service");
let MultimediaService = class MultimediaService {
    constructor(userService) {
        this.userService = userService;
        this.client = (0, supabase_client_1.getSupabaseClient)();
        this.s3Storage = new coze_coding_dev_sdk_1.S3Storage({
            endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
            accessKey: '',
            secretKey: '',
            bucketName: process.env.COZE_BUCKET_NAME,
            region: 'cn-beijing',
        });
        const config = new coze_coding_dev_sdk_2.Config();
        this.asrClient = new coze_coding_dev_sdk_2.ASRClient(config);
    }
    async uploadFile(userId, file, options) {
        console.log('=== 开始上传文件 ===');
        console.log('用户ID:', userId);
        console.log('文件名:', file.originalname);
        console.log('文件大小:', file.size);
        console.log('Content-Type:', file.mimetype);
        try {
            const type = this.getFileType(file.mimetype);
            const fileKey = await this.s3Storage.uploadFile({
                fileContent: file.buffer,
                fileName: `uploads/${userId}/${Date.now()}_${file.originalname}`,
                contentType: file.mimetype,
            });
            console.log('文件已上传到对象存储:', fileKey);
            const url = await this.s3Storage.generatePresignedUrl({
                key: fileKey,
                expireTime: 86400,
            });
            let transcript;
            if (type === 'audio' && options?.transcribeAudio) {
                try {
                    console.log('开始语音识别...');
                    transcript = await this.transcribeAudio(url);
                    console.log('语音识别完成:', transcript);
                }
                catch (error) {
                    console.error('语音识别失败:', error);
                }
            }
            const { data, error } = await this.client
                .from('multimedia_resources')
                .insert({
                user_id: userId,
                type,
                file_key: fileKey,
                original_filename: file.originalname,
                file_size: file.size,
                content_type: file.mimetype,
                transcript,
            })
                .select()
                .single();
            if (error) {
                console.error('保存多媒体资源失败:', error);
                throw new Error(`保存多媒体资源失败: ${error.message}`);
            }
            console.log('多媒体资源已保存到数据库:', data.id);
            return {
                id: data.id,
                fileKey: data.file_key,
                url,
                type: data.type,
                originalFilename: data.original_filename,
                fileSize: data.file_size,
                contentType: data.content_type,
                transcript: data.transcript,
            };
        }
        catch (error) {
            console.error('上传文件失败:', error);
            throw new common_1.BadRequestException(`上传文件失败: ${error.message}`);
        }
    }
    async getUserResources(currentUserId, targetUserId, type, limit = 50, offset = 0) {
        console.log('=== 获取用户多媒体资源 ===');
        console.log('当前用户ID:', currentUserId);
        console.log('目标用户ID:', targetUserId);
        console.log('类型过滤:', type);
        try {
            const isAdmin = await this.userService.isAdmin(currentUserId);
            if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
                throw new common_1.ForbiddenException('无权查看其他用户的资源');
            }
            const queryUserId = targetUserId || currentUserId;
            let query = this.client
                .from('multimedia_resources')
                .select('*', { count: 'exact' })
                .eq('user_id', queryUserId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            if (type) {
                query = query.eq('type', type);
            }
            const { data, error, count } = await query;
            if (error) {
                console.error('获取多媒体资源失败:', error);
                throw new Error(`获取多媒体资源失败: ${error.message}`);
            }
            console.log(`找到 ${count} 个资源`);
            return {
                resources: (data || []).map(item => ({
                    id: item.id,
                    userId: item.user_id,
                    type: item.type,
                    fileKey: item.file_key,
                    originalFilename: item.original_filename,
                    fileSize: item.file_size,
                    contentType: item.content_type,
                    duration: item.duration,
                    transcript: item.transcript,
                    createdAt: item.created_at,
                })),
                total: count || 0,
            };
        }
        catch (error) {
            console.error('获取多媒体资源失败:', error);
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`获取多媒体资源失败: ${error.message}`);
        }
    }
    async getResourceById(resourceId, currentUserId) {
        console.log('=== 获取资源详情 ===');
        console.log('资源ID:', resourceId);
        const { data: resource, error: fetchError } = await this.client
            .from('multimedia_resources')
            .select('*')
            .eq('id', resourceId)
            .single();
        if (fetchError || !resource) {
            throw new common_1.NotFoundException('资源不存在');
        }
        const isAdmin = await this.userService.isAdmin(currentUserId);
        if (!isAdmin && resource.user_id !== currentUserId) {
            throw new common_1.ForbiddenException('无权访问此资源');
        }
        const url = await this.s3Storage.generatePresignedUrl({
            key: resource.file_key,
            expireTime: 86400,
        });
        return {
            id: resource.id,
            userId: resource.user_id,
            type: resource.type,
            fileKey: resource.file_key,
            originalFilename: resource.original_filename,
            fileSize: resource.file_size,
            contentType: resource.content_type,
            duration: resource.duration,
            transcript: resource.transcript,
            createdAt: resource.created_at,
            url,
        };
    }
    async deleteResource(resourceId, currentUserId) {
        console.log('=== 删除资源 ===');
        console.log('资源ID:', resourceId);
        const { data: resource, error: fetchError } = await this.client
            .from('multimedia_resources')
            .select('file_key, user_id')
            .eq('id', resourceId)
            .single();
        if (fetchError || !resource) {
            throw new common_1.NotFoundException('资源不存在');
        }
        const isAdmin = await this.userService.isAdmin(currentUserId);
        if (!isAdmin && resource.user_id !== currentUserId) {
            throw new common_1.ForbiddenException('无权删除此资源');
        }
        try {
            await this.s3Storage.deleteFile({ fileKey: resource.file_key });
            console.log('已从对象存储删除文件:', resource.file_key);
        }
        catch (error) {
            console.error('删除对象存储文件失败:', error);
        }
        const { error: deleteError } = await this.client
            .from('multimedia_resources')
            .delete()
            .eq('id', resourceId);
        if (deleteError) {
            console.error('删除数据库记录失败:', deleteError);
            throw new Error(`删除资源失败: ${deleteError.message}`);
        }
        console.log('资源已删除');
    }
    async transcribeAudio(audioUrl) {
        console.log('=== 语音识别 ===');
        console.log('音频URL:', audioUrl);
        try {
            const result = await this.asrClient.recognize({
                url: audioUrl,
            });
            console.log('识别结果:', result.text);
            return result.text;
        }
        catch (error) {
            console.error('语音识别失败:', error);
            throw new Error(`语音识别失败: ${error.message}`);
        }
    }
    async getFileUrl(fileKey, expireTime = 86400) {
        return await this.s3Storage.generatePresignedUrl({
            key: fileKey,
            expireTime,
        });
    }
    getFileType(contentType) {
        if (contentType.startsWith('image/')) {
            return 'image';
        }
        else if (contentType.startsWith('audio/')) {
            return 'audio';
        }
        else if (contentType.startsWith('video/')) {
            return 'video';
        }
        else {
            return 'document';
        }
    }
};
exports.MultimediaService = MultimediaService;
exports.MultimediaService = MultimediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], MultimediaService);
//# sourceMappingURL=multimedia.service.js.map