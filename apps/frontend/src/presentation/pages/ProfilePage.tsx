"use client"

import { apiDataSource } from "@data/datasources/ApiDataSource"
import { TwitterVerifiedBadge } from "@presentation/components/TwitterVerifiedBadge"
import { useTwitterStatus } from "@presentation/hooks/useTwitterStatus"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Divider } from "primereact/divider"
import { InputText } from "primereact/inputtext"
import { Message } from "primereact/message"
import { Password } from "primereact/password"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"
import React, { useEffect, useRef, useState } from "react"

export const ProfilePage: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const toast = useRef<Toast>(null)
    const { status: twitterStatus, loading, checkTwitterStatus, disconnectTwitter } = useTwitterStatus()
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isChangingPassword, setIsChangingPassword] = useState(false)

    useEffect(() => {
        // Check X status on load
        checkTwitterStatus()

        // Show success message if coming from OAuth callback
        if (searchParams.get("twitter_connected") === "true") {
            setShowSuccessMessage(true)
            // Remove query param from URL
            router.replace("/profile")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const handleDisconnect = async () => {
        if (confirm("Do you really want to disconnect your X account? You won't be able to schedule post without a connected account.")) {
            await disconnectTwitter()
            setShowSuccessMessage(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.current?.show({
                severity: "warn",
                summary: "Required Fields",
                detail: "Fill in all fields",
                life: 3000
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast.current?.show({
                severity: "error",
                summary: "Passwords Don't Match",
                detail: "The new password and confirmation must be the same",
                life: 3000
            })
            return
        }

        if (newPassword.length < 6) {
            toast.current?.show({
                severity: "error",
                summary: "Weak Password",
                detail: "The password must be at least 6 characters long",
                life: 3000
            })
            return
        }

        setIsChangingPassword(true)

        try {
            const response = await apiDataSource.patch<{ message: string }>("/auth/change-password", {
                currentPassword,
                newPassword,
                confirmPassword
            })

            toast.current?.show({
                severity: "success",
                summary: "Password Changed",
                detail: response.data.message,
                life: 3000
            })

            // Limpar campos
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            console.error("Error changing password:", error)

            const errorMessage = error.response?.data?.message || "Error changing password"

            toast.current?.show({
                severity: "error",
                summary: "Erro",
                detail: errorMessage,
                life: 5000
            })
        } finally {
            setIsChangingPassword(false)
        }
    }

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <h1>My Profile</h1>
                <p className="text-600">Manage your personal information and X connection</p>
            </div>

            {showSuccessMessage && (
                <div className="col-12">
                    <Message severity="success" text="X account connected successfully! 🎉" className="w-full" />
                </div>
            )}

            {/* Seção: Informações do Perfil */}
            <div className="col-12 lg:col-6">
                <Card title="📧 Profile Information">
                    <div className="flex flex-column gap-3">
                        <div className="field">
                            <label htmlFor="email" className="font-semibold">
                                E-mail
                            </label>
                            <InputText id="email" value="admin@ts-cms.local" disabled className="w-full" aria-label="Email address" aria-describedby="email-help" />
                            <small id="email-help" className="text-500">
                                Your email address cannot be changed
                            </small>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Section: X Connection (linked to user) */}
            <div className="col-12 lg:col-6">
                <Card title="🐦 X Connection" className="h-full">
                    {loading ? (
                        <div className="flex align-items-center gap-2" role="status" aria-live="polite">
                            <i className="pi pi-spin pi-spinner" aria-hidden="true" />
                            <span>Loading...</span>
                        </div>
                    ) : twitterStatus.connected ? (
                        <div className="flex flex-column gap-3">
                            <div className="flex align-items-center gap-2" role="status" aria-live="polite">
                                <i className="pi pi-check-circle" style={{ fontSize: "1.5rem", color: "var(--green-500)" }} aria-hidden="true" />
                                <span className="text-xl font-semibold">Connected</span>
                            </div>

                            <Divider />

                            <div className="flex flex-column gap-2">
                                <div className="flex align-items-center gap-2">
                                    <span className="font-semibold">User:</span>
                                    <span>@{twitterStatus.username}</span>
                                </div>

                                <div className="flex align-items-center gap-2">
                                    <span className="font-semibold">Account type:</span>
                                    <TwitterVerifiedBadge verifiedType={twitterStatus.verifiedType} showText={true} />
                                </div>

                                <div className="flex align-items-center gap-2">
                                    <span className="font-semibold">Character limit:</span>
                                    <Tag value={(twitterStatus.maxTweetChars || 280).toLocaleString()} severity={(twitterStatus.maxTweetChars || 280) > 280 ? "success" : undefined} />
                                </div>
                            </div>

                            <Divider />

                            <Button label="Disconnect X" icon="pi pi-sign-out" severity="danger" outlined onClick={handleDisconnect} aria-label="Disconnect your X account" />
                        </div>
                    ) : (
                        <div className="flex flex-column gap-3">
                            <div className="flex align-items-center gap-2" role="status" aria-live="polite">
                                <i className="pi pi-times-circle" style={{ fontSize: "1.5rem", color: "var(--red-500)" }} aria-hidden="true" />
                                <span className="text-xl font-semibold">Not connected</span>
                            </div>

                            <p className="text-600">Connect your X account to schedule and post posts automatically.</p>

                            <Message severity="info" text="You will need to authorize the application to post posts on your behalf." />
                        </div>
                    )}
                </Card>
            </div>

            {/* Seção: Segurança (Trocar Senha) */}
            <div className="col-12">
                <Card title="🔒 Security">
                    <form onSubmit={handleChangePassword} className="flex flex-column gap-3">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <div className="field">
                                    <label htmlFor="currentPassword" className="font-semibold">
                                        Current Password
                                    </label>
                                    <Password
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        feedback={false}
                                        toggleMask
                                        className="w-full"
                                        inputClassName="w-full"
                                        aria-label="Current password"
                                        aria-required="true"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-4">
                                <div className="field">
                                    <label htmlFor="newPassword" className="font-semibold">
                                        New Password
                                    </label>
                                    <Password
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        toggleMask
                                        className="w-full"
                                        inputClassName="w-full"
                                        aria-label="New password"
                                        aria-required="true"
                                        aria-describedby="newPassword-help"
                                        autoComplete="new-password"
                                    />
                                    <small id="newPassword-help" className="sr-only">
                                        Password must be at least 6 characters long
                                    </small>
                                </div>
                            </div>

                            <div className="col-12 md:col-4">
                                <div className="field">
                                    <label htmlFor="confirmPassword" className="font-semibold">
                                        Confirm New Password
                                    </label>
                                    <Password
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        feedback={false}
                                        toggleMask
                                        className="w-full"
                                        inputClassName="w-full"
                                        aria-label="Confirm new password"
                                        aria-required="true"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" label="Change Password" icon="pi pi-key" loading={isChangingPassword} disabled={isChangingPassword} aria-label="Submit password change" />
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    )
}
