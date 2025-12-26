import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary lazily - only when needed
const configureCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  // Check if all required env vars are present
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error("Cloudinary ENV:", {
      name: config.cloud_name || "MISSING",
      key: config.api_key ? "***" : "MISSING",
      secret: config.api_secret ? "***" : "MISSING",
    });
    throw new Error("Missing Cloudinary environment variables. Please check your .env file.");
  }

  cloudinary.config(config);
  return true;
};

const uploadResult = async (filePath, folder = "default") => {
  try {
    if (!filePath) return null;

    // Configure Cloudinary before upload
    configureCloudinary();

    const response = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
};

export { uploadResult };
