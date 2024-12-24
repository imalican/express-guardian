import { FileMetadata } from './types';
import { logger } from '@shared/utils/logger';

type UploadedFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export class FileService {
  async uploadFile(file: UploadedFile): Promise<FileMetadata> {
    logger.info('Uploading file:', file.originalname);
    throw new Error('Not implemented');
  }

  async getFileById(id: string): Promise<FileMetadata> {
    logger.info('Fetching file by id:', id);
    // TODO: Implement file retrieval
    throw new Error('Not implemented');
  }

  async deleteFile(id: string): Promise<void> {
    logger.info('Deleting file:', id);
    // TODO: Implement file deletion
    throw new Error('Not implemented');
  }

  async downloadFile(id: string): Promise<Buffer> {
    logger.info('Downloading file:', id);
    throw new Error('Not implemented');
  }
}

export const fileService = new FileService();
