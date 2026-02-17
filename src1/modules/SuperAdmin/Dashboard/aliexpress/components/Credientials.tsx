import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../../../../../api/apiFactory";
import QueryCage from "../../../../../components/query/QueryCage";
import { toast } from "sonner";
import { extract_message } from "../../../../../helpers/auth";

interface AccountInfo {
  email: string;
  nickname: string | null;
  sellerId: string | null;
  platform: string | null;
}

interface ExpiryDetail {
  label: string;
  expiresIn: string;
  isExpired: boolean;
}

interface ExpiryInfo {
  accessToken: ExpiryDetail;
  refreshToken: ExpiryDetail;
}

interface Timestamps {
  connectedAt: string;
  lastUpdated: string;
}

interface Data {
  isConnected: boolean;
  status: string;
  statusBadge: string;
  statusColor: "red" | "green" | "yellow"; // Assuming these are the possible colors
  message: string;
  showReconnectButton: boolean;
  account: AccountInfo;
  expiryInfo: ExpiryInfo;
  timestamps: Timestamps;
}

export default function Credientials() {
  const query = useQuery<{ data: Data }>({
    queryKey: ["ali-cred"],
    queryFn: async () => {
      let resp = await apiClient.get("admin/aliexpress/credentials/status");
      return resp.data;
    },
  });
  const add_account = async () => {
    let resp = await apiClient.post("aliexpress/create-account", {
      account: "kudumartcorporation@gmail.com",
    });
    return resp.data;
  };
  const get_reconnect_link = async () => {
    let resp = await apiClient.get("/aliexpress/auth");
    const link = resp.data.authUrl;
    window.location.href = link; // Redirect to the authentication URL
    return resp.data;
  };
  const mutation = useMutation({
    mutationFn: (fn: Function) => fn(),
    onSuccess: () => {
      query.refetch();
    },
  });

  return (
    <div className=" ring ring-current/20 rounded-box shadow">
      <QueryCage query={query}>
        {(data) => {
          const {
            isConnected,
            statusBadge,
            statusColor,
            message,
            showReconnectButton,
            account,
            expiryInfo,
            timestamps,
          } = data.data;

          const statusColorClass = {
            red: "bg-error",
            green: "bg-success",
            yellow: "bg-warning",
          }[statusColor];

          return (
            <>
              <div className="card bg-base-100 shadow-xl">
                <section className="p-4 py-2 border-b border-current/20">
                  <div className="flex items-center justify-between ">
                    <h2 className="card-title">AliExpress Account Details</h2>
                    {!isConnected && (
                      <button
                        onClick={() => {
                          toast.promise(mutation.mutateAsync(add_account), {
                            loading: "Adding account...",
                            success: "Account added successfully",
                            error: extract_message,
                          });
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Add Account
                      </button>
                    )}
                    {isConnected && showReconnectButton && (
                      <button
                        onClick={() => {
                          toast.promise(
                            mutation.mutateAsync(get_reconnect_link),
                            {
                              loading: "Adding account...",
                              success: "Account added successfully",
                              error: extract_message,
                            },
                          );
                        }}
                        className="btn btn-warning btn-sm"
                      >
                        Reconnect Account
                      </button>
                    )}
                  </div>
                </section>
                <div className="card-body">
                  {isConnected ? (
                    <>
                      <section className="flex flex-col gap-4">
                        {account.email && (
                          <div>
                            <span className=" text-base font-semibold">
                              Account Email:
                            </span>
                            <span className=" text-base text-gray-500 ml-2">
                              {account.email}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="">
                            <span className="text-sm font-semibold">
                              Status:
                            </span>
                            <span
                              className={`badge ${statusColorClass} text-base-100 ml-2`}
                            >
                              {statusBadge}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-sm">{message}</span>
                          </div>
                        </div>
                      </section>

                      <div className="divider">Timestamps</div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold">Connected At:</p>
                          <p className="text-sm text-gray-500">
                            {timestamps.connectedAt}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Last Updated:</p>
                          <p className="text-sm text-gray-500">
                            {timestamps.lastUpdated}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="alert alert-info shadow-lg">
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="stroke-current flex-shrink-0 w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <span>
                          No AliExpress account connected. Please add an account
                          to get started.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        }}
      </QueryCage>
    </div>
  );
}
