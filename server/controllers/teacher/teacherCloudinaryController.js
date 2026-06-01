const crypto = require("crypto");

const getCloudinarySignature = (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({
      success: false,
      message: "Cloudinary credentials are not configured.",
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "vidyasetu/videos";
  const resourceType = "video";
  const paramsToSign = `folder=${folder}&resource_type=${resourceType}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${paramsToSign}${apiSecret}`)
    .digest("hex");

  res.json({
    success: true,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    resourceType,
  });
};

module.exports = { getCloudinarySignature };
