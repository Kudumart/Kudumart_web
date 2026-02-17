import { useMutation } from "@tanstack/react-query";
import Modal from "../../../../components/dialogs-modals/SimpleModal";
import { useModal } from "../../../../helpers/client";
import { useSingleSelect } from "../../../../helpers/selectors";
import GetCategories from "./GetCategoris";
import apiClient from "../../../../api/apiFactory";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { extract_message } from "../../../../helpers/auth";

interface Store {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    address: string;
    country: string;
  };
  businessHours: {
    sunday: string;
    saturday: string;
    monday_friday: string;
  };
  tipsOnFinding: string;
  logo: string;
  isVerified: boolean;
  currency: {
    symbol: string;
  };
}

export default function StoreCard({ item }: { item: Store }) {
  const modal = useModal();
  const selectProps = useSingleSelect(null);
  const mutation = useMutation({
    mutationFn: (fn: any) => fn(),
  });
  const { itemId } = useParams();

  const add_to_store = async () => {
    const resp = await apiClient.post("admin/aliexpress/products/import", {
      productId: itemId,
      shippingCountry: "NG",
      currency: "NGN",
      storeId: item.id,
      categoryId: selectProps.selectedItem,
      priceIncrementPercent: "30",
    });
    return resp.data;
  };

  return (
    <>
      <div
        key={item.id}
        className="card bg-base-100 border border-base-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98]"
      >
        <figure className="relative">
          {item.logo ? (
            <img
              src={item.logo}
              alt={item.name}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-base-200 grid place-items-center text-base-content/50">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          <div
            className={`badge absolute top-3 right-3 border-none font-medium px-3 py-3 ${
              item.isVerified
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {item.isVerified ? "Verified" : "Unverified"}
          </div>
        </figure>

        <div className="card-body p-5 gap-1">
          <div className="flex justify-between items-start">
            <h2 className="card-title text-lg font-semibold tracking-tight">
              {item.name}
            </h2>
            <span className="text-primary font-bold text-lg">
              {item.currency.symbol}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-base-content/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>
              {item.location.city}, {item.location.state}
            </span>
          </div>

          <p className="text-sm text-base-content/60 line-clamp-2 mt-2 leading-relaxed">
            {item.tipsOnFinding}
          </p>

          <div className="card-actions justify-end mt-4">
            <button
              onClick={() => modal.showModal()}
              className="btn btn-primary btn-md rounded-full px-6 normal-case font-semibold shadow-sm hover:shadow-md"
            >
              Import Product
            </button>
          </div>
        </div>
      </div>

      <Modal
        ref={modal.ref}
        title="Select Category"
        actions={
          <div className="flex gap-2 w-full justify-end">
            <button
              className="btn btn-ghost rounded-full normal-case"
              onClick={() => modal.ref.current?.close()}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectProps.selectedItem)
                  return toast.error("Please select a category");
                toast.promise(mutation.mutateAsync(add_to_store), {
                  loading: "Importing product...",
                  success: "Product imported successfully!",
                  error: extract_message,
                });
              }}
              className="btn btn-primary rounded-full px-8 normal-case"
            >
              Import
            </button>
          </div>
        }
      >
        <div className="py-4">
          <GetCategories selectProps={selectProps} />
        </div>
      </Modal>
    </>
  );
}
