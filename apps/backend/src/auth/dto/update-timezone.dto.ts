import { IsNotEmpty, IsString } from "class-validator"

export class UpdateTimezoneDto {
    @IsString()
    @IsNotEmpty()
    timezone: string
}

export class TimezoneResponseDto {
    id: number

    email: string

    timezone: string

    twitterUsername?: string

    createdAt: Date
}
