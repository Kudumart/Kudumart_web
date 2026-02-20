import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useApiMutation from "../../api/hooks/useApiMutation";
import { setCurrencyData } from "../../reducers/userSlice";
import { Menu, Settings } from "lucide-react"; // Hamburger icon for mobile
import SettingsSideBar from "./components/sideBar";

export default function UserSettings() {
    const { mutate } = useApiMutation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getCurrency = () => {
        mutate({
            url: `/vendor/currencies`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setCurrencyData(response.data.data);
            },
            onError: () => { },
        });
    };

    useEffect(() => {
        getCurrency();
    }, []);


    const handleSideBar = () => {
        setIsSidebarOpen(true);
    }

    return (
        <div className="w-full flex flex-col h-full bg-kudu-light-blue">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 mt-24 lg:pr-24 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
                <div className="w-full flex md:flex-row flex-col h-full relative gap-8 items-start">
                    {/* Mobile Sidebar Toggle Button */}
                    <button
                        className="md:hidden flex mt-5 items-center gap-2 p-2 bg-gray-200 rounded-lg"
                        onClick={() => handleSideBar()}
                    >
                        <Menu size={24} />
                        <span>Menu</span>
                    </button>

                    {/* Sidebar (Collapsible on Mobile) */}
                    <div
                        className={`fixed inset-0 bg-white z-9999 md:z-0 md:w-[25%] overflow-auto p-4 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
                            } md:flex flex-col shadow-lg md:shadow-none`}
                    >
                        {/* Close Button for Mobile */}
                        <button
                            className="md:hidden absolute top-4 right-4 text-gray-500"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            ✕
                        </button>
                        <SettingsSideBar close={() => setIsSidebarOpen(false)} />
                    </div>

                    {/* Main Content */}
                    <div className="flex w-full md:w-[80%]">
                        <Outlet />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-6 items-start my-10"></div>
            </div>
        </div>
    );
}
