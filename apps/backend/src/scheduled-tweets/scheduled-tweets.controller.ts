import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Request,
    UseGuards
} from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { CreateScheduledTweetDto } from "./dto/create-scheduled-tweet.dto"
import { FindAllQueryDto } from "./dto/find-all-query.dto"
import { UpdateScheduledTweetDto } from "./dto/update-scheduled-tweet.dto"
import { ScheduledTweetsService } from "./scheduled-tweets.service"

@Controller("scheduled-tweets")
@UseGuards(JwtAuthGuard)
export class ScheduledTweetsController {
    constructor(private readonly scheduledTweetsService: ScheduledTweetsService) { }

  @Post()
    create(@Body() createDto: CreateScheduledTweetDto, @Request() req) {
        return this.scheduledTweetsService.create(createDto, req.user.userId)
    }

  @Get()
  findAll(@Request() req, @Query() query: FindAllQueryDto) {
      return this.scheduledTweetsService.findAll(req.user.userId, query)
  }

  @Get("stats")
  getStats(@Request() req) {
      return this.scheduledTweetsService.getStats(req.user.userId)
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number, @Request() req) {
      return this.scheduledTweetsService.findOne(id, req.user.userId)
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateScheduledTweetDto,
    @Request() req
  ) {
      return this.scheduledTweetsService.update(id, updateDto, req.user.userId)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Request() req) {
      return this.scheduledTweetsService.remove(id, req.user.userId)
  }
}
