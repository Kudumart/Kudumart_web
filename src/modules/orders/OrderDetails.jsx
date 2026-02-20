/* eslint-disable react-hooks/exhaustive-deps */
import { capitalize } from "lodash";
import {
  Avatar,
  Breadcrumbs,
  Button,
  Progress,
} from "@material-tailwind/react";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { Loader } from "../../../layouts/Spinner";
// import ItemList from "./Order/ItemList";
import { IoMdCheckmarkCircle } from "react-icons/io";
import ReactStars from "react-rating-stars-component";
// import toast from "react-hot-toast";
import Swal from "sweetalert2";
// import { PartnerPaymentModal } from "./Product/Modals/PartnerPaymentModal";
// import { getPercentage } from "../../../../services/helper";
import Loader from "../../components/Loader";
import OrderItemList from "./components/OrderItemList";
import { getPercentage } from "../../helpers/helperFactory";
import { toast } from "react-toastify";

const orderProgress = [
  {
    status: "pending",
    allowed: ["pending", "approved", "shipped", "completed"],
    percent: 0,
  },
  {
    status: "cancelled",
    allowed: ["cancelled"],
    percent: 0,
  },
  {
    status: "approved",
    allowed: ["approved", "shipped", "completed"],
    percent: 35,
  },
  { status: "shipped", allowed: ["shipped", "completed"], percent: 68 },
  { status: "completed", allowed: ["completed"], percent: 100 },
];

