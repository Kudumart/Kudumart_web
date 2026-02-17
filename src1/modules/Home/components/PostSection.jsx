import Imgix from "react-imgix";

export default function PostSection() {
    return (
        <>
            <div className="lg:flex md:hidden sm:hidden w-[20%] flex-col gap-1">
                <div className="bg-kudu-orange py-2 px-5 rounded-md flex justify-center">
                    <div className="w-full flex flex-col items-center gap-2">
                        <p className="text-white text-sm text-center capitalize">
                            Ready to sell your products?
                        </p>
                        <Imgix sizes="20vw" src={'https://res.cloudinary.com/do2kojulq/image/upload/v1735426610/kudu_mart/store_kakpgp.png'} width={40} height={40} alt="store" />
                        <p className="text-white cursor-pointer text-sm text-center">
                            Post a free advert
                        </p>
                    </div>
                </div>
                <div className="flex w-full md:h-[329px] xl:h-[443px] relative">
                    <Imgix sizes="20vw" src={'https://res.cloudinary.com/do2kojulq/image/upload/v1735426607/kudu_mart/smart_phone_ad_yzwi5k.png'} width={300} height={100}
                        className="w-full h-full object-cover"
                        alt="smart_ad"
                    />
                </div>
            </div>
        </>
    )
}