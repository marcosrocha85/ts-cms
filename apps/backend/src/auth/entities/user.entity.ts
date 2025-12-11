import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ nullable: true, name: "twitter_username" })
  twitterUsername?: string

  @Column({ nullable: true, name: "twitter_verified_type" })
  twitterVerifiedType?: string // 'none' | 'blue' | 'business'

  @Column({ type: "int", default: 280, name: "max_tweet_chars" })
  maxTweetChars: number // 280 for normal, 25000 for Premium

  @Column({ nullable: true, name: "twitter_access_token", select: false })
  twitterAccessToken?: string

  @Column({ nullable: true, name: "twitter_refresh_token", select: false })
  twitterRefreshToken?: string

  @Column({ default: "America/Sao_Paulo", name: "timezone" })
  timezone: string // IANA timezone (e.g., 'America/Sao_Paulo', 'Europe/London')

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
