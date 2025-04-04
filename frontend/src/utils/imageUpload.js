import { CLOUDINARY_CONFIG } from '../config/cloudinaryConfig';

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    // Create form data
    const formData = new FormData();
    
    // Get filename from URI
    const filename = imageUri.split('/').pop();
    
    // Append file
    formData.append('file', {
      uri: imageUri,
      name: filename || 'photo.jpg',
      type: 'image/jpeg'
    });
    
    // Append upload preset
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    console.log('Uploading to Cloudinary...', {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();
    console.log('Cloudinary response:', data);

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to upload image');
    }

    return {
      success: true,
      public_id: data.public_id,
      url: data.secure_url
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};