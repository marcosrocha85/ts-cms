"use client"
import dynamic from "next/dynamic"
import { Skeleton } from "primereact/skeleton"

// Dynamically import Chart to avoid SSR issues with chart.js
const Chart = dynamic(() => import("primereact/chart").then((mod) => mod.Chart), {
    ssr: false,
    loading: () => <Skeleton width="100%" height="300px" />
})

interface ChartWrapperProps {
    type: "bar" | "line" | "pie" | "doughnut" | "polarArea" | "radar"
    data: any
    options?: any
    style?: React.CSSProperties
    className?: string
}

export function ChartWrapper({ type, data, options, style, className }: ChartWrapperProps) {
    return <Chart type={type} data={data} options={options} style={style} className={className} />
}
