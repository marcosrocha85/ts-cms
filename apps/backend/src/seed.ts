import { Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as bcrypt from "bcrypt"
import { config } from "dotenv"
import { DataSource } from "typeorm"

config()

const configService = new ConfigService()

export const AppDataSource = new DataSource({
    type: "mysql",
    host: configService.get<string>("DB_HOST") || "localhost",
    port: configService.get<number>("DB_PORT") || 3306,
    username: configService.get<string>("DB_USERNAME") || "root",
    password: configService.get<string>("DB_PASSWORD") || "",
    database: configService.get<string>("DB_DATABASE") || "tweet_scheduler",
    entities: [__dirname + "/**/*.entity{.ts,.js}"],
    synchronize: true, // Auto-create tables on seed
    logging: false
})

// Seed admin user
async function seedAdminUser() {
    const logger = new Logger("Seed")
    await AppDataSource.initialize()

    const userRepository = AppDataSource.getRepository("User")

    const existingUser = await userRepository.findOne({
        where: { email: "admin@ts-cms.local" }
    })

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10)
        await userRepository.save({
            email: "admin@ts-cms.local",
            password: hashedPassword,
            twitterUsername: "marcosrochagpm",
            twitterVerifiedType: "blue", // X Premium
            maxTweetChars: 25000
        })
        logger.log("✅ Admin user created: admin@ts-cms.local / admin123")
        logger.log("✅ Twitter: @marcosrochagpm (X Premium - 25k chars)")
    } else {
        logger.log("ℹ️  Admin user already exists")
    }

    await AppDataSource.destroy()
}

seedAdminUser().catch((error) => {
    const logger = new Logger("Seed")
    logger.error("Seed failed:", error)
})
