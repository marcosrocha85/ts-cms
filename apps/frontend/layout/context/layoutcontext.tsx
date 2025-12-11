"use client"
import { ChildContainerProps, LayoutConfig, LayoutContextProps, LayoutState } from "@/types"
import { createContext, useEffect, useState } from "react"
export const LayoutContext = createContext({} as LayoutContextProps)

export const LayoutProvider = ({ children }: ChildContainerProps) => {
    const [mounted, setMounted] = useState(false)
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: true,
        inputStyle: "outlined",
        menuMode: "static",
        colorScheme: "dark",
        theme: "lara-dark-blue",
        scale: 14
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    })

    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, overlayMenuActive: !prevLayoutState.overlayMenuActive }))
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive }))
        } else {
            setLayoutState((prevLayoutState) => ({ ...prevLayoutState, staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive }))
        }
    }

    const showProfileSidebar = () => {
        setLayoutState((prevLayoutState) => ({ ...prevLayoutState, profileSidebarVisible: !prevLayoutState.profileSidebarVisible }))
    }

    const isOverlay = () => {
        return layoutConfig.menuMode === "overlay"
    }

    const isDesktop = () => {
        if (typeof window === "undefined") return false
        return window.innerWidth > 991
    }

    if (!mounted) {
        return null
    }

    const value: LayoutContextProps = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        showProfileSidebar
    }

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
