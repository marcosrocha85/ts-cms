import { useRouter } from "next/navigation"

export const useGotoProfile = () => {
    const router = useRouter()

    const gotoProfile = async () => {
        router.push("/profile")
    }

    return {
        gotoProfile
    }
}
