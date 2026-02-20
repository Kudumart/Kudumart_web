import { useState } from "react";
import "./components/style.css";


const Conditions = () => {
    const principles = [
        {
            title: "Introduction",
            description:
                "At Kudu Mart, we prioritize trust, safety, and customer satisfaction. These Terms and Conditions outline-solid the rules governing the use of our platform to ensure a secure and enjoyable experience for all users.",
        },
        {
            title: "Acceptance of Terms",
            description:
                "By accessing or using our website and mobile applications, you agree to these Terms and Conditions. If you do not agree, you may not use our platform.",
        },
        {
            title: "Eligibility",
            description:
                "To use our platform and services, you must:<br>" +
                "- Be 18 years or older<br>" +
                "- Have a valid email address<br>" +
                "- Agree to the terms and conditions<br>" +
                "- Provide accurate and complete registration information"
        },
        {
            title: "Services",
            description:
                "Our Platform offers its users the ability to buy, sell, and auction physical products. Our core principles include: <br>" +
                "-  Customer Protection: We prioritize safeguarding user information, ensuring secure transactions, and protecting customers from fraudulent activities.<br>" +
                "-  Quality Assurance: We verify seller authenticity, product legitimacy, and ensure compliance with industry standards to maintain high-quality products and services.<br>" +
                "-  Transparency: We provide clear policies, accurate product descriptions, timely communication, and transparent business practices to foster trust.<br>" +
                "- Fairness: We ensure equal opportunities for sellers and fair pricing for buyers, promoting a level playing field.<br>" + "- Accountability: We take responsibility for resolving disputes, enforcing policies, and continually improving our platform where necessary."
        },
        {
            title: "User Responsibilities",
            description:
                "<b>1. Account Registration</b> <br>" + "You are responsible for maintaining the confidentiality of your account credentials.You can not transfer or share your account with others. Notify us immediately if you suspect unauthorised access to your account. <br>" + "<b>2. User Conduct</b><br>" + " Prohibited Activities: You agree not to: <br> " + "Post false, misleading, or fraudulent listings." +
                "Engage in illegal activities or sell prohibited items." +
                "Interfere with the operation of the platform or other users." +
                "Use our platform to spam, harass, or abuse others." +
                "Consequences: Account suspension/termination <br>" +
                "<b>3: Seller Requirements:</b> <br>" + "Verification: Sellers must provide valid government-issued identification and business registration documents (e.g., CAC or equivalent).<br>" +
                "Product Authenticity: Sellers guarantee product authenticity and compliance with trademark laws. <br>" +
                "Accurate Descriptions: Listings must include precise product details, including images and specifications.<br>" +
                "4. <b>Buyer Responsibilities</b> <br>" +
                "Account Security: Buyers maintain secure account information, password, etc.<br>" +
                "Payment Terms: Buyers agree to all payment terms, including prices and shipping costs."

        },
        {
            title: "Refund and Return Policy",
            description:
                "<ul>" +
                "<li>We offer a 7-days money-back guarantee for eligible purchases made via its platform.</li>" +
                "<li>Refunds are processed within 5-7 business days after approval.</li>" +
                "<li>Return shipping costs are borne by the buyer or seller, depending on the nature of the return.</li>" +
                "</ul>"
        },
        {
            title: "Shipping Policy",
            description:
                "<ul>" +
                "<li>Estimated delivery times range from 3-7 business days, depending on the buyer’s location.</li>" +
                "<li>Tracking information is provided for all shipments by the company.</li>" +
                "<li>Shipping costs are calculated based on weight and destination.</li>" +
                "</ul>"
        },
        {
            title: "Fees and Payments",
            description:
                "<ul>" +
                "<li>Though the use of our platform is free, sellers may purchase a subscription package to enjoy premium services.</li>" +
                "<li>Additional fees may apply for premium features or transactions.</li>" +
                "<li>All payments must be made through the platform’s secure payment system.</li>" +
                "</ul>"
        },
        {
            title: "Payment Security",
            description:
                "Encrypted transactions (SSL/TLS Secure payment gateways (e.g., PayPal, Stripe) and Compliant with PCI-DSS standards."
        },
        {
            title: "Dispute Resolution",
            description:
                "<ul>" +
                "<li>Buyers and sellers are encouraged to resolve disputes amicably. If disputes cannot be resolved, contact our support team for assistance via email, phone calls, or messaging.</li>" +
                "<li>Kudu Mart reserves the right to mediate and make final decisions on disputes with resolution timeline which shall not be less than 30 days effective from the date first sat except otherwise agreed by the parties.</li>" +
                "</ul>"
        },
        {
            title: "Intellectual Property Protection",
            description:
                "<p><strong>Kudu Mart owns all rights to its trademarks, logos, and content.</strong></p>" +
                "<p>Users may not copy, distribute, or use Kudu Mart’s intellectual property without permission.</p>" +
                "<ul>" +
                "<li><strong>Strict Copyright Policies:</strong> Kudu Mart is committed to protecting intellectual property rights and enforces strict copyright infringement policies.</li>" +
                "<li><strong>Removal of Infringing Content:</strong> Any content or products that infringe on third-party intellectual property rights will be promptly removed upon notification or discovery.</li>" +
                "<li><strong>Cooperation with Rights Holders:</strong> Kudu Mart collaborates with rights holders to address copyright violations and takes necessary actions, including account suspension or termination for repeat offenders.</li>" +
                "</ul>"
        },
        {
            title: "Limitation of Liability",
            description:
                "Kudu Mart is not responsible for any dispute, loss, or damage resulting from user actions or transactions outside the platform."
        },
        {
            title: "Termination of Use",
            description:
                "Kudu Mart reserves the right to suspend or terminate your account if you violate these Terms and Conditions."
        },
        {
            title: "Changes to Terms & Conditions",
            description:
                "We may update these Terms and Conditions at any time. Changes will be posted on this page, and your continued use of our platform and service signifies your acceptance of the updated terms."
        }
    ];

    return (
        <>
            <div className="w-full flex flex-col">
                <section className="breadcrumb" style={{
                    backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738012617/image_3_ij6lwh.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}>
                    <div className="flex flex-col py-12">
                        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
                            <h1 className="text-4xl font-bold">Terms and Conditions</h1>
                        </div>
                    </div>
                </section>
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="">
                        {/* Intro Section */}
                        <div className="mt-14 mb-8">
                            <p className="text-black text-lg mb-16">
                                Welcome to Kudu Mart, by using our platform, you agree to comply with these Terms and Conditions. Please read them carefully as they govern your access to and use of Kudu Mart’s services.
                            </p>
                        </div>

                        {/* Principles Section */}
                        <div className="bg-white rounded-lg py-10">
                            {principles.map((principle, index) => (
                                <div
                                    key={index}
                                    className={`border-b pb-6 mb-6 ${index === principles.length - 1 ? "border-b-0 mb-0 pb-0" : ""}`}
                                >
                                    <h3 className="text-lg font-semibold text-black mb-4">
                                        {index + 1}. {principle.title}
                                    </h3>
                                    <p className="text-black leading-9" dangerouslySetInnerHTML={{ __html: principle.description }}></p>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>

    );
};

export default Conditions;
