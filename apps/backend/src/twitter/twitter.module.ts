import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TwitterService } from "./twitter.service"
import { TwitterController } from "./twitter.controller"
import { User } from "../auth/entities/user.entity"

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("JWT_SECRET")
            }),
            inject: [ConfigService]
        })
    ],
    controllers: [TwitterController],
    providers: [TwitterService],
    exports: [TwitterService]
})
export class TwitterModule {}
