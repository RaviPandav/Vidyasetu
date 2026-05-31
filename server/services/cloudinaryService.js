const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - "image" | "video" | "raw"
 */
const uploadToCloudinary = async (filePath, folder = "vidyasetu", resourceType = "auto") => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary credentials are not configured");
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - "image" | "video" | "raw"
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Upload avatar image
 */
const uploadAvatar = (filePath) =>
  uploadToCloudinary(filePath, "vidyasetu/avatars", "image");

/**
 * Upload course thumbnail
 */
const uploadThumbnail = (filePath) =>
  uploadToCloudinary(filePath, "vidyasetu/thumbnails", "image");

/**
 * Upload lecture video
 */
const uploadVideo = (filePath) =>
  uploadToCloudinary(filePath, "vidyasetu/videos", "video");

/**
 * Upload PDF / study material
 */
const uploadDocument = (filePath) =>
  uploadToCloudinary(filePath, "vidyasetu/documents", "raw");

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadAvatar,
  uploadThumbnail,
  uploadVideo,
  uploadDocument,
};
