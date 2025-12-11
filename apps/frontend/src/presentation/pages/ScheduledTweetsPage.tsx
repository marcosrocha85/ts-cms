"use client"
import { ScheduledTweet } from "@domain/entities/ScheduledTweet"
import { DataTableSkeleton } from "@presentation/components/skeletons"
import { useScheduledTweets } from "@presentation/hooks/useScheduledTweets"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BreadCrumb } from "primereact/breadcrumb"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Column } from "primereact/column"
import { ConfirmDialog } from "primereact/confirmdialog"
import { DataTable } from "primereact/datatable"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { Paginator } from "primereact/paginator"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"

export function ScheduledTweetsPage() {
    const { tweets, loading: apiLoading, filters, pagination, toast, onPageChange, onFilterChange, clearFilters, handleDelete, handleToggle, navigateToNew, navigateToEdit } = useScheduledTweets()
    const loading = apiLoading

    const breadcrumbHome = { icon: "pi pi-home", url: "/" }
    const breadcrumbItems = [{ label: "Posts" }, { label: "Scheduled Posts", url: "/tweets" }]

    const statusOptions = [
        { label: "All", value: undefined },
        { label: "Draft", value: "draft" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Posted", value: "posted" },
        { label: "Failed", value: "failed" },
        { label: "Disabled", value: "disabled" }
    ]

    // Column templates
    const textBodyTemplate = (rowData: ScheduledTweet) => {
        const maxLength = 80
        const text = rowData.text.length > maxLength ? rowData.text.substring(0, maxLength) + "..." : rowData.text
        return <span className="white-space-pre-wrap">{text}</span>
    }

    const scheduledForBodyTemplate = (rowData: ScheduledTweet) => {
        return format(new Date(rowData.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    }

    const statusBodyTemplate = (rowData: ScheduledTweet) => {
        const statusConfig: Record<string, { severity: "success" | "info" | "warning" | "danger" | null; label: string; icon: string }> = {
            draft: { severity: null, label: "Draft", icon: "pi-file-edit" },
            scheduled: { severity: "info", label: "Scheduled", icon: "pi-clock" },
            posted: { severity: "success", label: "Posted", icon: "pi-check-circle" },
            failed: { severity: "danger", label: "Failed", icon: "pi-times-circle" },
            disabled: { severity: "warning", label: "Disabled", icon: "pi-ban" }
        }

        const config = statusConfig[rowData.status]
        return <Tag severity={config.severity} icon={`pi ${config.icon}`} value={config.label} />
    }

    const mediaBodyTemplate = (rowData: ScheduledTweet) => {
        if (!rowData.mediaPaths || rowData.mediaPaths.length === 0) {
            return <span className="text-500">-</span>
        }
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-image text-primary"></i>
                <span>{rowData.mediaPaths.length}</span>
            </div>
        )
    }

    const actionsBodyTemplate = (rowData: ScheduledTweet) => {
        const canEdit = rowData.status !== "posted"
        const canToggle = rowData.status === "scheduled" || rowData.status === "disabled"

        return (
            <div className="flex gap-2">
                {rowData.status === "posted" && rowData.tweetId && (
                    <Button
                        icon="pi pi-external-link"
                        className="p-button-rounded p-button-text p-button-info"
                        tooltip="Ver no X"
                        tooltipOptions={{ position: "top" }}
                        onClick={() => window.open(`https://twitter.com/i/web/status/${rowData.tweetId}`, "_blank")}
                    />
                )}
                {canEdit && <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-warning" tooltip="Edit" tooltipOptions={{ position: "top" }} onClick={() => navigateToEdit(rowData.id)} />}
                {canToggle && (
                    <Button
                        icon={rowData.status === "disabled" ? "pi pi-check" : "pi pi-ban"}
                        className="p-button-rounded p-button-text p-button-secondary"
                        tooltip={rowData.status === "disabled" ? "Enable" : "Disable"}
                        tooltipOptions={{ position: "top" }}
                        onClick={() => handleToggle(rowData)}
                    />
                )}
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" tooltip="Delete" tooltipOptions={{ position: "top" }} onClick={() => handleDelete(rowData.id)} />
            </div>
        )
    }

    const header = (
        <div className="flex flex-column gap-3">
            <div className="flex align-items-center justify-content-between">
                <h4 className="m-0">Scheduled Posts</h4>
                <Button label="New Tweet" icon="pi pi-plus" onClick={navigateToNew} />
            </div>

            {/* Filtros */}
            <div className="grid">
                <div className="col-12 md:col-3">
                    <Dropdown value={filters.status} options={statusOptions} onChange={(e) => onFilterChange({ ...filters, status: e.value })} placeholder="Status" className="w-full" />
                </div>

                <div className="col-12 md:col-3">
                    <InputText value={filters.search || ""} onChange={(e) => onFilterChange({ ...filters, search: e.target.value })} placeholder="Search at text..." className="w-full" />
                </div>

                <div className="col-12 md:col-2">
                    <Calendar
                        value={filters.dateFrom ? new Date(filters.dateFrom) : null}
                        onChange={(e) => onFilterChange({ ...filters, dateFrom: e.value ? e.value.toISOString() : undefined })}
                        placeholder="Start Date"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>

                <div className="col-12 md:col-2">
                    <Calendar
                        value={filters.dateTo ? new Date(filters.dateTo) : null}
                        onChange={(e) => onFilterChange({ ...filters, dateTo: e.value ? e.value.toISOString() : undefined })}
                        placeholder="End Date"
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                    />
                </div>

                <div className="col-12 md:col-2">
                    <Button label="Clear Filters" icon="pi pi-filter-slash" className="p-button-outlined w-full" onClick={clearFilters} />
                </div>
            </div>
        </div>
    )

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
            </div>

            <div className="col-12">
                <div className="card">
                    {loading && tweets.length === 0 ? (
                        <DataTableSkeleton rows={5} columns={5} />
                    ) : (
                        <DataTable value={tweets} loading={loading} header={header} emptyMessage="No posts found" responsiveLayout="scroll">
                            <Column field="text" header="Text" body={textBodyTemplate} style={{ minWidth: "300px" }} />
                            <Column field="scheduledFor" header="Scheduled For" body={scheduledForBodyTemplate} sortable style={{ minWidth: "180px" }} />
                            <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ minWidth: "150px" }} />
                            <Column header="Media" body={mediaBodyTemplate} style={{ width: "100px" }} />
                            <Column header="Actions" body={actionsBodyTemplate} exportable={false} style={{ minWidth: "200px" }} />
                        </DataTable>
                    )}

                    {/* Paginator - only show when not loading initially */}
                    {!(loading && tweets.length === 0) && (
                        <Paginator
                            first={(pagination.page - 1) * pagination.limit}
                            rows={pagination.limit}
                            totalRecords={pagination.total}
                            rowsPerPageOptions={[5, 10, 20, 50]}
                            onPageChange={onPageChange}
                            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} posts"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
