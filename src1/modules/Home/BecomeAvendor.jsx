import { useState } from "react";
import "../Home/components/style.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAppState from "../../hooks/appState";
import { useModal } from "../../hooks/modal";
import { useDispatch } from "react-redux";
import { setKuduUser } from "../../reducers/userSlice";
import SwitchVendorModal from "../User/components/switchVendor";

export default function BecomeAvendor() {
    const { user } = useAppState();
    const { openModal } = useModal();

    const dispatch = useDispatch();

    const handleRedirect = () => {
        const updatedUser = { ...user, accountType: 'Vendor' };
        dispatch(setKuduUser(updatedUser))
        window.location.href = "/profile/products";
    }

    const steps = [
        {
            id: 1,
            title: "Create an Account",
            description: "Sign up on Kudu and verify your identity to start selling.<br> Register using your name, email, and phone number or via your Google account and verify your account with your email. <br> Complete your seller profile, including location and payment details.",
            iconimage: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314956_l1yjd7.png",
            image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003820/kuduMart/Copy_of_Free_mockup_of_woman_holding_a_smartphone_Mockuuups_Studio_dzjzwd.png",
        },
        {
            id: 2,
            title: "List Your Products",
            description: "Navigate to the “Sell on Kudu” section. <br> Provide product details, and price and upload clear and high-quality photos of the product. <br> You will be notified when it has been published after undergoing a review process.",
            iconimage: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314958_rldf9o.png",
            image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003819/kuduMart/Free_iPad_Air_mockup_held_by_user_against_a_bright_silver_background_Mockuuups_Studio_yvzjlo.png",
        },
        {
            id: 3,
            title: "Receive Orders",
            description:
                "Buyer will contact you directly, answer their queries promptly, negotiate terms, and finalize the deal. <br> Monitor notifications and inquiries within the platform and follow up to ensure smooth communication and secure payments.",
            iconimage: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003835/kuduMart/Group_1321314959_gvaxtj.png",
            image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003820/kuduMart/image-copy-0_ye6bjg.png",
        },
        {
            id: 4,
            title: "Fulfill Orders",
            description:
                "For sales done directly or from the platform, confirm that you’ve received payment before shipping.  <br> Ship the product using the buyer’s shipping details and provide a tracking number.",
            iconimage: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003836/kuduMart/Group_1321314960_rsmf2i.png",
            image: "https://res.cloudinary.com/greenmouse-tech/image/upload/v1739003821/kuduMart/image_fwyvm3.png",
        },
    ];

    const faqs = [
        { id: 1, question: "Q: How can I sell on Kudu?", answer: "A: Create an account, select the “Vendor” section, list your product or service with clear details and pictures, and publish it for buyers to view." },
        { id: 2, question: "Q: Can I sell services on Kudu?", answer: "A: Yes, you can list services for sale, but services can not be auctioned." },
        { id: 4, question: "Q: Do I need a subscription package to sell on Kudu?", answer: "A: Yes, sellers must purchase a subscription package to access optimal selling features and list products or services on Kudu." },
        { id: 5, question: "Q: How do I get paid after selling on Kudu?", answer: "A: Payments are processed through the platform’s secure payment system and credited to your account once the transaction is complete." },
        { id: 6, question: "Q: Can I edit or delete my listings?", answer: "A: Yes, you can edit or delete your product or service listings anytime from your seller dashboard." },
        { id: 7, question: "Q: How can I manage inquiries from buyers?", answer: "A: Buyers can contact you via chat or text feature. Make sure to respond swiftly to finalize sales." },
        { id: 8, question: "Q: Can I sell physical products through an auction?", answer: "A: Yes, you can list physical products for auction by setting a starting price, and auction time frame." },
        { id: 9, question: "Q: What types of items or services are prohibited on Kudu?", answer: "A: Illegal or barred items and services are allowed on Kudu. Ensure your listing adheres to our terms and conditions." },
        { id: 10, question: "Q: Are there additional fees apart from the subscription?", answer: "A: While the subscription covers listing products or services, additional fees may apply for premium features or successful transactions." },
    ];

    const [hoveredStep, setHoveredStep] = useState(null);

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };


    const handleVendorModal = () => {
        openModal({
            size: 'sm',
            content: <SwitchVendorModal redirect={handleRedirect}>
                <div className='flex'>
                    <p className='text-sm gap-2 leading-[1.7rem]'>
                        Ready to grow your business? By switching to a vendor account,
                        you'll unlock tools to showcase your products, manage sales, and connect with customers.
                    </p>
                </div>
            </SwitchVendorModal>
        })
    }



    return (
        <>
            <div className="w-full flex flex-col">
                <section className="breadcrumb" style={{
                    backgroundImage: `url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1739000909/image_t6f1zw.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>
                    <div className="flex flex-col py-12">
                        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
                            <h1 className="text-4xl font-bold mt-10">Become a Vendor</h1>
                        </div>
                    </div>
                </section>
                <div className="w-full flex flex-col md:flex-row items-center justify-between xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap- gap-5 h-full bg-white">
                    {/* Left Section */}
                    <div className="w-full md:w-1/2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-semibold mt-10 mb-4">
                            Make more money selling
                        </h2>
                        <h2 className="text-3xl md:text-4xl font-semibold">
                            on <span className="font-bold">Kudu mart</span>
                        </h2>
                        <p className="mt-3 text-black text-base leading-loose">
                            Sell your items fast with Kudu, millions of buyers are waiting. Reach
                            more customers, boost your sales and grow your business effortlessly.
                            Join us now to get started!
                        </p>
                        <button className="mt-5 bg-[#FF6F22] text-white px-6 py-3 rounded-md hover:bg-orange-700 transition w-full md:w-auto">
                            {user ?
                                user?.accountType === "Vendor" ?
                                    <Link
                                        to="/profile/products"> List A Product</Link>
                                    :
                                    <span onClick={() => handleVendorModal()}>
                                        List A Product</span>
                                :
                                <Link
                                    to="/sign-up"> List A Product</Link>
                            }

                        </button>
                    </div>

                    {/* Right Section (Image with "K" shape) */}
                    <div className="w-full md:w-1/2 flex justify-center mt-8 md:mt-0 py-14">
                        <div className="w-96 h-auto md:w-96 md:h-auto bg-black rounded-full flex items-center justify-center overflow-hidden">
                            <img
                                src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1739001030/Group_1321314979_1_sxn1l0.png"
                                alt="Kudu mart"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 bg-[#F3F5FF] md:gap-8 gap-5 h-full">
                    {/* Header */}
                    <h2 className="text-center text-lg mt-16 md:text-3xl font-semibold">
                        Become A Vendor In Few Steps
                        <p className="text-center text-base text-black font-normal mt-5">
                            Here's a step-by-step guide for you to start selling on Kudu.
                        </p>
                    </h2>


                    {/* Steps */}
                    <div className="bg-white mt-8 mb-20 relative cursor-pointer">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`rounded-xl transition-all duration-300 relative z-[${100 - step.id}]
              shadow-md hover:shadow-xl ${hoveredStep === step.id
                                        ? "scale-100 p-6 shadow-3xl"
                                        : "p-8 "
                                    }
              ${index !== steps.length - 1 ? "-mt-4" : ""} 
            `}
                                onMouseEnter={() => setHoveredStep(step.id)}
                                onMouseLeave={() => setHoveredStep(null)}
                            >
                                <div className="flex items-center gap-10">
                                    <span className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
                                        Step {step.id}
                                    </span>
                                </div>

                                {/* Expanded Content (Only shows when hovered) */}
                                {hoveredStep === step.id && (
                                    <div className="mt-4 flex flex-col py-10 md:flex-row items-center gap-20">
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="w-96 h-auto rounded-lg object-cover"
                                        />
                                        <div>
                                            <div className="text-4xl">
                                                <img
                                                    src={step.iconimage}
                                                    alt={step.title}
                                                    className="w-24 h-24 rounded-lg object-cover mb-4"
                                                />
                                            </div>
                                            <h3 className="text-lg font-semibold leading-loose mb-2">{step.title}</h3>
                                            <p
                                                className="text-black text-base leading-loose"
                                                dangerouslySetInnerHTML={{ __html: step.description }}
                                            ></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 bg-white md:gap-8 gap-5 h-full">
                    <h2 className="text-xl font-semibold mt-8 mb-4">Frequently Asked Questions (Seller/Vendor)</h2>
                    <div className="space-y-2 mb-20">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden text-left">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex justify-between items-center p-4 py-6 bg-white hover:bg-gray-200"
                                >
                                    <span>Q{index + 1}: {faq.question}</span>
                                    {openIndex === index ? <FaMinus /> : <FaPlus />}
                                </button>
                                {openIndex === index && (
                                    <div className="p-4 bg-white py-6 border-t">{faq.answer}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
