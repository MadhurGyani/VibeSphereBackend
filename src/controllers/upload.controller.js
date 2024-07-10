import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { storage as appwriteStorage, databases } from '../db/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

i
const router = express.Router();

// Handler function for uploading and processing videos
const uploader = asyncHandler(async (req, res) => {
    const videoPath = req.file?.path;

    const vedioId = uuidv4()
  const outputPath = `./uploads/${vedioId}`
  const hlsPath = `${outputPath}/index.m3u8`

    // const outputDir = 'hls_output'; // Directory to store HLS files

    if (!videoPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Convert the video to HLS format
    const command = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`)
          }
          console.log(`stdout: ${stdout}`)
          console.log(`stderr: ${stderr}`)
        //   const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`;

        try {
            // Upload the HLS files to Appwrite storage
            const files = fs.readdirSync(outputPath);
            const urls = [];
            
            for (const file of files) {
                const filePath = path.join(outputPath, file);
const response = await appwriteStorage.createFile(process.env.APPWRITE_STORAGE_ID, uuidv4(), fs.createReadStream(filePath));
                console.log(response); 
                urls.push(response.href);
            }

            // Store the URL of the M3U8 file in Appwrite database
            const m3u8Url = urls.find(url => url.endsWith('.m3u8'));
           // await databases.createDocument('databaseID', 'collectionID', 'unique()', { videoUrl: m3u8Url });

            res.status(200).send({ m3u8Url });
        } catch (uploadError) {
            console.error('Error uploading files:', uploadError);
            res.status(500).send('Error uploading files');
        } finally {
            // Clean up the temporary files
            // fs.unlinkSync(videoPath);
            // files.forEach(file => fs.unlinkSync(path.join(outputDir, file)));
            // fs.rmdirSync(outputDir);
        }
    });
});

// Define the route and use the upload middleware
export {uploader}
