import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Drawer } from "@material-tailwind/react";
import { useState } from "react";
import SideBar from "./SideBar";
import NavBar from "./navBar";

const AdminLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="w-full flex flex-col md:flex-row h-full animate__animated animate__fadeIn bg-kudu-light-gray overflow-hidden">
        <Header openMenu={toggleMenu} />
        <div className="hidden md:flex">
          <SideBar />
        </div>
        <div className="w-full lg:ml-[24%] md:mx-4 flex flex-col gap-5 md:ml-[23%] h-full overflow-hidden">
          <NavBar />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
      <Drawer
        open={isMenuOpen}
        onClose={toggleMenu}
        placement="left"
        id="drawer"
        overlayProps={{
          className: "bg-black/50",
        }}
      >
        <SideBar onMobile onSelected={toggleMenu} />
      </Drawer>
    </>
  );
};

export default AdminLayout;
