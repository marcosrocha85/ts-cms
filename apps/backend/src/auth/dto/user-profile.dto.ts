export class UserProfileDto {
    id: number
    email: string
    twitterUsername?: string
    twitterVerifiedType?: string
    maxTweetChars: number
    createdAt: Date
}
