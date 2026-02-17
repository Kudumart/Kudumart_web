import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import ReactStars from "react-rating-stars-component";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import Loader from "../../../components/Loader";
import { dateFormat } from "../../../helpers/dateHelper";
import useAppState from "../../../hooks/appState";
import ProductReview from "../../Products/productReviews";
import { LuArrowLeft } from "react-icons/lu";
import TrackOrder from "../../../components/TrackOrder";
import VendorOrderDetails from "../../Vendor/modules/OrderDetails";

const OrderDetails = () => {
  const { user } = useAppState();
  const navigate = useNavigate();
  if (user?.accountType == "Vendor") {
    return <VendorOrderDetails />;
  }
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const { id } = useParams();

  const [rating, setRating] = useState(0);
  const [orderDetails, setOrderDetails] = useState({});
  const [disabled, setDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const { mutate } = useApiMutation();

  useEffect(() => {
    getOrderDetails();
  }, []);

  const getOrderDetails = () => {
    setIsLoading(true);
    mutate({
      url: `/user/order/items?orderId=${id}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setOrderDetails(response.data.data);
        getProductReviews(response.data.data[0].product.id);
        setIsLoading(false);
      },
      onError: (error) => {
        setIsLoading(false);
      },
    });
  };

  const getProductReviews = (productId) => {
    mutate({
      url: `/user/get/review?productId=${productId}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setReviews(response.data.data);
      },
      onError: (error) => {},
    });
  };

  const ratingChanged = (newRating) => {
    setRating(newRating);
  };

  const onSubmit = (data) => {
    setDisabled(true);
    mutate({
      url: "/user/add/review",
      method: "POST",
      headers: true,
      data: {
        orderId: id,
        productId: productDetails.id,
        rating: rating,
        comment: data.comment,
      },
      onSuccess: (response) => {
        setDisabled(false);
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  const markDelivered = (orderId) => {
    mutate({
      url: `/user/order/item/update/status`,
      method: "POST",
      headers: true,
      data: {
        orderItemId: orderId,
        status: "delivered",
      },
      onSuccess: (response) => {
        getOrderDetails();
      },
    });
  };

  const handleRefetch = () => {
    getOrderDetails();
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const productDetails = orderDetails[0].product;

  const isVendorType = user.id === orderDetails[0].vendorId;

  return (
    <div className="w-full flex-col gap-5 flex">
      <div className=" w-full flex flex-col md:flex-row justify-between gap-6">
        <div className="w-full md:w-3/5 gap-6 flex flex-col">
          <div className="flex flex-col p-6 bg-white shadow-md rounded-lg w-full">
            <div className="flex w-full mb-2 justify-between">
              <div className="flex gap-3">
                <span
                  onClick={() => navigate(-1)}
                  className="flex flex-col p-2 bg-gray-100 rounded-md shadow-md justify-center cursor-pointer"
                >
                  <LuArrowLeft size={20} />
                </span>
                <h2 className="text-xl font-semibold flex mt-1 items-center gap-2">
                  Order Details
                </h2>
              </div>
              {user.id !== orderDetails[0].vendorId &&
              orderDetails[0].status === "shipped" ? (
                <Menu placement="bottom">
                  <MenuHandler>
                    <Button>Update Delivery Status</Button>
                  </MenuHandler>
                  <MenuList>
                    <MenuItem
                      className="flex flex-col gap-3 w-full"
                      onClick={() => markDelivered(orderDetails[0].id)}
                    >
                      <span className="cursor-pointer w-full">
                        Mark as Delivered
                      </span>
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <></>
              )}
            </div>
            <div className="mt-4 border-b flex flex-col gap-2 pb-4">
              <p className="text-gray-600">
                {orderDetails.reduce((total, item) => total + item.quantity, 0)}{" "}
                Item
                {orderDetails.reduce(
                  (total, item) => total + item.quantity,
                  0,
                ) > 1 && "s"}
              </p>
              <p className="text-gray-600">
                <span className="mr-1">&#128197;</span> Placed on{" "}
                {dateFormat(orderDetails[0].createdAt, "dd-MM-yyy")}
              </p>
              <p className="text-gray-900 font-semibold">
                Total: {productDetails.store.currency.symbol}{" "}
                {orderDetails.reduce(
                  (total, item) => total + item.price * item.quantity,
                  0,
                )}
              </p>
            </div>

            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="md:text-lg text-base font-semibold">
                ITEMS IN THIS ORDER
              </h3>
              {orderDetails.map((item) => (
                <div key={item.id} className="flex items-center mt-4">
                  <img
                    src={item.product.image_url}
                    alt="Product"
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="ml-4 flex flex-col gap-1">
                    <p className="text-gray-800 font-semibold">
                      {item.product.name}
                    </p>
                    <p className="text-gray-600">QTY: {item.quantity}</p>
                    <p className="text-black font-semibold text-base">
                      {item.product.store.currency.symbol} {item.product.price}
                    </p>
                    <p className="flex gap-2">
                      Delivery Status:
                      <span
                        className={`${item.status !== "delivered" && item.status !== "cancelled" ? "text-kudu-orange" : item.status === "cancelled" ? "text-red-500" : "text-green-500"} font-semibold`}
                      >
                        <p className="text-sm capitalize">{item.status}</p>
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {user.id !== orderDetails[0].vendorId &&
          orderDetails[0].status === "delivered" ? (
            <ProductReview reviews={reviews} />
          ) : (
            <></>
          )}
        </div>

        {user.id !== orderDetails[0].vendorId &&
        orderDetails[0].status === "delivered" ? (
          <div className="bg-white shadow-md rounded-lg md:sticky self-start top-6 p-6 h-fit flex flex-col gap-3 md:w-2/5">
            <form
              className="flex flex-col w-full gap-1"
              onSubmit={handleSubmit(onSubmit)}
            >
              <textarea
                id="review"
                name="comment"
                {...register("comment")}
                required
                placeholder="Leave a review"
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 h-32 resize-none rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                style={{ outline: "none" }}
              />

              <p>Leave a rating</p>
              <ReactStars
                count={5}
                size={25}
                activeColor={"rgba(255, 111, 34, 1)"}
                onChange={ratingChanged}
                value={rating}
              />
              <Button
                type="submit"
                className="bg-kudu-orange text-white px-6 py-2 w-full mt-4 rounded-lg font-semibold"
              >
                Submit
              </Button>
            </form>
          </div>
        ) : (
          <div className="h-fit flex md:w-2/5">
            <ProductReview reviews={reviews} />
          </div>
        )}
      </div>

      <TrackOrder
        userType={isVendorType}
        orderId={orderDetails[0].id}
        status={orderDetails[0].status}
        refetch={handleRefetch}
      />
    </div>
  );
};

export default OrderDetails;
