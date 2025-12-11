"use client"
import { useUserSettings } from "@presentation/contexts/UserSettingsContext"
import { TwitterVerifiedBadge } from "./TwitterVerifiedBadge"

interface TweetPreviewProps {
    text: string
    mediaPaths?: string[]
    author?: {
        name: string
        username: string
        avatar?: string
        twitterVerifiedType?: string | null
    }
}

export function TweetPreview({ text, mediaPaths = [], author }: TweetPreviewProps) {
    const { maxTweetChars, twitterUsername, isXPremium, twitterVerifiedType } = useUserSettings()

    const defaultAuthor = {
        name: author?.name || "Marcos Rocha",
        username: author?.username || twitterUsername,
        twitterVerifiedType: author?.twitterVerifiedType || twitterVerifiedType,
        avatar: author?.avatar || `https://unavatar.io/twitter/${author?.username || twitterUsername}`
    }

    const charCount = text.length
    const isOverLimit = charCount > maxTweetChars

    // Render text with clickable URLs
    const renderTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const parts = text.split(urlRegex)
        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {part}
                    </a>
                )
            }
            return <span key={index}>{part}</span>
        })
    }

    // Grid layout based on number of images
    const getImageGridClass = (count: number) => {
        switch (count) {
            case 1:
                return "grid-cols-1"
            case 2:
                return "grid-cols-2"
            case 3:
                return "grid-cols-2" // two on top, one on bottom
            case 4:
                return "grid-cols-2"
            default:
                return "grid-cols-1"
        }
    }

    return (
        <div className="surface-card border-1 surface-border border-round p-4">
            <div className="mb-3">
                <h3 className="text-lg font-semibold mb-2">Post Preview</h3>
                <div className="text-500 text-sm">
                    Characters: <span className={isOverLimit ? "text-red-500 font-bold" : "text-900"}>{charCount}</span> / {maxTweetChars}
                    {isXPremium && <span className="ml-2 text-blue-500">(Premium)</span>}
                </div>
            </div>

            {/* X Card - X */}
            <div className="surface-ground border-1 surface-border border-round p-4">
                {/* X header */}
                <div className="flex align-items-start mb-3">
                    <img src={defaultAuthor.avatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile.png"} alt={defaultAuthor.name} className="border-circle mr-3" style={{ width: "48px", height: "48px", objectFit: "cover" }} />
                    <div className="flex-1">
                        <div className="flex align-items-center gap-2">
                            <span className="font-bold text-900">{defaultAuthor.name}</span>
                            <span className="text-500 text-sm">@{defaultAuthor.username}</span>
                            <TwitterVerifiedBadge verifiedType={defaultAuthor.twitterVerifiedType} className="twitter-badge" />
                            <span className="text-500 text-sm">· now</span>
                        </div>
                    </div>
                </div>

                {/* X Text */}
                <div className={`mb-3 white-space-pre-wrap ${isOverLimit ? "text-red-500" : "text-900"}`} style={{ fontSize: "15px", lineHeight: "20px" }}>
                    {text ? renderTextWithLinks(text) : <span className="text-500 italic">Type your post text...</span>}
                </div>

                {/* Images */}
                {mediaPaths.length > 0 && (
                    <div className={`grid ${getImageGridClass(mediaPaths.length)} gap-1 mb-3`}>
                        {mediaPaths.slice(0, 4).map((path, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden border-round ${mediaPaths.length === 3 && index === 2 ? "col-span-2" : ""}`}
                                style={{ paddingTop: "56.25%" }} // 16:9 aspect ratio
                            >
                                <img src={path} alt={`Media ${index + 1}`} className="absolute top-0 left-0 w-full h-full" style={{ objectFit: "cover" }} />
                            </div>
                        ))}
                    </div>
                )}

                {/* X actions */}
                <div className="flex align-items-center justify-content-between pt-2 border-top-1 surface-border">
                    <div className="flex align-items-center gap-2 text-500">
                        <i className="pi pi-comment text-sm"></i>
                        <span className="text-xs">0</span>
                    </div>
                    <div className="flex align-items-center gap-2 text-500">
                        <i className="pi pi-refresh text-sm"></i>
                        <span className="text-xs">0</span>
                    </div>
                    <div className="flex align-items-center gap-2 text-500">
                        <i className="pi pi-heart text-sm"></i>
                        <span className="text-xs">0</span>
                    </div>
                    <div className="flex align-items-center gap-2 text-500">
                        <i className="pi pi-chart-bar text-sm"></i>
                        <span className="text-xs">0</span>
                    </div>
                    <div className="flex align-items-center gap-2 text-500">
                        <i className="pi pi-share-alt text-sm"></i>
                    </div>
                </div>
            </div>

            {/* Aviso se exceder limite */}
            {isOverLimit && (
                <div className="flex align-items-center gap-2 mt-3 p-3 bg-red-100 border-round">
                    <i className="pi pi-exclamation-triangle text-red-500"></i>
                    <span className="text-red-700 text-sm">The post exceeds the limit of {maxTweetChars} characters!</span>
                </div>
            )}
        </div>
    )
}
