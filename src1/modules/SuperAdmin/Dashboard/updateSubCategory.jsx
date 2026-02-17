import { useForm } from "react-hook-form";
import useApiMutation from "../../../api/hooks/useApiMutation";
import DropZone from "../../../components/DropZone";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProductSubCategory = () => {
  const [files, setFiles] = useState([]);
  const { id } = useParams();
  const [categories, setCategories] = useState({});
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const { mutate } = useApiMutation();

  const handleDrop = (data) => {
    setFiles((prevFiles) => [data]);
  };

  const onSubmit = (data) => {
    if (files.length > 0) {
      const payload = {
        ...data,
        subCategoryId: id,
        categoryId: categories.categoryId,
        image: files[0],
      };
      mutate({
        url: "/admin/sub/categories",
        method: "PUT",
        data: payload,
        headers: true,
        onSuccess: (response) => {
          navigate(-1);
        },
        onError: () => {},
      });
    }
  };

  const getCategories = () => {
    mutate({
      url: `/admin/sub/categories`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const filteredData = response.data.data.find((item) => item.id === id);
        setCategories(filteredData);
        setFiles([filteredData.image]);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (categories?.name) {
      setValue("name", categories.name); // Ensure the value is set in the form state
    }
  }, [categories, setValue]);

  return (
    <>
      <div className="min-h-screen">
        <div className="All">
          <div className="rounded-md pb-2 w-full flex justify-between gap-5">
            <h2 className="text-lg font-semibold text-black-700 mt-4">
              Update Product Sub Category
            </h2>
          </div>
          <div className="w-full flex grow mt-3">
            <div className="shadow-xl py-2 px-5 md:w-3/5 w-full bg-white flex rounded-xl flex-col gap-10">
              <form
                className="w-full flex flex-col items-center justify-center p-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="w-full p-6">
                  {/* Plan Name */}
                  <div className="mb-4">
                    <label
                      className="block text-md font-semibold mb-3"
                      htmlFor="email"
                    >
                      Sub Category Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name", {
                        required: "Sub Category name is required",
                      })}
                      placeholder="Enter sub category name"
                      className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                      style={{ outline: "none" }}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    <div className="flex flex-col md:w-1/2 w-full gap-6">
                      <p className="-mb-3 text-mobiFormGray">
                        Sub Category Icon
                      </p>
                      <DropZone
                        onUpload={handleDrop}
                        text={"Upload Category Icons"}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    data-theme="kudu"
                  >
                    Update Sub Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProductSubCategory;
