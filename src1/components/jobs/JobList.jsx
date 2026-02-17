import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";

import { FaClock, FaMapMarkerAlt, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import AddJobModal from "./AddJobModal";
import { useModal } from "../../hooks/modal";
import { useDebounce } from "../../hooks/useDebounce";
import JobsTable from "../JobsTable";
import Modal from "../Modal";

const JobList = ({ data, refetch, loading }) => {
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
      item?.title?.toLowerCase().includes(query) ||
      item?.location?.toLowerCase().includes(query) ||
      item?.jobType?.toLowerCase().includes(query) ||
      item?.description?.toLowerCase().includes(query)
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
        <AddJobModal 
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
          title={`Do you wish to delete this job?`}
          text="Note: All jobs applications would be deleted alongside"
          redirect={refetch}
          api={`/admin/job/delete?jobId=${id}`}
          method={"DELETE"}
        />
      ),
    });
  };

  const handleDeactivateModal = (id) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to close this job?`}
          redirect={refetch}
          api={`/admin/job/close?jobId=${id}`}
          method={"PATCH"}
        />
      ),
    });
  };

  const handleRepostModal = (id) => {
    openModal({
      size: "sm",
      content: (
        <Modal
          title={`Do you wish to repost this job?`}
          redirect={refetch}
          body={{ jobId: id }}
          api={`/admin/job/repost`}
          method={"POST"}
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
    <div className="space-y-6">
      <JobsTable
        data={paginatedData}
        onEdit={handleEdit}
        onDelete={handleDeleteModal}
        onDeactivate={handleDeactivateModal}
        onRepost={handleRepostModal}
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

export default JobList;
