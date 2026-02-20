import "./style.css";
import { useState, useMemo } from "react";
import { ShoppingBag, Package, RefreshCcw } from "lucide-react";
import ProductListing from "../../../components/ProductsList";
import { useCountrySelect } from "../../../store/clientStore";
import apiClient from "../../../api/apiFactory";
import { useQuery } from "@tanstack/react-query";

export default function ProductConditions() {
  const { country } = useCountrySelect();

  const { data: new_products } = useQuery({
    queryKey: ["products-home-condition", country.value],
    queryFn: async () => {
      let resp = await apiClient.get("/products", {
        params: {
          country: country.value,
        },
      });
      return resp.data;
    },
  });

  const conditionsArr = [
    {
      name: "Brand New",
      id: "brand_new",
      icon: ShoppingBag,
      color: "#FF5733",
    },
    {
      name: "Refurbished",
      id: "refurbished",
      icon: RefreshCcw,
      color: "#FF5733",
    },
    {
      name: "Used",
      id: "fairly_used",
      icon: Package,
      color: "#FF5733",
    },
  ];

  const [activeCondition, setActiveCondition] = useState("brand_new");

  const filteredProducts = useMemo(() => {
    const products = new_products?.data || [];
    return products.filter((product) => product.condition === activeCondition);
  }, [new_products, activeCondition]);

  const handleActiveCondition = (id) => {
    setActiveCondition(id);
  };

  return (
    <div className="flex w-full flex-col lg:gap-5 md:gap-5 mb-10">
      <div
        data-theme="kudu"
        className="grid w-full grid-cols-3 my-3 md:mt-3 lg:mt-0 gap-4"
      >
        {conditionsArr.length > 0 ? (
          conditionsArr.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeCondition === item.id;

            return (
              <button
                key={index}
                onClick={() => handleActiveCondition(item.id)}
                className={`btn btn-primary btn-ghost h-auto flex flex-col py-3 md:py-5 ${
                  isActive ? " btn-active" : ""
                }`}
              >
                <IconComponent
                  size={40}
                  className="hidden md:block"
                  style={{ color: isActive ? "white" : item.color }}
                />
                <IconComponent
                  size={20}
                  className="block md:hidden"
                  style={{ color: isActive ? "white" : item.color }}
                />
                <span className="text-xs md:text-sm font-medium normal-case">
                  {item.name}
                </span>
              </button>
            );
          })
        ) : (
          <div className="col-span-3 flex justify-center py-10">
            <span className="text-2xl font-semibold opacity-50">
              NO DATA IS AVAILABLE
            </span>
          </div>
        )}
      </div>

      <ProductListing productsArr={filteredProducts} displayError />
    </div>
  );
}
