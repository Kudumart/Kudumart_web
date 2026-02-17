//@ts-nocheck
import { useState } from "react";
// import useApiMutation from "../../../api/hooks/useApiMutation"; // Unused import
import Loader from "../../../components/Loader";
// import { useEffect } from "react"; // Unused import
// import ProductCategoriesTable from "../../../components/ProductCategoriesTable"; // Unused import
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import CustomTable, {
  Actions,
  columnType,
} from "../../../components/CustomTable";
import { usePagination } from "../../../hooks/appState";
import { Minus, Plus } from "lucide-react";
import { useReModal } from "../../../hooks/new_hooks";
import ReModal from "../../../components/ReModal";
import DropZone from "../../../components/DropZone";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCategorie } from "../../../store/holders";
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
const ServiceCategories = () => {
  const paginate = usePagination();
  const { modalRef: modalRef, openModal, closeModal } = useReModal();
  const {
    modalRef: editModalRef,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useReModal();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ServiceCategory | null>(null);
  const { categories: cat, setCategories } = useCategorie();
  const categories = useQuery<ServiceCategoriesResponse>({
    queryKey: ["service-categories", paginate.params],
    queryFn: async () => {
      let resp = await apiClient.get("/service/categories", {
        params: paginate.params,
      });
      return resp.data;
    },
  });
  const total = categories?.data?.data?.length || 0;
  const add_category = useMutation({
    mutationFn: async (data: { name: string; image: string | null }) => {
      let resp = await apiClient.post("/admin/service/categories", data);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Category added successfully");
      categories.refetch();
      closeModal();
      setName("");
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const delete_category = useMutation({
    mutationFn: async (id: string) => {
      let resp = await apiClient.delete(`/admin/service/categories/${id}`);
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
      let resp = await apiClient.put(`/admin/service/categories/${item.id}`, {
        ...editItem,
      });
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
      closeEditModal();

      categories.refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  //@ts-ignore
  const actions: Actions<ServiceCategory> = [
    {
      label: "View",
      key: "view",
      action: (item) => {
        setCategories(item);
        navigate(`/admin/services/categories/${item.id}`);
      },
    },
    {
      label: "Sub Categories",
      key: "sub-categories",
      action: (item) => {
        navigate(`/admin/services/sub-category/${item.id}`);
      },
    },
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
  const columns: columnType[] = [
    // { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    {
      key: "image",
      label: "Image",
      render: (_, item) => {
        return item?.image?.trim() ? (
          <img
            src={item?.image || ""}
            alt={item?.name}
            className="w-10 h-10 object-cover rounded-md"
          />
        ) : (
          <>N/A</>
        );
      },
    },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
  ];
  return (
    <div className="min-h-screen p-4 bg-base-100" id="root" data-theme="kudu">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-3">
          Service Categories{" "}
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
                  Update Category
                </button>
              </div>
            </>
          )}
        </>
      </ReModal>

      <ReModal ref={modalRef}>
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Category</h3>
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
};

export default ServiceCategories;

const SimplePagination = ({
  paginate,
  total,
}: {
  paginate: any;
  total: number;
}) => {
  return (
    <div className="flex items-center gap-2  py-2 justify-center mb-2">
      <button
        onClick={paginate.prevPage}
        className="btn btn-square btn-primary btn-sm"
      >
        <Minus />
      </button>
      <>{paginate.params.page}</>
      <button
        onClick={() => paginate.nextPage(total)}
        className="btn btn-square btn-primary btn-sm"
      >
        <Plus />
      </button>
    </div>
  );
};
