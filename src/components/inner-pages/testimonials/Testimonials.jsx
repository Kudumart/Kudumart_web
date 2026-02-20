import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import { useDebounce } from "../../../hooks/useDebounce";
import Modal from "../../Modal";
import TestimonialsTable from "../../TestimonialsTable";
import AddTestimonialModal from "./AddTestimonialModal";

const Testimonials = ({ data, refetch, loading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    if (!debouncedSearchQuery.trim()) {
      return data;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return data.filter(item => 
      item?.name?.toLowerCase().includes(query) ||
      item?.position?.toLowerCase().includes(query) ||
      item?.message?.toLowerCase().includes(query)
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

  const handleCreateModal = (item = null) => {
    openModal({
      size: "sm",
      content: (
        <AddTestimonialModal
          refetch={refetch}
          closeModal={closeModal}
          selectedItem={item}
        />
      ),
    });
  };

  const handleDeleteModal = (id) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to delete this testimonial?`}
          redirect={refetch}
          api={`/admin/testimonial?id=${id}`}
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

  const handleEdit = (item) => {
    const newUrl = `${location.pathname}?id=${item.id}`;
    navigate(newUrl, { replace: true });
    handleCreateModal(item);
  };

  useEffect(() => {
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <TestimonialsTable
        data={paginatedData}
        onEdit={handleEdit}
        onDelete={handleDeleteModal}
        onAdd={() => {
          handleCreateModal();
          window.history.replaceState({}, "", window.location.pathname);
        }}
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

export default Testimonials;
