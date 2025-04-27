import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // if local file path is not present
    if (!localFilePath) {
      return null;
    }

    // upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
      folder: "LIBRARY-MANAGEMENT-SYSTEM",
    });

    // log the success
    console.log(
      "File uploaded to cloudinary successfully",
      response.secure_url
    );

    // delete the locally saved temp file
    fs.unlinkSync(localFilePath);

    // return the response
    return response;
  } catch (error) {
    // log the error
    console.error("Error uploading file to Cloudinary:", error);

    // delete the locally saved temp file
    fs.unlinkSync(localFilePath);

    // return null
    return null;
  }
};

export { uploadOnCloudinary };
