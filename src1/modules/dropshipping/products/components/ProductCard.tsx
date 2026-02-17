import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import apiClient from "../../../../api/apiFactory";
import { toast } from "sonner";
import { extract_message } from "../../../../helpers/auth";
import { useModal } from "../../../../helpers/client";
import Modal from "../../../../components/dialogs-modals/SimpleModal";
import AddToStore from "./AddToStore";
interface AliProduct {
  originalPrice: string;
  originalPriceCurrency: string;
  salePrice: string;
  discount: string;
  itemMainPic: string;
  title: string;
  type: string;
  score: string;
  itemId: string;
  targetSalePrice: string;
  targetOriginalPriceCurrency: string;
  evaluateRate: string;
  orders: string;
  targetOriginalPrice: string;
  itemUrl: string;
  salePriceCurrency: string;
}

export default function AliProductCard({ item }: { item: AliProduct }) {
  const mutation = useMutation({
    mutationFn: (fn: any) => fn(),
  });
  const add_to_store = async () => {
    const resp = await apiClient.post("admin/aliexpress/products/import", {
      productId: item.itemId,
      shippingCountry: "UK",
      currency: "USD",
      storeId: "ba90caf1-5660-4a54-a9f8-f3e76748e99a",
      categoryId: "2dd88ee9-6173-4625-9acb-8ccdf1be54fe",
      priceIncrementPercent: "30",
    });
    return resp.data;
  };
  return (
    <div className="card bg-base-100 shadow-xl">
      <figure>
        <img
          src={item.itemMainPic}
          alt={item.title}
          className="rounded-xl object-cover h-48 w-full"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title line-clamp-1 text-lg font-semibold">
          {item.title}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Price: {item.targetSalePrice} {item.targetOriginalPriceCurrency}
            </p>
            <p className="text-xs line-through text-gray-500">
              Original: {item.targetOriginalPrice}{" "}
              {item.targetOriginalPriceCurrency}
            </p>
          </div>
          <div className="badge badge-secondary">{item.discount}</div>
        </div>

        <div className="card-actions justify-end mt-4">
          <Link
            to={"/dropshipping/products/import/" + item.itemId}
            className="btn btn-primary btn-sm"
            // onClick={() => {
            //   modal.showModal();
            // }}
          >
            Add To Store
          </Link>
          <Link to={item.itemUrl} className="btn btn-accent btn-sm">
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
