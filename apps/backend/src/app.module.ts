import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { MailerModule } from "./mailer/mailer.module"
import { MediaModule } from "./media/media.module"
import { ScheduledTweetsModule } from "./scheduled-tweets/scheduled-tweets.module"
import { SchedulerModule } from "./scheduler/scheduler.module"
import { TwitterModule } from "./twitter/twitter.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        }),
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT, 10) || 3306,
            username: process.env.DB_USERNAME || "root",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_DATABASE || "tweet_scheduler",
            entities: [__dirname + "/**/*.entity{.ts,.js}"],
            synchronize: process.env.NODE_ENV === "development",
            logging: process.env.NODE_ENV === "development"
        }),
        AuthModule,
        ScheduledTweetsModule,
        TwitterModule,
        SchedulerModule,
        MediaModule,
        MailerModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule { }
