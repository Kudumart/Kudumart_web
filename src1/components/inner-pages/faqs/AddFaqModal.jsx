import useApiMutation from "../../../api/hooks/useApiMutation";
import { Button } from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import {
  useCreateFaq,
  useGetFaqsCategory,
  useUpdateFaq,
} from "../../../api/pages/faqs";
import { useState } from "react";
import Loader from "../../Loader";
import { toast } from "react-toastify";

const AddFaqModal = ({ selectedItem }) => {
  const { closeModal } = useModal();

  console.log(selectedItem)

  const [categoryId, setcategoryId] = useState(selectedItem?.faqCategoryId ?? "");
  const [question, setquestion] = useState(selectedItem?.question ?? "");
  const [answer, setanswer] = useState(selectedItem?.answer ?? "");

  const { mutate: create, isLoading: isCreating } = useCreateFaq();
  const { mutate: update, isLoading: isUpdating } = useUpdateFaq();

  const handleCreate = () => {
    if (
      question.trim() === "" ||
      answer.trim() === "" ||
      categoryId.trim() === ""
    ) {
      toast.info('All fields are required')
      return;
    }
    create(
      {
        question,
        answer,
        categoryId,
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
    // if (name.trim() === "") {
    //   return;
    // }
    update(
      {
        question,
        answer,
        categoryId,
        id: selectedItem.id,
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

  const { data: faqCategories, isLoading } = useGetFaqsCategory();

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
        <div className=" w-full">
          <p className="font-semibold text-base">Faq</p>
          <div className="mt-4 flex flex-col gap-3">
            <select
              name="category"
              id="category"
              value={categoryId} // Bind state to the select value
              onChange={(e) => setcategoryId(e.target.value)}
              className="w-full h-10 text-black px-3 text-medium border rounded-md"
            >
              <option value="">Select category</option>
              {faqCategories?.length > 0 ? (
                faqCategories.map((faqCategory) => (
                  <option key={faqCategory.id} value={faqCategory.id}>
                    {faqCategory.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>

            <input
              type="text"
              placeholder="Enter question"
              className="w-full h-10 text-black px-3 text-medium border rounded-md"
              value={question}
              onChange={(e) => setquestion(e.target.value)}
            />
            <textarea
              type="text"
              placeholder="Enter answer"
              className="w-full h-20 text-black px-3 text-medium border rounded-md"
              value={answer}
              onChange={(e) => setanswer(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center mt-5 gap-4">
          <Button
            onClick={selectedItem ? handleUpdate : handleCreate}
            className="bg-red-500 text-white outline-hidden px-4 py-2 rounded-lg"
          >
            {selectedItem ? "Update" : "Add"}
          </Button>
          <button
            onClick={closeModal}
            className="bg-gray-300 text-black px-4 py-2 font-medium rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default AddFaqModal;
