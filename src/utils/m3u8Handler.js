import fs from "fs";
import { storage } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";

const m3u8Genrator= (filePath , urls ) => {
    
    const m3u8Content = fs.readFileSync(filePath, 'utf8');
   
    console.log(m3u8Content);
    
    const replaceSegmentPaths = (m3u8Content, segmentUrls) => {
        const lines = m3u8Content.split('\n');
        let updatedContent = '';
    
        let segmentIndex = 0;
    
        lines.forEach(line => {
            if (line.startsWith('#EXTINF')) {
                updatedContent += `${line}\n`;
            } else if (line.endsWith('.ts')) {
                updatedContent += `${segmentUrls[segmentIndex++]}\n`;
            } else {
                updatedContent += `${line}\n`;
            }
        });
    
        return updatedContent;
    };
    fs.unlinkSync(filePath);
    const updatedContent = replaceSegmentPaths(m3u8Content,urls)
    
    
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
}

const uploadM3U8File = async (filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const response = await storage.createFile(
            process.env.APPWRITE_STORAGE_ID, // Your Appwrite bucket ID
            uuidv4(), // File ID
            fileBuffer, // File content
            filePath.split('/').pop() // File name
        );
        return response;
    } catch (error) {
        console.error('Error uploading m3u8 file:', error);
        throw error;
    }
};

export {m3u8Genrator, uploadM3U8File}