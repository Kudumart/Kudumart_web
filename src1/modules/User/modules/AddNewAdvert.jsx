import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiMutation from "../../../api/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import DropZone from "../../../components/DropZone";

const PostNewAdvert = () => {
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const { mutate } = useApiMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setDisabled(true);
    if (files.length > 0) {
      delete data.category;
      const payload = {
        ...data,
        showOnHomepage: data.showOnHomepage === "true",
        media_url: files[0],
      };
      mutate({
        url: "/vendor/adverts",
        method: "POST",
        data: payload,
        headers: true,
        onSuccess: (response) => {
          navigate(-1);
          setDisabled(false);
        },
        onError: () => {
          setDisabled(false);
        },
      });
    }
  };

  const getCategories = () => {
    mutate({
      url: `/vendor/categories`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCategories(response.data.data);
      },
      onError: () => {},
    });
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleDrop = (data) => {
    setFiles((prevFiles) => [data]);
  };

  return (
    <div className="w-full">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700">
          Post New Advert
        </h2>
      </div>
      <div className="w-full flex grow mt-3">
        <div className="shadow-xl py-2 px-5 md:w-3/4 w-full bg-white flex rounded-xl flex-col gap-10">
          <form
            className="w-full flex flex-col items-center justify-center p-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full p-6">
              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="categoryId"
                  {...register("categoryId", {
                    required: "Category is required",
                  })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                >
                  <option value={null} disabled selected>
                    Select Category
                  </option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="title"
                >
                  Advert Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register("title", {
                    required: "Advert Title is required",
                  })}
                  placeholder="Enter title of advert"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="title"
                >
                  Advert Link
                </label>
                <input
                  type="text"
                  id="link"
                  {...register("link", { required: "Advert Link is required" })}
                  placeholder="Enter link for advert"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  type="text"
                  id="description"
                  {...register("description", {
                    required: "Advert description is required",
                  })}
                  placeholder="Describe your advert"
                  className="w-full px-4 py-4 h-60 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="showOnHomepage"
                >
                  Show on Homepage
                </label>
                <div className="flex items-center gap-10">
                  {/* Yes Option */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="showOnHomepage"
                      value="true"
                      {...register("showOnHomepage")}
                      className="hidden"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center radio-indicator">
                      <div className="w-3 h-3 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-semibold">Yes</span>
                  </label>

                  {/* No Option */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="showOnHomepage"
                      value="false"
                      {...register("showOnHomepage")}
                      className="hidden"
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center radio-indicator">
                      <div className="w-3 h-3 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 font-semibold">No</span>
                  </label>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 mt-10">
                <div className="flex flex-col md:w-1/2 w-full gap-6">
                  <p className="-mb-3 text-mobiFormGray">
                    Advert Image{" "}
                    <i>(Recommended image size: 1309 × 384 pixels)</i>
                  </p>
                  <DropZone
                    onUpload={handleDrop}
                    single
                    text={"Upload an Image of Advert"}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 my-4">
                  {files.map((fileObj, index) => (
                    <div key={index} className="relative">
                      <img
                        src={fileObj}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                data-theme="kudu"
                disabled={disabled}
              >
                Create New Advert
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostNewAdvert;
