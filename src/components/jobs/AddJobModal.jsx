import { Button } from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import { toast } from "react-toastify";
import {
  useCreateTestimonial,
  useGetAdminTestimonialById,
  useUpdateTestimonial,
} from "../../api/pages/testimonials";
import DraftEditor from "../Editor";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { renderDraftContent } from "../../helpers/renderDraftContent";
import useFileUpload from "../../api/hooks/useFileUpload";
import { FaRegEdit } from "react-icons/fa";
import htmlToDraftjs from "html-to-draftjs";
import { useCreateJob, useGetAdminJobById, useUpdateJob } from "../../api/jobs";

const AddJobModal = ({ closeModal, refetch }) => {
  const { uploadFiles, isLoadingUpload } = useFileUpload();
  const [selectedItem, setselectedItem] = useState(null);
  const [title, settitle] = useState("");
  const [workplaceType, setworkplaceType] = useState("");
  const [location, setlocation] = useState("");
  const [jobType, setjobType] = useState("");
  const [message, setmessage] = useState("");
  const [photo, setphoto] = useState(
    "https://res.cloudinary.com/do2kojulq/image/upload/v1730286484/default_user_mws5jk.jpg"
  );
  const [descriptionEditor, setDescriptionEditor] = useState(() =>
    EditorState.createEmpty()
  );

  const { mutate: create, isLoading: isCreating } = useCreateJob();
  const { mutate: update, isLoading: isUpdating } = useUpdateJob();

  const handleCreate = () => {
    if (
      title.trim() === "" ||
      workplaceType.trim() === "" ||
      jobType.trim() === "" ||
      location.trim() === "" ||
      message.trim() === ""
    ) {
      toast.info("All fields are required");
      return;
    }
    create(
      {
        title,
        workplaceType,
        jobType,
        location,
        description: message,
      },
      {
        onSuccess: (response) => {
          closeModal();
          settitle("");
          setlocation("");
          setmessage("");
          setjobType("");
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
    if (
      title.trim() === "" ||
      workplaceType.trim() === "" ||
      jobType.trim() === "" ||
      location.trim() === "" ||
      message.trim() === ""
    ) {
      toast.info("All fields are required");
      return;
    }
    update(
      {
        title,
        workplaceType,
        jobType,
        location,
        description: message,
        jobId: selectedItem.id,
      },
      {
        onSuccess: (response) => {
          closeModal();
          settitle("");
          setlocation("");
          setmessage("");
          setjobType("");
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

  const { data: job, isLoading } = useGetAdminJobById(selectedItemId);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (job) {
      settitle(job.title);
      setworkplaceType(job.workplaceType);
      setjobType(job.jobType);
      
      // Handle both HTML content (existing jobs) and plain text (new format)
      const description = job.description;
      if (description.includes('<') && description.includes('>')) {
        // It's HTML content, convert to Draft.js and extract plain text
        const blocksFromHTML = htmlToDraftjs(description);
        const { contentBlocks, entityMap } = blocksFromHTML;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        const editorState = EditorState.createWithContent(contentState);
        setDescriptionEditor(editorState);
        // Extract plain text for the message state
        setmessage(contentState.getPlainText());
      } else {
        // It's plain text, create Draft.js content from it
        const contentState = ContentState.createFromText(description);
        setDescriptionEditor(EditorState.createWithContent(contentState));
        setmessage(description);
      }
      
      setlocation(job.location);
      setselectedItem(job);
    }
  }, [job]);

  if (isLoading && selectedItemId) return <Loader />;

  return (
    <>
      <div className="w-full flex max-h-[90vh] flex-col px-3 py-6 gap-3 -mt-3 overflow-y-auto">
        <div className=" w-full">
          <p className="font-semibold text-base">Add Job</p>
          {/* <div className="relative w-20 h-20">
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
          </div> */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter job title"
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
                value={title}
                onChange={(e) => settitle(e.target.value)}
              />
              <select
                value={workplaceType}
                onChange={(e) => setworkplaceType(e.target.value)}
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
              >
                <option>Select Workplace Type</option>
                <option value="remote">Remote</option>
                <option value="on-site">OnSite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter job location"
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
                value={location}
                onChange={(e) => setlocation(e.target.value)}
              />
              <select
                value={jobType}
                onChange={(e) => setjobType(e.target.value)}
                className="w-full h-10 text-black px-3 text-medium border rounded-md"
              >
                <option>Select Job Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="volunteer">Volunteer</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                className="block text-md font-semibold mb-3"
                htmlFor="email"
              >
                Job Description
              </label>
              <DraftEditor
                editorState={descriptionEditor}
                setEditorState={(newState) => {
                  setDescriptionEditor(newState);
                  // Extract plain text instead of HTML
                  const plainText = newState.getCurrentContent().getPlainText();
                  setmessage(plainText);
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

export default AddJobModal;
