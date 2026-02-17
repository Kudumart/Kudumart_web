import "../Home/components/style.css";
import { Link } from "react-router-dom";

export default function AdvertiseOnKudu() {
    return (
        <>
            <div className="w-full flex flex-col">
                <section className="breadcrumb" style={{
                    backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1739010136/kuduMart/image_1_jxejku.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>
                    <div className="flex flex-col py-12">
                        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
                            <h1 className="text-4xl font-bold mt-10">Advertise with Us </h1>
                        </div>
                    </div>
                </section>
                <div className="w-full flex flex-col md:flex-row xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap- gap-5 h-full bg-white">
                    <div className="max-w-4xl gap-10 my-12">
                        <h2 className="text-2xl font-medium leading-loose">At Kudu Mart, we offer businesses, brands, creators and artisans an exceptional opportunity to showcase their products and services to a global audience.</h2>

                    </div>
                    <div className="max-w-4xl gap-10 my-12">
                        <p className="text-base leading-loose">Whether you're a small business owner, a large corporation, or a solo artisan, our platform helps you reach the right customers at the right time.</p>
                    </div>
                </div>
                <div className="w-full  md:flex-row xl:px-40 lg:pl-20 lg:pr-36 md:px-20 lg:gap-10 md:gap- gap-5 h-full bg-white">
                    <div className="flex items-center justify-center text-white text-center px-4 rounded-lg overflow-hidden h-96" style={{
                        backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1739008498/kuduMart/image_iqvviu.jpg)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}>
                        <div className="p-6 rounded-lg w-full max-w-lg">
                            <h3 className="text-3xl font-semibold leading-loose">Who Can Advertise with Us?</h3>
                            <p className="text-base">Our advertising platform is perfect for:</p>
                        </div>
                    </div>
                    <div className="relative -mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mx-auto px-4 z-10 mb-20">
                        {[
                            { title: "Businesses of all sizes", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739009735/kuduMart/online-shop_lguvdi.png" },
                            { title: "Independent creators and artisans", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739009734/kuduMart/dressmaker_1_adn8tw.png" },
                            { title: "Service providers across various sectors and industries", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739009735/kuduMart/market-share_pmqms4.png" },
                            { title: "Corporations looking to expand their brand awareness", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739009734/kuduMart/graph_d2u48i.png" }
                        ].map((item, index) => (
                            <div key={index} className="bg-white p-8 border rounded-lg text-center flex flex-col items-center">
                                <span className="text-4xl"><img
                                    src={item.image}
                                    className="w-24 h-24 rounded-lg object-cover mb-4"
                                /></span>
                                <p className="font-semibold mt-4">{item.title}</p>
                                <button className="mt-4 bg-[#FF6F22] text-white py-3 rounded-md w-full hover:bg-orange-600 transition">
                                    <Link to="/sign-up"> Join Now</Link>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto mt-12 flex flex-col md:flex-row items-center px-4 md:text-left mb-20">
                        <div className="flex-1">
                            <h3 className="text-2xl font-medium mb-6">Our Advertising Options</h3>
                            <ul className="list-decimal pl-6 space-y-4 text-black text-lg leading-loose">
                                <li>Banner Ads: Showcase your business with eye-catching banner placements on high-traffic pages.</li>
                                <li>Featured Listings: Highlight your products or services in search results and category pages.</li>
                                <li>Sponsored Ads: Appear at the top of relevant searches to capture immediate attention.</li>
                                <li>Custom Campaigns: Work with our team to design a tailored advertising strategy for your brand.</li>
                            </ul>
                        </div>
                        <div className="flex-1 mt-8 md:mt-0 flex justify-center">
                            <img src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1739010373/kuduMart/image_h77uaq.png" draggable="false" alt="Advertising" className="w-full max-w-md" />
                        </div>
                    </div>
                    {/* Why Advertise Section */}
                    <div className="mx-auto mt-16 mb-20">
                        <h3 className="text-2xl font-bold text-center mb-16 px-3">Why you should advertise on Kudu Mart</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Extensive Audience", description: "It allows you to connect with a diverse and engaged audience locally and internationally.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739011008/kuduMart/globe_scsnkz.png" },
                                { title: "Targeted Promotion", description: "You can customize your ads to specific demographics, interests, and locations to maximize impact.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739011009/kuduMart/targeted-advertising_pykgyb.png" },
                                { title: "Affordable Options", description: "We have flexible advertising packages designed to fit your budget and goals.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739011008/kuduMart/price-list_ofqvjl.png" },
                                { title: "Improved Visibility", description: "You can showcase your business or craft to stand out among competitors.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739011009/kuduMart/view_k522hu.png" },
                                { title: "Real-Time Insights", description: "You will have access to analytic and performance reports to track your campaign's success.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739012197/kuduMart/analytics_kfclue.png" }
                            ].map((item, index) => (
                                <div key={index} className="bg-white p-8 shadow-sm border rounded-lg text-left">
                                    <span className="text-4xl"><img
                                        src={item.image}
                                        className="w-24 h-auto rounded-lg object-cover mb-4"
                                    /></span>
                                    <h4 className="text-lg font-semibold mt-3">{item.title}</h4>
                                    <p className="text-black text-base leading-loose mt-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col md:flex-row xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap- gap-5 h-full  bg-[#F3F5FF]">
                    {/* How to Get Started Section */}
                    <div className="mx-auto mt-16 px-4 text-center py-20 bg-white mb-20">
                        <h3 className="text-2xl font-bold mb-3">How to Get Started</h3>
                        <p className="text-black text-base mb-8">Advertising with Kudu is simple and seamless:</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { step: "1", title: "Register Your Account", description: "Create an advertiser account on Kudu.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314956_l1yjd7.png" },
                                { step: "2", title: "Choose a Package", description: "Select from our range of flexible advertising packages that suit your needs.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314958_rldf9o.png" },
                                { step: "3", title: "Design Your Ad", description: "Upload your creative materials or let our team assist you in creating impactful ads.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314959_gvaxtj.png" },
                                { step: "4", title: "Launch Your Campaign", description: "Start reaching your target audience and watch your business grow.", image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003836/kuduMart/Group_1321314960_rsmf2i.png" }
                            ].map((item, index) => (
                                <div key={index} className="bg-white p-6 border rounded-lg">
                                    <span className="text-4xl font-bold text-end text-[#F2F0F0]">{item.step}</span>
                                    <span className="text-5xl block text-left"><img
                                        src={item.image}
                                        className="w-24 h-auto rounded-lg object-cover mb-4"
                                    /></span>
                                    <h1 className="font-semibold  text-lg text-left mt-3 mb-4">{item.title}</h1>
                                    <p className="text-black text-left leading-loose mt-2">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
