import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import { User } from "../../auth/entities/user.entity"

export type TweetStatus =
  | "draft"
  | "scheduled"
  | "posted"
  | "failed"
  | "disabled";

@Entity("scheduled_tweets")
export class ScheduledTweet {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "text" })
  text: string

  @Column({ type: "json", nullable: true })
  mediaPaths: string[]

  @Column({ type: "json", nullable: true })
  mediaIds: string[]

  @Column({ type: "datetime" })
  scheduledFor: Date

  @Column({
      type: "enum",
      enum: ["draft", "scheduled", "posted", "failed", "disabled"],
      default: "draft"
  })
  status: TweetStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  tweetId: string | null

  @Column({ type: "text", nullable: true })
  errorMessage: string | null

  @Column()
  userId: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
