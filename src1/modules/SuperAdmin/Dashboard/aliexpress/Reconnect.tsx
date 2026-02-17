import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../../../api/apiFactory";
import QueryCage from "../../../../components/query/QueryCage";

export default function Reconnect() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearhParams] = useSearchParams();
  const code = search.get("code");
  const query = useQuery({
    queryKey: ["ali-connect"],
    queryFn: async () => {
      let resp = await apiClient.post("", {
        code,
      });
      return resp.data;
    },
    enabled: !!code,
  });

  return (
    <div data-theme="kudu">
      <div className="h-20 border-b border-current/20"></div>
      <QueryCage query={query}>
        {(data) => {
          return (
            <>
              <div className="" data-theme="kudu">
                <div className="hero min-h-screen ">
                  <div className="hero-content text-center">
                    <div className="max-w-md">
                      <h1 className="text-5xl font-bold">OAuth Callback</h1>
                      {code ? (
                        <>
                          <p className="py-6">
                            Processing your login. Please wait...
                          </p>
                          <div className="form-control mt-4">
                            <input
                              type="text"
                              readOnly
                              value={code}
                              className="input input-bordered w-full max-w-xs mx-auto text-center text-xl tracking-widest"
                            />
                          </div>
                          <p className="py-4 text-sm">
                            This code is typically exchanged for an access token
                            on the server.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="py-6">
                            No authentication code found in the URL.
                          </p>
                          <button
                            className="btn btn-primary mt-6"
                            onClick={() => navigate("/")}
                          >
                            Go to Home
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      </QueryCage>
    </div>
  );
}
