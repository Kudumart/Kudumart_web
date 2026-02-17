import "animate.css";
import { Menu, MenuHandler, MenuList } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import Imgix from "react-imgix";
import LogOutModal from "../../components/LogOut";
import { useModal } from "../../hooks/modal"; // Adjust the path as needed
import useAppState from "../../hooks/appState";
import SwitchVendorModal from "../../modules/User/components/switchVendor";
import FlyoutMenu from "./FlyoutMenu";
import SearchBar from "./SearchBar";
import { Mail, Bell, ShoppingCart } from "lucide-react";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../../reducers/userSlice";
import { useNotification } from "../../api/notification";
import { useConversation } from "../../api/message";
import { useCart } from "../../api/cart";
import CountrySelect from "./CountrySelect";
export default function Header({ openMenu }) {
  const { user } = useAppState();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: notifications, isLoading, error } = useNotification();
  const { data: messages } = useConversation();
  const { data: cart } = useCart();
  const cart_lent = cart?.length || 0;

  const getUnreadNotifications = (notifications) => {
    if (!notifications) return 0;

    return notifications.filter((notification) => !notification.isRead).length;
  };

  const getCartNumber = (cartData) => {
    if (!cartData) return 0;
    return cartData.filter((item) => item.product.quantity > 0).length;
  };

  const getUnreadMessagesCount = (messages) => {
    if (!messages) return 0;
    return messages.reduce((count, conversation) => {
      if (conversation.receiverId === user?.id) {
        const unreadMessages = conversation.message.filter(
          (msg) => !msg.isRead,
        ).length;
        return count + unreadMessages;
      }
      return count;
    }, 0);
  };

  const navOptions = [
    {
      value: "Cart",
      slug: "cart",
      svg: <ShoppingCart size={20} color="#5f5959" />,
      info: getCartNumber(cart),
    },
    {
      value: "Messages",
      slug: "messages",
      svg: <Mail size={20} color="#5f5959" />,
      info: getUnreadMessagesCount(messages),
    },
    {
      value: "Notification",
      slug: "profile/notification",
      svg: <Bell size={20} color="#5f5959" />,
      info: getUnreadNotifications(notifications),
    },
  ];

  const arrOptions = [
    {
      value: "My Profile",
      slug: "profile",
    },
    {
      value: "Logout",
      slug: "",
      modal: true,
    },
  ];

  const authOptions = [
    {
      value: "Register",
      slug: "sign-up",
    },
    {
      value: "Login",
      slug: "login",
    },
  ];

  const toggleMenu = () => {
    openMenu();
  };

  const handleRedirect = () => {
    const updatedUser = { ...user, accountType: "Vendor" };
    dispatch(setKuduUser(updatedUser));
    navigate("/profile/products");
  };

  const logOutRedirect = () => {
    navigate("/login");
  };

  const handleLogOutModal = () => {
    openModal({
      size: "sm",
      content: <LogOutModal redirect={logOutRedirect} />,
    });
  };

  const handleVendorModal = () => {
    if (user.accountType !== "Vendor") {
      openModal({
        size: "sm",
        content: (
          <SwitchVendorModal redirect={handleRedirect}>
            <div className="flex">
              <p className="text-sm gap-2 leading-[1.7rem]">
                To start selling on Kudu, your account will be switched to a
                vendor account. This change unlocks all the features you need to
                list products, manage orders, and grow your business.
              </p>
            </div>
          </SwitchVendorModal>
        ),
      });
    } else {
      handleRedirect();
    }
  };

  return (
    <>
      <div className="fixed w-full z-95 lg:py-0 md:py-0">
        {/* Main Header */}

        <div className="w-full flex items-center bg-white justify-between lg:px-28 md:gap-8 px-5">
          <div className="lg:hidden md:hidden flex my-2">
            <Link to="/">
              <Imgix
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737497178/kuduMart/kudum_2_c8qm7a.png"
                sizes="10vw"
                width={80}
                height={33}
              />
            </Link>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center space-x-5">
            {user &&
              navOptions.map((options, index) => (
                <>
                  <Link
                    to={`/${options.slug}`}
                    className="flex items-center relative text-black gap-1"
                    key={index}
                  >
                    {options.svg}
                    {options.info > 0 && (
                      <div
                        data-theme="kudu"
                        className=" w-4 h-4 rounded-full absolute -top-2 left-4 flex justify-center items-center bg-primary text-white"
                      >
                        <p className="text-[9px]">{options.info}</p>
                      </div>
                    )}
                  </Link>
                </>
              ))}

            {!user && (
              <div className="flex items-center gap-1">
                <Menu>
                  <MenuHandler>
                    <span className="flex items-center cursor-pointer gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5 4C5 2.93913 5.42143 1.92172 6.17157 1.17157C6.92172 0.421427 7.93913 0 9 0C10.0609 0 11.0783 0.421427 11.8284 1.17157C12.5786 1.92172 13 2.93913 13 4C13 5.06087 12.5786 6.07828 11.8284 6.82843C11.0783 7.57857 10.0609 8 9 8C7.93913 8 6.92172 7.57857 6.17157 6.82843C5.42143 6.07828 5 5.06087 5 4ZM5 10C3.67392 10 2.40215 10.5268 1.46447 11.4645C0.526784 12.4021 0 13.6739 0 15C0 15.7956 0.316071 16.5587 0.87868 17.1213C1.44129 17.6839 2.20435 18 3 18H15C15.7956 18 16.5587 17.6839 17.1213 17.1213C17.6839 16.5587 18 15.7956 18 15C18 13.6739 17.4732 12.4021 16.5355 11.4645C15.5979 10.5268 14.3261 10 13 10H5Z"
                          fill="black"
                        />
                      </svg>
                      <span className="mr-1 text-[14px] font-medium mt-[4px]">
                        {" "}
                        Register / Login
                      </span>
                    </span>
                  </MenuHandler>
                  <MenuList>
                    {authOptions.map((options, index) => (
                      <Link
                        to={`/${options.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                        key={index}
                      >
                        {options.value}
                      </Link>
                    ))}
                  </MenuList>
                </Menu>
              </div>
            )}

            {user && (
              <div className="text-kudu-orange flex items-center gap-1">
                <Menu>
                  <MenuHandler>
                    <div className="flex items-center relative">
                      <span className="flex items-center cursor-pointer gap-1">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21.6488 19.875C20.2209 17.4066 18.0206 15.6366 15.4528 14.7975C16.723 14.0414 17.7098 12.8892 18.2618 11.5179C18.8137 10.1467 18.9003 8.63213 18.5082 7.2069C18.1161 5.78167 17.267 4.52456 16.0912 3.62862C14.9155 2.73268 13.4782 2.24745 12 2.24745C10.5218 2.24745 9.08451 2.73268 7.90878 3.62862C6.73306 4.52456 5.88394 5.78167 5.49183 7.2069C5.09971 8.63213 5.18629 10.1467 5.73825 11.5179C6.29021 12.8892 7.27704 14.0414 8.5472 14.7975C5.97938 15.6356 3.77907 17.4056 2.35126 19.875C2.2989 19.9604 2.26417 20.0554 2.24912 20.1544C2.23407 20.2534 2.239 20.3544 2.26363 20.4515C2.28825 20.5486 2.33207 20.6398 2.3925 20.7196C2.45293 20.7995 2.52874 20.8665 2.61547 20.9165C2.7022 20.9666 2.79808 20.9989 2.89745 21.0113C2.99683 21.0237 3.0977 21.0161 3.19409 20.989C3.29049 20.9618 3.38047 20.9156 3.45872 20.8531C3.53697 20.7906 3.6019 20.713 3.6497 20.625C5.41595 17.5725 8.53782 15.75 12 15.75C15.4622 15.75 18.5841 17.5725 20.3503 20.625C20.3981 20.713 20.4631 20.7906 20.5413 20.8531C20.6196 20.9156 20.7095 20.9618 20.8059 20.989C20.9023 21.0161 21.0032 21.0237 21.1026 21.0113C21.2019 20.9989 21.2978 20.9666 21.3845 20.9165C21.4713 20.8665 21.5471 20.7995 21.6075 20.7196C21.6679 20.6398 21.7118 20.5486 21.7364 20.4515C21.761 20.3544 21.766 20.2534 21.7509 20.1544C21.7358 20.0554 21.7011 19.9604 21.6488 19.875ZM6.75001 9C6.75001 7.96165 7.05792 6.94662 7.63479 6.08326C8.21167 5.2199 9.03161 4.54699 9.99092 4.14963C10.9502 3.75227 12.0058 3.64831 13.0242 3.85088C14.0426 4.05345 14.9781 4.55347 15.7123 5.28769C16.4465 6.02192 16.9466 6.95738 17.1491 7.97578C17.3517 8.99418 17.2477 10.0498 16.8504 11.0091C16.453 11.9684 15.7801 12.7883 14.9168 13.3652C14.0534 13.9421 13.0384 14.25 12 14.25C10.6081 14.2485 9.27359 13.6949 8.28934 12.7107C7.3051 11.7264 6.7515 10.3919 6.75001 9Z"
                            fill="#000000"
                          />
                        </svg>
                      </span>
                    </div>
                  </MenuHandler>
                  <MenuList>
                    {arrOptions.map((options, index) =>
                      options.modal ? (
                        <span
                          className="block px-4 py-2 text-sm text-gray-700 hover:outline-hidden cursor-pointer"
                          key={index}
                          onClick={() => handleLogOutModal()}
                        >
                          {options.value}
                        </span>
                      ) : (
                        <Link
                          to={`/${options.slug}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 cursor-pointer "
                          key={index}
                        >
                          {options.value}
                        </Link>
                      ),
                    )}
                  </MenuList>
                </Menu>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden -mx-1">
              <button
                className="bg-[#FFF2EA] border border-black text-black py-2 px-2 rounded-full flex items-center gap-2"
                aria-label="Open Menu"
                id="mobile-menu-button"
                onClick={() => toggleMenu()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 stroke-black"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center bg-white justify-between py-2 px-5">
          <SearchBar /> <CountrySelect />
        </div>
      </div>

      <div className="bg-white fixed w-full z-95 Desk border-b-2">
        <div className="w-full flex items-center justify-between">
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button
              className="text-black focus:outline-hidden"
              aria-label="Open Menu"
              id="mobile-menu-button"
              onClick={() => toggleMenu()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <header className="w-full" data-theme="kudu">
            {/* Top Bar */}
            <div className="w-full bg-primary text-white py-3 md:px-24">
              {/* Left Section */}
              <div className="flex justify-center items-center  xl:space-x-52 md:space-x-24">
                {/* Swift Delivery Care */}
                <span className="flex items-center space-x-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="22"
                    viewBox="0 0 36 22"
                    fill="none"
                  >
                    <path
                      d="M11.7698 21C12.5858 21 13.3685 20.6758 13.9455 20.0988C14.5225 19.5217 14.8467 18.7391 14.8467 17.9231C14.8467 17.107 14.5225 16.3244 13.9455 15.7474C13.3685 15.1703 12.5858 14.8461 11.7698 14.8461C10.9537 14.8461 10.1711 15.1703 9.59408 15.7474C9.01705 16.3244 8.69287 17.107 8.69287 17.9231C8.69287 18.7391 9.01705 19.5217 9.59408 20.0988C10.1711 20.6758 10.9537 21 11.7698 21ZM27.1544 21C27.9705 21 28.7531 20.6758 29.3301 20.0988C29.9072 19.5217 30.2313 18.7391 30.2313 17.9231C30.2313 17.107 29.9072 16.3244 29.3301 15.7474C28.7531 15.1703 27.9705 14.8461 27.1544 14.8461C26.3384 14.8461 25.5557 15.1703 24.9787 15.7474C24.4017 16.3244 24.0775 17.107 24.0775 17.9231C24.0775 18.7391 24.4017 19.5217 24.9787 20.0988C25.5557 20.6758 26.3384 21 27.1544 21Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeMiterlimit="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.9231 17.9231H22.5385V1.92309C22.5385 1.67827 22.4412 1.44348 22.2681 1.27037C22.095 1.09726 21.8602 1.00001 21.6154 1.00001H1M8.15385 17.9231H5C4.87878 17.9231 4.75875 17.8992 4.64675 17.8528C4.53476 17.8064 4.433 17.7384 4.34729 17.6527C4.26157 17.567 4.19358 17.4653 4.14719 17.3533C4.1008 17.2413 4.07692 17.1212 4.07692 17V9.46155"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2.53809 5.61549H8.69193"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22.5381 5.61549H31.1689C31.3473 5.61553 31.5219 5.66729 31.6715 5.76449C31.8211 5.86169 31.9394 6.00018 32.0119 6.16318L34.7658 12.3601C34.8182 12.4778 34.8455 12.6051 34.8458 12.734V17.0001C34.8458 17.1213 34.8219 17.2414 34.7755 17.3534C34.7291 17.4653 34.6611 17.5671 34.5754 17.6528C34.4897 17.7385 34.3879 17.8065 34.2759 17.8529C34.164 17.8993 34.0439 17.9232 33.9227 17.9232H30.9996M22.5381 17.9232H24.0765"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span className="text-sm font-medium">
                    Swift Delivery Care
                  </span>
                </span>

                {/* Divider */}
                <span className="h-6 border-l border-white"></span>

                {/* 24/7 Customer Care */}
                <span className="flex items-center space-x-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="20"
                    viewBox="0 0 17 20"
                    fill="none"
                  >
                    <path
                      d="M6.70281 13.1165L6.69424 13.0965C6.5655 13.0613 6.43785 13.0222 6.31145 12.9793L6.30193 12.9755C4.98651 12.5255 3.84474 11.6754 3.03644 10.5442C2.22814 9.41303 1.79379 8.05742 1.79417 6.66714C1.79374 4.96088 2.44767 3.31943 3.62126 2.08088C4.79485 0.842326 6.39872 0.100996 8.10253 0.00958099C9.80634 -0.0818339 11.4803 0.483628 12.7797 1.5895C14.0791 2.69537 14.9049 4.25743 15.087 5.95394C15.1289 6.34625 14.8052 6.66714 14.411 6.66714C14.0167 6.66714 13.7016 6.34529 13.6492 5.95489C13.5225 5.0334 13.1528 4.16226 12.578 3.431C12.0031 2.69974 11.244 2.13473 10.3785 1.79404C9.51295 1.45335 8.57233 1.34927 7.65328 1.4925C6.73423 1.63572 5.86989 2.02109 5.14909 2.609C4.4283 3.1969 3.87705 3.96613 3.55201 4.83763C3.22696 5.70914 3.13984 6.65147 3.29959 7.5678C3.45935 8.48412 3.86022 9.34138 4.46101 10.0515C5.0618 10.7616 5.84083 11.2989 6.71805 11.6082C6.89476 11.2087 7.2034 10.8822 7.59224 10.6833C7.98107 10.4843 8.42647 10.4251 8.85379 10.5155C9.2811 10.6059 9.66436 10.8404 9.93932 11.1798C10.2143 11.5191 10.3642 11.9427 10.3641 12.3795C10.3641 12.9489 10.1146 13.4593 9.71942 13.8078C9.37163 14.115 8.92366 14.2846 8.45964 14.2848C8.08397 14.2862 7.71639 14.1758 7.40358 13.9678C7.09077 13.7597 6.84685 13.4634 6.70281 13.1165ZM4.64794 13.8087C3.94613 13.4337 3.30346 12.9572 2.74066 12.3947C2.21899 12.4554 1.73777 12.7056 1.38844 13.0977C1.0391 13.4899 0.845981 13.9967 0.845764 14.5219V15.0723C0.845764 15.9217 1.14857 16.7444 1.70085 17.3909C3.19201 19.1373 5.46399 20 8.45964 20C11.4553 20 13.7282 19.1373 15.2222 17.3909C15.7758 16.7441 16.0801 15.9208 16.0802 15.0694V14.5219C16.0802 13.954 15.8547 13.4094 15.4533 13.0076C15.052 12.6059 14.5075 12.38 13.9396 12.3795H11.7924C11.7924 12.8917 11.6781 13.3755 11.4715 13.8078H13.9396C14.1287 13.8083 14.3099 13.8837 14.4434 14.0176C14.5769 14.1515 14.6519 14.3329 14.6519 14.5219V15.0694C14.652 15.5803 14.4697 16.0743 14.1377 16.4625C12.9407 17.8604 11.0677 18.5707 8.45964 18.5707C5.85154 18.5707 3.98044 17.8604 2.78732 16.4635C2.45555 16.0755 2.2732 15.5818 2.27313 15.0714V14.5219C2.27313 14.3325 2.34837 14.1509 2.4823 14.0169C2.61623 13.883 2.79788 13.8078 2.98729 13.8078L4.64794 13.8087ZM4.6508 6.66714C4.65097 6.01016 4.82108 5.3644 5.14459 4.7926C5.4681 4.22079 5.93401 3.74239 6.49706 3.40387C7.06011 3.06534 7.70114 2.87822 8.35789 2.86067C9.01463 2.84311 9.66475 2.99573 10.2451 3.3037C10.8254 3.61166 11.3162 4.0645 11.6698 4.61821C12.0234 5.17192 12.2277 5.80767 12.263 6.4637C12.2983 7.11973 12.1632 7.77373 11.871 8.36215C11.5788 8.95058 11.1394 9.45341 10.5955 9.82182C9.99615 9.32159 9.24027 9.04762 8.45964 9.04767C9.091 9.04767 9.69649 8.79686 10.1429 8.35043C10.5894 7.90399 10.8402 7.2985 10.8402 6.66714C10.8402 6.03579 10.5894 5.43029 10.1429 4.98385C9.69649 4.53742 9.091 4.28661 8.45964 4.28661C7.82829 4.28661 7.22279 4.53742 6.77636 4.98385C6.32992 5.43029 6.07911 6.03579 6.07911 6.66714C6.07911 7.2985 6.32992 7.90399 6.77636 8.35043C7.22279 8.79686 7.82829 9.04767 8.45964 9.04767C7.64645 9.04767 6.90183 9.33904 6.32479 9.82182C5.80858 9.47345 5.38593 9.00353 5.09402 8.45343C4.80212 7.90332 4.64991 7.2899 4.6508 6.66714Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    24/7 Customer Care
                  </span>
                </span>

                {/* Divider */}
                <span className="h-6 border-l border-white"></span>

                {/* Get the Kudu App */}
                <Link
                  to="/download-app"
                  className="bg-white text-primary px-3 py-2 rounded-lg flex items-center space-x-4 hover:opacity-80 transition-opacity duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="22"
                    viewBox="0 0 15 22"
                    fill="none"
                  >
                    <path
                      d="M12.0813 1H3.03479C1.95588 1 1.0802 1.90054 1.0802 3.01081V18.9892C1.0802 20.0995 1.95588 21 3.03479 21H12.0813C13.1602 21 14.0359 20.0995 14.0359 18.9892V3.01081C14.0359 1.90054 13.1602 1 12.0813 1Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.39929 3.72646H9.71713M7.55821 18.3221C7.63482 18.3269 7.7116 18.3159 7.7838 18.2899C7.85601 18.2638 7.92211 18.2233 7.97805 18.1707C8.03398 18.1181 8.07856 18.0547 8.10903 17.9842C8.1395 17.9138 8.15522 17.8378 8.15522 17.7611C8.15522 17.6843 8.1395 17.6083 8.10903 17.5379C8.07856 17.4674 8.03398 17.404 7.97805 17.3514C7.92211 17.2988 7.85601 17.2583 7.7838 17.2322C7.7116 17.2062 7.63482 17.1952 7.55821 17.2C7.41542 17.2088 7.28139 17.2718 7.18341 17.3761C7.08544 17.4803 7.0309 17.618 7.0309 17.7611C7.0309 17.9041 7.08544 18.0418 7.18341 18.146C7.28139 18.2503 7.41542 18.3133 7.55821 18.3221Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium text-kudu-orange">
                    Get the Kudu App
                  </span>
                </Link>
              </div>
            </div>

            {/* Main Header */}
            <div className="w-full flex items-center justify-between gap-5 py-4 xl:px-40 md:px-20">
              <div className="flex">
                <Link to="/">
                  <img
                    className="xl:w-[130px] md:w-[100px] sm:w-[100px]"
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737497178/kuduMart/kudum_2_c8qm7a.png"
                    alt="Kudu Logo"
                    draggable="false"
                  />
                </Link>
              </div>
              {/* Search Bar */}

              <SearchBar />

              {/* Right Buttons */}
              <div className="flex items-center space-x-7">
                {user &&
                  navOptions.map((options, index) => (
                    <>
                      <Link
                        to={`/${options.slug}`}
                        className="flex items-center relative text-black gap-1"
                        key={index}
                      >
                        {options.svg}
                        {options.info > 0 && (
                          <div
                            data-theme="kudu"
                            className=" w-4 h-4 rounded-full absolute -top-2 left-4 flex justify-center items-center bg-primary text-white"
                          >
                            <p className="text-[9px]">{options.info}</p>
                          </div>
                        )}
                      </Link>
                    </>
                  ))}
                <CountrySelect />

                {!user && (
                  <div className="flex items-center gap-1">
                    <Menu>
                      <MenuHandler>
                        <span className="flex items-center cursor-pointer gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5 4C5 2.93913 5.42143 1.92172 6.17157 1.17157C6.92172 0.421427 7.93913 0 9 0C10.0609 0 11.0783 0.421427 11.8284 1.17157C12.5786 1.92172 13 2.93913 13 4C13 5.06087 12.5786 6.07828 11.8284 6.82843C11.0783 7.57857 10.0609 8 9 8C7.93913 8 6.92172 7.57857 6.17157 6.82843C5.42143 6.07828 5 5.06087 5 4ZM5 10C3.67392 10 2.40215 10.5268 1.46447 11.4645C0.526784 12.4021 0 13.6739 0 15C0 15.7956 0.316071 16.5587 0.87868 17.1213C1.44129 17.6839 2.20435 18 3 18H15C15.7956 18 16.5587 17.6839 17.1213 17.1213C17.6839 16.5587 18 15.7956 18 15C18 13.6739 17.4732 12.4021 16.5355 11.4645C15.5979 10.5268 14.3261 10 13 10H5Z"
                              fill="black"
                            />
                          </svg>
                          {/* <CountrySelect />*/}

                          <span className="mr-1 text-[15px] font-medium mt-[4px]">
                            {" "}
                            Register / Login
                          </span>
                        </span>
                      </MenuHandler>
                      <MenuList>
                        {authOptions.map((options, index) => (
                          <Link
                            to={`/${options.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                            key={index}
                          >
                            {options.value}
                          </Link>
                        ))}
                      </MenuList>
                    </Menu>
                  </div>
                )}

                {user && (
                  <div className="text-kudu-orange flex items-center gap-1">
                    <Menu>
                      <MenuHandler>
                        <div className="flex items-center relative">
                          <span className="flex items-center cursor-pointer gap-1">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M21.6488 19.875C20.2209 17.4066 18.0206 15.6366 15.4528 14.7975C16.723 14.0414 17.7098 12.8892 18.2618 11.5179C18.8137 10.1467 18.9003 8.63213 18.5082 7.2069C18.1161 5.78167 17.267 4.52456 16.0912 3.62862C14.9155 2.73268 13.4782 2.24745 12 2.24745C10.5218 2.24745 9.08451 2.73268 7.90878 3.62862C6.73306 4.52456 5.88394 5.78167 5.49183 7.2069C5.09971 8.63213 5.18629 10.1467 5.73825 11.5179C6.29021 12.8892 7.27704 14.0414 8.5472 14.7975C5.97938 15.6356 3.77907 17.4056 2.35126 19.875C2.2989 19.9604 2.26417 20.0554 2.24912 20.1544C2.23407 20.2534 2.239 20.3544 2.26363 20.4515C2.28825 20.5486 2.33207 20.6398 2.3925 20.7196C2.45293 20.7995 2.52874 20.8665 2.61547 20.9165C2.7022 20.9666 2.79808 20.9989 2.89745 21.0113C2.99683 21.0237 3.0977 21.0161 3.19409 20.989C3.29049 20.9618 3.38047 20.9156 3.45872 20.8531C3.53697 20.7906 3.6019 20.713 3.6497 20.625C5.41595 17.5725 8.53782 15.75 12 15.75C15.4622 15.75 18.5841 17.5725 20.3503 20.625C20.3981 20.713 20.4631 20.7906 20.5413 20.8531C20.6196 20.9156 20.7095 20.9618 20.8059 20.989C20.9023 21.0161 21.0032 21.0237 21.1026 21.0113C21.2019 20.9989 21.2978 20.9666 21.3845 20.9165C21.4713 20.8665 21.5471 20.7995 21.6075 20.7196C21.6679 20.6398 21.7118 20.5486 21.7364 20.4515C21.761 20.3544 21.766 20.2534 21.7509 20.1544C21.7358 20.0554 21.7011 19.9604 21.6488 19.875ZM6.75001 9C6.75001 7.96165 7.05792 6.94662 7.63479 6.08326C8.21167 5.2199 9.03161 4.54699 9.99092 4.14963C10.9502 3.75227 12.0058 3.64831 13.0242 3.85088C14.0426 4.05345 14.9781 4.55347 15.7123 5.28769C16.4465 6.02192 16.9466 6.95738 17.1491 7.97578C17.3517 8.99418 17.2477 10.0498 16.8504 11.0091C16.453 11.9684 15.7801 12.7883 14.9168 13.3652C14.0534 13.9421 13.0384 14.25 12 14.25C10.6081 14.2485 9.27359 13.6949 8.28934 12.7107C7.3051 11.7264 6.7515 10.3919 6.75001 9Z"
                                fill="rgba(255, 111, 34, 1)"
                              />
                            </svg>
                            <span className="mr-1 text-[15px] font-medium mt-[4px]">
                              {" "}
                              {user.firstName}{" "}
                            </span>
                          </span>
                        </div>
                      </MenuHandler>
                      <MenuList>
                        {arrOptions.map((options, index) =>
                          options.modal ? (
                            <span
                              className="block px-4 py-2 text-sm text-gray-700 hover:outline-hidden cursor-pointer"
                              key={index}
                              onClick={() => handleLogOutModal()}
                            >
                              {options.value}
                            </span>
                          ) : (
                            <Link
                              to={`/${options.slug}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 cursor-pointer "
                              key={index}
                            >
                              {options.value}
                            </Link>
                          ),
                        )}
                      </MenuList>
                    </Menu>
                  </div>
                )}

                <Link
                  to={"/auction"}
                  className="bg-kudu-dark-grey text-white py-2 px-4 rounded-md"
                >
                  <span className="mr-1 text-sm font-medium">Auction</span>
                </Link>

                {user && (
                  <span
                    className="bg-kudu-orange text-white py-2 px-4 cursor-pointer rounded-lg"
                    onClick={() => handleVendorModal()}
                  >
                    <span className="mr-1 text-sm font-medium">Sell</span>
                  </span>
                )}
                {/* New Menu Button */}
                <FlyoutMenu />
              </div>
            </div>
          </header>
        </div>
      </div>
    </>
  );
}

Header;
