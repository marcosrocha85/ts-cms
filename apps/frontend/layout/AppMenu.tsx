/* eslint-disable @next/next/no-img-element */

import { AppMenuItem } from "@/types"
import AppMenuitem from "./AppMenuitem"
import { MenuProvider } from "./context/menucontext"

const AppMenu = () => {
    const model: AppMenuItem[] = [
        {
            label: "Home",
            items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/dashboard" }]
        },
        {
            label: "X (Twitter)",
            items: [
                { label: "New Post", icon: "pi pi-fw pi-plus", to: "/tweets/new" },
                { label: "List", icon: "pi pi-fw pi-list", to: "/tweets" }
            ]
        }
    ]

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>
                })}
            </ul>
        </MenuProvider>
    )
}

export default AppMenu
