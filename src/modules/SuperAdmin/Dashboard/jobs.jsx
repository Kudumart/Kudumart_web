import React from "react";
import Loader from "../../../components/Loader";
import JobList from "../../../components/jobs/JobList";
import { useGetAdminJobs } from "../../../api/jobs";

const JobsManagement = () => {
  const { data: jobs, isLoading, refetch } = useGetAdminJobs();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <div className="text-center">
              <Loader />
              <p className="text-gray-600 mt-4">Loading job data...</p>
            </div>
          </div>
        ) : (
          <JobList data={jobs} refetch={() => refetch()} loading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default JobsManagement;
