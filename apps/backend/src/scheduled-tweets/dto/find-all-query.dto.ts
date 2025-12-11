import { Type } from "class-transformer"
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator"
import { TweetStatus } from "../entities/scheduled-tweet.entity"

export class FindAllQueryDto {
    @IsOptional()
    @IsEnum(["draft", "scheduled", "posted", "failed", "disabled"])
    status?: TweetStatus

    @IsOptional()
    search?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number

    @IsOptional()
    @IsDateString()
    dateFrom?: string

    @IsOptional()
    @IsDateString()
    dateTo?: string
}
