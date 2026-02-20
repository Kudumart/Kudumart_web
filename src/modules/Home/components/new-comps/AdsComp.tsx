import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";
import { useCountrySelect } from "../../../../store/clientStore";
import { useModal } from "../../../../hooks/modal";
import Imgix from "react-imgix";
import Loader from "../../../../components/Loader";

export default function AdsComp() {
  const { country } = useCountrySelect();

  const { data, isLoading } = useQuery({
    queryKey: ["products-home", country.value],
    queryFn: async () => {
      let resp = await apiClient.get("/adverts?showOnHomePage=true", {
        params: {
          country: country.value,
        },
      });
      return resp.data;
    },
  });
  const { openModal } = useModal();
  const ads = data?.data || [];
  const handleSelectedAd = (ad) => {
    openModal({
      size: "lg",
      content: (
        <div
          className="relative bg-white rounded-lg p-4 max-w-5xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={ad?.media_url}
            sizes="100vw"
            className="w-full h-auto max-h-screen object-contain rounded-sm"
          />
        </div>
      ),
    });
  };
  if (isLoading) {
    return (
      <>
        <Loader />
      </>
    );
  }
  // return <>{JSON.stringify(ads)}</>;
  return (
    <div>
      <div className="flex w-full flex-col md:flex-row gap-4 mt-6 mb-4">
        {ads.map((ad, index) => (
          <div
            key={index}
            onClick={() => handleSelectedAd(ad)}
            className={`group cursor-pointer md:w-full flex md:flex-row flex-col relative w-full ${
              ads.length > 1 ? "pt-64" : "pt-96"
            } px-4 lg:rounded-lg md:rounded-lg overflow-hidden`}
          >
            <div className="absolute inset-0 flex w-full h-full rounded-lg">
              <img src={ad?.media_url} alt="" className="flex-1 object-cover" />
              {/*<Imgix
                src={ad?.media_url}
                sizes="100vw"
                className="w-full h-full object-cover object-center rounded-lg transform scale-110 group-hover:scale-100 transition-all duration-700 ease-in-out"
              />*/}

              {/* Black hover overlay with text */}
              <div className="absolute inset-0 bg-black/50  group-hover:bg-opacity-60 transition duration-500 ease-in-out flex items-center justify-center">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Click to view
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
