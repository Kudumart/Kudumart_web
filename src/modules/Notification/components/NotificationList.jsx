import React from "react";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ data }) => {
  return (
    <div className="gap-4 flex flex-col mt-5">
      {data.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationList;
