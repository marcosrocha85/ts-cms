import { apiDataSource } from "@data/datasources/ApiDataSource"
import { useRouter } from "next/navigation"
import { Toast } from "primereact/toast"
import { useRef, useState } from "react"

interface LoginResponse {
    accessToken: string
    refreshToken: string
}

export function useLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const toast = useRef<Toast>(null)
    const router = useRouter()

    const handleLogin = async () => {
        if (!email || !password) {
            toast.current?.show({
                severity: "warn",
                summary: "Attention",
                detail: "Please fill email and password",
                life: 3000
            })
            return
        }

        setLoading(true)
        try {
            const response = await apiDataSource.post<LoginResponse>("/auth/login", {
                email,
                password
            })

            const { accessToken, refreshToken } = response.data

            // Save tokens to localStorage
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", refreshToken)

            toast.current?.show({
                severity: "success",
                summary: "Sucesso",
                detail: "Login successful!",
                life: 2000
            })

            // Redirect to dashboard after 500ms
            setTimeout(() => {
                router.push("/")
            }, 500)
        } catch (error: any) {
            console.error("Login failed:", error)

            const errorMessage = error.response?.data?.message || "Invalid email or password"

            toast.current?.show({
                severity: "error",
                summary: "Login Error",
                detail: errorMessage,
                life: 4000
            })
        } finally {
            setLoading(false)
        }
    }

    return {
        email,
        password,
        rememberMe,
        loading,
        toast,
        setEmail,
        setPassword,
        setRememberMe,
        handleLogin
    }
}
