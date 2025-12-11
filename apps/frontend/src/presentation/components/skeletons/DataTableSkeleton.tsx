import { Skeleton } from "primereact/skeleton"

export function DataTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="flex flex-column gap-3">
            {/* Table header */}
            <div className="grid">
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className={`col-${12 / columns}`}>
                        <Skeleton width="80%" height="1.5rem" />
                    </div>
                ))}
            </div>

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid surface-50 border-round p-3">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={colIndex} className={`col-${12 / columns}`}>
                            <Skeleton width="90%" height="1rem" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
