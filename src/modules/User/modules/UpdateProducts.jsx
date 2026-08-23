import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { stateFromHTML } from "draft-js-import-html";
import useApiMutation from "../../../api/hooks/useApiMutation";
import DropZone from "../../../components/DropZone";
import Loader from "../../../components/Loader";
import { EditorState, convertToRaw } from "draft-js";
import DraftEditor from "../../../components/Editor";
import draftToHtml from "draftjs-to-html";
import { toast } from "sonner";
import Button from "../../../components/Button";
import {
  Package,
  Store,
  Tag,
  DollarSign,
  ShieldCheck,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Trash2,
} from "lucide-react";

const UpdateProduct = () => {
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
  const [loading, setLoading] = useState(true);
  const [btnDisabled, setDisabled] = useState(false);
  const [product, setProduct] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate, isLoading } = useApiMutation();

  const conditions = [
    { id: "brand_new", name: "Brand New" },
    { id: "fairly_used", name: "Fairly Used" },
    { id: "refurbished", name: "Refurbished" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const watchedName = watch("name");
  const watchedPrice = watch("price");
  const watchedCondition = watch("condition");

  const getSubCategories = (categoryId) => {
    if (!categoryId) return;
    mutate({
      url: `/category/sub-categories?categoryId=${categoryId}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setSubCategories(response.data?.data || []);
      },
    });
  };

  const getStore = () => {
    mutate({
      url: `/vendor/store`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setStores(response.data?.data || []);
      },
    });
  };

  const getCategories = () => {
    mutate({
      url: `/categories`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setCategories(response.data?.data || []);
      },
    });
  };

  const getProduct = () => {
    mutate({
      url: `/vendor/product?productId=${id}`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        setProduct(response.data?.data || {});
      },
    });
  };

  const handleStoreChange = (data) => {
    const store = stores.find((s) => s.id === data);
    if (store?.currency?.symbol) {
      setCurrency(store.currency.symbol);
    }
  };

  useEffect(() => {
    getStore();
    getCategories();
    getProduct();
  }, [id]);

  useEffect(() => {
    if (!product || Object.keys(product || {}).length === 0) return;

    setValue("name", product.name || "");
    setValue("price", product.price || 0);
    setValue("discount_price", product.discount_price || 0);
    setValue("quantity", product.quantity || 0);
    setValue("warranty", product.warranty || "");
    setValue("return_policy", product.return_policy || "");
    setValue("storeId", product.storeId || "");
    setValue("condition", product.condition || "brand_new");

    const parentCatId = product.sub_category?.categoryId || product.categoryId;
    if (parentCatId) {
      setValue("category", parentCatId);
      getSubCategories(parentCatId);
    }

    if (product.additional_images && Array.isArray(product.additional_images)) {
      setAdditionalFiles(product.additional_images);
    }
    if (product.image_url) {
      setFiles([product.image_url]);
    }
    if (product.store?.currency?.symbol) {
      setCurrency(product.store.currency.symbol);
    }

    // Handle product.description (HTML case)
    if (product.description) {
      try {
        const contentState = stateFromHTML(product.description);
        setDescriptionEditor(EditorState.createWithContent(contentState));
        setValue("description", product.description);
      } catch (error) {
        console.error("Error parsing description:", error);
      }
    }

    // Handle product.specification (HTML case)
    if (product.specification) {
      try {
        const contentState = stateFromHTML(product.specification);
        setSpecificationsEditor(EditorState.createWithContent(contentState));
        setValue("specification", product.specification);
      } catch (error) {
        console.error("Error parsing specification:", error);
      }
    }

    setLoading(false);
  }, [product, setValue]);

  useEffect(() => {
    if (subCategories.length > 0 && product?.sub_category?.id) {
      setValue("categoryId", product.sub_category.id);
    }
  }, [subCategories, product, setValue]);

  const handleDrop = (data) => {
    const newFiles = Array.isArray(data) ? data : [data];
    setFiles(newFiles);
  };

  const handleAdditionalDrop = (data) => {
    const newFiles = Array.isArray(data) ? data : [data];
    setAdditionalFiles((prev) => Array.from(new Set([...prev, ...newFiles])));
  };

  const removeImage = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveAdditionalFile = (index) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setPresetPolicy = (type, value) => {
    if (type === "return") {
      setValue("return_policy", value);
    } else if (type === "warranty") {
      setValue("warranty", value);
    }
  };

  const onSubmit = (data) => {
    setDisabled(true);
    if (!files || files.length === 0) {
      setDisabled(false);
      toast.error("At least 1 product image is required.");
      return;
    }

    delete data.category;

    const payload = {
      ...data,
      productId: id,
      price: Number(data.price),
      quantity: Number(data.quantity),
      discount_price: Number(data.discount_price || 0),
      image_url: files[0],
      description: draftToHtml(
        convertToRaw(descriptionEditor.getCurrentContent()),
      ),
      specification: draftToHtml(
        convertToRaw(specificationsEditor.getCurrentContent()),
      ),
      additional_images: additionalFiles,
    };

    mutate({
      url: "/vendor/products",
      method: "PUT",
      data: payload,
      headers: true,
      onSuccess: () => {
        toast.success("Product updated successfully!");
        navigate(-1);
        setDisabled(false);
      },
      onError: () => {
        setDisabled(false);
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Back Link & Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to My Products
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shrink-0">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Product Details</h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Live Product
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Update inventory, pricing, description, and product category accurately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Card 1: Store & Category Hierarchy */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Store & Category Assignment</h2>
                    <p className="text-xs text-gray-500">Ensure the correct department and store are mapped</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Storefront <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("storeId", {
                        required: "Store is required",
                        onChange: (e) => handleStoreChange(e.target.value),
                      })}
                      className="w-full px-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm cursor-pointer"
                    >
                      <option value="" disabled>Select Storefront</option>
                      {stores.map((store) => (
                        <option value={store.id} key={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Main Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("category", {
                        required: "Category is required",
                        onChange: (e) => {
                          setValue("categoryId", "");
                          getSubCategories(e.target.value);
                        },
                      })}
                      className="w-full px-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm cursor-pointer"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map((cat) => (
                        <option value={cat.id} key={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Sub-Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("categoryId", { required: "Subcategory is required" })}
                      className="w-full px-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm cursor-pointer"
                    >
                      <option value="" disabled>Select Subcategory</option>
                      {subCategories.map((sub) => (
                        <option value={sub.id} key={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Details & Specs */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Product Identification & Details</h2>
                    <p className="text-xs text-gray-500">Provide title, condition, and rich descriptions</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Product Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("name", { required: "Product name is required" })}
                        placeholder="e.g. Apple iPhone 15 Pro Max 256GB - Titanium"
                        className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Item Condition <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("condition", { required: "Condition is required" })}
                        className="w-full px-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm cursor-pointer"
                      >
                        {conditions.map((cond) => (
                          <option value={cond.id} key={cond.id}>
                            {cond.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <DraftEditor
                        editorState={descriptionEditor}
                        setEditorState={(newState) => {
                          setDescriptionEditor(newState);
                          setValue(
                            "description",
                            JSON.stringify(convertToRaw(newState.getCurrentContent())),
                            { shouldValidate: true },
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Technical Specifications <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <DraftEditor
                        editorState={specificationsEditor}
                        setEditorState={(newState) => {
                          setSpecificationsEditor(newState);
                          setValue(
                            "specification",
                            JSON.stringify(convertToRaw(newState.getCurrentContent())),
                            { shouldValidate: true },
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Pricing & Inventory */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Pricing & Available Stock</h2>
                    <p className="text-xs text-gray-500">Set standard prices, discounts, and inventory counts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Sale Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register("price", { required: "Price is required" })}
                        placeholder="e.g. 150000"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-400">
                        {currency || "₦"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Discount Price <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register("discount_price")}
                        placeholder="e.g. 135000"
                        className="w-full pl-9 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-gray-400">
                        {currency || "₦"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Quantity in Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("quantity", { required: "Quantity is required", min: 0 })}
                      placeholder="e.g. 10"
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Warranty & Return Policy */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Warranty & Customer Protection</h2>
                    <p className="text-xs text-gray-500">Provide confidence to buyers with clear guarantees</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Warranty Terms <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPresetPolicy("warranty", "6 Months Warranty")}
                          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
                        >
                          6 Mos
                        </button>
                        <span className="text-gray-300 text-[11px]">|</span>
                        <button
                          type="button"
                          onClick={() => setPresetPolicy("warranty", "1 Year Warranty")}
                          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
                        >
                          1 Year
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      {...register("warranty", { required: "Warranty is required" })}
                      placeholder="e.g. 6 Months Manufacturer Warranty"
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        Return Policy <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPresetPolicy("return", "7 Days Return Policy")}
                          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
                        >
                          7 Days
                        </button>
                        <span className="text-gray-300 text-[11px]">|</span>
                        <button
                          type="button"
                          onClick={() => setPresetPolicy("return", "14 Days Return Policy")}
                          className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
                        >
                          14 Days
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      {...register("return_policy", { required: "Return policy is required" })}
                      placeholder="e.g. 7 Days Replacement Guarantee"
                      className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Card 5: Media Uploads */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-primary">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Product Photography</h2>
                    <p className="text-xs text-gray-500">High resolution photos attract up to 3x more buyer inquiries</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Image <span className="text-red-500">*</span>
                    </label>
                    <DropZone single onUpload={handleDrop} text="Click or drag cover image here" />

                    {files.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                        {files.map((fileObj, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200">
                            <img src={fileObj} alt="preview" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Gallery Images <span className="text-gray-400 font-normal">(Up to 5 images)</span>
                    </label>
                    <DropZone onUpload={handleAdditionalDrop} text="Add gallery photos from multiple angles" />

                    {additionalFiles.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                        {additionalFiles.map((fileObj, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200">
                            <img src={fileObj} alt="preview" className="w-full h-24 object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalFile(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sticky top-28">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Card Preview</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600">
                    Editing Product
                  </span>
                </div>

                {/* Mini Card Preview */}
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {files[0] ? (
                      <img src={files[0]} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-gray-800 uppercase">
                      {watchedCondition?.replace("_", " ") || "Brand New"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-gray-900 truncate">
                      {watchedName || "Product Title"}
                    </h4>
                    <p className="text-primary font-bold text-base mt-1">
                      {currency || "₦"} {watchedPrice ? Number(watchedPrice).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading || btnDisabled}
                    className="shadow-md shadow-primary/20"
                  >
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => navigate(-1)}
                    className="text-gray-500"
                  >
                    Cancel & Return
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default UpdateProduct;
