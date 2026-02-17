import "../Home/components/style.css";


const Cookies = () => {
    const principles = [
        {
            title: "Cookies Policy",
            description:
                "<p>At Kudu Mart, cookies are used to improve your browsing experience and ensure the smooth functioning of our e-commerce marketplace. This cookies policy helps explain to you what cookies are, how we use them, and how you can manage your preferences.</p>" +
                "<p><strong>What are cookies?</strong> Whenever you use your device to browse our website, small text files are stored on your device. These text files are called cookies. They aid websites to recognize your device, remember your preferences, and generate a more personalized experience.</p>"
        },
        {
            title: "Types of Cookies",
            description:
                "<ol>" +
                "<li><strong>Essential Cookies:</strong> These are cookies our website needs for basic operations, such as browsing our platform, logging into your account, and completing your secure transactions.</li>" +
                "<li><strong>Performance Cookies:</strong> These cookies assist us in understanding how our visitors make use of our website, thereby helping us to improve the website’s performance and user experience.</li>" +
                "<li><strong>Functional Cookies:</strong> These cookies help us remember your preferences, such as language selection or items you add to your cart, to provide a smoother shopping experience.</li>" +
                "<li><strong>Advertising Cookies:</strong> These are cookies that enable us to show you personalized advertisements based on your browsing history and preferences.</li>" +
                "</ol>"
        },
        {
            title: "Why Do We Use Cookies Here at Kudu Mart?",
            description:
                "<p>Cookies help us:</p>" +
                "<ul>" +
                "<li>Provide secure and smooth transactions through encrypted transaction payment gateways.</li>" +
                "<li>Suggest personalized recommendations for products and auctions to our visitors.</li>" +
                "<li>Analyze our website traffic and improve the performance of our platform.</li>" +
                "<li>Display relevant advertisements tailored to your interests.</li>" +
                "</ul>"
        },
        {
            title: "Managing Your Cookies Preference",
            description:
                "<p>You have the right to control how cookies are used on our website through your browser settings. Most browsers will allow you to block cookies, delete existing cookies, and set preferences for specific websites.</p>" +
                "<p>Here's how to manage cookies in popular browsers:</p>" +
                "<ul>" +
                "<li>Google Chrome: <a href='#'>Manage Cookies</a></li>" +
                "<li>Mozilla Firefox: <a href='#'>Manage Cookies</a></li>" +
                "<li>Safari: <a href='#'>Manage Cookies</a></li>" +
                "<li>Microsoft Edge: <a href='#'>Manage Cookies</a></li>" +
                "</ul>" +
                "<p><strong>Please note:</strong> Disabling cookies may affect features like logging in or completing purchases while accessing our website.</p>"
        },
        {
            title: "Third-Party Cookies",
            description:
                "<p>Our marketplace, Kudu Mart, may work with some trusted third-party services that also use cookies. These third-party cookies help us track our website performance and suggest relevant ads of your interests. The cookies also help us in preventing fraudulent activities and enhance the security of our marketplace.</p>"
        },
        {
            title: "Updates to this Policy",
            description:
                "<p>At Kudu Mart, we reserve the right to update this Cookies Policy when necessary to reflect changes in our practices and for legal compliance. If changes are made, they will be posted on this page and become effective upon posting.</p>"
        },
        {
            title: "Contact Us",
            description:
                "<p>If you have any questions or wish to express a concern about our cookies policy, feel free to reach out to us at:</p>" +
                "<p>Email: <a href='mailto:info@kudumart.com'>info@kudumart.com</a></p>"
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
                            <h1 className="text-4xl font-bold">Cookies Policy </h1>
                        </div>
                    </div>
                </section>
                <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
                    <div className="">
                        {/* Intro Section */}
                        <div className="mt-14">
                            <p className="text-black text-base leading-8">
                                At Kudu Mart, cookies are used to improve your browsing experience and ensure the smooth functioning of our e-commerce marketplace. This cookies policy helps explain to you, what cookies are, how we use them, and how you can manage your preferences.
                                What are cookies? Whenever you use your device to browse our website, small text files are stored on your device. These text files are called cookies. They aid websites to recognize your device, remember your preferences, and generate a more personalized experience.
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
