import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export interface UploadResult {
  key: string;
  bucket: string;
  region: string;
  url: string;
  checksum: string;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-south-1');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'edunexus-documents');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * Generate a unique S3 key for document storage
   * Format: tenants/{tenantId}/{category}/{year}/{month}/{uuid}-{filename}
   */
  generateKey(tenantId: string, category: string, filename: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const sanitizedFilename = this.sanitizeFilename(filename);

    return `tenants/${tenantId}/${category}/${year}/${month}/${uuid}-${sanitizedFilename}`;
  }

  /**
   * Sanitize filename to be S3-safe
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .slice(0, 100); // Limit length
  }

  /**
   * Upload a file to S3
   */
  async upload(
    tenantId: string,
    category: string,
    file: Express.Multer.File,
    customKey?: string,
  ): Promise<UploadResult> {
    const key = customKey || this.generateKey(tenantId, category, file.originalname);

    // Calculate MD5 checksum
    const checksum = crypto.createHash('md5').update(file.buffer).digest('hex');

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            'tenant-id': tenantId,
            'original-name': encodeURIComponent(file.originalname),
            'checksum': checksum,
            'uploaded-at': new Date().toISOString(),
          },
        }),
      );

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      this.logger.log(`File uploaded successfully: ${key}`);

      return {
        key,
        bucket: this.bucket,
        region: this.region,
        url,
        checksum,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload file to storage');
    }
  }

  /**
   * Upload raw buffer to S3
   */
  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    const checksum = crypto.createHash('md5').update(buffer).digest('hex');

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          Metadata: {
            checksum,
            'uploaded-at': new Date().toISOString(),
            ...metadata,
          },
        }),
      );

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return {
        key,
        bucket: this.bucket,
        region: this.region,
        url,
        checksum,
      };
    } catch (error) {
      this.logger.error(`Failed to upload buffer: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload to storage');
    }
  }

  /**
   * Get a presigned URL for downloading a file
   */
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<PresignedUrlResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return { url, expiresIn };
    } catch (error) {
      this.logger.error(`Failed to generate download URL: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Get a presigned URL for uploading a file directly to S3
   */
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<PresignedUrlResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return { url, expiresIn };
    } catch (error) {
      this.logger.error(`Failed to generate upload URL: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to generate upload URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async delete(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete file from storage');
    }
  }

  /**
   * Copy a file within S3 (useful for versioning)
   */
  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${sourceKey}`,
          Key: destinationKey,
        }),
      );

      this.logger.log(`File copied: ${sourceKey} -> ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to copy file');
    }
  }

  /**
   * Check if a file exists in S3
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   */
  async getMetadata(key: string): Promise<Record<string, string>> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        contentType: response.ContentType || '',
        contentLength: String(response.ContentLength || 0),
        lastModified: response.LastModified?.toISOString() || '',
        ...response.Metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to get file metadata');
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(prefix: string, maxKeys = 100): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: maxKeys,
        }),
      );

      return (response.Contents || []).map((item) => item.Key || '');
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to list files');
    }
  }

  /**
   * Get the bucket name
   */
  getBucket(): string {
    return this.bucket;
  }

  /**
   * Get the region
   */
  getRegion(): string {
    return this.region;
  }
}
