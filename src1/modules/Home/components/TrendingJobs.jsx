import { Link } from "react-router-dom";
import JobItem from "../../../components/JobItem";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import Loader from "../../../components/Loader";

const TrendingJobs = (props) => {
  const query = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      let resp = await apiClient.get("/fetch/jobs");
      return resp.data;
    },
  });
  if (query.isFetching)
    return (
      <>
        {" "}
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      </>
    );
  if (query.isError) return <>Error fetching jobs</>;
  const jobs = query.data?.data;

  const filteredJobs =
    jobs?.filter((job) =>
      `${job.title} ${job.location} ${job.type}`.toLowerCase(),
    ) || [];
  return (
    <div className="w-full">
      <div className="bg-[#192D4C] w-full flex justify-between p-6 rounded-md mb-10 cursor-pointer">
        <h2 className="text-lg text-white font-semibold">Trending Jobs</h2>
        <Link to={"/career"} className="text-white font-semibold">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => <JobItem job={job} key={index} />)
        ) : (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default TrendingJobs;
