import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import { useDebounce } from "../../../hooks/useDebounce";
import Modal from "../../Modal";
import FaqsTable from "../../FaqsTable";
import AddFaqModal from "./AddFaqModal";

const Faqs = ({ data, refetch, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { openModal } = useModal();

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    if (!debouncedSearchQuery.trim()) {
      return data;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return data.filter(item => 
      item?.question?.toLowerCase().includes(query) ||
      item?.answer?.toLowerCase().includes(query) ||
      item?.faqCategory?.name?.toLowerCase().includes(query)
    );
  }, [data, debouncedSearchQuery]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleCreateModal = (item) => {
    openModal({
      size: "sm",
      content: (
        <AddFaqModal
          selectedItem={item}
          data={data}
          redirect={refetch}
        />
      ),
    });
  };

  const handleDeleteModal = (id) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to delete this FAQ?`}
          redirect={refetch}
          api={`/admin/faq?id=${id}`}
          method={"DELETE"}
        />
      ),
    });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen p-6">
      <FaqsTable
        data={paginatedData}
        onEdit={handleCreateModal}
        onDelete={handleDeleteModal}
        onAdd={() => handleCreateModal(null)}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredData.length}
      />
    </div>
  );
};

export default Faqs;
