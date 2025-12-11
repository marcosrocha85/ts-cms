import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { extname } from "path"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { MediaService } from "./media.service"

@Controller("media")
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post("upload")
    @UseInterceptors(
        FilesInterceptor("files", 4, {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
                    const ext = extname(file.originalname)
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
                }
            }),
            fileFilter: (req, file, callback) => {
                // Accept only images and videos
                const allowedMimes = [
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                    "video/mp4",
                    "video/quicktime" // .mov
                ]

                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true)
                } else {
                    callback(new BadRequestException("Tipo de arquivo não permitido. Use JPEG, PNG, GIF, WebP, MP4 ou MOV."), false)
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            }
        })
    )
    async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new BadRequestException("Nenhum arquivo foi enviado")
        }

        if (files.length > 4) {
            throw new BadRequestException("Máximo de 4 arquivos permitido")
        }

        // Process each file (optimize images)
        const processedFiles = await this.mediaService.processFiles(files)

        return {
            message: `${processedFiles.length} arquivo(s) enviado(s) com sucesso`,
            files: processedFiles
        }
    }
}
