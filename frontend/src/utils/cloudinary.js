import cloudinary from 'cloudinary/lib/cloudinary';
import { CLOUDINARY_CONFIG } from '../config/cloudinaryConfig';

// Configure cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
  secure: true
});

// Helper to generate URLs for images
export const getImageUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  return cloudinary.url(publicId, options);
};

// Export the configured cloudinary instance
export default cloudinary;