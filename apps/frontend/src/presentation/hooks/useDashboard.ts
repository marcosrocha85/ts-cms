import { scheduledTweetRepository } from "@data/repositories/ScheduledTweetRepository"
import { useEffect, useState } from "react"

interface DashboardStats {
    scheduledCount: number
    postedCount: number
    failedCount: number
    totalCount: number
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        scheduledCount: 0,
        postedCount: 0,
        failedCount: 0,
        totalCount: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        setLoading(true)
        try {
            const data = await scheduledTweetRepository.getStats()
            setStats({
                scheduledCount: data.scheduled,
                postedCount: data.posted,
                failedCount: data.failed,
                totalCount: data.total
            })
        } catch (error) {
            console.error("Error loading statistics:", error)
        } finally {
            setLoading(false)
        }
    }

    return {
        stats,
        loading,
        loadStats
    }
}
