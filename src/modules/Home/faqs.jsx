import { useState } from "react";
import "./components/style.css";
import ShoppingExperience from "./components/ShoppingExperience";
import GetApp from "./components/GetApp";
import { useGetFaqClient } from "../../api/pages/faqs";
import Loader from "../../components/Loader";

const FAQs = () => {
  const [activeCategory, setActiveCategory] = useState("General");
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faqs, isLoading } = useGetFaqClient();

  if (isLoading)
    return (
      <div className="py-40">
        <Loader />
      </div>
    );

  // Filter categories and questions from API data
  const faqCategories = faqs?.map((faq) => faq.name) || [];

  // Filter questions by active category and search query
  const currentCategoryData = faqs?.find((q) => q.name === activeCategory);

  const filteredQuestions =
    currentCategoryData?.faqs?.filter((q) => {
      const matchesSearch =
        searchQuery.toLowerCase() === "" ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738005374/image_1_zkrcpb.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
            </div>
          </div>
        </section>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full bg-white">
          <div className="w-full flex flex-col md:flex-row gap-8 p-6 Justtttt">
            {/* Categories Sidebar */}
            <div className="w-full md:w-1/4 bg-white shadow rounded-lg p-4">
              <h2 className="font-semibold text-xl py-4 px-5 mb-4">
                Categories
              </h2>
              <ul className="space-y-2">
                {faqCategories.map((category) => (
                  <li
                    key={category}
                    className={`cursor-pointer py-4 px-5 rounded-lg ${activeCategory === category
                        ? "bg-[#FF6F22] text-white"
                        : "text-black hover:bg-[#FF6F22] hover:text-white"
                      }`}
                    onClick={() => {
                      setActiveCategory(category);
                      setExpandedQuestion(null);
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            {/* Questions Section */}
            <div className="w-full md:w-3/4">
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search in frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-lg p-5 w-full bg-gray-50"
                  style={{ outline: "none" }}
                />
              </div>

              {/* Questions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="font-semibold text-xl mb-4">Got Questions?</h2>
                <div className="space-y-4">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => (
                      <div key={q.id} className="border-b pb-4">
                        <div
                          className="flex justify-between items-center cursor-pointer py-4"
                          onClick={() =>
                            setExpandedQuestion(
                              expandedQuestion === q.id ? null : q.id,
                            )
                          }
                        >
                          <p className="text-black font-medium">{q.question}</p>
                          <button className="py-3">
                            {expandedQuestion === q.id ? "-" : "+"}
                          </button>
                        </div>
                        {expandedQuestion === q.id && (
                          <p className="mt-4 text-black font-medium mb-3">
                            {q.answer}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 py-4">
                      No questions found matching your criteria.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          <div className="w-full flex mt-3 Justing">
            <ShoppingExperience />
          </div>
        </div>
        <div
          className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 Amenn"
          style={{
            backgroundImage: `
                    url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1737405367/Frame_1618873123_fy7sgx.png)
                    `,
            backgroundBlendMode: "overlay",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",
          }}
        >
          <div className="w-full flex flex-col gap-5 ">
            <GetApp />
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;
