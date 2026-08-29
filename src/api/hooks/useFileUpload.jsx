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
            const filesArray = Array.isArray(acceptedFiles)
                ? acceptedFiles
                : (acceptedFiles instanceof FileList ? Array.from(acceptedFiles) : [acceptedFiles]);

            const uploadedUrls = [];

            for (let i = 0; i < filesArray.length; i++) {
                const file = filesArray[i];
                if (!file) continue;
                const formData = new FormData();
                formData.append("image", file);

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const url = typeof data?.data === 'string'
                    ? data.data
                    : (data?.data?.url || data?.url || data?.secure_url || data?.path || '');

                if (url) {
                    uploadedUrls.push(url);
                } else if (typeof data === 'string') {
                    uploadedUrls.push(data);
                }
            }

            const result = uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls;
            if (typeof onUpload === 'function') {
                onUpload(result, uploadedUrls);
            }
            return uploadedUrls;
        } catch (err) {
            setError(err.message || "Upload failed");
            console.error("Error during upload:", err);
            return [];
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
