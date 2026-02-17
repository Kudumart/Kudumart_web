import "../Home/components/style.css";


const Cookies = () => {
    const principles = [
        {
            title: "Return & Refund Policy",
            description:
                "<p>At Kudu Mart, we strive to ensure customer satisfaction by offering a fair and transparent Return and Refund Policy. If you are not satisfied with the item you bought on Kudu Mart, please read the terms below carefully to understand your rights and responsibilities regarding how to return the item and request a refund.</p>"
        },
        {
            title: "1. What is the time frame I have to make a return?",
            description:
                "<p>Customers have <strong>12</strong> to <strong>24</strong> hours after delivery to indicate if they wish to return the item they purchased. Products must then be returned within <strong>7 days</strong> of the delivery date and must be unused, in their original packaging, and in the same condition as when delivered.</p>"
        },
        {
            title: "2. Non-Returnable Items",
            description:
                "<p>The following items cannot be returned:</p>" +
                "<ul>" +
                "<li>Grocery items and food items.</li>" +
                "<li>Customized or personalized products.</li>" +
                "<li>A few health and personal care products.</li>" +
                "<li>Items marked as “final sale” or “non-returnable” at the time of purchase.</li>" +
                "</ul>"
        },
        {
            title: "3. How do I make a return?",
            description:
                "<ol>" +
                "<li><strong>Initiate a Return:</strong>" +
                "<ul>" +
                "<li>Log in to your account on the Kudu Mart website or mobile application and navigate to your profile.</li>" +
                "<li>Select the item you wish to return in ‘Order’ and click the ‘Return/Refund’ button.</li>" +
                "<li>Select the reason for returning the item. Based on the reason you choose, you might need to supply additional details concerning the order. Once you’ve filled in the necessary details, press the ‘Submit’ button.</li>" +
                "</ul>" +
                "</li>" +
                "<li><strong>Approval:</strong>" +
                "<ul>" +
                "<li>Once the return request is reviewed, you will receive instructions for shipping the item back.</li>" +
                "</ul>" +
                "</li>" +
                "<li><strong>Shipping the Item:</strong>" +
                "<ul>" +
                "<li>Return shipping costs are the responsibility of the buyer or seller, depending on the nature of the return (e.g., defective product, incorrect item).</li>" +
                "<li>We offer the option for you to send the item back yourself. You may choose any courier to send back the items. Once you return the items, kindly include the package’s tracking details.</li>" +
                "</ul>" +
                "</li>" +
                "</ol>"
        },
        {
            title: "4. Refunds",
            description:
                "<ul>" +
                "<li>Refunds are processed within <strong>5-7 business days</strong> of receiving the returned item and verifying its condition.</li>" +
                "<li>Refunds will be issued to the original payment method used for the purchase.</li>" +
                "<li>Shipping fees are non-refundable unless the return is due to a mistake or defect in the product.</li>" +
                "</ul>"
        },
        {
            title: "5. Return Shipping Costs",
            description:
                "<ul>" +
                "<li>If the return is due to an error on the seller’s part (e.g., defective or incorrect item), the seller will cover the return shipping cost.</li>" +
                "<li>If the return is due to the buyer’s discretion (e.g., no longer needed or wanted), the buyer will cover the return shipping cost.</li>" +
                "</ul>"
        },
        {
            title: "6. Dispute Resolution",
            description:
                "<p>If there are disagreements regarding returns or refunds, Kudu Mart offers a neutral dispute resolution process to mediate and resolve conflicts fairly.</p>"
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
                            <h1 className="text-4xl font-bold">Return Policy</h1>
                        </div>
                    </div>
                </section>
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="">
                        {/* Intro Section */}
                        <div className="mt-14">
                            <p className="text-black text-base leading-8">
                            At Kudu Mart, we strive to ensure customer satisfaction by offering a fair and transparent Return and Refund Policy. If you are not satisfied with the item you bought on Kudu Mart, please read the terms below carefully to understand your rights and responsibilities regarding how to return the item and request a refund.
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

export default Cookies;
