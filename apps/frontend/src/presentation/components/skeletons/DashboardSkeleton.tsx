import { Card } from "primereact/card"
import { Skeleton } from "primereact/skeleton"

export function DashboardChartSkeleton() {
    return (
        <Card>
            <div className="flex flex-column gap-3">
                <Skeleton width="200px" height="1.5rem" />
                <Skeleton width="100%" height="300px" />
            </div>
        </Card>
    )
}

export function DashboardStatsSkeleton() {
    return (
        <>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-12 md:col-6 lg:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <Skeleton width="130px" height="1.5rem" />
                                <Skeleton width="60px" height="2rem" />
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: "2.5rem", height: "2.5rem" }}>
                                <Skeleton size="3rem" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export function DashboardCalendarSkeleton() {
    return (
        <Card>
            <div className="flex flex-column gap-3">
                <Skeleton width="150px" height="1.5rem" />
                <Skeleton width="100%" height="400px" />
            </div>
        </Card>
    )
}
