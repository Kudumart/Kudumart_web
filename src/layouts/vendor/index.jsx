import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Drawer } from "@material-tailwind/react";
import { useState } from "react";
import SideBar from "./SideBar";

const VendorLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <div className="w-full flex flex-col md:flex-row h-full animate__animated animate__fadeIn bg-kudu-light-gray">
                <Header openMenu={toggleMenu} />
                <div className="hidden md:flex">
                    <SideBar />
                </div>
                <div className="w-full lg:ml-[23%] md:mx-4 flex flex-col gap-5 md:ml-[23%] h-full">
                    <Outlet />
                </div>
            </div>
            <Drawer open={isMenuOpen} onClose={toggleMenu} placement="left">
                <SideBar onMobile onSelected={toggleMenu} />
            </Drawer>
        </>
    );
};

export default VendorLayout;