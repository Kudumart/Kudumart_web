import { Outlet } from "react-router-dom";
import Header from "./Header";
import { Drawer } from "@material-tailwind/react";
import { useState } from "react";
import SideBar from "./AdminSidebar";
import NavBar from "./navBar";
import { AdminThemeProvider, useAdminTheme } from "../../hooks/adminTheme";

const AdminLayoutContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode } = useAdminTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className={`admin-shell min-h-screen w-full bg-[#f4f6f9] text-slate-900 transition-colors ${darkMode ? "admin-dark" : ""}`}>
        <Header openMenu={toggleMenu} />
        <div className="hidden md:block">
          <SideBar />
        </div>
        <main className="flex min-h-screen w-full flex-col md:pl-[272px] md:pr-4">
          <NavBar />
          <div className="flex-1 pb-4">
            <Outlet />
          </div>
        </main>
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

const AdminLayout = () => <AdminThemeProvider><AdminLayoutContent /></AdminThemeProvider>;

export default AdminLayout;
