import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export class ApiDataSource {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json"
            }
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("accessToken")
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor - handle token refresh
        this.client.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    if (typeof window !== "undefined") {
                        const refreshToken = localStorage.getItem("refreshToken")

                        // If there is no refresh token, redirect straight to login
                        if (!refreshToken) {
                            localStorage.removeItem("accessToken")
                            window.location.href = "/auth/login"
                            return Promise.reject(error)
                        }

                        // Attempt token refresh
                        try {
                            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
                            const { accessToken } = response.data
                            localStorage.setItem("accessToken", accessToken)

                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                            }
                            return this.client(originalRequest)
                        } catch (refreshError) {
                            localStorage.removeItem("accessToken")
                            localStorage.removeItem("refreshToken")
                            window.location.href = "/auth/login"
                            return Promise.reject(refreshError)
                        }
                    }
                }

                return Promise.reject(error)
            }
        )
    }

    get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.client.get(url, config)
    }

    post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.client.post(url, data, config)
    }

    put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.client.put(url, data, config)
    }

    delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.client.delete(url, config)
    }

    patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.client.patch(url, data, config)
    }
}

export const apiDataSource = new ApiDataSource()
