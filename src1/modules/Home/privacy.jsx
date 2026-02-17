import { useState } from "react";
import "../Home/components/style.css";

const Privacy = () => {
  const principles = [
    {
      title: "Customer Protection",
      description:
        "We prioritize safeguarding user information, ensuring secure transactions and protecting customers from fraudulent activities.",
    },
    {
      title: "Quality Assurance",
      description:
        "We verify seller authenticity, product legitimacy and ensure compliance with industry standards to maintain high-quality products and services.",
    },
    {
      title: "Transparency",
      description:
        "We provide clear policies, accurate product descriptions, timely communication and transparent business practices to foster trust.",
    },
    {
      title: "Fairness",
      description:
        "We ensure equal opportunities for sellers and fair pricing for buyers, promoting a level playing field.",
    },
    {
      title: "Accountability",
      description:
        "We take responsibility for resolving disputes, enforcing policies and continually improving our platform where necessary.",
    },
  ];

  const policies = [
    {
      title: "Refund and Return Policy",
      description:
        "At Kudu Mart Ltd, we run a 30-day money-back guarantee , All  Refunds are processed within 5-7 business days while Return shipping costs are borne by buyer/seller (as applicable)",
    },
    {
      title: "Product Authenticity",
      description:
        "Sellers guarantee product authenticity and must comply with trademark laws.",
    },
    {
      title: "Accurate Descriptions",
      description:
        "Seller must ensure accurate product information, including images, specifications.",
    },
  ];

  const buyers = [
    {
      title: "Account Security",
      description:
        " Buyers maintains secure account information, passwords, etc",
    },
    {
      title: "Payment Terms",
      description:
        "Buyers agree to payment terms, including pricing, shipping costs.",
    },
  ];

  const disputes = [
    {
      title: "Customer Support",
      description:
        "Dedicated support team available via email, phone calls, messaging.",
    },
    {
      title: "Mediation",
      description:
        "Neutral dispute resolution process, with resolution timeline which shall not be less than 90days effective from the date first sat except otherwise agreed by the parties.",
    },
  ];

  const amendments = [
    {
      description:
        "We reserve the right to update policies as needed without prior consent from the public and all changes effective upon posting.",
    },
  ];

  const acceptances = [
    {
      title: "Shipping Policy",
      description:
        " Estimated delivery timeline ranges: 3-7 business days depending on location. Tracking information are provided by the company. All Shipping costs calculated based on weight and destination",
    },
    {
      title: "Payment Security",
      description:
        "Encrypted transactions (SSL/TLS Secure payment gateways (e.g., PayPal, Stripe) and Compliant with PCI-DSS standards",
    },

    {
      title: "Intellectual Property Protection",
      description:
        "Strict copyright infringement policies ,  Removal of infringing content/products , Cooperation with rights holders",
    },
  ];

  const users = [
    {
      title: "Prohibited activities",
      description: " Spamming , Harassment , Illegal activities",
    },
    {
      title: "Consequences",
      description: "Account suspension/termination",
    },
  ];

  const sellers = [
    {
      title: "Verification",
      description:
        "Sellers provide valid government-issued ID, Business registration documents (like CAC or as applicable)",
    },
  ];

  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738008968/image_2_mvgdxh.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Privacy Policy </h1>
            </div>
          </div>
        </section>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
          <div className="">
            {/* Intro Section */}
            <div className="text-center mt-14 mb-8">
              <p className="text-black text-lg mb-16">
                At KUDU, we prioritise trust, safety, and customer satisfaction.
                Our policies ensure a secure and enjoyable shopping experience
                for all users.
              </p>
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4">
                Our Core Principles
              </h2>
            </div>

            {/* Principles Section */}
            <div className="bg-white rounded-lg py-10">
              {principles.map((principle, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === principles.length - 1
                      ? "border-b-0 mb-0 pb-0"
                      : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {principle.title}
                  </h3>
                  <p className="text-black">{principle.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Key Policies
              </h2>
            </div>
            {/*  Key Policies Section */}
            <div className="bg-white rounded-lg py-10">
              {policies.map((policie, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === policie.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {policie.title}
                  </h3>
                  <p className="text-black">{policie.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Buyer Responsibilities
              </h2>
            </div>
            {/* Buyer Responsibilities Section */}
            <div className="bg-white rounded-lg py-10">
              {buyers.map((buyer, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === buyer.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {buyer.title}
                  </h3>
                  <p className="text-black">{buyer.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Dispute Resolution
              </h2>
            </div>
            {/* Dispute Resolution Section */}
            <div className="bg-white rounded-lg py-10">
              {disputes.map((dispute, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === dispute.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {dispute.title}
                  </h3>
                  <p className="text-black">{dispute.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Amendments and Updates
              </h2>
            </div>
            {/*Amendments and Updates Section */}
            <div className="bg-white rounded-lg py-10">
              {amendments.map((amendment, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === amendment.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <p className="text-black">{amendment.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Acceptance
              </h2>
            </div>
            {/*Acceptance Section */}
            <div className="bg-white rounded-lg py-10">
              {amendments.map((amendment, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === amendment.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <p className="text-black">{amendment.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Acceptance
              </h2>
            </div>
            {/*Acceptance Section */}
            <div className="bg-white rounded-lg py-10">
              <p className="text-black mb-8">
                By using [Kudu Mart Platform] users agree to these policies as
                contained herein.
              </p>
              {acceptances.map((acceptance, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === acceptance.length - 1
                      ? "border-b-0 mb-0 pb-0"
                      : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {acceptance.title}
                  </h3>
                  <p className="text-black">{acceptance.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                User Conduct
              </h2>
            </div>
            {/* User Conduct and Updates Section */}
            <div className="bg-white rounded-lg py-10">
              {users.map((user, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === user.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {user.title}
                  </h3>
                  <p className="text-black">{user.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-black  bg-[#FFF2EA] py-4 mb-4 capitalize">
                Seller Requirements
              </h2>
            </div>
            {/*  Seller Requirements and Updates Section */}
            <div className="bg-white rounded-lg py-10">
              {sellers.map((seller, index) => (
                <div
                  key={index}
                  className={`border-b pb-6 mb-6 ${
                    index === seller.length - 1 ? "border-b-0 mb-0 pb-0" : ""
                  }`}
                >
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {index + 1}. {seller.title}
                  </h3>
                  <p className="text-black">{seller.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Privacy;
