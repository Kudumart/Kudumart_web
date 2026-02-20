import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import NotificationList from "./components/NotificationList";
import NotificationItem from "./components/NotificationItem";
import { useNotification } from "../../api/notification";
import Loader from "../../components/Loader";

const Notification = () => {
  const { data, isLoading, error } = useNotification();

  if (isLoading)
    return (
      <div className="py-40">
        <Loader />
      </div>
    );

  const unreadNotification = data?.filter((item) => item.isRead === false);
  const readNotification = data?.filter((item) => item.isRead === true);
  return (
    <section className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white pt-10">
      {/* <div className="flex gap-5 border-b border-black overflow-hidden">
        <div className="border px-4 rounded-md py-3 border-black border-b-white border-b rounded-br-none rounded-bl-none">
          <p>All Notifications</p>
        </div>
        <div className="">
          <p>Unread</p>
        </div>
      </div> */}
      <Tabs>
        <TabList>
          <Tab>All Notifications</Tab>
          <Tab>Unread</Tab>
          <Tab>Read</Tab>
        </TabList>

        <TabPanel>
          <NotificationList data={data} />
        </TabPanel>
        <TabPanel>
          <NotificationList data={unreadNotification} />
        </TabPanel>
        <TabPanel>
          <NotificationList data={readNotification} />
        </TabPanel>
      </Tabs>
    </section>
  );
};

export default Notification;
