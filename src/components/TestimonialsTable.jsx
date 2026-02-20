import React from "react";
import ReviewTable from "./ReviewTable";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

const TestimonialsTable = ({ 
  data, 
  onEdit, 
  onDelete, 
  onAdd,
  loading,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) => {
  const columns = [
    { key: "photo", label: "Photo" },
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    { key: "message", label: "Message" },
    { key: "actions", label: "Actions" }
  ];

  const renderRow = (item) => ({
    photo: (
      <div className="flex items-center">
        <img
          src={item.photo}
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
      </div>
    ),
    name: (
      <span className="text-sm font-semibold text-gray-900">
        {item.name}
      </span>
    ),
    position: (
      <span className="text-sm text-orange-500">
        {item.position}
      </span>
    ),
    message: (
      <div className="max-w-xs">
        <div 
          className="text-sm text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: item?.message || "" }}
        />
      </div>
    ),
    actions: (
      <div className="flex items-center gap-3">
        <FaRegEdit
          color="blue"
          size={16}
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onEdit(item)}
          title="Edit Testimonial"
        />
        <RiDeleteBin5Line
          color="red"
          size={16}
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onDelete(item.id)}
          title="Delete Testimonial"
        />
      </div>
    )
  });

  const exportData = data?.map(item => ({
    Name: item.name || "",
    Position: item.position || "",
    Message: item.message?.replace(/<[^>]*>/g, "") || "", // Strip HTML for export
    "Created At": new Date(item?.createdAt).toLocaleDateString()
  }));

  return (
    <ReviewTable
      columns={columns}
      data={data}
      renderRow={renderRow}
      loading={loading}
      disableInternalSearch={true}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search testimonials..."
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
      exportData={exportData}
      exportFilename="testimonials"
      title="Testimonial List"
      onAdd={onAdd}
      addButtonText="Add Testimonial"
    />
  );
};

export default TestimonialsTable;
