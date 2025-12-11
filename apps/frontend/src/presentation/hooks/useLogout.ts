import { apiDataSource } from "@data/datasources/ApiDataSource"
import { useRouter } from "next/navigation"

export const useLogout = () => {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // Try notifying the backend (optional)
            await apiDataSource.post("/auth/logout", {})
        } catch (error) {
            // Ignore errors (logout should always work client-side)
            console.log("Backend logout failed, continuing with local logout")
        } finally {
            // Remove tokens from localStorage
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")

            // Redirect to login
            router.push("/auth/login")
        }
    }

    return {
        handleLogout
    }
}
