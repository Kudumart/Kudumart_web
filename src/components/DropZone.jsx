import React from "react";
import { useDropzone } from "react-dropzone";
import useFileUpload from "../api/hooks/useFileUpload";

export default function DropZone({ text, onUpload, single }) {
  const { uploadFiles, isLoadingUpload } = useFileUpload();

  const onDrop = async (files) => {
    const selectedFiles = single ? [files[0]] : files; // Take only the first file if `single` is true

    if (selectedFiles[0]) {
      await uploadFiles(selectedFiles, (uploadedUrls) => {
        onUpload(single ? uploadedUrls[0] : uploadedUrls); // Return a single URL if `single` is true
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: !single, // Prevent multiple file selection when `single` is true
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 w-full h-40 flex bGmobiGrayDark items-center justify-center transition ${
        isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Drop the file here ...</p>
      ) : isLoadingUpload ? (
        <div className="flex w-full items-center flex-col gap-2">
          <p className="text-blue-500">Loading ...</p>
        </div>
      ) : (
        <div className="flex w-full items-center flex-col gap-2">
          <span>
            <svg width="75" height="54" viewBox="0 0 75 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M34.125 53.6673H18.9375C13.8188 53.6673 9.44587 51.9173 5.81887 48.4173C2.18962 44.9173 0.375 40.6395 0.375 35.584C0.375 31.2507 1.69687 27.3895 4.34062 24.0007C6.98438 20.6118 10.4438 18.4451 14.7188 17.5007C16.125 12.3895 18.9375 8.25065 23.1562 5.08399C27.375 1.91732 32.1562 0.333984 37.5 0.333984C44.0812 0.333984 49.6635 2.59732 54.2467 7.12399C58.8322 11.6529 61.125 17.1673 61.125 23.6673C65.0062 24.1118 68.2271 25.764 70.7876 28.624C73.3459 31.4862 74.625 34.834 74.625 38.6673C74.625 42.834 73.149 46.3762 70.197 49.294C67.2428 52.2095 63.6562 53.6673 59.4375 53.6673H40.875V29.834L46.275 35.0007L51 30.334L37.5 17.0007L24 30.334L28.725 35.0007L34.125 29.834V53.6673Z"
                fill="#595959"
              />
            </svg>
          </span>
          {text ? (
            <p className="text-sm text-center">{text}</p>
          ) : (
            <>
              <p>Upload Government ID</p>
              <p className="text-sm text-center">Drag and drop a file here, or click to select a file</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
