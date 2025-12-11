/* eslint-disable @next/next/no-img-element */

import { useGotoProfile } from "@/src/presentation/hooks/useGotoProfile"
import { AppTopbarRef } from "@/types"
import { useLogout } from "@presentation/hooks/useLogout"
import Link from "next/link"
import { Menu } from "primereact/menu"
import { MenuItem } from "primereact/menuitem"
import { classNames } from "primereact/utils"
import { forwardRef, useContext, useImperativeHandle, useRef } from "react"
import { LayoutContext } from "./context/layoutcontext"

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext)
    const { gotoProfile } = useGotoProfile()
    const { handleLogout } = useLogout()
    const menubuttonRef = useRef(null)
    const topbarmenuRef = useRef(null)
    const topbarmenubuttonRef = useRef(null)
    const profileMenuRef = useRef<Menu>(null)

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }))

    const profileMenuItems: MenuItem[] = [
        {
            label: "Profile",
            icon: "pi pi-user",
            command: gotoProfile
        },
        {
            separator: true
        },
        {
            label: "Logout",
            icon: "pi pi-sign-out",
            command: handleLogout
        }
    ]

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== "light" ? "white" : "dark"}.svg`} width="47.22px" height={"35px"} alt="logo" />
                <span>SAKAI</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames("layout-topbar-menu", { "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button" onClick={(e) => profileMenuRef.current?.toggle(e)}>
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button>
                <Menu model={profileMenuItems} popup ref={profileMenuRef} />
                <Link href="/settings">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-cog"></i>
                        <span>Settings</span>
                    </button>
                </Link>
            </div>
        </div>
    )
})

AppTopbar.displayName = "AppTopbar"

export default AppTopbar
