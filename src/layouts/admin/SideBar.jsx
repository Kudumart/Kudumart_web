import { useState } from "react";
import Imgix from "react-imgix";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useModal } from "../../hooks/modal";
import LogOutModal from "../../components/LogOut";
import { FaLaptop } from "react-icons/fa";
import { IoCashOutline } from "react-icons/io5";
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  ShoppingBag,
  DollarSign,
  FileText,
  Search,
  ChevronDown,
  Bell, // Added Bell icon for notifications
} from "lucide-react";

const Sidebar = ({ onMobile = false, onSelected = () => {} }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [dropdownStates, setDropdownStates] = useState({
    stores: false,
    orders: false,
    users: false,
    products: false,
    services: false, // Added for services dropdown
    pages: false,
    jobs: false,
    notifications: false, // Added for notifications dropdown
    // aliexpress: false, // Removed for AliExpress dropdown
  });
  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleChildren = (type) => {
    setDropdownStates((prevState) => ({
      stores: type === "stores" ? !prevState.stores : false,
      orders: type === "orders" ? !prevState.orders : false,
      users: type === "users" ? !prevState.users : false,
      products: type === "products" ? !prevState.products : false,
      services: type === "services" ? !prevState.services : false, // Handler for services dropdown
      pages: type === "pages" ? !prevState.pages : false,
      jobs: type === "jobs" ? !prevState.jobs : false,
      notifications:
        type === "notifications" ? !prevState.notifications : false, // Handler for notifications dropdown
      // aliexpress: type === "aliexpress" ? !prevState.aliexpress : false, // Handler for AliExpress dropdown
    }));
  };

  const handleMenuClick = (callback) => {
    if (callback) callback();
    if (onMobile) {
      onSelected();
    }
  };

  const logOutRedirect = () => {
    navigate("/auth/admin/login");
  };

  const handleLogOutModal = () => {
    openModal({
      size: "sm",
      content: <LogOutModal redirect={logOutRedirect} mode="admin" />,
    });
  };

  return (
    <>
      <div
        className={`bg-kudu-made h-full px-6 pt-6 rounded-md flex-col w-full md:w-[20%] relative md:fixed flex ${onMobile ? "overflow-y-auto" : "overflow-hidden"}  transition-all mb-10`}
      >
        <div
          className={`h-full bg-white pb-20 rounded-md flex-col w-full md:w-[21%] relative md:fixed flex ${onMobile ? "overflow-y-auto" : "overflow-hidden"} bg-mobiDarkCloud transition-all mb-10`}
        >
          {/* Logo */}
          <div className="px-4 flex flex-col gap-2">
            <Link to={"/auth/admin/login"} onClick={() => handleMenuClick()}>
              <Imgix
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737211689/kuduMart/kudum_1_urk9wm.png"
                alt="Kudu Mart Logo"
                className="object-cover"
                style={{ width: "80px", height: "80px" }}
              />
            </Link>
            <div className="w-full h-px mb-4 border-mobiSilverDivider border-bottom border"></div>
          </div>

          {/* Navigation Items */}
          <nav className="px-5 space-y-5 flex-1 overflow-y-auto">
            <Link
              to={"/admin/dashboard"}
              onClick={() => handleMenuClick()}
              className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                isActive("/admin/dashboard")
                  ? "bg-[#FFF1E9] text-black"
                  : "text-[#7F7F7F] hover:bg-[#FFF1E9]"
              }`}
            >
              <i className="mr-5">
                <LayoutDashboard size={20} />
              </i>
              <span className="text-md font-semibold">Dashboard</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => handleChildren("users")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-[#FFF1E9] w-full"
              >
                <i className="mr-5">
                  <Users size={20} />
                </i>
                <span className="text-md font-semibold">Users</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.users && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-50 border border-gray-200">
                  <Link
                    to={"/admin/all-customers"}
                    onClick={() => handleMenuClick(() => handleChildren(""))}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Customers
                  </Link>
                  <Link
                    to={"/admin/all-vendors"}
                    onClick={() => handleMenuClick(() => handleChildren(""))}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Vendors
                  </Link>
                  <Link
                    to={"/admin/sub-admins"}
                    onClick={() => handleMenuClick(() => handleChildren(""))}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sub Admins
                  </Link>
                  <Link
                    to={"/admin/permissions"}
                    onClick={() => handleMenuClick(() => handleChildren(""))}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Permissions
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => handleChildren("products")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <Package size={20} />
                </i>
                <span className="text-md font-semibold">Products</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.products && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"products-sell"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Products
                  </Link>
                  <Link
                    to={"my-products"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Products
                  </Link>
                  <Link
                    to={"auction-products"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Auction Products
                  </Link>
                  <Link
                    to={"products-categories"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Categories
                  </Link>
                  <Link
                    to={"products-categories/sub-category"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Product SubCategories
                  </Link>
                </div>
              )}
            </div>

            {/* New Services Section */}
            <div className="relative">
              <button
                onClick={() => handleChildren("services")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  {/* Replace with a relevant icon for services if available, e.g., a wrench or gears */}
                  <Package size={20} />
                </i>
                <span className="text-md font-semibold">Services</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.services && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"services"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Services
                  </Link>
                  <Link
                    to={"services/categories"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Service Categories
                  </Link>
                  {/* <Link
                    to={"services/sub-categories"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Service Sub-Categories
                  </Link>*/}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleChildren("stores")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <Store size={20} />
                </i>
                <span className="text-md font-semibold">Stores</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.stores && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"/admin/all-stores"}
                    className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                      isActive("/admin/all-stores")
                        ? "bg-[#FFF1E9] text-black"
                        : "text-[#7F7F7F] hover:bg-gray-100"
                    }`}
                  >
                    All Stores
                  </Link>
                  <Link
                    to={"/admin/my-stores"}
                    className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                      isActive("/admin/my-stores")
                        ? "bg-[#FFF1E9] text-black"
                        : "text-[#7F7F7F] hover:bg-gray-100"
                    }`}
                  >
                    My Stores
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleChildren("orders")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <ShoppingBag size={20} />
                </i>
                <span className="text-md font-semibold">Orders</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.orders && (
                <div className="absolute left-0 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"/admin/orders"}
                    className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                      isActive("/admin/orders")
                        ? "bg-[#FFF1E9] text-black"
                        : "text-[#7F7F7F] hover:bg-gray-100"
                    }`}
                  >
                    All Orders
                  </Link>
                  <Link
                    to={"/admin/customer-orders"}
                    className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                      isActive("/admin/customer-orders")
                        ? "bg-[#FFF1E9] text-black"
                        : "text-[#7F7F7F] hover:bg-gray-100"
                    }`}
                  >
                    Customer's Orders
                  </Link>
                </div>
              )}
            </div>
            <Link
              to={"/admin/transactions"}
              className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                isActive("/admin/transactions")
                  ? "bg-[#FFF1E9] text-black"
                  : "text-[#7F7F7F] hover:bg-gray-100"
              }`}
            >
              <i className="mr-5">
                <DollarSign size={20} />
              </i>
              <span className={`text-md font-semibold`}>Transactions</span>
            </Link>

            <Link
              to={"/admin/withdrawal-request"}
              className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                isActive("/admin/withdrawal-request")
                  ? "bg-[#FFF1E9] text-black"
                  : "text-[#7F7F7F] hover:bg-gray-100"
              }`}
            >
              <i className="mr-5">
                <IoCashOutline size={20} />
              </i>
              <span className={`text-md font-semibold`}>
                Withdrawal Request
              </span>
            </Link>

            <div className="relative">
              <button
                onClick={() => handleChildren("pages")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <FileText size={20} />
                </i>
                <span className="text-md font-semibold">Pages</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.pages && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"pages/faq-category"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Faq category
                  </Link>
                  <Link
                    to={"pages/faqs"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Faqs
                  </Link>
                  <Link
                    to={"pages/testimonials"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Testimonial
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => handleChildren("jobs")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <FaLaptop className="mr-5" size={20} />
                <span className="text-md font-semibold">Jobs</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.jobs && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"jobs"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Jobs
                  </Link>
                </div>
              )}
            </div>

            <Link
              to={"/admin/adverts"}
              className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                isActive("/admin/adverts")
                  ? "bg-[#FFF1E9] text-black"
                  : "text-[#7F7F7F] hover:bg-gray-100"
              }`}
            >
              <i className="mr-5">
                <Search size={20} />
              </i>
              <span className={`text-md font-semibold`}>Adverts</span>
            </Link>

            {/* AliExpress Section - Disabled/Hidden */}
            {/*
            <div className="relative">
              <button
                onClick={() => handleChildren("aliexpress")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <Package size={20} />
                </i>
                <span className="text-md font-semibold">AliExpress</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.aliexpress && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"/admin/aliexpress"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    AliExpress Account
                  </Link>
                  <Link
                    to={"/dropshipping/products"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    AliExpress Products
                  </Link>
                </div>
              )}
            </div>
            */}

            <Link
              to={"subscriptions"}
              className={`flex items-center px-4 h-[57px] rounded-lg text-[#7F7F7F] hover:bg-gray-100 transition`}
            >
              <i className="mr-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="24"
                  viewBox="0 0 27 24"
                  fill="none"
                >
                  <path
                    d="M11.3555 17.8879L17.0313 12.2121L18.3464 13.5273L11.2495 20.6242L7.86159 17.2364L9.17673 15.9212L11.1434 17.8879L11.2495 17.9939L11.3555 17.8879ZM21.6682 6.39545H4.51364V4.51364H21.6682V6.39545ZM6.69546 0.15H19.4864V2.03182H6.69546V0.15Z"
                    fill="#7F7F7F"
                    stroke="white"
                    strokeWidth="0.3"
                  />
                  <path
                    d="M24 21.9684H24.15V21.8184V10.9094V10.7594H24H2.18182H2.03182V10.9094V21.8184V21.9684H2.18182H24ZM2.18182 8.87754H24C24.5389 8.87754 25.0557 9.09161 25.4367 9.47265C25.8178 9.85369 26.0318 10.3705 26.0318 10.9094V21.8184C26.0318 22.3573 25.8178 22.8741 25.4367 23.2552C25.0557 23.6362 24.5389 23.8503 24 23.8503H2.18182C1.64295 23.8503 1.12615 23.6362 0.745106 23.2552C0.364066 22.8741 0.15 22.3573 0.15 21.8184V10.9094C0.15 10.3705 0.364066 9.85369 0.745106 9.47265C1.12615 9.09161 1.64295 8.87754 2.18182 8.87754Z"
                    fill="#7F7F7F"
                    stroke="white"
                    strokeWidth="0.3"
                  />
                </svg>
              </i>
              <span className={`text-md font-semibold`}>Subscription</span>
            </Link>

            <Link
              to={"user-inquiries"}
              className={`flex items-center px-4 h-[57px] rounded-lg text-[#7F7F7F] hover:bg-gray-100 transition`}
            >
              <i className="mr-5">
                <Users size={20} />
              </i>
              <span className={`text-md font-semibold`}>User Inquiries</span>
            </Link>

            {/* Notifications Link */}
            <div className="relative">
              <button
                onClick={() => handleChildren("notifications")}
                className="flex items-center px-4 h-[57px] rounded-lg transition text-[#7F7F7F] hover:bg-gray-100 w-full"
              >
                <i className="mr-5">
                  <Bell size={20} />
                </i>
                <span className="text-md font-semibold">Notifications</span>
                <i className="ml-5 right-0">
                  <ChevronDown size={20} />
                </i>
              </button>
              {dropdownStates.notifications && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg py-3 z-10">
                  <Link
                    to={"/admin/notifications"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Notifications
                  </Link>
                  <Link
                    to={"/admin/notification-settings"}
                    onClick={() => handleChildren("")}
                    className="block px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Notification Settings
                  </Link>
                </div>
              )}
            </div>

            <div className="w-full h-px px-4 border-mobiSilverDivider border-bottom border"></div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-6">
            <Link
              to={"/admin/settings"}
              onClick={() => handleMenuClick()}
              className={`flex items-center px-4 h-[57px] rounded-lg transition ${
                isActive("/admin/settings")
                  ? "bg-[#FFF1E9] text-black"
                  : "text-[#7F7F7F] hover:bg-gray-100"
              }`}
            >
              <i className={`fas fa-cog mr-5`}></i>
              <span className="text-md font-semibold">Settings</span>
            </Link>
            <span
              onClick={() => handleMenuClick(handleLogOutModal)}
              className={`flex cursor-pointer items-center py-2 px-4 h-[57px] rounded-lg text-red-500 hover:bg-kudu-light-gray  transition`}
            >
              <i className="fas fa-sign-out-alt mr-5"></i>
              <span className="text-md font-semibold">Logout</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
