import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCurrencyData, setKuduUser } from "../../../reducers/userSlice";
import { redirect, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function DeleteAccount() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      let resp = await apiClient.delete("/user/delete/account");
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Account deleted successfully.");
      setSuccess(true);
      setError(null);
      dispatch(setKuduUser(null));
      dispatch(setCurrencyData(null));
      localStorage.clear();
      nav("/");
      // closeModal();
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to delete account.");
      toast.error(err.response.data.message);
      setSuccess(false);
    },
  });

  return (
    <div
      // className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center p-4 bg-red-200"
      data-theme="kudu"
    >
      <div className="w-full ">
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-base-content mb-3">
                Delete Account
              </h2>
              <p className="text-base-content/70 text-lg leading-relaxed">
                This action is permanent and cannot be undone. All your data,
                settings, and content will be permanently removed from our
                servers.
              </p>
            </div>

            {success ? (
              <div className="alert alert-success shadow-lg">
                <svg
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="font-medium">
                  Your account has been successfully deleted.
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                {/*{error && (
                  <div className="alert alert-error shadow-lg">
                    <svg
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}*/}

                {!showConfirm ? (
                  <div className="space-y-4">
                    <div className="bg-base-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-warning mt-1">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-base-content mb-1">
                            What gets deleted:
                          </p>
                          <ul className="text-base-content/70 space-y-1">
                            <li>• All personal data and settings</li>
                            <li>• Account history and preferences</li>
                            <li>• Any associated content or files</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-error btn-lg w-full"
                      onClick={() => setShowConfirm(true)}
                    >
                      Proceed to Delete Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="alert alert-warning shadow-lg">
                      <svg
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        ></path>
                      </svg>
                      <div>
                        <h3 className="font-bold">Final Confirmation</h3>
                        <div className="text-sm">
                          Are you absolutely sure you want to delete your
                          account?
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        className="btn btn-error btn-lg w-full"
                        disabled={isPending}
                        onClick={() => mutate()}
                      >
                        {isPending ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Deleting Account...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                            Yes, Delete My Account Forever
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-ghost btn-lg w-full"
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                      >
                        Cancel and Keep Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
