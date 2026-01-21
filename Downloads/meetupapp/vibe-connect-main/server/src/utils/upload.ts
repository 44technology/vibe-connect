import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      file.originalname.toLowerCase().split('.').pop() || ''
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file buffer exists
    if (!file || !file.buffer) {
      reject(new Error('File buffer is missing'));
      return;
    }

    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing. Check your .env file.');
      reject(new Error('Cloudinary configuration is missing. Please check your environment variables.'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ulikme',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error details:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });
          reject(error);
        } else if (!result || !result.secure_url) {
          reject(new Error('Upload succeeded but no URL returned'));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};
