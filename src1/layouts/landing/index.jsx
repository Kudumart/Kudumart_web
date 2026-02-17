import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { Drawer } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import SideBar from "./SideBar";
import Footer from "./Footer";
import Chat from "../../modules/Chatbot/Chat";

const LandingLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hideFooter, setHideFooter] = useState(false);
  const location = useLocation();

  const urlExceptions = ["/messages"];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (urlExceptions.some((url) => location.pathname.includes(url))) {
      // remove footer
      setHideFooter(true);
    } else {
      setHideFooter(false);
    }
  }, [location.pathname]); // Trigger this effect whenever the pathname changes

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    document.documentElement.style.position = null;
  }, [location]);

  return (
    <>
      <div>
        <Header openMenu={toggleMenu} />
        <div className={`${hideFooter ? "pt-[2%]" : "pt-[4%]"}`}>
          <Outlet />
          {/* <Chat />*/}
          {!hideFooter && <Footer />}
        </div>
      </div>
      <Drawer open={isMenuOpen} onClose={toggleMenu} placement="left">
        <SideBar onSelected={toggleMenu} />
      </Drawer>
    </>
  );
};

export default LandingLayout;
