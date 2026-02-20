import Imgix from "react-imgix";
import { Link } from "react-router-dom";
import useAppState from "../../../hooks/appState";
import { useModal } from "../../../hooks/modal";
import SwitchVendorModal from "./switchVendor";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../../../reducers/userSlice";
import { VscBell } from "react-icons/vsc";
import Badge from "../../../components/Badge";
import {
  Home,
  Box,
  UserCheck,
  Briefcase,
  ShoppingCart,
  Star,
  Newspaper,
  MessageSquare,
  Bookmark,
  Wallet2,
  Settings2,
  WorkflowIcon,
} from "lucide-react";

const ProfileSideBar = ({ close }) => {
  const { user } = useAppState();
  const { openModal } = useModal();

  const dispatch = useDispatch();

  const handleRedirect = () => {
    const updatedUser = { ...user, accountType: "Vendor" };
    dispatch(setKuduUser(updatedUser));
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const isVendor = user?.accountType !== "Customer";

  const navItems = [
    {
      label: "My Stores",
      icon: <Home size={23} color="#FF6F22" />,
      route: "stores",
      vendor: true,
    },
    {
      label: "My Products",
      icon: <Box size={23} color="#FF6F22" />,
      route: "products",
      vendor: true,
    },
    {
      label: `${!user?.isVerified ? "Complete KYC" : "View KYC"}`,
      icon: <UserCheck size={20} color="#FF6F22" />,
      route: "updated-kyc",
      vendor: true,
    },
    {
      label: "Become a Vendor",
      icon: (
        <Briefcase width={20} height={20} fill="currentColor" color="#FF6F22" />
      ),
      route: null,
      vendor: false,
    },
    {
      label: "Orders",
      icon: <ShoppingCart size={20} color="#FF6F22" />,
      route: "orders",
      vendor: null,
    },
    {
      label: "Services",
      icon: <WorkflowIcon size={20} color="#FF6F22" />,
      route: "services",
      vendor: true,
    },
    {
      label: "Interested Auctions",
      icon: <Star size={20} stroke="#FF6F22" />,
      route: "interestedAuctions",
      vendor: null,
    },
    {
      label: "Advert",
      icon: <Newspaper size={20} color="#FF6F22" />,
      route: "adverts",
      vendor: true,
    },
    {
      label: "Messages",
      icon: <MessageSquare size={20} color="#FF6F22" />,
      route: "/messages",
      vendor: null,
    },
    {
      label: "Notification",
      icon: <VscBell color="#FF6F22" size={23} />,
      route: "notification",
      vendor: null,
    },
    {
      label: "Bookmarked Items",
      icon: <Bookmark size={19} color="#FF6F22" />,
      route: "bookmark",
      vendor: null,
    },
    {
      label: "Wallet",
      icon: <Wallet2 size={19} strokeWidth={2} color="rgba(255, 111, 34, 1)" />,
      route: "wallet",
      vendor: true,
    },
    {
      label: "Subscription",
      icon: <UserCheck size={14} color="#FF6F22" />,
      route: "subscription",
      vendor: true,
    },
    {
      label: "Settings",
      icon: <Settings2 size={24} color="#FF6F22" />,
      route: "/settings/profile",
      vendor: null,
    },
  ];

  const filteredItems = navItems.filter(
    (item) =>
      (isVendor && item.vendor) ||
      (!isVendor && item.vendor === false) ||
      item.vendor === null,
  );

  const handleVendorModal = () => {
    openModal({
      size: "sm",
      content: (
        <SwitchVendorModal redirect={handleRedirect}>
          <div className="flex">
            <p className="text-sm gap-2 leading-[1.7rem]">
              Ready to grow your business? By switching to a vendor account,
              you'll unlock tools to showcase your products, manage sales, and
              connect with customers.
            </p>
          </div>
        </SwitchVendorModal>
      ),
    });
  };

  const closeModal = () => {
    close();
  };

  return (
    <div className="w-full bg-white rounded-lg z-[-1] All">
      {/* Profile Section */}
      <div className="flex flex-col gap-3 items-center p-4">
        <Imgix
          src={
            user?.photo ||
            `https://res.cloudinary.com/do2kojulq/image/upload/v1735426614/kudu_mart/victor-diallo_p03kd2.png`
          }
          alt="Profile"
          width={80}
          height={80}
          sizes="100vw"
          className="rounded-full w-20 h-20 object-cover border-4 border-white shadow-md"
        />
        <Link to={"/profile"}>
          <h2 className="mt-2 text-lg font-semibold">
            {user?.firstName} {user?.lastName}
          </h2>
        </Link>
        {user?.accountType !== "Customer" && (
          <p className="w-full justify-center flex items-center my-1">
            <Badge
              bgColor={user?.isVerified ? "bg-green-500" : "bg-red-500"}
              textColor={"text-white"}
              text={user?.isVerified ? "Verified" : "Unverified"}
            />
          </p>
        )}
        <Link to={"/profile"} className="mt-1">
          <p className="text-sm">See Profile</p>
        </Link>
      </div>

      {/* Alerts Section */}
      {user?.accountType !== "Customer" && !user?.isVerified ? (
        <div className="mt-1 mb-6 bg-kudu-orange px-1 py-1 w-full rounded-lg">
          <div className="flex items-center justify-between text-white px-3 py-2 rounded-md">
            <div className="flex items-center">
              <span className="text-sm font-semibold">
                Become verified by completing your KYC
              </span>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Navigation Section */}
      <div className="p-4 flex flex-col gap-6">
        {filteredItems.map((item, index) =>
          item.route ? (
            <Link
              key={index}
              to={`${item.route}`}
              onClick={() => closeModal()}
              className="flex items-center py-3 px-3 border-b border-gray-200 last:border-0 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ) : (
            <span
              onClick={() => handleVendorModal()}
              className="flex items-center py-3 px-3 border-b border-gray-200 last:border-0 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
};

export default ProfileSideBar;
