"use client"
import { ChartWrapper } from "@presentation/components/ChartWrapper"
import { FullCalendarComponent } from "@presentation/components/FullCalendarComponent"
import { DashboardChartSkeleton, DashboardStatsSkeleton } from "@presentation/components/skeletons"
import { useDashboard } from "@presentation/hooks/useDashboard"
import { useScheduledTweets } from "@presentation/hooks/useScheduledTweets"
import { BreadCrumb } from "primereact/breadcrumb"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Toast } from "primereact/toast"
import { useEffect, useMemo, useRef, useState } from "react"

export function DashboardPage() {
    const { stats, loading: apiLoading, loadStats } = useDashboard()
    const { tweets, loadTweets } = useScheduledTweets()
    const loading = apiLoading
    const toast = useRef<Toast>(null)

    // Next 5 posts is already available via Posts page; here we focus on charts and failures

    // Chart.js dataset for posts by status
    const chartData = useMemo(
        () => ({
            labels: ["Scheduled", "Posted", "Failed"],
            datasets: [
                {
                    label: "Posts",
                    backgroundColor: ["#93C5FD", "#86EFAC", "#FCA5A5"],
                    data: [stats.scheduledCount, stats.postedCount, stats.failedCount]
                }
            ]
        }),
        [stats]
    )

    const chartOptions = useMemo(
        () => ({
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: false
        }),
        []
    )

    // Failed posts list
    const failedTweets = useMemo(() => tweets.filter((t) => t.status === "failed"), [tweets])

    // Dialog for retry with new date
    const [retryVisible, setRetryVisible] = useState(false)
    const [retryTweetId, setRetryTweetId] = useState<number | null>(null)
    const [retryDate, setRetryDate] = useState<Date | null>(null)

    const openRetry = (id: number) => {
        setRetryTweetId(id)
        setRetryDate(new Date(Date.now() + 10 * 60 * 1000))
        setRetryVisible(true)
    }

    const handleRetry = async () => {
        if (!retryTweetId || !retryDate) return
        try {
            // If scheduled, needs new date; we mark as scheduled and update scheduledFor
            const iso = retryDate.toISOString()
            const { scheduledTweetRepository } = await import("@data/repositories/ScheduledTweetRepository")
            await scheduledTweetRepository.update(retryTweetId, { status: "scheduled", scheduledFor: iso })
            toast.current?.show({ severity: "success", summary: "Rescheduled", detail: "Tweet rescheduled", life: 2500 })
            setRetryVisible(false)
            setRetryTweetId(null)
            await loadTweets()
            await loadStats()
        } catch (err) {
            toast.current?.show({ severity: "error", summary: "Error", detail: "Failed to reschedule", life: 3000 })
        }
    }

    useEffect(() => {
        // ensure initial loading
        loadTweets()
        loadStats()
    }, [loadStats, loadTweets])

    const breadcrumbHome = { icon: "pi pi-home", url: "/" }
    const breadcrumbItems = [{ label: "Dashboard" }]

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
            </div>

            {/* Stats Cards */}
            {loading ? (
                <DashboardStatsSkeleton />
            ) : (
                <>
                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Scheduled Posts</span>
                                    <div className="text-900 font-medium text-xl">{stats.scheduledCount}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                                    <i className="pi pi-calendar text-blue-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Published Posts</span>
                                    <div className="text-900 font-medium text-xl">{stats.postedCount}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                                    <i className="pi pi-check-circle text-green-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Failed Posts</span>
                                    <div className="text-900 font-medium text-xl">{stats.failedCount}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                                    <i className="pi pi-times-circle text-red-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0">
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Total Posts</span>
                                    <div className="text-900 font-medium text-xl">{stats.totalCount}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                                    <i className="pi pi-twitter text-purple-500 text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Chart of posts by status */}
            <div className="col-6">
                {loading ? (
                    <DashboardChartSkeleton />
                ) : (
                    <div className="card">
                        <h5 className="mb-3">Posts by Status</h5>
                        <div style={{ height: "300px" }}>
                            <ChartWrapper type="bar" data={chartData} options={chartOptions} />
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de posts falhados com Retry */}
            <div className="col-6">
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-3">
                        <h5 className="m-0">Failed Posts</h5>
                        <span className="text-500">{failedTweets.length} item(s)</span>
                    </div>
                    <DataTable value={failedTweets} size="small" emptyMessage="No failures">
                        <Column field="id" header="#" style={{ width: "80px" }} />
                        <Column field="text" header="Text" />
                        <Column field="errorMessage" header="Error" />
                        <Column header="Actions" body={(row) => <Button label="Retry" icon="pi pi-refresh" outlined onClick={() => openRetry(row.id)} />} style={{ width: "140px" }} />
                    </DataTable>
                </div>
            </div>

            {/* Scheduled Posts Calendar */}
            <div className="col-12">
                <div className="card">
                    <h5 className="mb-3">Scheduled Posts Calendar</h5>
                    <FullCalendarComponent tweets={tweets} />
                </div>
            </div>

            <Dialog
                header="Reschedule Post"
                visible={retryVisible}
                onHide={() => setRetryVisible(false)}
                footer={
                    <div className="flex gap-2">
                        <Button label="Cancel" text onClick={() => setRetryVisible(false)} />
                        <Button label="Reschedule" icon="pi pi-check" onClick={handleRetry} disabled={!retryDate} />
                    </div>
                }
            >
                <p className="mb-3">Choose a new date and time to reschedule:</p>
                <Calendar value={retryDate} onChange={(e) => setRetryDate(e.value as Date)} showTime hourFormat="24" minDate={new Date(Date.now() + 5 * 60 * 1000)} />
            </Dialog>
        </div>
    )
}
