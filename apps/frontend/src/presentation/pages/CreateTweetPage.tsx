"use client"
import { TweetPreview } from "@presentation/components/TweetPreview"
import { useUserSettings } from "@presentation/contexts/UserSettingsContext"
import { useCreateTweet } from "@presentation/hooks/useCreateTweet"
import { useTwitterStatus } from "@presentation/hooks/useTwitterStatus"
import { format } from "date-fns"
import { BreadCrumb } from "primereact/breadcrumb"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Card } from "primereact/card"
import { Divider } from "primereact/divider"
import { FileUpload } from "primereact/fileupload"
import { InputTextarea } from "primereact/inputtextarea"
import { MenuItem } from "primereact/menuitem"
import { Message } from "primereact/message"
import { SplitButton } from "primereact/splitbutton"
import { Toast } from "primereact/toast"

export function CreateTweetPage() {
    const { maxTweetChars } = useUserSettings()
    const { status: twitterStatus, loading: twitterLoading, connectTwitter } = useTwitterStatus()
    const { text, scheduledFor, mediaFiles, isSubmitting, toast, fileUploadRef, setText, setScheduledFor, handleMediaUpload, removeMedia, handleSchedule, handlePostNow, handleCancel } = useCreateTweet()

    const breadcrumbHome = { icon: "pi pi-home", url: "/" }
    const breadcrumbItems = [{ label: "Posts" }, { label: "Scheduled Posts", url: "/tweets" }, { label: "New Post", url: "/tweets/new" }]

    const splitButtonItems: MenuItem[] = [
        {
            label: "Post Now",
            icon: "pi pi-send",
            command: handlePostNow
        }
    ]

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
            </div>

            <div className="col-12 lg:col-7">
                <Card title="New Post">
                    {!twitterLoading && !twitterStatus.connected && (
                        <Message
                            severity="warn"
                            text={
                                <div className="flex align-items-center gap-2">
                                    <span>You need to connect your X account to schedule posts.</span>
                                    <Button label="Connect Twitter" icon="pi pi-twitter" className="p-button-sm" onClick={connectTwitter} />
                                </div>
                            }
                            className="mb-4 w-full"
                        />
                    )}

                    <div className="p-fluid">
                        <div className="field">
                            <label htmlFor="postText" className="font-semibold">
                                Post Text <span className="text-red-500">*</span>
                            </label>
                            <InputTextarea
                                id="postText"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                placeholder="What's happening?"
                                maxLength={280}
                                className="w-full"
                                autoFocus
                                aria-label="Post text content"
                                aria-describedby="postText-help"
                                aria-required="true"
                            />
                            <small id="postText-help" className={`block mt-2 ${text.length > maxTweetChars ? "text-red-500" : "text-500"}`} role="status" aria-live="polite">
                                {text.length} / {maxTweetChars} characters
                            </small>
                        </div>

                        <div className="field">
                            <label htmlFor="scheduledFor" className="font-semibold">
                                Schedule for <small className="text-500">(optional for immediate posting)</small>
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
                            />
                            {scheduledFor && (
                                <small id="scheduledFor-help" className="block mt-2 text-500" role="status" aria-live="polite">
                                    Will be posted on: {format(scheduledFor, "dd/MM/yyyy 'at' HH:mm")}
                                </small>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="media-upload" className="font-semibold mb-2 block">
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
                                chooseLabel="Select Images"
                                disabled={mediaFiles.length >= 4}
                                className="w-full"
                                aria-label="Upload images for post"
                                aria-describedby="media-help"
                            />
                            <small id="media-help" className="block mt-2 text-500">
                                Accepted formats: JPEG, PNG, GIF. Maximum size: 5MB per image.
                            </small>
                        </div>

                        {mediaFiles.length > 0 && (
                            <div className="field">
                                <label className="font-semibold mb-2 block">Selected Images</label>
                                <div className="grid" role="list" aria-label="Selected images">
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
                                                <small className="block mt-1 text-500 text-sm truncate">{media.name}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Divider />

                        <div className="flex gap-2 justify-content-end" role="group" aria-label="Form actions">
                            <Button label="Cancel" icon="pi pi-times" className="p-button-secondary flex-1" onClick={handleCancel} disabled={isSubmitting} type="button" aria-label="Cancel and go back" />
                            <SplitButton label="Schedule Post" icon="pi pi-calendar-plus" onClick={handleSchedule} model={splitButtonItems} loading={isSubmitting} disabled={isSubmitting} className="flex-1" aria-label="Schedule post or post now" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="col-12 lg:col-5">
                <div className="sticky" style={{ top: "80px" }}>
                    <TweetPreview text={text} mediaPaths={mediaFiles.map((m) => m.url)} />
                </div>
            </div>
        </div>
    )
}
