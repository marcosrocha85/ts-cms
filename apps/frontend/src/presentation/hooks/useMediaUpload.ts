import axios from "axios"
import { useState } from "react"

export interface UploadedFile {
    originalName: string
    filename: string
    path: string
    url: string
    size: number
    mimetype: string
    width?: number
    height?: number
}

export interface UseMediaUploadReturn {
    uploadFiles: (files: File[]) => Promise<UploadedFile[]>
    isUploading: boolean
    uploadProgress: number
    error: string | null
}

export function useMediaUpload(): UseMediaUploadReturn {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
        if (!files || files.length === 0) {
            throw new Error("Nenhum arquivo selecionado")
        }

        if (files.length > 4) {
            throw new Error("Máximo de 4 arquivos permitido")
        }

        // Validar tamanho dos arquivos
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`Arquivo ${file.name} excede o tamanho máximo de 5MB`)
            }
        }

        setIsUploading(true)
        setUploadProgress(0)
        setError(null)

        try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append("files", file)
            })

            const response = await axios.post<{ files: UploadedFile[] }>("/api/media/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        setUploadProgress(percentCompleted)
                    }
                }
            })

            setUploadProgress(100)
            return response.data.files
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Error uploading files"
            setError(errorMessage)
            throw new Error(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    return {
        uploadFiles,
        isUploading,
        uploadProgress,
        error
    }
}
