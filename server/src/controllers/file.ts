import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { MessageModel } from "../model/message";
import { AttachmentModel } from "../model/attachment";

export async function DownloadFile(req: Request, res: Response) {
    const { url } = req.params;
    const currentUser=(req as any).user
    // Better: Use regex or proper parsing instead of assuming fixed dash positions
    // Example URLs: "123-filename.pdf" or "456-my-file-name.jpg"
    
    const firstDashIndex = url.indexOf('-');
    if (firstDashIndex === -1) {
    res.status(400).json({ error: 'Invalid file URL format' });
    return
    }
    
    const folder = url.substring(0, firstDashIndex);
    const filename = url.substring(firstDashIndex + 1);
    
   
    // Additional validation
    if (!folder || !filename) {
        res.status(400).json({ error: 'Invalid file URL format' });
        return
    }
    
    const attachment=await AttachmentModel.findOne({url})
    const message= await MessageModel.findOne({file:attachment,sender:currentUser})
if (!message) {
    res.status(404).json({message:"url is not for this user"})
    return
}
    // Security: Prevent directory traversal
    const safeFolder = path.basename(folder);
    const safeFilename = path.basename(filename);
    
    const filePath = path.join(process.cwd(), 'uploads', safeFolder, safeFilename);
    
    // Security: Ensure path is within uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!filePath.startsWith(uploadsDir)) {
         res.status(403).json({ error: 'Access denied' });
         return
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
         res.status(404).json({ error: 'File not found' });
         return
    }
    
    // Check if it's a file (not a directory)
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
         res.status(400).json({ error: 'Cannot download directory' });
         return
    }
    
    res.download(filePath, safeFilename, (err) => {
        if (err) {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download failed' });
            }
        }
    });
}