import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useMarkNotificationAsRead } from "../../../api/notification";
import Loader from "../../../components/Loader";

const NotificationItem = ({ notification }) => {
  const { mutate: markAsRead, isLoading } = useMarkNotificationAsRead();

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };
  return (
    <div
      onClick={() => handleMarkAsRead(notification?.id)}
      className={`flex items-start p-4 cursor-pointer rounded-lg shadow-md ${
        notification?.isRead ? "bg-white" : "bg-[#cf5a1c4d]"
      }`}
    >
      <div>
        <img
          src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737497178/kuduMart/kudum_2_c8qm7a.png"
          alt="logo"
          className="w-16"
        />
      </div>
      <div className="flex-1 ml-4">
        <div>
          <p className="font-medium">{notification?.title}</p>
          <p className="text-gray-600">{notification?.message}</p>
        </div>
      </div>
      <div className="w-fit">
        <div className=" ">
          {/* <RiDeleteBin5Line /> */}

          {isLoading && <Loader size={10} />}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
