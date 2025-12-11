"use client"
import { UserSettingsProvider } from "@/src/presentation/contexts/UserSettingsContext"
import "primeflex/primeflex.css"
import "primeicons/primeicons.css"
import { PrimeReactProvider } from "primereact/api"
import "primereact/resources/primereact.css"
import { LayoutProvider } from "../layout/context/layoutcontext"
import "../styles/layout/layout.scss"

// FontAwesome
import { config } from "@fortawesome/fontawesome-svg-core"
import "@fortawesome/fontawesome-svg-core/styles.css"
config.autoAddCss = false // Avoids conflict with Next.js

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-dark-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <a href="#main-content" className="skip-to-main">
                    Skip to main content
                </a>
                <PrimeReactProvider>
                    <UserSettingsProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </UserSettingsProvider>
                </PrimeReactProvider>
            </body>
        </html>
    )
}
