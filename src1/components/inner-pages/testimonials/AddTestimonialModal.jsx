import useApiMutation from "../../../api/hooks/useApiMutation";
import { Button } from "@material-tailwind/react";
import { useModal } from "../../../hooks/modal";
import { useEffect, useRef, useState } from "react";
import Loader from "../../Loader";
import { toast } from "react-toastify";
import {
  useCreateTestimonial,
  useGetAdminTestimonialById,
  useUpdateTestimonial,
} from "../../../api/pages/testimonials";
import DraftEditor from "../../Editor";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { renderDraftContent } from "../../../helpers/renderDraftContent";
import useFileUpload from "../../../api/hooks/useFileUpload";
import { FaRegEdit } from "react-icons/fa";
import htmlToDraftjs from "html-to-draftjs";

const AddTestimonialModal = ({ closeModal, refetch }) => {
  const { uploadFiles, isLoadingUpload } = useFileUpload();
  const [selectedItem, setselectedItem] = useState(null);
  const [name, setname] = useState("");
  const [position, setposition] = useState("");
  const [message, setmessage] = useState("");
  const [photo, setphoto] = useState(
    "https://res.cloudinary.com/do2kojulq/image/upload/v1730286484/default_user_mws5jk.jpg"
  );
  const [descriptionEditor, setDescriptionEditor] = useState(() =>
    EditorState.createEmpty()
  );

  const { mutate: create, isLoading: isCreating } = useCreateTestimonial();
  const { mutate: update, isLoading: isUpdating } = useUpdateTestimonial();

  const handleCreate = () => {
    if (name.trim() === "" || position.trim() === "" || message.trim() === "") {
      toast.info("All fields are required");
      return;
    }
    create(
      {
        name,
        position,
        photo: photo,
        message,
      },
      {
        onSuccess: (response) => {
          closeModal();
          setname("");
          setposition("");
          setmessage("");
          setphoto("");
          refetch();
          window.history.replaceState({}, "", window.location.pathname);
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
        name,
        position,
        photo: photo,
        message,
        id: selectedItem.id,
      },
      {
        onSuccess: (response) => {
          closeModal();
          setname("");
          setposition("");
          setmessage("");
          setphoto("");
          refetch();
          window.history.replaceState({}, "", window.location.pathname);
        },
        onError: () => {
          closeModal();
        },
      }
    );
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files;

    if (file[0]) {
      await uploadFiles(file, (uploadedUrls) => {
        setphoto(uploadedUrls[0]); // Return a single URL if `single` is true
      });
    }
  };
  const fileInputRef = useRef(null);
  const queryParams = new URLSearchParams(window.location.search);
  const selectedItemId = queryParams.get("id");

  const { data: testimonial, isLoading } =
    useGetAdminTestimonialById(selectedItemId);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (testimonial) {
      setname(testimonial.name);
      setposition(testimonial.position);
      setmessage(testimonial.message);
      setphoto(testimonial.photo);
      setselectedItem(testimonial);
      const blocksFromHTML = htmlToDraftjs(testimonial.message);
      const { contentBlocks, entityMap } = blocksFromHTML;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      setDescriptionEditor(EditorState.createWithContent(contentState));
    }
  }, [testimonial]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="w-full flex h-auto flex-col px-3 py-6 gap-3 -mt-3">
        <div className=" w-full">
          <p className="font-semibold text-base">Testimomnial</p>
          <div className="relative w-20 h-20">
            <div className="cursor-pointer absolute right-0 z-10 bg-gray-600 rounded-full h-6 w-6 flex justify-center items-center">
              {isLoadingUpload ? (
                <Loader size={10} />
              ) : (
                <FaRegEdit
                  color="blue"
                  size={18}
                  className=""
                  onClick={() => fileInputRef.current.click()}
                />
              )}
            </div>
            <img
              src={photo}
              alt=""
              className="h-full w-full rounded-full absolute"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter name"
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
                value={name}
                onChange={(e) => setname(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter position"
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
                value={position}
                onChange={(e) => setposition(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="email"
              >
                Message
              </label>
              <DraftEditor
                editorState={descriptionEditor}
                setEditorState={(newState) => {
                  setDescriptionEditor(newState);
                  setmessage(
                    renderDraftContent(
                      JSON.stringify(
                        convertToRaw(descriptionEditor.getCurrentContent())
                      )
                    )
                  );
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-5 gap-4">
          <Button
            disabled={isLoadingUpload || isCreating || isUpdating}
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

export default AddTestimonialModal;
