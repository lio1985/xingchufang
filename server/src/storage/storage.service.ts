import { Injectable, Logger } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storage: S3Storage;

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  /**
   * 上传文件到对象存储
   * @param buffer 文件内容
   * @param fileName 文件名
   * @param contentType 文件类型
   * @returns 文件 key
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    this.logger.log(`上传文件: ${fileName}, contentType: ${contentType}`);

    const fileKey = await this.storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType,
    });

    this.logger.log(`文件上传成功, key: ${fileKey}`);
    return fileKey;
  }

  /**
   * 获取文件访问 URL
   * @param fileKey 文件 key
   * @param expireTime 过期时间（秒），默认 1 天
   * @returns 签名 URL
   */
  async getFileUrl(fileKey: string, expireTime: number = 86400): Promise<string> {
    const url = await this.storage.generatePresignedUrl({
      key: fileKey,
      expireTime,
    });
    return url;
  }

  /**
   * 生成预签名 URL（别名方法，兼容旧代码）
   * @param fileKey 文件 key
   * @param expireTime 过期时间（秒），默认 1 天
   * @returns 签名 URL
   */
  async generatePresignedUrl(fileKey: string, expireTime: number = 86400): Promise<string> {
    return this.getFileUrl(fileKey, expireTime);
  }

  /**
   * 删除文件
   * @param fileKey 文件 key
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    this.logger.log(`删除文件: ${fileKey}`);
    return await this.storage.deleteFile({ fileKey });
  }

  /**
   * 检查文件是否存在
   * @param fileKey 文件 key
   */
  async fileExists(fileKey: string): Promise<boolean> {
    return await this.storage.fileExists({ fileKey });
  }
}
