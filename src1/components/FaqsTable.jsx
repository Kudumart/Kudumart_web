import React from "react";
import ReviewTable from "./ReviewTable";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";

const FaqsTable = ({ 
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
    { key: "category", label: "Category" },
    { key: "question", label: "Question" },
    { key: "answer", label: "Answer" },
    { key: "actions", label: "Actions" }
  ];

  const renderRow = (item) => ({
    category: (
      <span className="text-sm font-medium">
        {item?.faqCategory?.name || "N/A"}
      </span>
    ),
    question: (
      <div className="max-w-xs">
        <p className="text-sm font-semibold text-gray-900 line-clamp-3">
          {item?.question}
        </p>
      </div>
    ),
    answer: (
      <div className="max-w-sm">
        <p className="text-sm text-gray-600 line-clamp-3">
          {item?.answer}
        </p>
      </div>
    ),
    actions: (
      <div className="flex items-center gap-3">
        <FaRegEdit
          color="blue"
          size={16}
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onEdit(item)}
          title="Edit FAQ"
        />
        <RiDeleteBin5Line
          color="red"
          size={16}
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => onDelete(item.id)}
          title="Delete FAQ"
        />
      </div>
    )
  });

  const exportData = data?.map(item => ({
    Category: item?.faqCategory?.name || "N/A",
    Question: item?.question || "",
    Answer: item?.answer || "",
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
      searchPlaceholder="Search FAQs..."
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
      exportData={exportData}
      exportFilename="faqs"
      title="FAQ List"
      onAdd={onAdd}
      addButtonText="Add FAQ"
    />
  );
};

export default FaqsTable;
