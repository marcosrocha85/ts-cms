import { scheduledTweetRepository } from "@data/repositories/ScheduledTweetRepository"
import { ScheduledTweet, TweetStatus } from "@domain/entities/ScheduledTweet"
import { FindAllParams } from "@domain/repositories/ScheduledTweetRepository"
import { useRouter } from "next/navigation"
import { confirmDialog } from "primereact/confirmdialog"
import { Toast } from "primereact/toast"
import { useCallback, useEffect, useRef, useState } from "react"

export function useScheduledTweets() {
    const router = useRouter()
    const toast = useRef<Toast>(null)

    const [tweets, setTweets] = useState<ScheduledTweet[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<FindAllParams>({
        status: undefined,
        search: "",
        dateFrom: undefined,
        dateTo: undefined
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    const loadTweets = useCallback(async () => {
        setLoading(true)
        try {
            const response = await scheduledTweetRepository.findAll({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            })
            setTweets(response.data)
            setPagination((prev) => ({
                ...prev,
                total: response.meta.total,
                totalPages: response.meta.totalPages
            }))
        } catch (error) {
            console.error("Error loading posts:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Could not load posts",
                life: 3000
            })
        } finally {
            setLoading(false)
        }
    }, [filters, pagination.page, pagination.limit])

    useEffect(() => {
        loadTweets()
    }, [loadTweets])

    const onPageChange = (event: { page: number; rows: number }) => {
        setPagination((prev) => ({
            ...prev,
            page: event.page + 1, // PrimeReact usa 0-indexed
            limit: event.rows
        }))
    }

    const onFilterChange = (newFilters: FindAllParams) => {
        setFilters(newFilters)
        setPagination((prev) => ({ ...prev, page: 1 })) // Reset to page 1
    }

    const clearFilters = () => {
        setFilters({
            status: undefined,
            search: "",
            dateFrom: undefined,
            dateTo: undefined
        })
        setPagination((prev) => ({ ...prev, page: 1 }))
    }

    const handleDelete = (tweetId: number) => {
        confirmDialog({
            message: "Are you sure you want to delete this post?",
            header: "Confirm Deletion",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Yes, delete",
            rejectLabel: "Cancel",
            accept: async () => {
                try {
                    await scheduledTweetRepository.remove(tweetId)

                    setTweets(tweets.filter((t) => t.id !== tweetId))
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Post deleted successfully",
                        life: 3000
                    })
                } catch (error) {
                    console.error("Error deleting post:", error)
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Could not delete post",
                        life: 3000
                    })
                }
            }
        })
    }

    const handleToggle = async (tweet: ScheduledTweet) => {
        try {
            const newStatus: TweetStatus = tweet.status === "disabled" ? "scheduled" : "disabled"

            await scheduledTweetRepository.update(tweet.id, { status: newStatus })

            setTweets(tweets.map((t) => (t.id === tweet.id ? { ...t, status: newStatus } : t)))

            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: `Post ${newStatus === "disabled" ? "disabled" : "enabled"} successfully`,
                life: 3000
            })
        } catch (error) {
            console.error("Error toggling status:", error)
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Could not change tweet status",
                life: 3000
            })
        }
    }

    const navigateToNew = () => router.push("/tweets/new")
    const navigateToEdit = (id: number) => router.push(`/tweets/${id}/edit`)

    return {
        tweets,
        loading,
        filters,
        pagination,
        toast,
        onPageChange,
        onFilterChange,
        clearFilters,
        handleDelete,
        handleToggle,
        navigateToNew,
        navigateToEdit,
        loadTweets
    }
}
