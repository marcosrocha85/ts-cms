"use client"

import { apiDataSource } from "@data/datasources/ApiDataSource"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Dropdown } from "primereact/dropdown"
import { Message } from "primereact/message"
import React, { useEffect, useState } from "react"

export const SettingsPage: React.FC = () => {
    const [timezone, setTimezone] = useState<string>("America/Sao_Paulo")
    const [timezones, setTimezones] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ severity: "success" | "error" | "info"; text: string } | null>(null)

    useEffect(() => {
        // Fetch timezone list
        const loadTimezones = async () => {
            try {
                const response = await apiDataSource.get("/auth/timezones")
                setTimezones(response.data)
            } catch (error) {
                console.error("Failed to load timezones:", error)
                setMessage({ severity: "error", text: "Failed to load timezones" })
            }
        }

        // Fetch current user timezone
        const loadCurrentTimezone = async () => {
            try {
                const response = await apiDataSource.get("/auth/profile")
                setTimezone(response.data.timezone || "America/Sao_Paulo")
            } catch (error) {
                console.error("Failed to load current timezone:", error)
            }
        }

        loadTimezones()
        loadCurrentTimezone()
    }, [])

    const handleTimezoneChange = async () => {
        setLoading(true)
        try {
            await apiDataSource.patch("/auth/timezone", { timezone })
            setMessage({ severity: "success", text: "Timezone updated successfully!" })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            console.error("Failed to update timezone:", error)
            setMessage({ severity: "error", text: "Failed to update timezone" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h1>Settings</h1>
                <p className="text-600">Customize the application according to your preferences</p>
            </div>

            {message && (
                <div className="col-12">
                    <Message severity={message.severity} text={message.text} className="w-full" />
                </div>
            )}

            {/* Section: Timezone */}
            <div className="col-12 lg:col-6">
                <Card title="🌍 Timezone">
                    <div className="flex flex-column gap-3">
                        <p className="text-600">Select your default timezone. This will be used for scheduling tweets and display times.</p>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="timezone" className="font-semibold">
                                Timezone:
                            </label>
                            <Dropdown id="timezone" value={timezone} onChange={(e) => setTimezone(e.value)} options={timezones.map((tz) => ({ label: tz, value: tz }))} placeholder="Select a timezone" className="w-full" showClear />
                            <Button label="Save Timezone" icon="pi pi-check" onClick={handleTimezoneChange} loading={loading} className="mt-2" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Section: Appearance */}
            <div className="col-12 lg:col-6">
                <Card title="🎨 Appearance">
                    <div className="flex flex-column gap-3">
                        <Message severity="info" text="The dark theme is configured as default in this application." className="w-full" />
                        <p className="text-600">Currently the theme is fixed in dark mode. Additional customization options may be included in future versions.</p>
                    </div>
                </Card>
            </div>

            {/* Section: About */}
            <div className="col-12 lg:col-6">
                <Card title="ℹ️ About the System">
                    <div className="flex flex-column gap-3">
                        <p>
                            <strong>TweetScheduler CMS</strong> is a tool for managing and scheduling posts using the official X (Twitter) API.
                        </p>
                        <div className="flex flex-column gap-2">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-user" />
                                <span>Developed by @marcosrochagpm</span>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-code" />
                                <span>Stack: Next.js + NestJS + MySQL</span>
                            </div>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-github" />
                                <span>Open Source</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Note about future settings */}
            <div className="col-12">
                <Message severity="info" text="💡 Additional settings will be added here as needed" className="w-full" />
            </div>
        </div>
    )
}
