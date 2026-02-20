import { FaSearch, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./components/style.css";
import ShoppingExperience from "./components/ShoppingExperience";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetJobClient } from "../../api/jobs";
import Loader from "../../components/Loader";
import JobItem from "../../components/JobItem";

export default function JobListings() {
  const { data: jobs, isLoading } = useGetJobClient();

  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading)
    return (
      <div className="py-40">
        <Loader />
      </div>
    );

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.location} ${job.type}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/ddj0k8gdw/image/upload/v1738838887/image_1_swhdte.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Kudu Careers</h1>
            </div>
          </div>
        </section>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap- gap-5 h-full">
          <div className="Justing">
            {/* Header */}
            <h2 className="text-center text-xl md:text-2xl font-semibold mb-6">
              Browse through our Job Opportunities here at Kudu
            </h2>

            {/* Search Bar */}
            <div className="flex items-center bg-white border rounded-lg p-4 mb-6 max-w-lg mx-auto">
              <FaSearch className="text-gray-500 ml-2" />
              <input
                type="text"
                placeholder="Search available jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-hidden px-3 py-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <JobItem job={job} key={index} />
                ))
              ) : (
                <p className="text-center text-gray-500">No jobs found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 bg-white h-full">
          <div className="w-full flex mt-3">
            <ShoppingExperience />
          </div>
        </div>
      </div>
    </>
  );
}
