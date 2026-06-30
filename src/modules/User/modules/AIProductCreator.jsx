import { useState, useRef } from "react";
import { FaTimes, FaMagic, FaUpload, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function AIProductCreator({ onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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

      const prompt = `You are a product listing expert. Analyze this product image and extract all relevant details to create a complete product listing.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "name": "product name (clear, specific, 5-10 words)",
  "description": "detailed product description (2-3 paragraphs, mention key features, uses, benefits)",
  "specification": "technical specifications (materials, dimensions, colors, weight, etc.)",
  "condition": "brand_new OR fairly_used OR refurbished",
  "price": "suggested price in numbers only (e.g. 15000)",
  "discount_price": "0",
  "quantity": "1",
  "warranty": "warranty information (e.g. 1 year manufacturer warranty)",
  "return_policy": "return policy (e.g. 7 days return policy)",
  "category_suggestion": "suggested product category (Electronics, Clothing, Furniture, Vehicles, Real Estate, etc.)",
  "sku": "suggested SKU code (e.g. PRD-001)"
}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                    detail: "high",
                  },
                },
                { type: "text", text: prompt },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "OpenAI API error");
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");
      const parsed = JSON.parse(jsonMatch[0]);

      setAiData(parsed);
      setStep(4);
    } catch (err) {
      setError(err.message || "Failed to analyze image. Please try again.");
      setStep(2);
    } finally {
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
    <div className="w-full max-w-lg mx-auto" data-theme="kudu">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step > s ? <FaCheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-8 h-1 mx-1 rounded transition-all ${
                  step > s ? "bg-orange-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Product Type */}
      {step === 1 && (
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMagic className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Create Product with AI</h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload a product image and our AI will automatically fill in all product details for you.
          </p>
          <p className="text-sm font-semibold text-gray-700 mb-4">First, select product type:</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleTypeSelect("auction")}
              className="flex-1 max-w-[160px] border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl p-4 transition-all group"
            >
              <div className="text-3xl mb-2">🔨</div>
              <p className="font-semibold text-gray-700 group-hover:text-orange-600">Auction</p>
              <p className="text-xs text-gray-400 mt-1">Bidding product</p>
            </button>
            <button
              onClick={() => handleTypeSelect("non-auction")}
              className="flex-1 max-w-[160px] border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl p-4 transition-all group"
            >
              <div className="text-3xl mb-2">🛍️</div>
              <p className="font-semibold text-gray-700 group-hover:text-orange-600">Non-Auction</p>
              <p className="text-xs text-gray-400 mt-1">Regular product</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Image */}
      {step === 2 && (
        <div>
          <button
            onClick={() => { setStep(1); setImageFile(null); setImagePreview(null); }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
          >
            ← Back
          </button>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Upload Product Image</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a clear image of your{" "}
            <span className="font-semibold text-orange-500">
              {productType === "auction" ? "Auction" : "Non-Auction"}
            </span>{" "}
            product. AI will analyze it and auto-fill all details.
          </p>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              imagePreview
                ? "border-orange-400 bg-orange-50"
                : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
            }`}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
                <p className="text-xs text-orange-500 mt-3 font-medium">
                  ✓ Image selected — click to change
                </p>
              </div>
            ) : (
              <>
                <FaUpload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </>
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
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={analyzeImage}
            disabled={!imageFile}
            className="mt-4 w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: imageFile ? "#FF6F22" : "#ccc" }}
          >
            <FaMagic className="w-4 h-4" />
            Analyze with AI
          </button>
        </div>
      )}

      {/* STEP 3: Analyzing */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSpinner className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Image...</h3>
          <p className="text-sm text-gray-500">
            AI is examining your product image and generating all the necessary details. This may take a few seconds.
          </p>
          <div className="mt-6 space-y-2">
            {["Detecting product type...", "Extracting specifications...", "Generating description...", "Suggesting price..."].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <FaSpinner className="animate-spin w-3 h-3" />
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: AI Done — Preview */}
      {step === 4 && aiData && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaCheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-800">AI Analysis Complete!</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Review the extracted details below. You can edit them on the next page.
          </p>

          <div className="bg-gray-50 rounded-xl border p-4 space-y-2 max-h-60 overflow-y-auto text-sm">
            <Row label="Product Name" value={aiData.name} />
            <Row label="Category" value={aiData.category_suggestion} />
            <Row label="Condition" value={aiData.condition?.replace("_", " ")} />
            <Row label="Price" value={`${aiData.price}`} />
            <Row label="Warranty" value={aiData.warranty} />
            <Row label="Return Policy" value={aiData.return_policy} />
            <Row label="SKU" value={aiData.sku} />
            <div className="pt-2 border-t">
              <p className="text-gray-400 text-xs font-medium mb-1">Description Preview</p>
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{aiData.description}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => { setStep(2); setAiData(null); }}
              className="flex-1 py-2 px-4 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50"
            >
              Try Again
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-2 px-4 rounded-xl font-semibold text-white text-sm"
              style={{ background: "#FF6F22" }}
            >
              Proceed to Form →
            </button>
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
