import Imgix from "react-imgix"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import useApiMutation from "../../api/hooks/useApiMutation"
import Loader from "../../components/Loader"
import { Carousel } from "@material-tailwind/react"
import ProductDescription from "./layouts/productDescription"
import Monitor from "../../components/Monitor"


export default function MonitorAuction() {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState({});

    const { id } = useParams();

    const { mutate } = useApiMutation();

    const getProduct = () => {
        setLoading(true);
        mutate({
            url: `/auction/product?auctionproductId=${id}`,
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setProduct(response.data.data);
                setLoading(false);
            },
            onError: () => {
                setLoading(false)
            },
        });
    }

    useEffect(() => {
        getProduct();
    }, []);




    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    } else {
        if (Object.keys(product).length === 0) {
            return (
                <div className="w-full h-screen flex items-center justify-center">
                    <div className="empty-store">
                        <div className="text-center">
                            <img
                                src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                                alt="Empty Store Illustration"
                                className="w-80 h-80 mx-auto"
                            />
                        </div>
                        <h1 className="text-center text-lg font-bold mb-4">
                            Product Not Found
                        </h1>
                    </div>
                </div>
            );
        }
    }




    return (
        <>
            <div className="w-full flex flex-col h-full bg-kudu-light-blue">
                <div className="w-full flex flex-col md:gap-10 bg-kudu-light-blue h-full mt-14 md:mt-16 ">
                    <div className="w-full xl:px-80 lg:pl-44 lg:pr-36 md:px-4 px-5 py-3 md:py-0 mt-10 border-b border-[rgba(204,204,204,1)] flex">
                        <span className="md:text-lg text-base font-semibold mb-3">{product.name}</span>
                    </div>
                    <div className="w-full flex flex-col xl:px-80 lg:pl-44 lg:pr-36 md:px-4 px-5 py-3 md:py-0 lg:gap-10 md:gap-8 gap-5 bg-kudu-light-blue h-full">
                        <div className="w-full flex gap-3">
                            <div className="flex flex-wrap md:flex-row flex-col w-full gap-2 mb-8">
                                {/* First Div */}
                                <div className="flex-1 md:flex-[0_0_30%] rounded-md h-full">
                                    <div className="w-full flex h-80 justify-center">
                                        <Carousel
                                            className="rounded-xl bg-white shadow-lg"
                                            autoplay
                                            loop
                                        >
                                            {product.additionalImages.map((image, index) => (
                                                <>
                                                    <img
                                                        src={image}
                                                        alt="image 1"
                                                        className="h-full w-full bg-transparent object-cover"
                                                    />
                                                </>
                                            ))}
                                        </Carousel>
                                    </div>
                                    <div className="flex w-full overflow-x-auto my-3">
                                        <div className="flex w-full gap-2 h-auto max-h-[100px]">
                                            {product.additionalImages.map((image, index) => (
                                                <Imgix
                                                    src={image}
                                                    sizes="100vw"
                                                    width={185}
                                                    height={100}
                                                    alt="main-product"
                                                    key={index}
                                                    className="rounded-md h-full object-cover"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ShippingEstimate Div */}
                                <div className="flex-1 md:flex-[0_0_43%] flex-wrap rounded-md h-full">
                                    <ProductDescription description={product.description} specifications={product.specification} />
                                </div>

                                {/* Last Div */}
                                <div className="flex-1 md:flex-[0_0_25%] rounded-md h-full">
                                    <Monitor auctionProductId={id} currency={product.store.currency.symbol} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}