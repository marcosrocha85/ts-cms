import { Card } from "primereact/card"
import { Skeleton } from "primereact/skeleton"

export function TweetCardSkeleton() {
    return (
        <Card className="mb-3">
            <div className="flex flex-column gap-3">
                {/* Header with status and date */}
                <div className="flex justify-content-between align-items-center">
                    <Skeleton width="80px" height="1.5rem" borderRadius="16px" />
                    <Skeleton width="120px" height="1rem" />
                </div>

                {/* Post text */}
                <div className="flex flex-column gap-2">
                    <Skeleton width="100%" height="1rem" />
                    <Skeleton width="90%" height="1rem" />
                    <Skeleton width="70%" height="1rem" />
                </div>

                {/* Media preview */}
                <div className="grid">
                    <div className="col-6">
                        <Skeleton width="100%" height="150px" borderRadius="8px" />
                    </div>
                    <div className="col-6">
                        <Skeleton width="100%" height="150px" borderRadius="8px" />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Skeleton width="80px" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="80px" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="80px" height="2.5rem" borderRadius="6px" />
                </div>
            </div>
        </Card>
    )
}
