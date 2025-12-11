import { NotFoundException } from "@nestjs/common"

export class UserNotFoundException extends NotFoundException {
    constructor(identifier?: string) {
        super({
            message: identifier ? `User with ${identifier} not found` : "User not found",
            error: "USER_NOT_FOUND",
            statusCode: 404
        })
    }
}
