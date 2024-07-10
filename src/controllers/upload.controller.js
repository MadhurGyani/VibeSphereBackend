import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { storage} from '../db/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Handler function for uploading and processing videos
const uploader = asyncHandler(async (req, res) => {
    const videoPath = req.file?.path;

    if (!videoPath) {
        throw new ApiError(400, "Video file is missing");
    }

    const vedioId = uuidv4();
    const outputPath = `./uploads/${vedioId}`;
    const hlsPath = `${outputPath}/index.m3u8`;

    // Ensure the output directory exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Adjust the path to FFmpeg executable as necessary
    const ffmpegPath = 'C:/ffmpeg/ffmpeg';

    // Convert the video to HLS format
    const command = `${ffmpegPath} -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error converting video to HLS format');
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        try {
            // Upload the HLS files to Appwrite storage
            const files = fs.readdirSync(outputPath);
            const urls = [];
            console.log(files);
            for (const file of files) {
                console.log(file);

                const filePath = path.join(outputPath, file);
                console.log(filePath); // Verify the filePath

                const response = await storage.createFile(process.env.APPWRITE_STORAGE_ID, uuidv4(), fs.createReadStream(filePath));
                
                // Ensure response is defined and contains 'href'
                if (response && response.href) {
                    console.log(response);
                    urls.push(response.href);
                } else {
                    console.error('Invalid response:', response);
                    // Handle this error condition as needed
                }
            }

            // Store the URL of the M3U8 file in Appwrite database
            const m3u8Url = urls.find(url => url.endsWith('.m3u8'));

            // Respond with the URL to the client
            res.status(200).send({ m3u8Url });
        } catch (uploadError) {
            console.error('Error uploading files:', uploadError);
            res.status(500).send('Error uploading files');
        } finally {
           // Clean up the temporary files if needed
    fs.unlinkSync(videoPath); // Remove the original video file

    // List all files in the outputPath
    const files = fs.readdirSync(outputPath);

    if (files.length > 0) {
        // Remove each file in the outputPath
        files.forEach(file => {
            const filePath = path.join(outputPath, file);
            fs.unlinkSync(filePath);
        });
    }

    // Remove the outputPath directory itself
    fs.rmdirSync(outputPath);
        }
    });
});

// Define the route and use the upload middleware
export { uploader };
