import { scheduledTweetRepository } from "@data/repositories/ScheduledTweetRepository"
import { useUserSettings } from "@presentation/contexts/UserSettingsContext"
import { useRouter } from "next/navigation"
import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload"
import { Toast } from "primereact/toast"
import { useRef, useState } from "react"
import { useMediaUpload } from "./useMediaUpload"

export interface MediaFile {
    name: string
    url: string
    file: File
}

export function useCreateTweet() {
    const router = useRouter()
    const toast = useRef<Toast>(null)
    const fileUploadRef = useRef<FileUpload>(null)
    const { maxTweetChars } = useUserSettings()
    const { uploadFiles } = useMediaUpload()

    const [text, setText] = useState("")
    const [scheduledFor, setScheduledFor] = useState<Date | null>(null)
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleMediaUpload = (event: FileUploadHandlerEvent) => {
        const files = event.files

        if (mediaFiles.length + files.length > 4) {
            toast.current?.show({
                severity: "warn",
                summary: "Limit Exceeded",
                detail: "You can add up to 4 images only",
                life: 3000
            })
            return
        }

        const newMediaFiles: MediaFile[] = files.map((file) => ({
            name: file.name,
            url: URL.createObjectURL(file),
            file: file
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
        URL.revokeObjectURL(newMediaFiles[index].url)
        newMediaFiles.splice(index, 1)
        setMediaFiles(newMediaFiles)

        toast.current?.show({
            severity: "info",
            summary: "Image Removed",
            detail: "Image removed successfully",
            life: 3000
        })
    }

    const validateForm = (isPostNow: boolean = false): boolean => {
        if (!text.trim()) {
            toast.current?.show({
                severity: "error",
                summary: "Validation Error",
                detail: "The post text is required",
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

        // If this is "Post Now", scheduledFor is not required
        if (!isPostNow) {
            if (!scheduledFor) {
                toast.current?.show({
                    severity: "error",
                    summary: "Validation Error",
                    detail: "The scheduled date and time are required",
                    life: 3000
                })
                return false
            }

            if (scheduledFor < new Date()) {
                toast.current?.show({
                    severity: "error",
                    summary: "Validation Error",
                    detail: "The scheduled date must be in the future",
                    life: 3000
                })
                return false
            }
        }

        return true
    }

    const handleSubmit = async (isPostNow: boolean = false) => {
        if (!validateForm(isPostNow)) {
            return
        }

        setIsSubmitting(true)

        try {
            let mediaPaths: string[] = []

            // Upload images if present
            if (mediaFiles.length > 0) {
                toast.current?.show({
                    severity: "info",
                    summary: "Uploading",
                    detail: `Uploading ${mediaFiles.length} image(s)...`,
                    life: 3000
                })

                const uploadedFiles = await uploadFiles(mediaFiles.map((m) => m.file))
                mediaPaths = uploadedFiles.map((file) => file.path)

                toast.current?.show({
                    severity: "success",
                    summary: "Upload Completed",
                    detail: `${uploadedFiles.length} image(s) uploaded successfully`,
                    life: 3000
                })
            }

            // If this is "Post Now", use current time + 1 minute and status 'posted'
            // If this is "Schedule", use the selected date and status 'scheduled'
            const postDate = isPostNow
                ? new Date(Date.now() + 1 * 60 * 1000) // 1 minute in the future (will post immediately)
                : scheduledFor!

            const tweetStatus = isPostNow ? "posted" : "scheduled"

            await scheduledTweetRepository.create({
                text,
                mediaPaths: mediaPaths.length > 0 ? mediaPaths : undefined,
                scheduledFor: postDate.toISOString(),
                status: tweetStatus
            })

            toast.current?.show({
                severity: "success",
                summary: isPostNow ? "Post Created" : "Post Scheduled",
                detail: isPostNow ? "Post will be published immediately!" : "Post scheduled successfully!",
                life: 3000
            })

            setTimeout(() => {
                router.push("/tweets")
            }, 1000)
        } catch (error: any) {
            console.error("Error creating post:", error)

            const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while creating the post. Please try again."

            // Check if the X account is not connected
            if (errorMessage.includes("not connected to X") || errorMessage.includes("authenticate first")) {
                toast.current?.show({
                    severity: "warn",
                    summary: "X Not Connected",
                    detail: "You need to connect your X account before scheduling posts. Go to Settings to connect.",
                    life: 7000
                })

                // Redirect to settings after 2 seconds
                setTimeout(() => {
                    router.push("/settings")
                }, 2000)
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Error Creating Post",
                    detail: errorMessage,
                    life: 5000
                })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSchedule = () => handleSubmit(false)
    const handlePostNow = () => handleSubmit(true)

    const handleCancel = () => {
        mediaFiles.forEach((media) => URL.revokeObjectURL(media.url))
        router.push("/tweets")
    }

    return {
        text,
        scheduledFor,
        mediaFiles,
        isSubmitting,
        toast,
        fileUploadRef,
        setText,
        setScheduledFor,
        handleMediaUpload,
        removeMedia,
        handleSubmit,
        handleSchedule,
        handlePostNow,
        handleCancel
    }
}
