import { useState, useRef } from "react";
import { FaTimes, FaMagic, FaUpload, FaSpinner, FaCheckCircle, FaBoxOpen, FaGavel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Button from "../../../components/Button";

export default function AIProductCreator({ onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { mutate } = useApiMutation();

  const [step, setStep] = useState(1); // 1=type, 2=upload, 3=analyzing, 4=done
  const [productType, setProductType] = useState(null); // "auction" | "non-auction"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [aiData, setAiData] = useState(null);

  const handleTypeSelect = (type) => {
    setProductType(type);
    setStep(2);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  const analyzeImage = async () => {
    if (!imageFile) {
      setError("Please upload a product image first.");
      return;
    }
    setAnalyzing(true);
    setStep(3);
    setError(null);

    try {
      const base64 = await toBase64(imageFile);
      const mimeType = imageFile.type;

      mutate({
        url: "/vendor/products/ai-generate",
        method: "POST",
        headers: true,
        data: {
          imageBase64: base64,
          mimeType,
        },
        onSuccess: (response) => {
          setAiData(response.data.data);
          setStep(4);
          setAnalyzing(false);
        },
        onError: (error) => {
          setError(error.message || "Failed to analyze image. Please try again.");
          setStep(2);
          setAnalyzing(false);
        },
      });
    } catch (err) {
      setError(err.message || "Failed to process image. Please try again.");
      setStep(2);
      setAnalyzing(false);
    }
  };

  const handleProceed = () => {
    if (!aiData) return;
    // Store AI data in sessionStorage so the product form can read it
    sessionStorage.setItem("ai_product_data", JSON.stringify({ ...aiData, imagePreview }));
    onClose();
    if (productType === "auction") {
      navigate("/profile/auction-products/create?ai=1");
    } else {
      navigate("/profile/products/create?ai=1");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-theme="kudu">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-400"
                }`}
            >
              {step > s ? <FaCheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-8 h-1 mx-1 rounded transition-all ${step > s ? "bg-orange-500" : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Product Type */}
      {step === 1 && (
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-kudu-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaMagic className="w-8 h-8 text-kudu-orange" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Create Product with AI</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Upload a product image and our AI will automatically extract details and fill in the listing form for you.
          </p>

          <div className="text-left mb-4">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Select Listing Type</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeSelect("auction")}
              className="flex flex-col items-center border-2 border-gray-200 hover:border-kudu-orange hover:bg-orange-50/50 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gray-100 group-hover:bg-kudu-orange group-hover:text-white rounded-full flex items-center justify-center text-gray-500 mb-4 transition-colors">
                <FaGavel className="w-6 h-6" />
              </div>
              <p className="font-bold text-gray-800 group-hover:text-kudu-orange text-lg">Auction</p>
              <p className="text-sm text-gray-500 mt-1">Accept bids from buyers</p>
            </button>
            <button
              onClick={() => handleTypeSelect("non-auction")}
              className="flex flex-col items-center border-2 border-gray-200 hover:border-kudu-orange hover:bg-orange-50/50 rounded-2xl p-6 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gray-100 group-hover:bg-kudu-orange group-hover:text-white rounded-full flex items-center justify-center text-gray-500 mb-4 transition-colors">
                <FaBoxOpen className="w-6 h-6" />
              </div>
              <p className="font-bold text-gray-800 group-hover:text-kudu-orange text-lg">Non-Auction</p>
              <p className="text-sm text-gray-500 mt-1">Standard product listing</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Image */}
      {step === 2 && (
        <div className="py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStep(1); setImageFile(null); setImagePreview(null); }}
            className="mb-6 -ml-3"
          >
            ← Back to Type Selection
          </Button>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Product Image</h3>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Upload a clear image of your{" "}
            <span className="font-semibold text-kudu-orange capitalize">
              {productType === "auction" ? "Auction" : "Fixed Price"}
            </span>{" "}
            product. Our AI will analyze it to auto-fill your listing.
          </p>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${imagePreview
                ? "border-kudu-orange bg-orange-50/30"
                : "border-gray-300 hover:border-kudu-orange hover:bg-orange-50/50"
              }`}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="max-h-56 mx-auto rounded-xl object-contain shadow-sm"
                />
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-kudu-orange font-semibold">
                  <FaCheckCircle />
                  <span>Image ready. Click to change</span>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUpload className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">Click to browse or drag image here</p>
                <p className="text-sm text-gray-400">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            variant="primary"
            className="mt-6 bg-kudu-orange hover:bg-orange-600 shadow-md shadow-orange-500/20 rounded-xl"
            onClick={analyzeImage}
            disabled={!imageFile}
            icon={FaMagic}
          >
            Analyze Product Image
          </Button>
        </div>
      )}

      {/* STEP 3: Analyzing */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-kudu-orange/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-white border-4 border-orange-50 rounded-full flex items-center justify-center shadow-lg">
              <FaSpinner className="w-8 h-8 text-kudu-orange animate-spin" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">AI is Analyzing...</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Please wait while our advanced AI extracts product details from your image.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-xs mx-auto space-y-4">
            {["Identifying product features...", "Generating SEO-friendly title...", "Writing detailed description...", "Estimating market value..."].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
                <div className="w-2 h-2 bg-kudu-orange rounded-full"></div>
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: AI Done — Preview */}
      {step === 4 && aiData && (
        <div className="py-2">
          <div className="flex items-center justify-center gap-3 mb-6 bg-green-50 text-green-700 py-3 px-4 rounded-xl border border-green-100">
            <FaCheckCircle className="w-6 h-6" />
            <h3 className="font-bold">AI Analysis Complete!</h3>
          </div>

          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            We've extracted the following details. You can review and edit them in the next step.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500 font-medium bg-gray-50/50 w-1/3">Product Name</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{aiData.name || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500 font-medium bg-gray-50/50">Category</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">{aiData.category_suggestion || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500 font-medium bg-gray-50/50">Price</td>
                    <td className="py-3 px-4 text-green-600 font-bold tracking-wide">₦{aiData.price?.toLocaleString() || "-"}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-500 font-medium bg-gray-50/50">Condition</td>
                    <td className="py-3 px-4 text-gray-800 font-semibold capitalize">{aiData.condition?.replace("_", " ") || "-"}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" className="py-4 px-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Description Preview</p>
                      <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">{aiData.description}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-xl border-2"
              onClick={() => { setStep(2); setAiData(null); }}
            >
              Try Another Image
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 rounded-xl bg-kudu-orange hover:bg-orange-600 shadow-md shadow-orange-500/20"
              onClick={handleProceed}
            >
              Proceed to Form
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 font-medium w-28 shrink-0">{label}:</span>
      <span className="text-gray-700 capitalize">{value || "-"}</span>
    </div>
  );
}
