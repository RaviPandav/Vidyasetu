const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeLocalFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (cleanupError) {
    console.error(`Failed to cleanup local file: ${filePath}`, cleanupError);
  }
};

const cloudinaryUpload = (methodName, filePath, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader[methodName](filePath, options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - "image" | "video" | "raw"
 */
const uploadToCloudinary = async (filePath, folder = "vidyasetu", resourceType = "auto") => {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary credentials are not configured");
    }

    const result = await cloudinaryUpload("upload", filePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      chunk_size: 6000000,
    });

    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    const statusCode = error?.http_code || error?.status || error?.statusCode;
    const cloudinaryDetails =
      error?.error?.message ||
      error?.message ||
      JSON.stringify(error?.error || error || {}, null, 2);

    const err = new Error(`Cloudinary upload failed: ${cloudinaryDetails}`);
    if (statusCode) err.statusCode = statusCode;
    throw err;
  } finally {
    removeLocalFile(filePath);
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
const uploadVideo = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("Video file path is required for uploadVideo");
    }

    const result = await cloudinaryUpload("upload_large", filePath, {
      folder: "vidyasetu/videos",
      resource_type: "video",
      chunk_size: 6000000,
      use_filename: true,
      unique_filename: true,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const cloudinaryDetails =
      error?.error?.message || error?.message || JSON.stringify(error || {}, null, 2);
    const err = new Error(`Cloudinary video upload failed: ${cloudinaryDetails}`);
    if (error?.http_code) err.statusCode = error.http_code;
    throw err;
  } finally {
    removeLocalFile(filePath);
  }
};

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
