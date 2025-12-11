import React from "react"

export interface TwitterVerifiedBadgeProps {
    verifiedType?: string | null
    showText?: boolean
    className?: string
}

const VERIFIED_BADGES = {
    blue: {
        url: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg",
        label: "X Premium"
    },
    business: {
        url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Twitter_Verified_Badge_Gold.svg",
        label: "Business"
    },
    government: {
        url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Twitter_Verified_Badge_Gray.svg",
        label: "Government"
    }
}

export const TwitterVerifiedBadge: React.FC<TwitterVerifiedBadgeProps> = ({ verifiedType, showText = false, className }) => {
    if (!verifiedType) {
        return <span className={className}>Default</span>
    }

    const badge = VERIFIED_BADGES[verifiedType as keyof typeof VERIFIED_BADGES]
    if (!badge) {
        return <span className={className}>Default</span>
    }

    // Always render the original X SVG
    const badgeImage = <img src={badge.url} alt={`${verifiedType} verified`} style={{ width: "20px", height: "20px", display: "inline-block", verticalAlign: "middle" }} />

    // If showText is false, return only the image
    if (!showText) {
        return <span className={className}>{badgeImage}</span>
    }

    // If showText is true, render the image alongside plain text
    return (
        <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            {badgeImage}
            <span>{badge.label}</span>
        </span>
    )
}
