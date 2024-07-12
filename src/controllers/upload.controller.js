import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { m3u8Genrator, uploadM3U8File } from "../utils/m3u8Handler.js";

const readM3U8File = (filePath) => {
  return fs.readFileSync(filePath, "utf8");
};

// Handler function for uploading and processing videos
const uploader = asyncHandler(async (req, res) => {
  const videoPath = req.file?.path;

  if (!videoPath) {
    throw new ApiError(400, "Video file is missing");
  }
  console.log(videoPath);
  const videoId = uuidv4();
  const outputPath = `./uploads/${videoId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  // Ensure the output directory exists
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Adjust the path to FFmpeg executable as necessary
  const ffmpegPath = "C:/ffmpeg/ffmpeg";

  // Convert the video to HLS format
  const command = `${ffmpegPath} -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error converting video to HLS format");
    }
    let files = [];

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    try {
      // Upload the HLS files to Appwrite storage
      files = fs.readdirSync(outputPath);
      files = files.filter(function(item) {
        return item !== "index.m3u8"
    })
      const urls = [];
      console.log(files);
      for (const file of files) {
        const filePath = path.join(outputPath, file);
        //console.log(`path>>>> ${filePath}`);
        const response = await uploadOnCloudinary(filePath,0);

        if (response && response.secure_url) {
          urls.push(response.secure_url);
        } else {
          console.error("Invalid response:", response);
        }
      }
      const filePath = path.join(outputPath,"index.m3u8");

      m3u8Genrator(filePath,urls);

      const response = await uploadM3U8File(filePath);
      console.log(response);
      
      const m3u8FileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${m3u8FileResponse.$id}/view`;


      // Respond with the URL to the client
      res.status(200).send({m3u8FileUrl});
    } catch (uploadError) {
      console.error("Error uploading files:", uploadError);
      res.status(500).send("Error uploading files");
    } finally {
      // Clean up the temporary files if needed
      fs.unlinkSync(videoPath); // Remove the original video file

      // List all files in the outputPath
      const outputFiles = fs.readdirSync(outputPath);

      if (outputFiles.length > 1) {
        // Remove each file in the outputPath
        outputFiles.forEach((file) => {
          const filePath = path.join(outputPath, file);
          fs.unlinkSync(filePath);
        });
      }

      // Remove the outputPath directory itself
      //fs.rmdirSync(outputPath);
    }
  });
});

// Define the route and use the upload middleware
export { uploader };
