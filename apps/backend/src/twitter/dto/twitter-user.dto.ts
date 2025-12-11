export class TwitterUserDto {
    id: string
    username: string
    name: string
    verified_type?: string // 'blue' | 'business' | 'government' | 'none'
}
