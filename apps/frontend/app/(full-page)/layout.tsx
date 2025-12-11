import React from "react"

interface SimpleLayoutProps {
    children: React.ReactNode
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return <React.Fragment>{children}</React.Fragment>
}
