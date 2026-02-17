import React from "react";
import ReviewTable from "./ReviewTable";
import { FaMapMarkerAlt, FaClock, FaEdit, FaTrash, FaEye, FaPause, FaPlay, FaBriefcase } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const JobsTable = ({ 
  data, 
  onEdit, 
  onDelete, 
  onAdd,
  onDeactivate,
  onRepost,
  loading,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) => {
  const navigate = useNavigate();
  
  const columns = [
    { 
      key: "title", 
      label: "Job Title",
      className: "min-w-[200px] w-[25%]",
      render: (value, item) => (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center shrink-0">
            <FaBriefcase className="text-orange-600 text-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {item.title}
            </h3>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs text-gray-500">
                ID: {item.id}
              </p>
              {/* Show location and job type on mobile when hidden */}
              <div className="flex flex-wrap gap-2 sm:hidden">
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  <FaMapMarkerAlt className="text-orange-500 text-xs" />
                  {item.location}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                  <FaBriefcase className="text-blue-500 text-xs" />
                  {item.jobType || "N/A"}
                </span>
              </div>
              {/* Show date on mobile when hidden */}
              <div className="sm:hidden">
                <span className="text-xs text-gray-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short', 
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: "jobType", 
      label: "Job Type",
      className: "min-w-[120px] w-[15%] hidden sm:table-cell",
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <FaBriefcase className="text-blue-500 text-xs" />
          </div> */}
          <span className="text-sm text-gray-700 font-medium capitalize">
            {item.jobType || "N/A"}
          </span>
        </div>
      )
    },
    { 
      key: "location", 
      label: "Location",
      className: "min-w-[120px] w-[15%] hidden sm:table-cell",
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
            <FaMapMarkerAlt className="text-orange-500 text-xs" />
          </div>
          <span className="text-sm text-gray-700 font-medium">{item.location}</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status",
      className: "min-w-[100px] w-[15%]",
      render: (value, item) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg border-2 ${
            item.status?.toLowerCase() === "active" 
              ? "bg-green-50 text-green-800 border-green-300 shadow-sm" 
              : item.status?.toLowerCase() === "closed" || item.status?.toLowerCase() === "inactive"
              ? "bg-red-50 text-red-800 border-red-300 shadow-sm"
              : item.status?.toLowerCase() === "paused" || item.status?.toLowerCase() === "pending"
              ? "bg-yellow-50 text-yellow-800 border-yellow-300 shadow-sm"
              : "bg-gray-50 text-gray-800 border-gray-300 shadow-sm"
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              item.status?.toLowerCase() === "active" 
                ? "bg-green-600" 
                : item.status?.toLowerCase() === "closed" || item.status?.toLowerCase() === "inactive"
                ? "bg-red-600"
                : item.status?.toLowerCase() === "paused" || item.status?.toLowerCase() === "pending"
                ? "bg-yellow-600"
                : "bg-gray-600"
            }`}></div>
            <span className="capitalize font-bold">
              {item.status || "Unknown"}
            </span>
          </span>
        </div>
      )
    },
    { 
      key: "description", 
      label: "Description",
      className: "min-w-[300px] w-[30%]",
      render: (value, item) => {
        const cleanText = item?.description?.replace(/<[^>]*>/g, "") || "No description available";
        const truncatedText = cleanText.length > 100 ? cleanText.slice(0, 100) + "..." : cleanText;
        
        return (
          <div className="max-w-md pr-4">
            <div className="relative group">
              <div 
                className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                title={cleanText}
              >
                {truncatedText}
              </div>
            </div>
          </div>
        );
      }
    }
  ];


  const actions = [
    {
      label: () => (
        <div className="flex items-center gap-2">
          <FaEdit className="text-blue-500" />
          <span>Edit</span>
        </div>
      ),
      onClick: (row) => onEdit(row),
      className: "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
    },
    {
      label: () => (
        <div className="flex items-center gap-2">
          <FaTrash className="text-red-500" />
          <span>Delete</span>
        </div>
      ),
      onClick: (row) => onDelete(row.id),
      className: "text-red-600 hover:text-red-800 hover:bg-red-50"
    },
    {
      label: (row) => (
        <div className="flex items-center gap-2">
          {row.status === "active" ? (
            <>
              <FaPause className="text-orange-500" />
              <span>Close Job</span>
            </>
          ) : (
            <>
              <FaPlay className="text-green-500" />
              <span>Repost Job</span>
            </>
          )}
        </div>
      ),
      onClick: (row) => row.status === "active" ? onDeactivate(row.id) : onRepost(row.id),
      className: (row) => row.status === "active" 
        ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50" 
        : "text-green-600 hover:text-green-800 hover:bg-green-50"
    },
    {
      label: () => (
        <div className="flex items-center gap-2">
          <FaEye className="text-purple-500" />
          <span>View Applicants</span>
        </div>
      ),
      onClick: (row) => navigate(`applicants/${row.id}`),
      className: "text-purple-600 hover:text-purple-800 hover:bg-purple-50"
    }
  ];

  const exportData = data?.map(item => ({
    "Job Title": item.title || "",
    "Job Type": item.jobType || "",
    Location: item.location || "",
    Status: item.status || "",
    Description: item.description?.replace(/<[^>]*>/g, "").slice(0, 100) + (item.description?.replace(/<[^>]*>/g, "").length > 100 ? "..." : "") || "", // Strip HTML and limit to 100 chars for export
    "Job ID": item.id || ""
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      <div className="px-6 py-5 bg-linear-to-r from-orange-50 via-orange-100 to-orange-50 border-b-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaBriefcase className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Job Management</h2>
              <p className="text-sm text-gray-600">Manage all job postings and applications</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 bg-white px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm">
            <FaBriefcase className="text-orange-500 text-base" />
            <span className="font-semibold">{totalItems || data?.length || 0} Total Jobs</span>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <ReviewTable
          columns={columns}
          data={data}
          actions={actions}
          loading={loading}
          disableInternalSearch={true}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder="Search jobs by title, location, or type..."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          exportData={exportData}
          exportFilename="jobs-list"
          title=""
          onAdd={onAdd}
          addButtonText="Create New Job"
          className="border-0 shadow-none"
        />
      </div>
    </div>
  );
};

export default JobsTable;
