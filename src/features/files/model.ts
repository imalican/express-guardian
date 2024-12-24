import mongoose, { Schema, Document, SchemaDefinitionProperty } from 'mongoose';
import { FileMetadata } from './types';

export interface FileDocument extends Omit<FileMetadata, 'id'>, Document {}

const fileSchema = new Schema<FileDocument>(
  {
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    } as unknown as SchemaDefinitionProperty,
  },
  {
    timestamps: true,
  }
);

export const FileModel = mongoose.model<FileDocument>('File', fileSchema);
