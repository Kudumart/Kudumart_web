import React from "react";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const JobItem = ({ job }) => {
  return (
    <div className="border rounded-lg shadow-md bg-white">
      <div className="w-full px-4 pt-2">
        <div className="w-full to-black-900 rounded-md text-white px-4 py-12"
          style={{
            backgroundImage: `
          url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1737204832/kuduMart/Group_1321314866_fiej2r.jpg)
          `,
            backgroundBlendMode: "overlay",
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100%",

          }}></div>
      </div>
      <div className="px-7 py-4">
      <h3 className="text-lg font-semibold leading-loose">{job.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-500 my-2 leading-loose">
        <FaMapMarkerAlt className="text-orange-500" />
        <span className="text-orange-500 leading-loose">{job.location}</span>
        <FaClock className="text-blue-500 ml-4" />
        <span className="text-blue-500 leading-loose">{job.jobType}</span>
      </div>

      <div
        className="text-sm text-gray-700 leading-loose"
        dangerouslySetInnerHTML={{ __html: `${job?.description.slice(0, 200)}...` }}
      ></div>

      <button className="border w-full mt-4 py-4 rounded-lg text-sm hover:bg-gray-100">
        <Link to={`/jobs-details/${job.id}`}>View Job Details</Link>
      </button>
    </div>
    </div>
  );
};

export default JobItem;
