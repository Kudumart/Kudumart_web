import { useCallback } from "react";
import { toast } from "react-toastify";

const useErrorHandler = () => {
    const handleError = useCallback((error) => {
        // Check if there's a response from the server
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "An error occurred.";

            if (status >= 400 && status < 500) {
                // Client errors (e.g., 400 Bad Request, 401 Unauthorized)
                toast.error(message);
            } else if (status >= 500) {
                // Server errors (e.g., 500 Internal Server Error)
                toast.error(message || "A server error occurred. Please try again later.");
            } else {
                // Other errors
                toast.error("An unexpected error occurred.");
            }
        } else if (error.request) {
            // Network or connection errors
            toast.error("Network error. Please check your internet connection.");
        } else {
            // Fallback for unknown errors
            toast.error(`Error: ${error.message || "Something went wrong."}`);
        }
    }, []);

    return handleError;
};

export default useErrorHandler;
