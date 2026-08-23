import React from 'react';
import Button from './Button';
import { useModal } from '../hooks/modal';

const NotificationModal = ({ title, message, type = "success", buttonText = "OK" }) => {
  const { closeModal } = useModal();

  const handleClose = () => {
    closeModal();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "warning":
        return "primary";
      default:
        return "success";
    }
  };

  return (
    <div className="w-full flex h-auto flex-col px-6 py-6 gap-4">
      <div className="text-center w-full">
        {getIcon()}
        <h3 className="font-semibold text-xl text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleClose}
          variant={getButtonVariant()}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default NotificationModal;
