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
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import NewProductReviews from "./_components/NewProductReviews";
interface ProductStoreCurrency {
  name: string;
  symbol: string;
}

interface ProductStore {
  name: string;
  currency: ProductStoreCurrency;
}

interface ProductSubCategory {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  store: ProductStore;
  views: number;
  status: string;
  storeId: string;
  keywords: string | null;
  quantity: number;
  vendorId: string;
  warranty: string;
  condition: string;
  createdAt: string;
  image_url: string;
  seo_title: string | null;
  updatedAt: string;
  video_url: string | null;
  categoryId: string;
  description: string;
  sub_category: ProductSubCategory;
  return_policy: string;
  specification: string;
  discount_price: string;
  meta_description: string | null;
  additional_images: string[];
}

interface OrderItem {
  product: Product;
  id: string;
  vendorId: string;
  orderId: string;
  quantity: number;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailsResponse {
  message: string;
  data: OrderItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
const VendorOrderDetails = () => {
  const { user } = useAppState();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const { id } = useParams<{ id: string }>();

  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  const { mutate } = useApiMutation();

  useEffect(() => {
    getOrderDetails();
  }, []);

  const detail_query = useQuery({
    queryKey: ["details", id],
    queryFn: async () => {
      const response = await apiClient(`/user/order/items?orderId=${id}`);
      const data = await response.data;
      return data.data;
    },
  });
  const getOrderDetails = () => {};

  const getProductReviews = (productId: string) => {
    ///@ts-ignore
    mutate({
      url: `/user/get/review?productId=${productId}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response: { data: { data: any[] } }) => {
        setReviews(response.data.data);
      },
      onError: () => {},
    });
  };

  const ratingChanged = (newRating: number) => {
    setRating(newRating);
  };

  const onSubmit = (data: { comment: string }) => {
    if (orderDetails.length === 0 || !orderDetails[0]?.product?.id) {
      return;
    }
    ///@ts-ignore

    mutate({
      url: "/user/add/review",
      method: "POST",
      headers: true,
      data: {
        orderId: id,
        productId: orderDetails[0].product.id,
        rating: rating,
        comment: data.comment,
      },
      onSuccess: () => {
        // Optionally refetch reviews or update state
      },
      onError: () => {},
    });
  };

  const markDelivered = (orderItemId: string) => {
    ///@ts-ignore

    mutate({
      url: `/user/order/item/update/status`,
      method: "POST",
      headers: true,
      data: {
        orderItemId: orderItemId,
        status: "delivered",
      },
      onSuccess: () => {
        getOrderDetails();
      },
    });
  };

  const handleRefetch = () => {
    getOrderDetails();
  };

  if (detail_query.isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  if (detail_query?.data.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>No order details found.</p>
      </div>
    );
  }
  const orderDetails = detail_query?.data;
  const vendor_id = user?.id;
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
            <>
              <NewProductReviews id={id as string} />
              {/*<ProductReview reviews={reviews} />*/}
            </>
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
                id="comment"
                {...register("comment", { required: true })}
                placeholder="Leave a review"
                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 h-32 resize-none rounded-lg focus:outline-none placeholder-gray-400 text-sm mb-3"
              />
              {errors.comment && (
                <p className="text-red-500 text-sm">Comment is required.</p>
              )}

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
            <NewProductReviews id={id as string} />
          </div>
        )}
      </div>

      <TrackOrder
        userType={isVendorType}
        orderId={orderDetails[0].id}
        status={orderDetails[0].status}
        refetch={handleRefetch}
        admin={false} // Assuming this prop is expected for TrackOrder
      />
    </div>
  );
};

export default VendorOrderDetails;
