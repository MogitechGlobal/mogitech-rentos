// apps/api/src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import 'multer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'mogirentos',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) return reject(error);
          
          // FIX: Tell TypeScript we guarantee 'result' exists before resolving
          if (!result) {
            return reject(new Error('Upload failed: Cloudinary returned undefined.'));
          }
          
          resolve(result);
        },
      );

      // Convert the memory buffer from Multer into a stream for Cloudinary
      toStream(file.buffer).pipe(upload);
    });
  }
}