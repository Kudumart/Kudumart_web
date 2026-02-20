import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { Button } from "@material-tailwind/react";
import Loader from "../../../components/Loader";
import { dateFormat } from "../../../helpers/dateHelper";

export default function AdvertList() {
    const [activeTab, setActiveTab] = useState("published");
    const [loading, setLoading] = useState(true);
    const [adverts, setAdverts] = useState([]);

    const { mutate } = useApiMutation();
    const navigate = useNavigate();

    const getAdverts = () => {
        mutate({
            url: `/vendor/adverts`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setAdverts(response.data.data);
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        getAdverts();
    }, []);



    // Filter adverts based on activeTab
    const filteredAdverts = adverts.filter(advert =>
        activeTab === "published" ? advert.status === "approved" : advert.status === "pending" || advert.status === "rejected"
    );

    return (
        <div className="w-full p-6 bg-white shadow rounded-lg">
            <div className="flex w-full justify-between">
                <h2 className="text-lg font-bold mb-4">Adverts</h2>
                <Button className="bg-kudu-orange p-2" onClick={() => navigate("create-advert")}>
                    Create Advert
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b text-xs sm:text-sm">
                <button
                    className={`p-2 sm:p-3 font-semibold ${activeTab === "published" ?
                        "text-[#FE6A3A] border-b-2 border-[#FE6A3A]" : "text-black"}`}
                    onClick={() => setActiveTab("published")}
                >
                    PUBLISHED ({adverts.filter(a => a.status === "approved").length})
                </button>
                <button
                    className={`p-2 sm:p-3 font-semibold ml-2 sm:ml-4 ${activeTab === "pending" ?
                        "text-[#FE6A3A] border-b-2 border-[#FE6A3A]" : "text-black"}`}
                    onClick={() => setActiveTab("pending")}
                >
                    PENDING / UNPUBLISHED ({adverts.filter(a => a.status === "pending" || a.status === "rejected").length})
                </button>
            </div>

            {/* Loader */}
            {loading ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <Loader />
                </div>
            ) : (
                <div className="mt-4">
                    {filteredAdverts.length > 0 ? (
                        filteredAdverts.map((advert) => (
                            <div
                                key={advert.id}
                                className="flex flex-col sm:flex-row items-center p-4 border rounded-lg shadow-sm mb-4"
                            >
                                <img
                                    src={advert.media_url}
                                    alt={advert.title}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-md object-cover mb-4 sm:mb-0"
                                />
                                <div className="sm:ml-4 flex-1 text-center gap-5 sm:text-left">
                                    <p className="font-semibold text-black leading-loose">{advert.title}</p>
                                    <div className="grid grid-cols-2 gap-1 px-4 mb-5">
                                        <p className="text-sm text-gray-500 leading-loose">
                                            • Clicks:  {advert.clicks}
                                        </p>
                                        <p className="text-sm text-gray-500 leading-loose">
                                            • Created On:  {dateFormat(advert.createdAt, "dd-MM-yyyy")}
                                        </p>
                                        <p className="text-sm text-gray-500 leading-loose">
                                            • Description:  {advert.description}
                                        </p>
                                        <p className="text-sm text-gray-500 leading-loose">
                                            • Link:  {advert.link}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs text-white mt-8 shadow-md rounded-lg capitalize px-3 py-2 rounded-xs leading-loose 
                                            ${advert.status === "approved" ? "bg-green-500" : advert.status === "pending" ? 
                                                "bg-kudu-orange" : "bg-red-500"}`}
                                    >
                                        {advert.status}
                                        {advert.status === "pending" ? " (Awaiting admin approval)" : ""}
                                    </span>
                                </div>
                                <Link to={`edit-advert/${advert.id}`} className="text-orange-500 font-semibold mt-4 sm:mt-0">
                                    EDIT ADVERT
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 mt-6">No adverts found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
