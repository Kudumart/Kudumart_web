import useApiMutation from "../../../api/hooks/useApiMutation";
import Button from "../../Button";
import { useModal } from "../../../hooks/modal";
import {
  useCreateFaqsCategory,
  useUpdateFaqCategory,
} from "../../../api/pages/faqs";
import { useState } from "react";

const AddFaqCategoryModal = ({ selectedItem }) => {
  const { closeModal } = useModal();

  const [name, setname] = useState(selectedItem?.name ?? "");

  const { mutate: create, isLoading } = useCreateFaqsCategory();
  const { mutate: update, isLoading: isUpdating } = useUpdateFaqCategory();

  const handleCreate = () => {
    if (name.trim() === "") {
      return;
    }
    create(
      {
        name,
      },
      {
        onSuccess: (response) => {
          closeModal();
        },
        onError: () => {
          closeModal();
        },
      }
    );
  };

  const handleUpdate = () => {
    if (name.trim() === "") {
      return;
    }
    update(
      {
        name,
        id:selectedItem.id,
      },
      {
        onSuccess: (response) => {
          closeModal();
        },
        onError: () => {
          closeModal();
        },
      }
    );
  };

  return (
    <>
      <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
        <div className=" w-full">
          <p className="font-semibold text-base">Faq category</p>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter category name"
              className="w-full h-10 text-black px-3 text-medium"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center mt-5 gap-4">
          <Button
            onClick={selectedItem ? handleUpdate : handleCreate}
            variant="danger"
          >
            {selectedItem ? "Update" : "Add"}
          </Button>
          <Button
            onClick={closeModal}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddFaqCategoryModal;
