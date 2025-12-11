"use client"

import { ScheduledTweet } from "@domain/entities/ScheduledTweet"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { useMemo } from "react"

interface FullCalendarComponentProps {
    tweets: ScheduledTweet[]
}

export function FullCalendarComponent({ tweets }: FullCalendarComponentProps) {
    const events = useMemo(() => {
        return tweets
            .filter((t) => t.status === "scheduled" || t.status === "draft")
            .map((tweet) => ({
                id: tweet.id.toString(),
                title: tweet.text.substring(0, 50) + (tweet.text.length > 50 ? "..." : ""),
                start: new Date(tweet.scheduledFor).toISOString(),
                backgroundColor: tweet.status === "scheduled" ? "#3b82f6" : "#9ca3af",
                borderColor: tweet.status === "scheduled" ? "#1e40af" : "#6b7280",
                extendedProps: {
                    status: tweet.status,
                    text: tweet.text,
                    tweetId: tweet.id
                }
            }))
    }, [tweets])

    return (
        <div className="full-calendar-wrapper">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                events={events}
                height="auto"
                eventClick={(info) => {
                    const { text, tweetId, status } = info.event.extendedProps
                    alert(`Post #${tweetId} (${status})\n\n${text}`)
                }}
                dayCellDidMount={(info) => {
                    info.el.style.minHeight = "80px"
                }}
            />
        </div>
    )
}
