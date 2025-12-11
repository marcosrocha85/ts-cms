import { scheduledTweetRepository } from "@data/repositories/ScheduledTweetRepository"
import { ScheduledTweet } from "@domain/entities/ScheduledTweet"
import { useUserSettings } from "@presentation/contexts/UserSettingsContext"
import { useRouter } from "next/navigation"
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload"
import { Toast } from "primereact/toast"
import { useCallback, useEffect, useRef, useState } from "react"
import { useMediaUpload } from "./useMediaUpload"

export interface MediaFile {
    name: string
    url: string
    file?: File
    isExisting?: boolean
}

export function useEditTweet(tweetId: string) {
    const router = useRouter()
    const toast = useRef<Toast>(null)
    const fileUploadRef = useRef<FileUpload>(null)
    const { maxTweetChars } = useUserSettings()
    const { uploadFiles } = useMediaUpload()

    const [isLoading, setIsLoading] = useState(true)
    const [tweet, setTweet] = useState<ScheduledTweet | null>(null)
    const [text, setText] = useState("")
    const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const loadTweet = useCallback(async () => {
        setIsLoading(true)
        try {
            const loadedTweet = await scheduledTweetRepository.findOne(parseInt(tweetId))

            setTweet(loadedTweet)
            setText(loadedTweet.text)
            setScheduledFor(new Date(loadedTweet.scheduledFor))

            if (loadedTweet.mediaPaths && loadedTweet.mediaPaths.length > 0) {
                const existingMedia: MediaFile[] = loadedTweet.mediaPaths.map((path, index) => ({
                    name: `Image ${index + 1}`,
                    url: path,
                    isExisting: true
                }))
                setMediaFiles(existingMedia)
            }
        } catch (error) {
            console.error("Error loading post:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Could not load the post. Please try again.",
                life: 3000
            })
            setTimeout(() => router.push("/tweets"), 2000)
        } finally {
            setIsLoading(false)
        }
    }, [tweetId, router, toast])

    useEffect(() => {
        loadTweet()
    }, [loadTweet])

    const handleMediaUpload = (event: FileUploadHandlerEvent) => {
        const files = event.files

        if (mediaFiles.length + files.length > 4) {
            toast.current?.show({
                severity: "warn",
                summary: "Limit Exceeded",
                detail: "You can add a maximum of 4 images",
                life: 3000
            })
            return
        }

        const newMediaFiles: MediaFile[] = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file: file,
            isExisting: false
        }))

        setMediaFiles([...mediaFiles, ...newMediaFiles])

        if (fileUploadRef.current) {
            fileUploadRef.current.clear()
        }

        toast.current?.show({
            severity: "success",
            summary: "Image Added",
            detail: `${files.length} image(s) added successfully`,
            life: 3000
        })
    }

    const removeMedia = (index: number) => {
        const newMediaFiles = [...mediaFiles]
        if (!newMediaFiles[index].isExisting) {
            URL.revokeObjectURL(newMediaFiles[index].url)
        }
        newMediaFiles.splice(index, 1)
        setMediaFiles(newMediaFiles)

        toast.current?.show({
            severity: "info",
            summary: "Image Removed",
            detail: "Image removed successfully",
            life: 3000
        })
    }

    const validateForm = (): boolean => {
        if (!text.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "Post text is required",
                life: 3000
            })
            return false
        }

        if (text.length > maxTweetChars) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: `The post cannot have more than ${maxTweetChars} characters`,
                life: 3000
            })
            return false
        }

        if (!scheduledFor) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "The scheduling date and time are required",
                life: 3000
            })
            return false
        }

        if (scheduledFor < new Date()) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "The scheduling date must be in the future",
                life: 3000
            })
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            let mediaPaths: string[] = []

            // Keep existing images
            const existingPaths = mediaFiles.filter((m) => m.isExisting).map((m) => m.url)

            // Upload of new images
            const newFiles = mediaFiles.filter((m) => !m.isExisting && m.file)
            if (newFiles.length > 0) {
                toast.current?.show({
                    severity: "info",
                    summary: "Uploading",
                    detail: `Sending ${newFiles.length} new image(s)...`,
                    life: 3000
                })

                const uploadedFiles = await uploadFiles(newFiles.map((m) => m.file!))
                const newPaths = uploadedFiles.map((file) => file.path)

                toast.current?.show({
                    severity: "success",
                    summary: "Upload Completed",
                    detail: `${uploadedFiles.length} image(s) sent successfully`,
                    life: 3000
                })

                mediaPaths = [...existingPaths, ...newPaths]
            } else {
                mediaPaths = existingPaths
            }

            await scheduledTweetRepository.update(parseInt(tweetId), {
                text,
                mediaPaths: mediaPaths.length > 0 ? mediaPaths : undefined,
                scheduledFor: scheduledFor!.toISOString()
            })

            toast.current?.show({
                severity: "success",
                summary: "Post Updated",
                detail: "Post updated successfully!",
                life: 3000
            })

            setTimeout(() => {
                router.push("/tweets")
            }, 1000)
        } catch (error: any) {
            console.error("Error updating post:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while updating the post. Please try again."
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: errorMessage,
                life: 3000
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        mediaFiles.filter((m) => !m.isExisting).forEach((media) => URL.revokeObjectURL(media.url))
        router.push("/tweets")
    }

    const canEdit = tweet?.status !== "posted"

    return {
        isLoading,
        tweet,
        text,
        scheduledFor,
        mediaFiles,
        isSubmitting,
        canEdit,
        toast,
        fileUploadRef,
        setText,
        setScheduledFor,
        handleMediaUpload,
        removeMedia,
        handleSubmit,
        handleCancel
    }
}
