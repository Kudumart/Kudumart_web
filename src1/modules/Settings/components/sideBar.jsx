import Imgix from "react-imgix";
import { Link } from "react-router-dom";
import useAppState from "../../../hooks/appState";
import { useModal } from "../../../hooks/modal";
import { Delete, User, UserCog } from "lucide-react";

const SettingsSideBar = ({ close }) => {
  const { user } = useAppState();
  const { openModal, closeModal } = useModal();

  const isVendor = user.accountType !== "Customer";

  const navItems = [
    {
      label: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#FF6F22"
          width="23"
          height="23"
        >
          <path
            fillRule="evenodd"
            d="M12 2a5 5 0 0 1 5 5v2a5 5 0 1 1-10 0V7a5 5 0 0 1 5-5zm0 20c-4.418 0-8-1.79-8-4v-2a8 8 0 0 1 16 0v2c0 2.21-3.582 4-8 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      route: "profile",
      vendor: null,
    },
    {
      label: "Security",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#FF6F22"
          width="23"
          height="23"
        >
          <path
            fillRule="evenodd"
            d="M12 2C7.58 2 4 4 4 4v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V4s-3.58-2-8-2zm0 18c-3.34-1.09-6-5.1-6-9V5.54a12.32 12.32 0 0 1 6-1.54c2.12 0 4.15.41 6 1.54V11c0 3.9-2.66 7.91-6 9zm-1-9h2v4h-2v-4zm0-4h2v2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      route: "security",
      vendor: null,
    },
    {
      label: "Delete Acount",
      icon: <UserCog className="text-kudu-orange" />,
      route: "delete-account",
      vendor: null,
    },
    /* {
             label: "Bank", icon: <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M23.1853 7.69637C23.1525 7.62231 22.3584 5.86075 20.5931 4.09543C18.2409 1.74325 15.27 0.500122 12 0.500122C8.72999 0.500122 5.75905 1.74325 3.40687 4.09543C1.64155 5.86075 0.843741 7.62512 0.814679 7.69637C0.772035 7.79229 0.75 7.89609 0.75 8.00106C0.75 8.10603 0.772035 8.20983 0.814679 8.30575C0.847491 8.37981 1.64155 10.1404 3.40687 11.9057C5.75905 14.257 8.72999 15.5001 12 15.5001C15.27 15.5001 18.2409 14.257 20.5931 11.9057C22.3584 10.1404 23.1525 8.37981 23.1853 8.30575C23.2279 8.20983 23.25 8.10603 23.25 8.00106C23.25 7.89609 23.2279 7.79229 23.1853 7.69637ZM12 14.0001C9.11437 14.0001 6.59343 12.9511 4.50655 10.8829C3.65028 10.0314 2.92179 9.06039 2.34374 8.00012C2.92164 6.93975 3.65014 5.96873 4.50655 5.11731C6.59343 3.04918 9.11437 2.00012 12 2.00012C14.8856 2.00012 17.4066 3.04918 19.4934 5.11731C20.3514 5.96852 21.0815 6.93955 21.6609 8.00012C20.985 9.262 18.0403 14.0001 12 14.0001ZM12 3.50012C11.11 3.50012 10.2399 3.76404 9.49993 4.25851C8.7599 4.75298 8.18313 5.45578 7.84253 6.27805C7.50194 7.10031 7.41282 8.00511 7.58646 8.87803C7.76009 9.75094 8.18867 10.5528 8.81801 11.1821C9.44735 11.8114 10.2492 12.24 11.1221 12.4137C11.995 12.5873 12.8998 12.4982 13.7221 12.1576C14.5443 11.817 15.2471 11.2402 15.7416 10.5002C16.2361 9.76017 16.5 8.89014 16.5 8.00012C16.4988 6.80703 16.0242 5.66316 15.1806 4.81951C14.337 3.97587 13.1931 3.50136 12 3.50012ZM12 11.0001C11.4066 11.0001 10.8266 10.8242 10.3333 10.4945C9.83993 10.1649 9.45542 9.69635 9.22835 9.14817C9.00129 8.59999 8.94188 7.99679 9.05764 7.41485C9.17339 6.83291 9.45911 6.29836 9.87867 5.8788C10.2982 5.45924 10.8328 5.17352 11.4147 5.05777C11.9967 4.94201 12.5999 5.00142 13.148 5.22848C13.6962 5.45555 14.1648 5.84006 14.4944 6.33341C14.824 6.82676 15 7.40678 15 8.00012C15 8.79577 14.6839 9.55883 14.1213 10.1214C13.5587 10.6841 12.7956 11.0001 12 11.0001Z" fill="#FF6F22" />
             </svg>,
             route: 'bank-account',
             vendor: true
         }, */
  ];

  const filteredItems = navItems.filter(
    (item) =>
      (isVendor && item.vendor) ||
      (!isVendor && item.vendor === false) ||
      item.vendor === null,
  );

  return (
    <div className="w-full bg-white rounded-lg z-[-1] All p-4">
      {/* Profile Section */}
      <div className="flex flex-col gap-3 items-center">
        <Imgix
          src={
            user.photo ||
            `https://res.cloudinary.com/do2kojulq/image/upload/v1735426614/kudu_mart/victor-diallo_p03kd2.png`
          }
          alt="Profile"
          width={80}
          height={80}
          sizes="100vw"
          className="rounded-full w-20 h-20 object-cover border-4 border-white shadow-md"
        />
        <h2 className="mt-2 text-lg font-semibold">
          {user.firstName} {user.lastName}
        </h2>
        <Link to={"/profile"}>
          <p className="text-sm">See Profile</p>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="mt-6 flex flex-col gap-6">
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
            <></>
          ),
        )}
      </div>
    </div>
  );
};

export default SettingsSideBar;
