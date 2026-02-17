import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [keyword, setKeyword] = useState("");

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };

  return (
    <header className="flex items-center pt-5 justify-between Abinah All mt-5">
      {/* Search Bar Removed - Use table-level search instead */}
      <div className="flex-1"></div>

      {/* Action Icons */}
      <div className="flex items-center space-x-5 mx-8">
        <button className="bg-white rounded-lg p-4  hover:bg-gray-100">
          <i className="text-gray-500">
            {/* Settings Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12a7.5 7.5 0 01-15 0m15 0a7.5 7.5 0 00-15 0m15 0h3m-18 0H3"
              />
            </svg>
          </i>
        </button>
        <Link
          to="/admin/notifications"
          className="bg-white rounded-lg p-4 hover:bg-gray-100"
        >
          <i className="text-purple-500">
            {/* Notification Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11.5a6.5 6.5 0 00-5-6.32V4a2 2 0 10-4 0v1.18A6.5 6.5 0 004 11.5v2.658c0 .217-.07.428-.195.605L2.5 17h5m7 0a3 3 0 01-6 0m6 0H9"
              />
            </svg>
          </i>
        </Link>
      </div>

      {/* Profile Section */}
      <div className="flex items-center bg-white rounded-lg px-2 py-1 xl:space-x-52 md:space-x-48">
        <div className="flex items-center bg-[#FBEBE9] rounded-lg px-4 py-2 xl:space-x-48 md:space-x-44">
          <span className="text-sm text-black-700 font-medium">
            Super Admin
          </span>
          <div
            className="w-9 h-9 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/greenmouse-tech/image/upload/v1737214961/kuduMart/Group_1321314866_u2x7bj.png')",
            }}
          >
            {/* Replace with profile image */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
