import React, { createContext, useContext, useEffect, useState } from "react"

interface UserSettingsContextType {
    maxTweetChars: number
    twitterUsername: string
    twitterVerifiedType: string
    isXPremium: boolean
    loadUserSettings: () => Promise<void>
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined)

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [maxTweetChars, setMaxTweetChars] = useState(280)
    const [twitterUsername, setTwitterUsername] = useState("")
    const [twitterVerifiedType, setTwitterVerifiedType] = useState("")

    const loadUserSettings = async () => {
        try {
            const token = localStorage.getItem("accessToken")
            if (!token) {
                return
            }

            const response = await fetch("/api/twitter/status", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch user settings")
            }

            const data = await response.json()

            setMaxTweetChars(data.maxTweetChars || 280)
            setTwitterUsername(data.username || "")
            setTwitterVerifiedType(data.verifiedType || "")
        } catch (error) {
            console.error("Error loading user settings:", error)
            // Fallback to default values
            setMaxTweetChars(280)
            setTwitterUsername("")
            setTwitterVerifiedType("")
        }
    }

    useEffect(() => {
        loadUserSettings()
    }, [])

    const isXPremium = twitterVerifiedType === "blue"

    return (
        <UserSettingsContext.Provider
            value={{
                maxTweetChars,
                twitterUsername,
                twitterVerifiedType,
                isXPremium,
                loadUserSettings
            }}
        >
            {children}
        </UserSettingsContext.Provider>
    )
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext)
    if (!context) {
        throw new Error("useUserSettings must be used within UserSettingsProvider")
    }
    return context
}
