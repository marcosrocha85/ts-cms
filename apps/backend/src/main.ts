import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { NestExpressApplication } from "@nestjs/platform-express"
import { join } from "path"
import { AppModule } from "./app.module"

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    // Serve static files from public directory (React build)
    app.useStaticAssets(join(__dirname, "..", "public"))

    // Serve uploaded media files
    app.useStaticAssets(join(__dirname, "..", "uploads"), {
        prefix: "/uploads/"
    })

    // Set API prefix to avoid conflicts with frontend routes
    app.setGlobalPrefix("api")

    // Enable CORS for development (frontend on port 5173)
    app.enableCors({
        origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : false,
        credentials: true
    })

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    )

    await app.listen(process.env.PORT ?? 3000)
    const logger = new Logger("Bootstrap")
    logger.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`)
    logger.log(`API available at: http://localhost:${process.env.PORT ?? 3000}/api`)
}
bootstrap()
