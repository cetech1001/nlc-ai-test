import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3MultipartService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private cfg: ConfigService) {
    const c = this.cfg.get('media.provider.s3');
    this.bucket = c.bucketName;
    this.s3 = new S3Client({
      region: c.region,
      credentials: {
        accessKeyId: c.accessKeyID,
        secretAccessKey: c.secretAccessKey,
      },
    });
  }

  async initMultipart(key: string, contentType: string) {
    console.error(`Key: ${key}, Content-Type: ${contentType}`);

    const cmd = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    });
    console.log("CreateMultipartUploadCommand called successfully");
    const res = await this.s3.send(cmd);
    console.log("send completed successfully");
    return { uploadId: res.UploadId!, key };
  }

  async getPartUrl(key: string, uploadId: string, partNumber: number) {
    const cmd = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });
    return await getSignedUrl(this.s3, cmd, {expiresIn: 3600});
  }

  async completeMultipart(key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    const cmd = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.sort((a,b) => a.PartNumber - b.PartNumber) },
    });
    await this.s3.send(cmd);
    return { key };
  }
}
