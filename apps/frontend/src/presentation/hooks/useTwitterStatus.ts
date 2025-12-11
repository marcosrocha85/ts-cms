import { apiDataSource } from "@data/datasources/ApiDataSource"
import { useEffect, useState } from "react"

interface TwitterConnectionStatus {
    connected: boolean
    username?: string
    verifiedType?: string
    maxTweetChars?: number
}

export function useTwitterStatus() {
    const [status, setStatus] = useState<TwitterConnectionStatus>({ connected: false })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkTwitterStatus()
    }, [])

    const checkTwitterStatus = async () => {
        try {
            const response = await apiDataSource.get<TwitterConnectionStatus>("/twitter/status")
            setStatus(response.data)
        } catch (error) {
            console.error("Failed to check X status:", error)
            setStatus({ connected: false })
        } finally {
            setLoading(false)
        }
    }

    const connectTwitter = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken")

            if (!accessToken) {
                console.error("No access token found. User needs to login first.")
                window.location.href = "/auth/login"
                return
            }

            // Use the Next.js proxy (localhost:3001/api/...) instead of calling the backend directly
            // This ensures Next.js handles the redirect correctly
            const authUrl = `/api/twitter/auth?access_token=${accessToken}`

            // Redirect through the Next.js proxy
            window.location.href = authUrl
        } catch (error) {
            console.error("Failed to initiate X OAuth:", error)
        }
    }

    const disconnectTwitter = async () => {
        try {
            await apiDataSource.get("/twitter/disconnect")
            setStatus({ connected: false })
            return true
        } catch (error) {
            console.error("Failed to disconnect Twitter:", error)
            return false
        }
    }

    return {
        status,
        loading,
        checkTwitterStatus,
        connectTwitter,
        disconnectTwitter
    }
}
