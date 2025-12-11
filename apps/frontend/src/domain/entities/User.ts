export interface User {
    id: number
    email: string
    twitterUsername?: string
    twitterVerifiedType?: string // 'none' | 'blue' | 'business'
    maxTweetChars: number // 280 or 25000
    createdAt: Date
}
