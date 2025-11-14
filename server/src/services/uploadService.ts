// src/services/uploadService.ts
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';

export class UploadService {
    /**
     * Upload image to Cloudinary
     * @param buffer - Image buffer from multer
     * @param folder - Cloudinary folder name
     * @returns Promise<string> - Secure URL of uploaded image
     */
    static async uploadImage(buffer: Buffer, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder,
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto' },
                        { format: 'jpg' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload success:', result?.secure_url);
                        resolve(result!.secure_url);
                    }
                }
            );

            // Convert buffer to stream and pipe to cloudinary
            const stream = Readable.from(buffer);
            stream.pipe(uploadStream);
        });
    }

    /**
     * Delete image from Cloudinary
     * @param imageUrl - Full URL of the image
     * @param folder - Cloudinary folder name
     */
    static async deleteImage(imageUrl: string, folder: string): Promise<void> {
        try {
            // Extract public_id from URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `${folder}/${fileName.split('.')[0]}`;
            
            console.log('Deleting image from Cloudinary:', publicId);
            await cloudinary.uploader.destroy(publicId);
            console.log('Image deleted successfully:', publicId);
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            // Don't throw error, just log it
        }
    }
}