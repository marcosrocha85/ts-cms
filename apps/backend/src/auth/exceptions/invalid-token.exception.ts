import { UnauthorizedException } from "@nestjs/common"

export class InvalidTokenException extends UnauthorizedException {
    constructor(message: string = "Invalid or expired token") {
        super({
            message,
            error: "INVALID_TOKEN",
            statusCode: 401
        })
    }
}
