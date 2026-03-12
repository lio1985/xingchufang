import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { ASRClient, Config } from 'coze-coding-dev-sdk';
import { UserService } from '../user/user.service';

export interface UploadResult {
  id: string;
  fileKey: string;
  url: string;
  type: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  transcript?: string;
}

export interface MultimediaResource {
  id: string;
  userId: string;
  type: 'image' | 'audio' | 'video' | 'document';
  fileKey: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  duration?: number;
  transcript?: string;
  createdAt: string;
}

@Injectable()
export class MultimediaService {
  private s3Storage: S3Storage;
  private asrClient: ASRClient;
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {
    this.s3Storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    const config = new Config();
    this.asrClient = new ASRClient(config);
  }

  /**
   * 上传文件
   */
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    options?: {
      transcribeAudio?: boolean; // 是否对音频进行语音识别
    }
  ): Promise<UploadResult> {
    console.log('=== 开始上传文件 ===');
    console.log('用户ID:', userId);
    console.log('文件名:', file.originalname);
    console.log('文件大小:', file.size);
    console.log('Content-Type:', file.mimetype);

    try {
      // 确定文件类型
      const type = this.getFileType(file.mimetype);

      // 上传到对象存储
      const fileKey = await this.s3Storage.uploadFile({
        fileContent: file.buffer,
        fileName: `uploads/${userId}/${Date.now()}_${file.originalname}`,
        contentType: file.mimetype,
      });

      console.log('文件已上传到对象存储:', fileKey);

      // 生成访问URL
      const url = await this.s3Storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 86400, // 24小时有效期
      });

      // 语音识别（如果是音频文件且用户要求）
      let transcript: string | undefined;
      if (type === 'audio' && options?.transcribeAudio) {
        try {
          console.log('开始语音识别...');
          transcript = await this.transcribeAudio(url);
          console.log('语音识别完成:', transcript);
        } catch (error) {
          console.error('语音识别失败:', error);
          // 语音识别失败不影响文件上传
        }
      }

      // 保存到数据库
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
    } catch (error: any) {
      console.error('上传文件失败:', error);
      throw new BadRequestException(`上传文件失败: ${error.message}`);
    }
  }

  /**
   * 获取用户的多媒体资源列表
   */
  async getUserResources(
    currentUserId: string,
    targetUserId?: string,
    type?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ resources: MultimediaResource[]; total: number }> {
    console.log('=== 获取用户多媒体资源 ===');
    console.log('当前用户ID:', currentUserId);
    console.log('目标用户ID:', targetUserId);
    console.log('类型过滤:', type);

    try {
      const isAdmin = await this.userService.isAdmin(currentUserId);

      // 如果不是管理员且指定了目标用户ID，则只能查看自己的资源
      if (!isAdmin && targetUserId && targetUserId !== currentUserId) {
        throw new ForbiddenException('无权查看其他用户的资源');
      }

      // 确定要查询的用户ID
      // targetUserId 在 controller 层已验证，如果是非法字符串会抛出 400
      // 如果 targetUserId 是 undefined，表示不传参数，查询当前用户的资源
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
    } catch (error: any) {
      console.error('获取多媒体资源失败:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`获取多媒体资源失败: ${error.message}`);
    }
  }

  /**
   * 获取资源详情
   */
  async getResourceById(resourceId: string, currentUserId: string): Promise<MultimediaResource> {
    console.log('=== 获取资源详情 ===');
    console.log('资源ID:', resourceId);

    // 先获取资源信息
    const { data: resource, error: fetchError } = await this.client
      .from('multimedia_resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (fetchError || !resource) {
      throw new NotFoundException('资源不存在');
    }

    // 验证访问权限
    const isAdmin = await this.userService.isAdmin(currentUserId);
    if (!isAdmin && resource.user_id !== currentUserId) {
      throw new ForbiddenException('无权访问此资源');
    }

    // 生成访问URL
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
      url, // 临时添加URL用于访问
    } as any;
  }

  /**
   * 删除资源
   */
  async deleteResource(resourceId: string, currentUserId: string): Promise<void> {
    console.log('=== 删除资源 ===');
    console.log('资源ID:', resourceId);

    // 获取资源信息
    const { data: resource, error: fetchError } = await this.client
      .from('multimedia_resources')
      .select('file_key, user_id')
      .eq('id', resourceId)
      .single();

    if (fetchError || !resource) {
      throw new NotFoundException('资源不存在');
    }

    // 验证权限
    const isAdmin = await this.userService.isAdmin(currentUserId);
    if (!isAdmin && resource.user_id !== currentUserId) {
      throw new ForbiddenException('无权删除此资源');
    }

    // 删除对象存储中的文件
    try {
      await this.s3Storage.deleteFile({ fileKey: resource.file_key });
      console.log('已从对象存储删除文件:', resource.file_key);
    } catch (error) {
      console.error('删除对象存储文件失败:', error);
      // 继续删除数据库记录
    }

    // 删除数据库记录
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

  /**
   * 语音识别
   */
  async transcribeAudio(audioUrl: string): Promise<string> {
    console.log('=== 语音识别 ===');
    console.log('音频URL:', audioUrl);

    try {
      const result = await this.asrClient.recognize({
        url: audioUrl,
      });

      console.log('识别结果:', result.text);
      return result.text;
    } catch (error: any) {
      console.error('语音识别失败:', error);
      throw new Error(`语音识别失败: ${error.message}`);
    }
  }

  /**
   * 获取文件的访问URL
   */
  async getFileUrl(fileKey: string, expireTime: number = 86400): Promise<string> {
    return await this.s3Storage.generatePresignedUrl({
      key: fileKey,
      expireTime,
    });
  }

  /**
   * 根据Content-Type判断文件类型
   */
  private getFileType(contentType: string): 'image' | 'audio' | 'video' | 'document' {
    if (contentType.startsWith('image/')) {
      return 'image';
    } else if (contentType.startsWith('audio/')) {
      return 'audio';
    } else if (contentType.startsWith('video/')) {
      return 'video';
    } else {
      return 'document';
    }
  }
}
