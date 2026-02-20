import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useApiMutation from "../api/hooks/useApiMutation";
import { useNavigate } from "react-router-dom";
import DropZone from "./DropZone";
import { EditorState, convertToRaw } from "draft-js";
import DraftEditor from "./Editor";
import draftToHtml from "draftjs-to-html";
import { FaTimes } from "react-icons/fa";

const AddNewProduct = () => {
  const [descriptionEditor, setDescriptionEditor] = useState(() =>
    EditorState.createEmpty(),
  );
  const [specificationsEditor, setSpecificationsEditor] = useState(() =>
    EditorState.createEmpty(),
  );

  const [currency, setCurrency] = useState(null);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [btnDisabled, setDisabled] = useState(false);

  const conditions = [
    { id: "brand_new", name: "Brand New" },
    { id: "fairly_used", name: "Fairly Used" },
    { id: "refurbished", name: "Refurbished" },
  ];

  const { mutate } = useApiMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: "",
      specifications: "",
      discount_price: 0,
    },
  });

  const onSubmit = (data) => {
    setDisabled(true);
    if (files.length > 0) {
      const concatenatedFiles = files.concat(additionalFiles);
      const uniqueFiles = [...new Set(concatenatedFiles)];
      delete data.category;
      const payload = {
        ...data,
        image_url: files[0],
        description: draftToHtml(
          convertToRaw(descriptionEditor.getCurrentContent()),
        ),
        specification: draftToHtml(
          convertToRaw(specificationsEditor.getCurrentContent()),
        ),
        additional_images: uniqueFiles,
      };

      mutate({
        url: "/admin/products",
        method: "POST",
        data: payload,
        headers: true,
        onSuccess: (response) => {
          navigate(-1);
        },
        onError: () => {
          setDisabled(false);
        },
      });
    } else {
      setDisabled(false);
      toast.error("Product Images are required");
    }
  };

  const getStore = () => {
    mutate({
      url: `/admin/store`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setStores(response.data.data);
      },
      onError: () => {},
    });
  };

  const getCategories = () => {
    mutate({
      url: `/admin/categories`,
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
    getStore();
    getCategories();
  }, []);

  const handleStoreChange = (data) => {
    const store = stores.find((store) => store.id === data);
    setCurrency(store.currency.symbol);
  };

  const handleDrop = (data) => {
    // Ensure data is always an array
    const newFiles = Array.isArray(data) ? data : [data];

    setFiles((prevFiles) => {
      // Merge previous files and new ones, ensuring uniqueness
      const updatedFiles = Array.from(new Set([...prevFiles, ...newFiles]));
      return updatedFiles;
    });
  };

  const handleAdditionalDrop = (data) => {
    // Ensure data is always an array
    const newFiles = Array.isArray(data) ? data : [data];

    setAdditionalFiles((prevFiles) => {
      // Merge previous files and new ones, ensuring uniqueness
      const updatedFiles = Array.from(new Set([...prevFiles, ...newFiles]));
      return updatedFiles;
    });
  };

  const getSubCategories = (categoryId) => {
    mutate({
      url: `/admin/categories/sub/categories`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const findCategory = response.data.data.find(
          (category) => category.id === categoryId,
        );
        const subCategories = findCategory.subCategories.map((subCategory) => ({
          id: subCategory.id,
          name: subCategory.name,
        }));
        setSubCategories(subCategories);
      },
      onError: () => {},
    });
  };

  const removeImage = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleRemoveAdditionalFile = (index) => {
    setAdditionalFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="All">
      <div className="rounded-md pb-2 w-full gap-5">
        <h2 className="text-lg font-semibold text-black-700 mt-4 mb-4">
          Add New Product
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
                  Store
                </label>
                <select
                  id="storeId"
                  {...register("storeId", { required: "Store is required" })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  onChange={(event) => handleStoreChange(event.target.value)}
                  required
                >
                  <option value={null} disabled selected>
                    Select Store
                  </option>
                  {stores.map((store) => (
                    <option value={store.id} key={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Category
                </label>
                <select
                  id="category"
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  onChange={(event) => getSubCategories(event.target.value)}
                  required
                >
                  <option value={null} disabled selected>
                    Select Category
                  </option>
                  {categories.map((catgeory) => (
                    <option value={catgeory.id} key={catgeory.id}>
                      {catgeory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Sub Category
                </label>
                <select
                  id="categoryId"
                  {...register("categoryId", {
                    required: "Sub Category is required",
                  })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                >
                  <option value={null} disabled selected>
                    Select Sub Category
                  </option>
                  {subCategories.map((catgeory) => (
                    <option value={catgeory.id} key={catgeory.id}>
                      {catgeory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", {
                    required: "Product Name is required",
                  })}
                  placeholder="Enter name of product"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Condition
                </label>
                <select
                  id="condition"
                  {...register("condition", {
                    required: "Condition is required",
                  })}
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                >
                  <option value={null} disabled selected>
                    Select Condition
                  </option>
                  {conditions.map((condition) => (
                    <option value={condition.id} key={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Description
                </label>
                <DraftEditor
                  editorState={descriptionEditor}
                  setEditorState={(newState) => {
                    setDescriptionEditor(newState);
                    setValue(
                      "description",
                      JSON.stringify(
                        convertToRaw(newState.getCurrentContent()),
                      ),
                      {
                        shouldValidate: true, // Ensure validation runs when value changes
                      },
                    );
                  }}
                />
                {errors.description && (
                  <p className="text-red-500">Description is required</p>
                )}
              </div>

              <div className="mt-4 mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Specifications
                </label>
                <DraftEditor
                  editorState={specificationsEditor}
                  setEditorState={(newState) => {
                    setSpecificationsEditor(newState);
                    setValue(
                      "specifications",
                      JSON.stringify(
                        convertToRaw(newState.getCurrentContent()),
                      ),
                      {
                        shouldValidate: true, // Ensure validation runs when value changes
                      },
                    );
                  }}
                />
                {errors.specifications && (
                  <p className="text-red-500">Specifications are required</p>
                )}
              </div>

              <div className="mt-4 mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Quantity Available
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="price"
                    {...register("quantity", {
                      required: "Product Quantity is required",
                      min: {
                        value: 0,
                        message: "Quantity cannot be negative",
                      },
                    })}
                    placeholder="Enter Product Quantity"
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                    style={{ outline: "none" }}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Price
                </label>
                <div className="flex gap-2">
                  <span className="flex flex-col justify-center">
                    {currency}
                  </span>
                  <input
                    type="text"
                    id="price"
                    {...register("price", {
                      required: "Product Price is required",
                    })}
                    placeholder="Enter Price"
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                    style={{ outline: "none" }}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Discount Price (Optional)
                </label>
                <div className="flex gap-2">
                  <span className="flex flex-col justify-center">
                    {currency}
                  </span>
                  <input
                    type="text"
                    id="discount_price"
                    {...register("discount_price")}
                    placeholder="Enter Discount Price"
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                    style={{ outline: "none" }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Warranty
                </label>
                <input
                  type="text"
                  id="warranty"
                  {...register("warranty", {
                    required: "Product Warranty is required",
                  })}
                  placeholder="Enter Product Warranty"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-md font-semibold mb-3"
                  htmlFor="email"
                >
                  Return policy
                </label>
                <input
                  type="text"
                  id="return_policy"
                  {...register("return_policy", {
                    required: "Return Policy is required",
                  })}
                  placeholder="Return Policy"
                  className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                  style={{ outline: "none" }}
                  required
                />
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-col w-full gap-6">
                  <p className="-mb-3 text-mobiFormGray">Main Product Image</p>
                  <DropZone
                    single
                    onUpload={handleDrop}
                    text={"Upload Main Image of Product"}
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
                      <span
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white shadow-lg text-black rounded-full p-1"
                      >
                        <FaTimes className="w-4 h-4" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-col w-full gap-6">
                  <p className="-mb-3 text-mobiFormGray">
                    Additional Product Images{" "}
                    <span className="text-sm text-gray-400">
                      (You can upload 4 or 5 images)
                    </span>
                  </p>
                  <DropZone
                    onUpload={handleAdditionalDrop}
                    text={"Upload Additional Images of Product"}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 my-4">
                  {additionalFiles.map((fileObj, index) => (
                    <div key={index} className="relative">
                      <img
                        src={fileObj}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-sm"
                      />
                      <span
                        onClick={() => handleRemoveAdditionalFile(index)}
                        className="absolute top-1 right-1 bg-white shadow-lg text-black rounded-full p-1"
                      >
                        <FaTimes className="w-4 h-4" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-block"
                data-theme="kudu"
                disabled={
                  !watch("description") ||
                  !watch("specifications") ||
                  btnDisabled
                }
              >
                Create New Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
