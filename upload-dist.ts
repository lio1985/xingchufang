import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";

async function main() {
  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: "",
    secretKey: "",
    bucketName: process.env.COZE_BUCKET_NAME,
    region: "cn-beijing",
  });

  // 读取文件
  const fileBuffer = readFileSync("/workspace/projects/dist-web.tar.gz");
  console.log("文件大小:", fileBuffer.length, "bytes");

  // 上传文件
  const key = await storage.uploadFile({
    fileContent: fileBuffer,
    fileName: "dist-web.tar.gz",
    contentType: "application/gzip",
  });
  console.log("上传成功, key:", key);

  // 生成签名 URL (有效期 1 小时)
  const url = await storage.generatePresignedUrl({
    key,
    expireTime: 3600,
  });
  console.log("\n下载链接 (1小时有效):");
  console.log(url);
}

main().catch(console.error);
