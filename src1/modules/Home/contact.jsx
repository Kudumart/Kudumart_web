import "../Home/components/style.css";
import ShoppingExperience from "./components/ShoppingExperience";
import GetApp from "./components/GetApp";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import useApiMutation from "../../api/hooks/useApiMutation";
import { useState } from "react";

export default function Contact() {
  const [disabled, setDisabled] = useState(false);

  const { register, handleSubmit, setValue, reset } = useForm();

  const { mutate } = useApiMutation();

  const sendMessage = (data) => {
    setDisabled(true);

    mutate({
      url: "/submit/contact/form",
      method: "POST",
      data: data,
      headers: true,
      onSuccess: (response) => {
        setDisabled(false);
        reset();
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  return (
    <>
      <div className="w-full flex flex-col">
        <section className="breadcrumb">
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Contact Us</h1>
            </div>
          </div>
        </section>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
          <div className="relative w-full overflow-hidden Ju">
            <div className="w-full flex flex-col gap-2 justify-center items-center mt-16">
              <div className="flex">
                <h1 className="text-3xl text-center font-bold md:text-2xl">
                  Hey there, how can we help ?
                </h1>
              </div>
            </div>

            {/* Card Section */}
            <div className="w-full flex md:flex-row flex-col">
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14"
                style={{ position: "relative" }}
              >
                {/* Auction Card */}
                <div className="h-full w-full rounded-lg p-8 flex flex-col items-center border">
                  <div className="w-[80px] h-[80px]">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738002863/kuduMart/u9auqtxfhknorhzzd04l.png"
                      alt="Auction Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    Do you have any question ?
                  </h3>
                  <p className="mt-2 text-md leading-loose text-center">
                    Visit our FAQ to see answers to our most asked questions
                  </p>
                  <Link
                    className="btn my-2  btn-block btn-primary"
                    data-theme="kudu"
                    to="/faqs"
                  >
                    {" "}
                    See FAQs
                  </Link>
                </div>

                {/* Sell Anything Card */}
                <div className="h-full w-full rounded-lg p-6 flex flex-col items-center border">
                  <div className="w-[80px] h-[80px]">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738002864/kuduMart/joreawbfjisqvuoomkva.png"
                      alt="Sell Anything Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">Email Support</h3>
                  <p className="mt-2 text-md leading-loose text-center">
                    support@kudumart.com <br></br>
                    info@kudumart.com
                  </p>
                  {/* <button className="mt-6 border text-black  py-3 px-24 rounded-lg hover:bg-orange-600 transition duration-300">
                    <Link to="/sign-up">Email Now</Link>
                  </button>*/}
                </div>

                {/* Bid Your Price Card */}
                <div className="h-full w-full rounded-lg p-6 flex flex-col items-center border">
                  <div className="w-[80px] h-[80px]">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1738002864/kuduMart/xhg42osawx2hb4lengd2.png"
                      alt="Bid Your Price Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">
                    Call & WhatsApp Line
                  </h3>
                  <p className="mt-2 text-md leading-loose text-center">
                    {/* 0923 4551 774*/}
                    08133059324
                  </p>
                  {/* <button className="mt-6 border text-black py-3 px-24 rounded-lg hover:bg-orange-600 transition duration-300">
                    <Link to="/sign-up">Call Now</Link>
                  </button>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white ">
          {/* Map and Contact Form */}
          <div className="grid md:grid-cols-2 gap-9">
            <div className="bg-white rounded-lg overflow-hidden">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126202.72931046391!2d3.2998591051244743!3d7.163197312558428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103aeb1e3d7cc6fd%3A0xa1360f091a02c5f9!2sAbeokuta!5e0!3m2!1sen!2sng!4v1614303830927!5m2!1sen!2sng"
                width="100%"
                height="780"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className="bg-white shadow rounded-lg p-8">
              <h3 className="text-lg font-bold text-black mb-4">
                Send Us A Message
              </h3>
              <form onSubmit={handleSubmit(sendMessage)}>
                <div className="mb-4">
                  <label
                    htmlFor="fullName"
                    className="block text-md font-medium text-black mb-4"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="border rounded-lg p-4 w-full bg-gray-50"
                    placeholder="Enter your full name"
                    style={{ outline: "none" }}
                    {...register("name", { required: "Full name is required" })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-md font-medium text-black mb-4"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="border rounded-lg p-4 w-full bg-gray-50"
                    placeholder="Enter your phone number"
                    style={{ outline: "none" }}
                    {...register("phoneNumber", {
                      required: "Phone Number is required",
                    })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-md font-medium text-black mb-4"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="border rounded-lg p-4 w-full bg-gray-50"
                    placeholder="Enter your email address"
                    style={{ outline: "none" }}
                    {...register("email", { required: "Email is required" })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-md font-medium text-black mb-4"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="border rounded-lg p-4 w-full bg-gray-50"
                    placeholder="Type your message"
                    style={{ outline: "none" }}
                    {...register("message", {
                      required: "Message is required",
                    })}
                    rows="6"
                    required
                  ></textarea>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="notRobot"
                    className="h-4 w-4 text-orange-500 border-gray-300 rounded-sm"
                  />
                  <label
                    htmlFor="notRobot"
                    className="ml-2 text-sm text-gray-700"
                  >
                    I'm not a robot
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={disabled}
                  className="w-full bg-[#FF6F22] text-white font-semibold py-4 mt-5 rounded-lg hover:bg-[#FF6F22]"
                >
                  Submit →
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          <div className="w-full flex mt-3 Justing">
            <ShoppingExperience />
          </div>
        </div>
        <div
          className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 Amenn"
          style={{
            backgroundImage: `
                    url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737405367/Frame_1618873123_fy7sgx.png)
                    `,
            backgroundBlendMode: "overlay",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
            className: "sm-[70vh]",
          }}
        >
          <div className="w-full flex flex-col gap-5 ">
            <GetApp />
          </div>
        </div>
      </div>
    </>
  );
}
