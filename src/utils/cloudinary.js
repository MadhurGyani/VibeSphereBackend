import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

const uploadOnCloudinary = async (localFilePath,isRaw) => {
    try {
        if (!localFilePath) return null
        const resource_type = "auto";
        if(isRaw) resource_type = "raw" 

        console.log(`Uploading file: ${localFilePath}`); // Log the file being uploaded
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        //fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log("error in adjdfnjsjdnfdnf>>>>>>>>>>>>>>");
        return null;
    }
}



export {uploadOnCloudinary}

