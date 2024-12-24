export interface FileMetadata {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface FileUploadOptions {
  allowedTypes?: string[];
  maxSize?: number;
  destination?: string;
}

export interface FileDownloadOptions {
  asAttachment?: boolean;
  fileName?: string;
}
