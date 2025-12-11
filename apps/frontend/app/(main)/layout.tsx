import { appMetadata } from "@/config/metadata"
import { Metadata } from "next"
import Layout from "../../layout/layout"

interface AppLayoutProps {
    children: React.ReactNode
}

export const metadata: Metadata = {
    title: appMetadata.title,
    description: appMetadata.description,
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: "device-width" },
    openGraph: {
        type: "website",
        title: appMetadata.title,
        url: appMetadata.url,
        description: appMetadata.description,
        images: [appMetadata.ogImage],
        ttl: 604800
    },
    icons: {
        icon: "/favicon.ico"
    }
}

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>
}
