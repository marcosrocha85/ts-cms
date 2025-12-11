import { LoginPage } from "@presentation/pages/LoginPage"
import { fireEvent, render, screen } from "@testing-library/react"

const handleLoginMock = jest.fn()
const setEmailMock = jest.fn()
const setPasswordMock = jest.fn()
// Mock do LayoutContext para evitar undefined durante o render
jest.mock("../../../layout/context/layoutcontext", () => {
    const React = require("react")
    return { LayoutContext: React.createContext({ layoutConfig: { inputStyle: "outlined", colorScheme: "light" } }) }
})

// Mock do hook useLogin
jest.mock("@presentation/hooks/useLogin", () => ({
    useLogin: () => ({
        email: "",
        password: "",
        rememberMe: false,
        loading: false,
        toast: { current: null },
        setEmail: setEmailMock,
        setPassword: setPasswordMock,
        setRememberMe: jest.fn(),
        handleLogin: handleLoginMock
    })
}))

describe("LoginPage", () => {
    it("should render login form", () => {
        render(<LoginPage />)

        expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i, { selector: "input" })).toBeInTheDocument()
    })

    it("should allow typing email and password", () => {
        render(<LoginPage />)

        const emailInput = screen.getByRole("textbox", { name: /email/i })
        const passwordInput = screen.getByLabelText(/password/i, { selector: "input" })

        fireEvent.change(emailInput, { target: { value: "test@example.com" } })
        fireEvent.change(passwordInput, { target: { value: "password123" } })

        expect(setEmailMock).toHaveBeenCalledWith("test@example.com")
        expect(setPasswordMock).toHaveBeenCalledWith("password123")
    })

    it("should call handleLogin on submit", () => {
        render(<LoginPage />)

        const submitButton = screen.getByRole("button", { name: /sign in/i })

        fireEvent.click(submitButton)

        expect(handleLoginMock).toHaveBeenCalled()
    })
})
