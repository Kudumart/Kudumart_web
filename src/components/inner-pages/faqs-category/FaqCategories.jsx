import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import Modal from "../../Modal";
import AddFaqCategoryModal from "./AddFaqCategoryModal";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import ReviewTable from "../../ReviewTable";

const FaqCategories = ({ data, refetch }) => {
  const [selectedItem, setselectedItem] = useState(null);

  const { openModal } = useModal();

  const handleRedirect = () => {
    refetch();
  };

  const handleCreateModal = (item) => {
    openModal({
      size: "sm",
      content: (
        <AddFaqCategoryModal
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
          title={`Do you wish to delete this category?`}
          redirect={refetch}
          api={`/admin/faq/category?id=${id}`}
          method={"DELETE"}
        />
      ),
    });
  };

  const columns = [
    { key: 'name', label: 'Category Name' }
  ];

  const actions = [
    {
      label: () => "Edit",
      onClick: (row) => handleCreateModal(row)
    },
    {
      label: () => "Delete",
      onClick: (row) => handleDeleteModal(row.id)
    }
  ];

  return (
    <>
      <div className="All">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">
            FAQ Categories
          </h2>
          <button
            onClick={() => handleCreateModal(null)}
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 text-center inline-block"
          >
            Add New Category
          </button>
        </div>
        <div className="bg-white rounded-md w-full gap-5">
          <ReviewTable
            title="FAQ Categories"
            columns={columns}
            data={data || []}
            allData={data || []}
            exportData={true}
            isLoading={false}
            hasNumber={true}
            actions={actions}
          />
        </div>
      </div>
    </>
  );
};

export default FaqCategories;
