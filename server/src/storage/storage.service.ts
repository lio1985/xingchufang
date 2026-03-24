import { Injectable } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';

@Injectable()
export class StorageService {
  private s3Storage: S3Storage;

  constructor() {
    this.s3Storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  /**
   * 上传文件到对象存储
   * @param fileContent 文件内容（Buffer）
   * @param fileName 文件名
   * @param contentType 文件类型
   * @returns 文件存储的 key
   */
  async uploadFile(fileContent: Buffer, fileName: string, contentType: string): Promise<string> {
    const fileKey = await this.s3Storage.uploadFile({
      fileContent,
      fileName,
      contentType,
    });
    return fileKey;
  }

  /**
   * 生成预签名 URL
   * @param fileKey 文件 key
   * @param expireTime 过期时间（秒），默认 1 天
   * @returns 预签名 URL
   */
  async generatePresignedUrl(fileKey: string, expireTime: number = 86400): Promise<string> {
    return this.s3Storage.generatePresignedUrl({
      key: fileKey,
      expireTime,
    });
  }

  /**
   * 删除文件
   * @param fileKey 文件 key
   * @returns 是否删除成功
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    return this.s3Storage.deleteFile({ fileKey });
  }

  /**
   * 检查文件是否存在
   * @param fileKey 文件 key
   * @returns 文件是否存在
   */
  async fileExists(fileKey: string): Promise<boolean> {
    return this.s3Storage.fileExists({ fileKey });
  }
}
