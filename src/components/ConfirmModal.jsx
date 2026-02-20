import React from 'react';
import { useModal } from '../hooks/modal';

const ConfirmModal = ({ title, message, onConfirm, confirmText = "Yes", confirmColor = "red" }) => {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

  const getConfirmButtonClass = () => {
    switch (confirmColor) {
      case "red":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "green":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "orange":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      default:
        return "bg-red-500 hover:bg-red-600 text-white";
    }
  };

  return (
    <div className="w-full flex h-auto flex-col px-6 py-6 gap-4">
      <div className="text-center w-full">
        <h3 className="font-semibold text-xl text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={handleConfirm}
          className={`${getConfirmButtonClass()} px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2`}
        >
          {confirmText}
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 font-medium rounded-lg transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
