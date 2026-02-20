//@ts-nocheck

import { useState } from "react";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import { useEffect } from "react";
import ProductCategoriesTable from "../../../components/ProductCategoriesTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import CustomTable, { columnType } from "../../../components/CustomTable";
import { usePagination } from "../../../hooks/appState";
import { Minus, Plus } from "lucide-react";
import { SimplePagination } from "../../../components/SimplePagination";
import { useParams } from "react-router-dom";
import { useReModal } from "../../../hooks/new_hooks";
import ReModal from "../../../components/ReModal";
import DropZone from "../../../components/DropZone";
import { toast } from "react-toastify";
import { formatDate } from "date-fns";
interface ServiceCategory {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}
interface ServiceCategoriesResponse {
  data: ServiceCategory[];
}
export default function ServiceSubCategories() {
  const { id } = useParams();
  const paginate = usePagination();
  const { modalRef: modalRef, openModal, closeModal } = useReModal();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ServiceCategory | null>(null);
  const {
    modalRef: editModalRef,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useReModal();
  const categories = useQuery<ServiceCategoriesResponse>({
    queryKey: ["service-sub-categories", paginate.params, id],
    queryFn: async () => {
      let resp = await apiClient.get(`/service/subcategories/${id}`, {
        params: paginate.params,
      });
      return resp.data;
    },
  });
  const add_category = useMutation({
    mutationFn: async (data: { name: string; image: string | null }) => {
      let resp = await apiClient.post("/admin/service/subcategories", {
        ...data,
        categoryId: id,
      });
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Category added successfully");
      categories.refetch();
      closeModal();
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const delete_category = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.delete(`/admin/service/subcategories/${id}`);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      categories.refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const edit_category = useMutation({
    mutationFn: async (item: ServiceCategory) => {
      let resp = await apiClient.put(
        `/admin/service/subcategories/${item.id}`,
        {
          ...editItem,
          categoryId: id,
        },
      );
      return resp.data;
    },
    onSuccess: () => {
      toast.success("sub category edited successfully");
      closeEditModal();

      categories.refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const total = categories?.data?.data?.length || 0;
  const actions: Actions<ServiceCategory> = [
    {
      label: "Edit",
      key: "edit-item",
      action: (item) => {
        setEditItem(item);
        openEditModal();
      },
    },
    {
      label: "Delete",
      key: "delete-item",
      action: (item) => {
        if (delete_category.isPending) {
          toast.error("Category is being deleted");
          return;
        }
        delete_category.mutate(item.id);
      },
    },
  ];
  const columns: columnType<ServiceCategory>[] = [
    // { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "image",
      label: "Image",
      render: (item) => (
        <img
          src={item?.image || ""}
          alt={item?.name}
          className="w-10 h-10 object-cover rounded-md"
        />
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item, row) => {
        const date = new Date(item);
        return <>{date.toLocaleDateString()}</>;
      },
    },
    {
      key: "updatedAt",
      label: "Updated At",
      render: (item, row) => {
        const date = new Date(item);
        return <>{date.toLocaleDateString()}</>;
      },
    },
  ];
  return (
    <div className="min-h-screen p-4 bg-base-100" id="root" data-theme="kudu">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-3">
          Service SubCategories{" "}
          <span>
            {categories.isFetching && (
              <>
                <div className="loading text-primary"></div>
              </>
            )}
            {categories.isError && (
              <>
                <div className="ml-2 ">
                  <button
                    onClick={() => categories.refetch()}
                    className="btn btn-accent"
                  >
                    reload
                  </button>
                </div>
              </>
            )}
          </span>
        </h2>

        <button className="btn btn-primary" onClick={openModal}>
          Add Category
        </button>
      </div>
      <div className="overflow-x-scroll">
        <CustomTable
          actions={actions}
          columns={columns}
          data={categories.data?.data || []}
        />
      </div>
      <SimplePagination paginate={paginate} total={total} />
      <ReModal ref={editModalRef}>
        <>
          {editItem && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Edit Category</h3>
                <div className="flex flex-col gap-2">
                  <label htmlFor="edit-category-name" className="font-medium">
                    Category Name
                  </label>
                  <input
                    id="edit-category-name"
                    type="text"
                    value={editItem.name}
                    onChange={(e) =>
                      setEditItem({ ...editItem, name: e.target.value })
                    }
                    placeholder="Enter category name"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Category Image</label>
                  <DropZone
                    text={<>Upload Image</>}
                    onUpload={(files: File[]) => {
                      if (files.length > 0) {
                        setEditItem({ ...editItem, image: files[0].name });
                      } else {
                        setEditItem({ ...editItem, image: null });
                      }
                    }}
                  />
                  {editItem.image && (
                    <img
                      src={
                        editItem.image.startsWith("/")
                          ? editItem.image
                          : `/uploads/${editItem.image}`
                      }
                      alt="Uploaded preview"
                      className="w-24 h-24 object-cover rounded-md mt-2"
                    />
                  )}
                </div>
                <button
                  disabled={!editItem.name || edit_category.isPending}
                  className="btn btn-primary w-full"
                  onClick={() => {
                    edit_category.mutate(editItem);
                    // toast.success("Category updated successfully (mock)");
                  }}
                  // disabled={!editItem.name || !editItem.image || add_category.isPending}
                >
                  Update Sub Category
                </button>
              </div>
            </>
          )}
        </>
      </ReModal>

      <ReModal ref={modalRef}>
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Sub-Category</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="category-name" className="font-medium">
                Category Name
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Category Image</label>
              <DropZone
                text={<>Upload Image</>}
                onUpload={(files: string[]) => {
                  let img_url = files[0];
                  console.log(img_url);
                  setImage(img_url); // Assuming the API expects the filename or a reference to it
                }}
              />
              {image && (
                <img
                  src={`/uploads/${image}`} // Assuming your uploads are in a public folder named 'uploads'
                  alt="Uploaded preview"
                  className="w-24 h-24 object-cover rounded-md mt-2"
                />
              )}
            </div>
            <button
              className="btn btn-primary w-full"
              onClick={() => add_category.mutate({ name, image })}
              disabled={!name || add_category.isPending}
            >
              {add_category.isPending ? <Loader /> : "Add Category"}
            </button>
          </div>
        </>
      </ReModal>
    </div>
  );
}
