import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RekognitionClient,
  CreateCollectionCommand,
  DeleteCollectionCommand,
  IndexFacesCommand,
  DeleteFacesCommand,
  SearchFacesByImageCommand,
  DetectFacesCommand,
  ListFacesCommand,
  FaceDetail,
  FaceRecord,
  FaceMatch,
  BoundingBox as AwsBoundingBox,
} from '@aws-sdk/client-rekognition';
import { BoundingBox } from './dto/face-recognition.dto';

export interface IndexFaceResult {
  faceId: string;
  boundingBox: BoundingBox;
  quality: number;
  confidence: number;
}

export interface SearchFaceResult {
  faceId: string;
  similarity: number;
  boundingBox?: BoundingBox;
}

export interface DetectedFace {
  boundingBox: BoundingBox;
  confidence: number;
  quality: number;
  landmarks?: { type: string; x: number; y: number }[];
}

@Injectable()
export class RekognitionService {
  private readonly logger = new Logger(RekognitionService.name);
  private readonly client: RekognitionClient;
  private readonly defaultThreshold: number;
  private readonly qualityThreshold: number;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION', 'ap-south-1');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    this.client = new RekognitionClient({
      region,
      credentials: accessKeyId && secretAccessKey
        ? { accessKeyId, secretAccessKey }
        : undefined, // Use default credential chain if not provided
    });

    this.defaultThreshold = this.configService.get('FACE_MATCH_THRESHOLD', 90);
    this.qualityThreshold = this.configService.get('FACE_QUALITY_THRESHOLD', 80);
  }

  /**
   * Create a new face collection for a tenant
   */
  async createCollection(collectionId: string): Promise<string> {
    try {
      const command = new CreateCollectionCommand({
        CollectionId: collectionId,
      });

      const response = await this.client.send(command);
      this.logger.log(`Created collection ${collectionId}: ${response.CollectionArn}`);
      return response.CollectionArn || collectionId;
    } catch (error: any) {
      if (error.name === 'ResourceAlreadyExistsException') {
        this.logger.warn(`Collection ${collectionId} already exists`);
        return collectionId;
      }
      this.logger.error(`Failed to create collection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a face collection
   */
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      const command = new DeleteCollectionCommand({
        CollectionId: collectionId,
      });

      await this.client.send(command);
      this.logger.log(`Deleted collection ${collectionId}`);
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        this.logger.warn(`Collection ${collectionId} not found`);
        return;
      }
      throw error;
    }
  }

  /**
   * Index a face from an image (for enrollment)
   */
  async indexFace(
    collectionId: string,
    imageSource: { url?: string; bytes?: Buffer },
    externalImageId?: string,
  ): Promise<IndexFaceResult | null> {
    try {
      const image = await this.getImageInput(imageSource);

      const command = new IndexFacesCommand({
        CollectionId: collectionId,
        Image: image,
        ExternalImageId: externalImageId,
        MaxFaces: 1,
        QualityFilter: 'AUTO',
        DetectionAttributes: ['ALL'],
      });

      const response = await this.client.send(command);

      if (!response.FaceRecords || response.FaceRecords.length === 0) {
        if (response.UnindexedFaces && response.UnindexedFaces.length > 0) {
          const reason = response.UnindexedFaces[0].Reasons?.join(', ') || 'Unknown';
          throw new BadRequestException(`Face could not be indexed: ${reason}`);
        }
        throw new BadRequestException('No face detected in the image');
      }

      const faceRecord = response.FaceRecords[0];
      const face = faceRecord.Face!;
      const faceDetail = faceRecord.FaceDetail!;

      return {
        faceId: face.FaceId!,
        boundingBox: this.convertBoundingBox(face.BoundingBox!),
        quality: this.calculateQuality(faceDetail),
        confidence: face.Confidence || 0,
      };
    } catch (error: any) {
      this.logger.error(`Failed to index face: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a face from collection
   */
  async deleteFace(collectionId: string, faceId: string): Promise<void> {
    try {
      const command = new DeleteFacesCommand({
        CollectionId: collectionId,
        FaceIds: [faceId],
      });

      await this.client.send(command);
      this.logger.log(`Deleted face ${faceId} from collection ${collectionId}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete face: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for faces in collection that match the input image
   */
  async searchFaces(
    collectionId: string,
    imageSource: { url?: string; bytes?: Buffer },
    threshold?: number,
    maxFaces: number = 10,
  ): Promise<SearchFaceResult[]> {
    try {
      const image = await this.getImageInput(imageSource);

      const command = new SearchFacesByImageCommand({
        CollectionId: collectionId,
        Image: image,
        FaceMatchThreshold: threshold || this.defaultThreshold,
        MaxFaces: maxFaces,
      });

      const response = await this.client.send(command);

      if (!response.FaceMatches || response.FaceMatches.length === 0) {
        return [];
      }

      return response.FaceMatches.map((match) => ({
        faceId: match.Face!.FaceId!,
        similarity: match.Similarity || 0,
        boundingBox: match.Face?.BoundingBox
          ? this.convertBoundingBox(match.Face.BoundingBox)
          : undefined,
      }));
    } catch (error: any) {
      if (error.name === 'InvalidParameterException' &&
          error.message?.includes('no faces')) {
        return [];
      }
      this.logger.error(`Failed to search faces: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect all faces in an image (for class photo processing)
   */
  async detectFaces(
    imageSource: { url?: string; bytes?: Buffer },
  ): Promise<DetectedFace[]> {
    try {
      const image = await this.getImageInput(imageSource);

      const command = new DetectFacesCommand({
        Image: image,
        Attributes: ['ALL'],
      });

      const response = await this.client.send(command);

      if (!response.FaceDetails || response.FaceDetails.length === 0) {
        return [];
      }

      return response.FaceDetails.map((face) => ({
        boundingBox: this.convertBoundingBox(face.BoundingBox!),
        confidence: face.Confidence || 0,
        quality: this.calculateQuality(face),
        landmarks: face.Landmarks?.map((l) => ({
          type: l.Type || 'unknown',
          x: l.X || 0,
          y: l.Y || 0,
        })),
      }));
    } catch (error: any) {
      this.logger.error(`Failed to detect faces: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for multiple faces in a single image (batch processing)
   */
  async searchMultipleFaces(
    collectionId: string,
    imageSource: { url?: string; bytes?: Buffer },
    threshold?: number,
  ): Promise<{ searchedFace: DetectedFace; matches: SearchFaceResult[] }[]> {
    // First detect all faces
    const detectedFaces = await this.detectFaces(imageSource);

    if (detectedFaces.length === 0) {
      return [];
    }

    // For each detected face, search in collection
    // Note: AWS Rekognition SearchFacesByImage returns the best match
    // For multiple faces, we need to crop and search each face individually
    // This is a simplified implementation that searches the whole image

    const searchResults = await this.searchFaces(
      collectionId,
      imageSource,
      threshold,
      detectedFaces.length,
    );

    // Map detected faces to search results based on bounding box proximity
    return detectedFaces.map((face) => ({
      searchedFace: face,
      matches: searchResults.filter((match) => {
        if (!match.boundingBox) return false;
        return this.boundingBoxesOverlap(face.boundingBox, match.boundingBox);
      }),
    }));
  }

  /**
   * List all faces in a collection
   */
  async listFaces(collectionId: string, maxResults: number = 100): Promise<{
    faceId: string;
    externalImageId?: string;
  }[]> {
    try {
      const command = new ListFacesCommand({
        CollectionId: collectionId,
        MaxResults: maxResults,
      });

      const response = await this.client.send(command);

      return (response.Faces || []).map((face) => ({
        faceId: face.FaceId!,
        externalImageId: face.ExternalImageId,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to list faces: ${error.message}`);
      throw error;
    }
  }

  // ============ Helper Methods ============

  private async getImageInput(imageSource: { url?: string; bytes?: Buffer }): Promise<{
    S3Object?: { Bucket: string; Name: string };
    Bytes?: Uint8Array;
  }> {
    if (imageSource.bytes) {
      return { Bytes: imageSource.bytes };
    }

    if (imageSource.url) {
      // If it's an S3 URL, parse it
      if (imageSource.url.includes('s3.amazonaws.com') || imageSource.url.startsWith('s3://')) {
        const { bucket, key } = this.parseS3Url(imageSource.url);
        return { S3Object: { Bucket: bucket, Name: key } };
      }

      // Otherwise, download the image and use bytes
      const response = await fetch(imageSource.url);
      const arrayBuffer = await response.arrayBuffer();
      return { Bytes: new Uint8Array(arrayBuffer) };
    }

    throw new BadRequestException('Either url or bytes must be provided');
  }

  private parseS3Url(url: string): { bucket: string; key: string } {
    if (url.startsWith('s3://')) {
      const parts = url.replace('s3://', '').split('/');
      return {
        bucket: parts[0],
        key: parts.slice(1).join('/'),
      };
    }

    // Parse https://bucket.s3.region.amazonaws.com/key format
    const match = url.match(/https?:\/\/([^.]+)\.s3[^/]*\.amazonaws\.com\/(.+)/);
    if (match) {
      return { bucket: match[1], key: match[2] };
    }

    // Parse https://s3.region.amazonaws.com/bucket/key format
    const match2 = url.match(/https?:\/\/s3[^/]*\.amazonaws\.com\/([^/]+)\/(.+)/);
    if (match2) {
      return { bucket: match2[1], key: match2[2] };
    }

    throw new BadRequestException('Invalid S3 URL format');
  }

  private convertBoundingBox(awsBox: AwsBoundingBox): BoundingBox {
    return {
      left: awsBox.Left || 0,
      top: awsBox.Top || 0,
      width: awsBox.Width || 0,
      height: awsBox.Height || 0,
    };
  }

  private calculateQuality(faceDetail: FaceDetail): number {
    const quality = faceDetail.Quality;
    if (!quality) return 0;

    // Average of brightness and sharpness
    const brightness = quality.Brightness || 0;
    const sharpness = quality.Sharpness || 0;

    return (brightness + sharpness) / 2;
  }

  private boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
    // Check if two bounding boxes overlap with some tolerance
    const tolerance = 0.1; // 10% tolerance

    const overlapX = Math.max(0,
      Math.min(box1.left + box1.width, box2.left + box2.width) -
      Math.max(box1.left, box2.left)
    );

    const overlapY = Math.max(0,
      Math.min(box1.top + box1.height, box2.top + box2.height) -
      Math.max(box1.top, box2.top)
    );

    const overlapArea = overlapX * overlapY;
    const box1Area = box1.width * box1.height;

    return overlapArea / box1Area > tolerance;
  }

  /**
   * Get the collection ID for a tenant
   */
  getCollectionId(tenantId: string): string {
    const prefix = this.configService.get('FACE_COLLECTION_PREFIX', 'edunexus');
    return `${prefix}-${tenantId}`;
  }

  /**
   * Check if AWS credentials are configured
   */
  isConfigured(): boolean {
    const accessKey = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    return !!(accessKey && secretKey);
  }
}
