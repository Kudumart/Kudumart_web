import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import boole, { apiClient } from "../../../api/apiFactory";
import { usePagination, useSmallPagination } from "../../../hooks/appState";
import ServiceSubCategories from "./services-sub-categories";
import CustomTable, {
  Actions,
  columnType,
} from "../../../components/CustomTable";
import { toast } from "react-toastify";
import { useReModal } from "../../../hooks/new_hooks";
import ReModal from "../../../components/ReModal";
import { useEffect, useState } from "react";
import { all } from "axios";
import { SimplePagination } from "../../../components/SimplePagination";
import { useCategorie } from "../../../store/holders";

interface Option {
  id: number;
  option_value: string;
}

interface Attribute {
  id: number;
  name: string;
  input_type: "single_select" | "bool_input" | "int_input";
  data_type: "str_array" | "bool" | "int";
  options: Option[];
}

interface AttributesResponse {
  data: Attribute[];
}

interface CreateAttributeType {
  name: string;
  input_type: "single_select" | "bool_input" | "int_input";
  data_type: "str_array" | "bool" | "int";
  value: Option[];
}

export default function ViewServiceCategories() {
  const { categories: cat, setCategories } = useCategorie();
  const { id } = useParams();
  const page_params = usePagination();
  const sub_attributes = useQuery<AttributesResponse>({
    queryKey: ["sub_categories", id],
    queryFn: async () => {
      let resp = await apiClient.get(
        "/admin/service/categories/" + id + "/attributes",
        {
          params: page_params,
        },
      );
      return resp.data;
    },
  });
  const data = sub_attributes.data?.data;

  let columns: columnType<Attribute> = [
    {
      key: "name",
      label: "Name",
      render: (_, item: Attribute) => item.name,
    },
    {
      key: "input_type",
      label: "Input Type",
      render: (_, item: Attribute) => item.input_type,
    },
    {
      key: "data_type",
      label: "Data Type",
      render: (_, item: Attribute) => item.data_type,
    },
    {
      key: "options",
      label: "Options",
      render: (_, item: Attribute) => (
        <div className="max-w-[150px] text-ellipsis line-clamp-1">
          {item.options
            .map((option: Option, index) => option.option_value)
            .join(", ")}
        </div>
      ),
    },
  ];
  const add_options = useMutation({
    mutationFn: async ({ item, name }: { item: Attribute; name?: string }) => {
      let resp = await apiClient.post(
        `/admin/service/attributes/${item.id}/options`,
        {
          options: [name],
        },
      );
      return resp.data;
    },
    onSuccess: () => {
      toast.success("option added successfully");
      sub_attributes.refetch();
    },
    onError: (error) => {
      toast.error("Failed to add option");
      console.error(error);
    },
  });

  const delete_option = useMutation({
    mutationFn: async (optionId: number) => {
      let resp = await apiClient.delete(
        `/admin/service/attributes/options/${optionId}`,
      );
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Option deleted successfully");
      sub_attributes.refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete option");
      console.error(error);
    },
  });
  const delete_attribute = useMutation({
    mutationFn: async (id: string | number) => {
      let resp = await apiClient.delete(`/admin/service/attributes/${id}`);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("attribute deleted successfully");
      sub_attributes.refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete attribute");
      console.error(error);
    },
  });

  const actions: Actions<Attribute> = [
    {
      label: "Delete",
      key: "delete",
      action: (item: Attribute) => delete_attribute.mutate(item?.id),
    },
    {
      label: "add option",
      key: "add-option",
      // action: (item: Attribute) => add_options.mutate(item),
      render: (item: Attribute) => {
        if (item.data_type === "bool" || item.data_type === "int") return null;
        return (
          <>
            <div className="dropdown dropdown-left dropdown-top">
              <label tabIndex={0} className="btn btn-primary w-full btn-soft">
                Add Option
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    let form = new FormData(e.target as HTMLFormElement);
                    let name = form.get("option_name") as string;
                    toast.promise(
                      add_options.mutateAsync({ item: item, name: name }),
                      {
                        pending: "Adding option...",
                      },
                    );
                  }}
                >
                  <input
                    name="option_name"
                    id="option_name"
                    type="text"
                    placeholder="New Option"
                    className="input input-bordered w-full mb-2"
                  />
                  <button
                    disabled={add_options.isPending}
                    type="submit"
                    className="btn btn-block btn-primary btn-sm"
                  >
                    Add
                  </button>
                </form>
              </ul>
            </div>
          </>
        );
      },
    },
    {
      key: "delete-option",
      label: "Delete Option",
      render: (item: Attribute) => (
        <div className="dropdown dropdown-left dropdown-top">
          <label tabIndex={0} className="btn btn-accent w-full btn-soft">
            Delete Option
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            {item.options.map((option) => (
              <li key={option.id} onClick={(e) => {}}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={delete_option.isPending}
                  onClick={() => {
                    toast.promise(
                      async () => delete_option.mutateAsync(option.id),
                      {
                        pending: "deleting option",
                      },
                    );
                  }}
                >
                  <a>{option.option_value}</a>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ];
  const { modalRef: modalRef, openModal, closeModal } = useReModal();

  return (
    <div
      data-theme="kudu"
      className="flex flex-col  bg-base-100 p-2 shadow rounded-md"
    >
      {cat && (
        <div className="card card-side bg-base-200 shadow-sm rounded-box m-2">
          <figure className="px-4 py-2">
            {cat.image ? (
              <div className="size-25">
                <div className="w-24 h-24 rounded-full">
                  <img src={cat.image} alt={cat.name} />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24">
                <div className="bg-neutral grid place-items-center h-24 text-neutral-content rounded-full w-24">
                  <span className="text-3xl ">
                    {cat.name.substring(0, 1).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title">{cat.name}</h2>
            <div className="flex flex-col text-sm text-base-content/60">
              <span>
                Created: {new Date(cat.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(cat.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="mb-2 flex items-center p-2">
        <div className="text-xl font-bold">Service Attributes</div>
        <button className="btn btn-primary ml-auto" onClick={openModal}>
          Add Attribute
        </button>
      </div>
      <div>
        <CustomTable data={data || []} columns={columns} actions={actions} />
        <SimplePagination paginate={page_params} total={data?.length || 0} />
      </div>
      <div className="mt-12 border-t pt-4 border-current/20">
        <ServiceSubCategories />
      </div>
      <div></div>
      <ReModal ref={modalRef} onClose={closeModal}>
        <CreateAttribute
          categoryId={id}
          closeModal={closeModal}
          sub_attributes={sub_attributes}
        />
      </ReModal>
    </div>
  );
}

///create attribute modal
const CreateAttribute = ({
  closeModal,
  sub_attributes,
  categoryId,
}: {
  closeModal: () => void;
  sub_attributes: any;
  categoryId?: string | number;
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);
  interface ApiResponse {
    data: Attribute[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  }
  const page_params = useSmallPagination({ initialLimit: 5 });
  const {
    data: attributesData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["attributes", page_params.params.page, page_params.params.limit],
    queryFn: async () => {
      const response = await apiClient.get("/admin/service/attributes", {
        params: {
          page: page_params.params.page,
          limit: page_params.params.limit,
        },
      });
      return response.data;
    },
  });
  const new_params = { ...page_params, limit: 5 };
  useEffect(() => {
    console.log("fetching");
  }, [page_params.page]);
  const handleAttributeToggle = (attribute: Attribute) => {
    setSelectedAttributes((prevSelected) => {
      if (prevSelected.some((selected) => selected.id === attribute.id)) {
        return prevSelected.filter((selected) => selected.id !== attribute.id);
      } else {
        return [...prevSelected, attribute];
      }
    });
  };
  const add_attributes = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `/admin/service/categories/${categoryId}/attributes`,
        {
          attributeIds: [
            ...selectedAttributes.map((attribute) => attribute.id),
          ],
        },
      );
      return response.data;
    },
    onSuccess: () => {
      closeModal(); // Close the modal after submission
      sub_attributes.refetch();
    },
    onError: () => {
      toast.error("Failed to add attributes");
    },
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your logic to submit the selected attributes here
    toast.promise(add_attributes.mutateAsync(), {
      pending: "Adding attributes...",
    });
  };

  if (error) {
    return <div>Error loading attributes.</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 "
      data-theme="kudu"
    >
      <h2 className="text-xl label font-bold ">Selected Attributes</h2>

      <div className="flex flex-wrap gap-2">
        {selectedAttributes.map((attribute) => (
          <div
            key={attribute.id}
            className="badge badge-primary badge-sm badge-soft gap-1 cursor-pointer"
            onClick={() => handleAttributeToggle(attribute)}
          >
            {attribute.name}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Available Attributes</span>
          {isFetching ? (
            <li className="p-2 cursor-pointer text-xs mt-1 hover:bg-base-200 rounded-md">
              Loading...
            </li>
          ) : (
            <></>
          )}
        </label>
        <ul>
          {attributesData?.data.map((attribute) => (
            <li
              key={attribute.id}
              className={`p-2 cursor-pointer text-xs mt-1 hover:bg-base-200 rounded-md ${
                selectedAttributes.some(
                  (selected) => selected.id === attribute.id,
                )
                  ? "bg-primary text-white"
                  : ""
              }`}
              onClick={() => handleAttributeToggle(attribute)}
            >
              {attribute.name}
            </li>
          ))}
        </ul>
      </div>
      <SimplePagination
        paginate={new_params}
        total={attributesData?.data?.length || 0}
      />
      <button
        disabled={add_attributes.isPending || selectedAttributes.length === 0}
        type="submit"
        className="btn btn-primary"
      >
        {add_attributes.isPending ? "Loading..." : "Submit"}
      </button>
    </form>
  );
};
