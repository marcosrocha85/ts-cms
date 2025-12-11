"use client"
import { TweetPreview } from "@presentation/components/TweetPreview"
import { useUserSettings } from "@presentation/contexts/UserSettingsContext"
import { useEditTweet } from "@presentation/hooks/useEditTweet"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { BreadCrumb } from "primereact/breadcrumb"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Card } from "primereact/card"
import { Divider } from "primereact/divider"
import { FileUpload } from "primereact/fileupload"
import { InputTextarea } from "primereact/inputtextarea"
import { Message } from "primereact/message"
import { ProgressSpinner } from "primereact/progressspinner"
import { Toast } from "primereact/toast"

export function EditTweetPage() {
    const params = useParams()
    const tweetId = params.id as string
    const { maxTweetChars } = useUserSettings()

    const { isLoading, tweet, text, scheduledFor, mediaFiles, isSubmitting, canEdit, toast, fileUploadRef, setText, setScheduledFor, handleMediaUpload, removeMedia, handleSubmit, handleCancel } = useEditTweet(tweetId)

    const breadcrumbHome = { icon: "pi pi-home", url: "/" }
    const breadcrumbItems = [{ label: "Posts" }, { label: "Scheduled Posts", url: "/tweets" }, { label: "Edit Tweet", url: `/tweets/${tweetId}/edit` }]

    if (isLoading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                </div>
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                            <ProgressSpinner />
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    if (!tweet) {
        return (
            <div className="grid">
                <div className="col-12">
                    <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                </div>
                <div className="col-12">
                    <Card>
                        <Message severity="error" text="Tweet not found" />
                    </Card>
                </div>
            </div>
        )
    }

    if (!canEdit) {
        return (
            <div className="grid">
                <div className="col-12">
                    <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                </div>
                <div className="col-12">
                    <Card>
                        <Message severity="warn" text="This tweet has already been posted and cannot be edited." />
                        <div className="mt-3">
                            <Button label="Back to List" icon="pi pi-arrow-left" onClick={handleCancel} />
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
            </div>

            <div className="col-12 lg:col-8">
                <Card title="Edit Tweet">
                    <div className="p-fluid">
                        <div className="field">
                            <label htmlFor="tweetText" className="font-semibold">
                                Post Text <span className="text-red-500">*</span>
                            </label>
                            <InputTextarea
                                id="tweetText"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                placeholder="What's happening?"
                                maxLength={280}
                                className="w-full"
                                autoFocus
                                aria-label="Post text content"
                                aria-describedby="tweetText-help"
                                aria-required="true"
                            />
                            <small id="tweetText-help" className={`block mt-2 ${text.length > maxTweetChars ? "text-red-500" : "text-500"}`} role="status" aria-live="polite">
                                {text.length} / {maxTweetChars} characters
                            </small>
                        </div>

                        <div className="field">
                            <label htmlFor="scheduledFor" className="font-semibold">
                                Schedule for <span className="text-red-500">*</span>
                            </label>
                            <Calendar
                                id="scheduledFor"
                                value={scheduledFor}
                                onChange={(e) => setScheduledFor(e.value as Date)}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                                placeholder="Select date and time"
                                minDate={new Date()}
                                showIcon
                                className="w-full"
                                aria-label="Schedule date and time for posting"
                                aria-describedby="scheduledFor-help"
                                aria-required="true"
                            />
                            {scheduledFor && (
                                <small id="scheduledFor-help" className="block mt-2 text-500" role="status" aria-live="polite">
                                    Will be posted on: {format(scheduledFor, "dd/MM/yyyy 'at' HH:mm")}
                                </small>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="media-upload-edit" className="font-semibold mb-2 block">
                                Images (optional - maximum 4)
                            </label>
                            <FileUpload
                                ref={fileUploadRef}
                                name="media"
                                multiple
                                accept="image/*"
                                maxFileSize={5000000}
                                customUpload
                                uploadHandler={handleMediaUpload}
                                auto
                                chooseLabel="Add More Images"
                                disabled={mediaFiles.length >= 4}
                                className="w-full"
                                aria-label="Upload additional images for post"
                                aria-describedby="media-help-edit"
                            />
                            <small id="media-help-edit" className="block mt-2 text-500">
                                Accepted formats: JPEG, PNG, GIF. Maximum size: 5MB per image.
                            </small>
                        </div>

                        {mediaFiles.length > 0 && (
                            <div className="field">
                                <label className="font-semibold mb-2 block">Images</label>
                                <div className="grid" role="list" aria-label="Post images">
                                    {mediaFiles.map((media, index) => (
                                        <div key={index} className="col-12 md:col-6 lg:col-3" role="listitem">
                                            <div className="relative">
                                                <img src={media.url} alt={`Preview of ${media.name}`} className="w-full border-round" style={{ height: "150px", objectFit: "cover" }} />
                                                <Button
                                                    icon="pi pi-times"
                                                    className="p-button-rounded p-button-danger p-button-sm absolute"
                                                    style={{ top: "0.5rem", right: "0.5rem" }}
                                                    onClick={() => removeMedia(index)}
                                                    type="button"
                                                    aria-label={`Remove image ${media.name}`}
                                                    tooltip={`Remove ${media.name}`}
                                                    tooltipOptions={{ position: "bottom" }}
                                                />
                                                <small className="block mt-1 text-500 text-sm truncate">
                                                    {media.name}
                                                    {media.isExisting && <span className="ml-1">(existing)</span>}
                                                </small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Divider />

                        <div className="flex gap-2 justify-content-end" role="group" aria-label="Form actions">
                            <Button label="Cancel" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} disabled={isSubmitting} type="button" aria-label="Cancel and go back" />
                            <Button label="Save Changes" icon="pi pi-check" onClick={handleSubmit} loading={isSubmitting} type="button" aria-label="Save post changes" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-4">
                <div className="sticky" style={{ top: "80px" }}>
                    <TweetPreview text={text} mediaPaths={mediaFiles.map((m) => m.url)} />
                </div>
            </div>
        </div>
    )
}
