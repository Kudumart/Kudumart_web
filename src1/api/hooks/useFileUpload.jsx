import { useState } from "react";

const useFileUpload = (defaultOptions = {
    uploadPreset: "mobil_holder",
    folder: "mobiHolder",
}) => {
    const [isLoadingUpload, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const uploadUrl = `${import.meta.env.VITE_CLOUDINARY_URL}`;

    const uploadFiles = async (acceptedFiles, onUpload = () => { }) => {
        setIsLoading(true);
        setError(null);

        try {
            const uploadedUrls = [];

            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                const formData = new FormData(); // Create a new FormData for each file
                formData.append("image", file);

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                uploadedUrls.push(data.data); // Collect all uploaded URLs
            }

            onUpload(uploadedUrls); // Return all URLs once uploads are complete
        } catch (err) {
            setError(err.message || "Upload failed");
            console.error("Error during upload:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        uploadFiles,
        isLoadingUpload,
        error,
    };
};

export default useFileUpload;
