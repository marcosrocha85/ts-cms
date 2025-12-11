import { Card } from "primereact/card"
import { Skeleton } from "primereact/skeleton"

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
    return (
        <Card>
            <div className="flex flex-column gap-4">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="field">
                        <Skeleton width="120px" height="1rem" className="mb-2" />
                        <Skeleton width="100%" height="2.5rem" borderRadius="6px" />
                    </div>
                ))}
                <div className="flex gap-2 justify-content-end">
                    <Skeleton width="100px" height="2.5rem" borderRadius="6px" />
                    <Skeleton width="100px" height="2.5rem" borderRadius="6px" />
                </div>
            </div>
        </Card>
    )
}
