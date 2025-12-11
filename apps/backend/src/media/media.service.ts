import { Injectable, Logger } from "@nestjs/common";
import { promises as fs } from "fs";
import { join } from "path";
import * as sharp from "sharp";

export interface ProcessedFile {
    originalName: string;
    filename: string;
    path: string;
    url: string;
    size: number;
    mimetype: string;
    width?: number;
    height?: number;
}

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name)

    async processFiles(files: Array<Express.Multer.File>): Promise<ProcessedFile[]> {
        const processedFiles: ProcessedFile[] = []

        for (const file of files) {
            const processedFile: ProcessedFile = {
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                url: `/uploads/${file.filename}`,
                size: file.size,
                mimetype: file.mimetype
            }

            // If this is an image, optimize with sharp
            if (file.mimetype.startsWith("image/")) {
                try {
                    const imagePath = join(process.cwd(), file.path)
                    const image = sharp(imagePath)
                    const metadata = await image.metadata()

                    processedFile.width = metadata.width
                    processedFile.height = metadata.height

                    // Resize if too large (max 2048px width)
                    if (metadata.width && metadata.width > 2048) {
                        await image
                            .resize(2048, null, { withoutEnlargement: true })
                            .jpeg({ quality: 85 })
                            .toFile(imagePath + ".optimized")

                        // Replace original file with the optimized one
                        await fs.unlink(imagePath)
                        await fs.rename(imagePath + ".optimized", imagePath)

                        // Update size metadata
                        const stats = await fs.stat(imagePath)
                        processedFile.size = stats.size
                    }
                } catch (error) {
                    this.logger.error("Error optimizing image:", error)
                    // Continue even if optimization fails
                }
            }

            processedFiles.push(processedFile)
        }

        return processedFiles
    }

    async deleteFile(filename: string): Promise<void> {
        try {
            const filePath = join(process.cwd(), "uploads", filename)
            await fs.unlink(filePath)
        } catch (error) {
            this.logger.error("Error deleting file:", error)
            // Do not throw if the file does not exist
        }
    }
}