export default function OrderDetails() {
  const { search } = useLocation();
  const productId = new URLSearchParams(search).get("productId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progressVal, setProgressVal] = useState({});
  const [payout, setPayout] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [prodId, setProdId] = useState("");

  // const getOrderDetail = async () => {
  //   try {
  //     const config = {
  //       headers: {
  //         "Content-Type": "Application/json",
  //         authorization: localStorage.getItem("auth_token"),
  //       },
  //     };
  //     setLoading(true);
  //     const url = `/orders/order-detail/${productId}`;
  //     const response = await Axios.get(url, config);
  //     const { data } = response;
  //     setOrder(data);
  //     setLoading(false);
  //     setStatus(data.status);
  //     setProgressVal(
  //       orderProgress.find((progress) => progress.status === data.status)
  //     );
  //   } catch (error) {
  //     setLoading(false);
  //   }
  // };

  const formatNumber = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const updateOrder = async (_status) => {
    if (_status !== "" && _status !== null) {
      try {
        setStatus(_status);
        const config = {
          headers: {
            "Content-Type": "Application/json",
            authorization: localStorage.getItem("auth_token"),
          },
        };
        const url = `/orders/update-order`;
        const bodyParam = {
          orderId: order.id,
          status: _status,
        };
        setProgressVal(
          orderProgress.find((progress) => progress.status === _status)
        );

        // await Axios.patch(url, bodyParam, config);

        //   setOrder(data);
        Swal.fire({
          title: "Success",
          imageUrl:
            "https://res.cloudinary.com/greenmouse-tech/image/upload/v1686055425/BOG/success_afvfig.jpg",
          imageWidth: "75px",
          text: `Order has been updated to ${_status}!`,
          buttonsStyling: "false",
          confirmButtonText: "Continue",
          confirmButtonColor: "#3F79AD",
        });
        // getOrderDetail();
      } catch (error) {
        toast.error(error.message, {
          duration: 6000,
          position: "top-center",
          style: { background: "#BD362F", color: "white" },
        });
      }
    }
  };
  const openPayment = (id, ids) => {
    if (id.fname.includes("admin")) {
      toast.error("Cannot make payment to Admin", {
        duration: 6000,
        position: "top-center",
        style: { background: "#BD362F", color: "white" },
      });
    } else {
      setPayout(true);
      setPartnerId(id.id);
      setProdId(ids);
    }
  };

  // useEffect(() => {
  //   getOrderDetail();
  // }, []);

  // if (loading) {
  //   return (
  //     <center>
  //       <Loader />
  //     </center>
  //   );
  // }

  const getSubTotal = (items) => {
    const total = items?.reduce((sum, data) => {
      return sum + data.amount;
    }, 0);
    return total;
  };

  return (
    <div>
      
        <div className="min-h-screen fs-500 relative">
          <div className="w-full py-8 bg-white px-4">
            <p className="text-2xl fw-600 lg:flex items-center">
              Order ID:{" "}
              <span className="text-primary px-3">{order?.orderSlug}</span>{" "}
              <span className="text-xs text-blue-500 bg-light px-2">
                {status}
              </span>
            </p>
            <p className="fs-400 text-gray-600 mt-2">View order details</p>
            <Breadcrumbs className="bg-white pl-0 mt-4">
              <Link to="/" className="opacity-60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Link>
              <Link to="/dashboard" className="opacity-60">
                <span>Dashboard</span>
              </Link>
              <Link to="/dashboard/ordersadmin" className="opacity-60">
                <span>Orders</span>
              </Link>
              <Link className="">
                <span>Order Details</span>
              </Link>
            </Breadcrumbs>
          </div>
          {/* order details */}
          <div className="lg:p-5 px-2 py-4">
            <div>
              {/* order progress */}
              <div>
                <p className="fw-600 underline">Order Progress</p>
                <div className="my-6 mb-24 lg:my-10 relative w-11/12">
                  <div className="">
                    <Progress value={progressVal.percent} color="amber" />
                  </div>
                  <div className="absolute -top-2 o-process">
                    <IoMdCheckmarkCircle
                      className={`text-2xl circle bg-white ${
                        orderProgress[0].allowed.filter(
                          (_allowed) => _allowed === status
                        ).length > 0
                          ? "text-secondary"
                          : "text-gray-400"
                      }`}
                    />
                    <p className={`fw-500 w-8 lg:w-auto fs-400 text-gray-500`}>
                      Order Sent
                    </p>
                  </div>
                  <div className="absolute -top-2 p-process">
                    <IoMdCheckmarkCircle
                      className={`text-2xl circle bg-white ${
                        orderProgress[2].allowed.filter(
                          (_allowed) => _allowed === status
                        ).length > 0
                          ? "text-secondary"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`fw-500 fs-400 w-8 lg:w-auto text-gray-500 relative -left-6`}
                    >
                      Confirmed
                    </p>
                  </div>
                  <div className="absolute -top-2 s-process">
                    <IoMdCheckmarkCircle
                      className={`text-2xl circle bg-white ${
                        orderProgress[3].allowed.filter(
                          (_allowed) => _allowed === status
                        ).length > 0
                          ? "text-secondary"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`fw-500 fs-400 w-8 lg:w-auto text-gray-500 relative -left-6`}
                    >
                      Shipped
                    </p>
                  </div>
                  <div className="absolute -top-2 d-process">
                    <IoMdCheckmarkCircle
                      className={`text-2xl circle bg-white ${
                        orderProgress[4].allowed.filter(
                          (_allowed) => _allowed === status
                        ).length > 0
                          ? "text-secondary"
                          : "text-gray-400"
                      }`}
                    />
                    <p className="fw-500 fs-400 text-gray-500 relative -left-6">
                      Completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:grid-83">
              <div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="flex justify-between border-b border-gray-300 pb-4">
                    <p className="fw-600">Items ({order?.order_items?.length})</p>

                    <select
                      id="countries"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={(e) => updateOrder(e.target.value)}
                      value={status}
                    >
                      <option selected value="">
                        Order Status
                      </option>
                      {order?.status === "cancelled" && (
                        <option value="cancelled">Cancelled</option>
                      )}
                      {order?.status === "approved" &&
                        ["approved", "shipped", "completed", "cancelled"].map(
                          (stat) => (
                            <option value={stat}>{capitalize(stat)}</option>
                          )
                        )}
                      {order?.status === "pending" &&
                        [
                          "pending",
                          "approved",
                          "shipped",
                          "completed",
                          "cancelled"
                        ].map((stat) => (
                          <option value={stat}>{stat === "approved"? "Confirmed" : capitalize(stat)}</option>
                        ))}
                      {order?.status === "shipped" &&
                        ["shipped", "completed", "cancelled"].map((stat) => (
                          <option value={stat}>{capitalize(stat)}</option>
                        ))}
                      {order?.status === "completed" &&
                        ["completed"].map((stat) => (
                          <option value={stat}>{capitalize(stat)}</option>
                        ))}
                    </select>
                  </div>
                  <div className="py-6 border-b border-gray-300 border-dashed">
                    {order?.order_items?.map((item) => (
                      <OrderItemList key={item.id} item={item} />
                    ))}
                  </div>
                  <div className="py-6 fw-500 border-b border-gray-300 border-dashed">
                    <div className="text-gray-600 flex justify-between">
                      <p>Subtotal</p>
                      <p className="text-black">
                        &#8358;{formatNumber(getSubTotal(order?.order_items))}
                      </p>
                    </div>
                    <div className="text-gray-600 mt-4 flex justify-between">
                      <p>Delivery Fee</p>
                      <p className="text-black">
                        &#8358;{formatNumber(order?.deliveryFee)}
                      </p>
                    </div>
                    <div className="text-gray-600 mt-4 flex justify-between">
                      <p>VAT</p>
                      <p className="text-black">
                        &#8358;
                        {formatNumber(
                          getPercentage(getSubTotal(order?.order_items), 7.5)
                        )}
                      </p>
                    </div>
                    {order?.insuranceFee && (
                      <div className="text-gray-600 mt-4 flex justify-between">
                        <p>Insurance Charge</p>
                        <p className="text-black">
                          &#8358;
                          {formatNumber(
                            order?.order_items[0]?.shippingAddress
                              ?.deliveryaddress?.insurancecharge
                          )}
                        </p>
                      </div>
                    )}
                    <div className="text-gray-600 mt-4 flex justify-between">
                      <p>Discount</p>
                      <p className="text-black">{order?.discount} &#37;</p>
                    </div>
                  </div>
                  <div className="py-6 fw-500">
                    <div className="text-gray-600 mt-4 flex justify-between">
                      <p>Order Total</p>
                      <p className="text-black">
                        &#8358;
                        {formatNumber(order?.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="flex justify-between border-b border-gray-300 pb-4">
                    <p className="fw-600">Transaction</p>
                  </div>
                  <div className="lg:flex grid-2 fw-500 justify-between pt-6">
                    <div>
                      <p>
                        Payment Ref:{" "}
                        {order?.order_items[0].paymentInfo.reference}
                      </p>
                      {/* <p className="text-gray-600">{order?.order_items[0].paymentInfo.reference}</p> */}
                    </div>
                    <div>
                      <p>{dayjs(order?.createdAt).format("DD-MM-YYYY")}</p>
                    </div>
                    <div className="mt-2 lg:mt-0">
                      <p className="text-black">
                        &#8358;
                        {formatNumber(order?.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="flex justify-between border-b border-gray-300 pb-4">
                    <p className="fw-600">Client Info</p>
                  </div>
                  <div className="flex mt-6">
                    <div>
                      <Avatar
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1667909634/BOG/logobog_rmsxxc.png"
                        variant="circular"
                        alt="order"
                      />
                    </div>
                    <div className="grid fs-400 content-between pl-4 fw-500">
                      <p className="mt-3">
                        {order?.client?.fname
                          ? order?.client.fname + " " + order?.client.lname
                          : "No Phone number"}
                      </p>
                    </div>
                  </div>
                  <div className="fs-400 fw-500 mt-4">
                    <div className="flex">
                      <p className="text-gray-600">Phone:</p>
                      <p className="pl-3">
                        {order?.client.phone
                          ? order?.client.phone
                          : "No Phone number"}
                      </p>
                    </div>
                    <div className="flex">
                      <p className="text-gray-600">Email:</p>
                      <p className="pl-3">{order?.client.email}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="flex justify-between pb-4">
                    <p className="fw-600">Shipping Address</p>
                  </div>
                  <div className="fs-400 fw-500 mt-4">
                    <p>{`${order?.order_items[0].shippingAddress.address}, ${order?.order_items[0].shippingAddress.state}`}</p>
                  </div>
                </div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="">
                    <p className="fw-600 pb-4">Client Review</p>
                    {order?.orderReview[0] && (
                      <div>
                        <textarea
                          className="h-24 p-2 w-full rounded-sm mt-2 border border-gray-400 "
                          readOnly={true}
                        >
                          {order?.orderReview[0]?.review}
                        </textarea>
                        <ReactStars
                          count={5}
                          size={45}
                          color2={"#ffd700"}
                          value={order?.orderReview[0]?.star}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white lg:p-6 p-3 mt-8 rounded-md">
                  <div className="flex justify-between border-b border-gray-300 pb-4">
                    <p className="fw-600">Partner(s) Info</p>
                  </div>
                  {order?.order_items &&
                    order?.order_items.map((item, index) => (
                      <div key={index} className="pb-3 border-b">
                        <div className="flex items-center mt-6">
                          <div>
                            <Avatar
                              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1667909634/BOG/logobog_rmsxxc.png"
                              variant="circular"
                              alt="order"
                            />
                          </div>
                          <div className="grid fs-400 content-between pl-4 fw-500">
                            <p>
                              {item.product_owner.fname}{" "}
                              {item.product_owner.lname}
                            </p>
                          </div>
                        </div>
                        <div className="fs-400 fw-500 mt-4">
                          <div className="flex">
                            <p className="text-gray-600">Phone:</p>
                            <p className="pl-3">
                              {item.product_owner.phone
                                ? item.product_owner.phone
                                : "No Phone number"}
                            </p>
                          </div>
                          <div className="flex">
                            <p className="text-gray-600">Email:</p>
                            <p className="pl-3">
                              {item.product_owner.email
                                ? item.product_owner.email
                                : "No Email"}
                            </p>
                          </div>
                          <div className="flex">
                            <p className="text-gray-600">Product Name:</p>
                            <p className="pl-3">
                              {item.product.name
                                ? item.product.name
                                : "No name"}
                            </p>
                          </div>
                          <div className="flex">
                            <p className="text-gray-600">Product Price:</p>
                            <p className="pl-3">
                              {item.product.price
                                ? formatNumber(item.product.price)
                                : "No Email"}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-primary mt-4"
                          onClick={() =>
                            openPayment(item.product_owner, item.id)
                          }
                        >
                          Initialize Payment
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      
      {/* {payout && (
        <PartnerPaymentModal
          CloseModal={() => setPayout(false)}
          id={prodId}
          userId={partnerId}
        />
      )} */}
    </div>
  );
}
