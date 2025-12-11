"use client"
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { useContext, useRef, useState } from "react"

import { appMetadata } from "@/config/metadata"
import { LayoutContext } from "@/layout/context/layoutcontext"
import { NodeRef } from "@/types"
import { Button } from "primereact/button"
import { Ripple } from "primereact/ripple"
import { StyleClass } from "primereact/styleclass"
import { classNames } from "primereact/utils"

const LandingPage = () => {
    const [isHidden, setIsHidden] = useState(false)
    const { layoutConfig } = useContext(LayoutContext)
    const menuRef = useRef<HTMLElement | null>(null)

    const toggleMenuItemClick = () => {
        setIsHidden((prevState) => !prevState)
    }

    return (
        <div className="surface-0 flex justify-content-center">
            <div id="home" className="landing-wrapper overflow-hidden">
                <div className="py-4 px-4 mx-0 md:mx-6 lg:mx-8 lg:px-8 flex align-items-center justify-content-between relative lg:static">
                    <Link href="/" className="flex align-items-center">
                        <img src={`/layout/images/${layoutConfig.colorScheme === "light" ? "logo-dark" : "logo-white"}.svg`} alt="Sakai Logo" height="50" className="mr-0 lg:mr-2" />
                        <span className="text-900 font-medium text-2xl line-height-3 mr-8">{appMetadata.shortName}</span>
                    </Link>
                    <StyleClass nodeRef={menuRef as NodeRef} selector="@next" enterClassName="hidden" leaveToClassName="hidden" hideOnOutsideClick>
                        <i ref={menuRef} className="pi pi-bars text-4xl cursor-pointer block lg:hidden text-700"></i>
                    </StyleClass>
                    <div className={classNames("align-items-center surface-0 flex-grow-1 justify-content-between hidden lg:flex absolute lg:static w-full left-0 px-6 lg:px-0 z-2", { hidden: isHidden })} style={{ top: "100%" }}>
                        <ul className="list-none p-0 m-0 flex lg:align-items-center select-none flex-column lg:flex-row cursor-pointer">
                            <li>
                                <a href="#home" onClick={toggleMenuItemClick} className="p-ripple flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3">
                                    <span>Home</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li>
                                <a href="#features" onClick={toggleMenuItemClick} className="p-ripple flex m-0 md:ml-5 px-0 py-3 text-900 font-medium line-height-3">
                                    <span>Features</span>
                                    <Ripple />
                                </a>
                            </li>
                        </ul>
                        <div className="flex justify-content-between lg:block border-top-1 lg:border-top-none surface-border py-3 lg:py-0 mt-3 lg:mt-0">
                            <Link href="/auth/login">
                                <Button label="Login" rounded className="border-none ml-5 font-light line-height-2 bg-blue-500 text-white"></Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div
                    id="hero"
                    className="flex flex-column pt-4 px-4 lg:px-8 overflow-hidden"
                    style={{
                        background: "linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #EEEFAF 0%, #C3E3FA 100%)",
                        clipPath: "ellipse(150% 87% at 93% 13%)",
                        paddingBottom: "6em"
                    }}
                >
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4">
                        <h1 className="text-6xl font-bold text-gray-900 line-height-2">
                            <span className="font-light block">Schedule Your</span>X Posts in Advance
                        </h1>
                        <p className="font-normal text-2xl line-height-3 md:mt-3 text-gray-700">Plan your entire week of posts in minutes. Upload media, set schedules, and watch your content post automatically to X (Twitter) at the perfect time.</p>
                        <Link href="/dashboard">
                            <Button type="button" label="Get Started" rounded className="text-xl border-none mt-3 bg-blue-500 font-normal line-height-3 px-3 text-white"></Button>
                        </Link>
                    </div>
                    <div className="flex justify-content-center md:justify-content-end">
                        <img src="/demo/images/landing/screen-1.png" alt="Hero Image" className="w-9 md:w-auto" />
                    </div>
                </div>

                <div id="features" className="py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8">
                    <div className="grid justify-content-center">
                        <div className="col-12 text-center mt-8 mb-4">
                            <h2 className="text-900 font-normal mb-2">Powerful Features</h2>
                            <span className="text-600 text-2xl">Everything you need to manage your X presence professionally</span>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-yellow-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-calendar text-2xl text-yellow-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Smart Scheduling</h5>
                                    <span className="text-600">Pick any date and time for your posts to post automatically to X.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(145,226,237,0.2),rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-cyan-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-image text-2xl text-cyan-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Media Upload</h5>
                                    <span className="text-600">Attach up to 4 images or 1 GIF/video with full X API optimization.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(172, 180, 223, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(246, 158, 188, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-indigo-200"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-list text-2xl text-indigo-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Bulk Management</h5>
                                    <span className="text-600">View, edit, enable/disable, or delete multiple posts from one dashboard.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(187, 199, 205, 0.2),rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2),rgba(145, 210, 204, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-bluegray-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-chart-bar text-2xl text-bluegray-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Analytics Dashboard</h5>
                                    <span className="text-600">Track your posts by status with visual charts and calendar views.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(187, 199, 205, 0.2),rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(145, 226, 237, 0.2),rgba(160, 210, 250, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-orange-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-check-circle text-2xl text-orange-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Smart Retry</h5>
                                    <span className="text-600">Failed posts are saved and can be retried at a new time with one click.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pb-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(251, 199, 145, 0.2), rgba(246, 158, 188, 0.2)), linear-gradient(180deg, rgba(172, 180, 223, 0.2), rgba(212, 162, 221, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-pink-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-moon text-2xl text-pink-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Dark Mode</h5>
                                    <span className="text-600">Convallis tellus id interdum velit laoreet.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(160, 210, 250, 0.2)), linear-gradient(180deg, rgba(187, 199, 205, 0.2), rgba(145, 210, 204, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-teal-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-bolt text-2xl text-teal-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Instant Setup</h5>
                                    <span className="text-600">Connect your X account via OAuth and start scheduling in seconds.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg:pr-5 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(145, 210, 204, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(251, 199, 145, 0.2), rgba(160, 210, 250, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-blue-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-lock text-2xl text-blue-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Secure & Private</h5>
                                    <span className="text-600">Your data stays private with encrypted OAuth and secure local storage.</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-12 lg:col-4 p-0 lg-4 mt-4 lg:mt-0">
                            <div
                                style={{
                                    height: "12em",
                                    padding: "2px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(90deg, rgba(160, 210, 250, 0.2), rgba(212, 162, 221, 0.2)), linear-gradient(180deg, rgba(246, 158, 188, 0.2), rgba(212, 162, 221, 0.2))"
                                }}
                            >
                                <div className="p-3 surface-card h-full" style={{ borderRadius: "8px" }}>
                                    <div
                                        className="flex align-items-center justify-content-center bg-purple-200 mb-3"
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        <i className="pi pi-fw pi-filter text-2xl text-purple-700"></i>
                                    </div>
                                    <h5 className="mb-2 text-900">Advanced Filtering</h5>
                                    <span className="text-600">Filter by date range, status (draft, scheduled, posted, failed), or search text.</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="col-12 mt-8 mb-8 p-2 md:p-8"
                            style={{
                                borderRadius: "20px",
                                background: "linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #EFE1AF 0%, #C3DCFA 100%)"
                            }}
                        >
                            <div className="flex flex-column justify-content-center align-items-center text-center px-3 py-3 md:py-0">
                                <h3 className="text-gray-900 mb-2">Marcos Rocha</h3>
                                <span className="text-gray-600 text-2xl">@marcosrochagpm</span>
                                <p className="text-gray-900 sm:line-height-2 md:line-height-4 text-2xl mt-4" style={{ maxWidth: "800px" }}>
                                    &ldquo;{appMetadata.shortName} lets me plan my entire content strategy in advance. I schedule my posts once and they go out at the perfect time. No more juggling tabs or remembering when to post.&rdquo;
                                </p>
                                <i className="pi pi-fw pi-twitter text-5xl text-blue-400 mt-4"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-4 px-4 mx-0 mt-8 lg:mx-8">
                    <div className="grid justify-content-between">
                        <div className="col-12 md:col-2" style={{ marginTop: "-1.5rem" }}>
                            <Link href="/" className="flex flex-wrap align-items-center justify-content-center md:justify-content-start md:mb-0 mb-3 cursor-pointer">
                                <img src={`/layout/images/${layoutConfig.colorScheme === "light" ? "logo-dark" : "logo-white"}.svg`} alt="footer sections" width="50" height="50" className="mr-2" />
                                <span className="font-medium text-3xl text-900">{appMetadata.shortName}</span>
                            </Link>
                        </div>

                        <div className="col-12 md:col-10 lg:col-7">
                            <div className="grid text-center md:text-left">
                                <div className="col-12 md:col-3"></div>
                                <div className="col-12 md:col-3"></div>
                                <div className="col-12 md:col-3">
                                    <h4 className="font-medium text-2xl line-height-3 mb-3 text-900">Product</h4>
                                    <a href="#features" className="line-height-3 text-xl block cursor-pointer mb-2 text-700">
                                        Features
                                    </a>
                                    <a href="/dashboard" className="line-height-3 text-xl block cursor-pointer text-700">
                                        Get Started
                                    </a>
                                </div>

                                <div className="col-12 md:col-3 mt-4 md:mt-0">
                                    <h4 className="font-medium text-2xl line-height-3 mb-3 text-900">Connect</h4>
                                    <a href="https://x.com/marcosrochagpm" className="line-height-3 text-xl block cursor-pointer mb-2 text-700">
                                        X (Twitter)
                                    </a>
                                    <a href="https://github.com/marcosrocha85" className="line-height-3 text-xl block cursor-pointer mb-2 text-700">
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
