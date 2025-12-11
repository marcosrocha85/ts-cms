import { useScheduledTweets } from "@presentation/hooks/useScheduledTweets"
import { act, renderHook } from "@testing-library/react"

const pushMock = jest.fn()
const findAllMock = jest.fn()
const updateMock = jest.fn()
const removeMock = jest.fn()
const confirmDialogMock = jest.fn()
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock })
}))

jest.mock("primereact/confirmdialog", () => ({
    confirmDialog: (config: unknown) => confirmDialogMock(config)
}))

jest.mock("@data/repositories/ScheduledTweetRepository", () => ({
    scheduledTweetRepository: {
        findAll: (...args: unknown[]) => findAllMock(...args),
        update: (...args: unknown[]) => updateMock(...args),
        remove: (...args: unknown[]) => removeMock(...args)
    }
}))

describe("useScheduledTweets Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        findAllMock.mockResolvedValue({
            data: [],
            meta: { total: 0, totalPages: 0 }
        })
        updateMock.mockResolvedValue({})
        removeMock.mockResolvedValue({})
    })

    it("should load tweets on mount", async () => {
        const { result } = renderHook(() => useScheduledTweets())

        await act(async () => {
            await flushPromises()
        })

        expect(findAllMock).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
        expect(result.current.tweets).toEqual([])
    })

    it("should navigate to create and edit routes", async () => {
        const { result } = renderHook(() => useScheduledTweets())

        await act(async () => {
            await flushPromises()
            result.current.navigateToNew()
            result.current.navigateToEdit(42)
        })

        expect(pushMock).toHaveBeenCalledWith("/tweets/new")
        expect(pushMock).toHaveBeenCalledWith("/tweets/42/edit")
    })

    it("should update pagination on page change", async () => {
        const { result } = renderHook(() => useScheduledTweets())

        await act(async () => {
            await flushPromises()
            result.current.onPageChange({ page: 2, rows: 25 })
        })

        expect(result.current.pagination.page).toBe(3)
        expect(result.current.pagination.limit).toBe(25)
    })

    it("should reset filters when clearing", async () => {
        const { result } = renderHook(() => useScheduledTweets())

        await act(async () => {
            await flushPromises()
            result.current.onFilterChange({ status: "scheduled" })
            result.current.clearFilters()
        })

        expect(result.current.filters).toEqual({
            status: undefined,
            search: "",
            dateFrom: undefined,
            dateTo: undefined
        })
        expect(result.current.pagination.page).toBe(1)
    })
})
