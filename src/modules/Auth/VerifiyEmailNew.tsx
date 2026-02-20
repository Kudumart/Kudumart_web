import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { PropsWithChildren } from "react";
import {
  MailCheck,
  MailWarning,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogIn,
  RefreshCcw,
} from "lucide-react";

export default function VerifyEmailNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email")?.trim();
  const token = searchParams.get("token")?.trim();

  const { isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ["verifyEmail", email, token],
    queryFn: async () => {
      return await apiClient.post("/auth/verify/email-token", {
        email,
        token,
      });
    },
    enabled: !!(email && token),
    retry: false,
  });

  //@ts-ignore
  const error_message = error?.response?.data.message;

  // Show error if missing parameters
  if (!email || !token) {
    return (
      <ThemeWrapper>
        <div className="min-h-dvh flex items-center justify-center bg-base-200 px-4">
          <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 rounded-xl">
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <MailWarning className="text-error w-14 h-14" />
              </div>
              <h2 className="card-title justify-center text-3xl font-semibold mb-4">
                Invalid Verification Link
              </h2>
              <div className="alert alert-error mb-6 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>
                  The verification link is invalid or incomplete. Please check
                  your email for the correct link.
                </span>
              </div>
              <div className="card-actions justify-center">
                <button
                  className="btn btn-primary btn-wide flex gap-2"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="w-4 h-4" />
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="min-h-dvh flex items-center justify-center bg-base-200 px-4">
        <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 rounded-xl">
          <div className="card-body text-center">
            {/*<div className="mb-8">
              <div className="mb-4 mx-auto w-fit">
                <div className="bg-primary text-primary-content rounded-full w-16 h-16 grid place-items-center shadow-lg">
                  <MailCheck className="w-8 h-8" />
                </div>
              </div>
              <h2 className="card-title justify-center text-3xl font-semibold mb-2">
                Email Verification
              </h2>
              <p className="text-base-content/70 text-base">
                We're verifying your email address
              </p>
            </div>*/}

            {isLoading && (
              <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
                <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Verifying your email...
                </p>
                <p className="text-sm text-base-content/60">
                  This will only take a moment
                </p>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
                <div className="bg-success/20 rounded-full p-4 mb-4 flex items-center justify-center">
                  <CheckCircle2 className="text-success w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-success mb-3">
                  Email Verified Successfully!
                </h3>
                <div className="alert alert-success mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    Your email has been successfully verified. You can now
                    access all features.
                  </span>
                </div>
                <div className="card-actions justify-center">
                  <button
                    className="btn btn-primary btn-lg btn-wide flex gap-2"
                    onClick={() => navigate("/Login")}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Continue to Login
                  </button>
                </div>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
                <div className="bg-error/20 rounded-full p-4 mb-4 flex items-center justify-center">
                  <XCircle className="text-error w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-error mb-3">
                  Verification Failed
                </h3>
                <div className="alert alert-error mb-6 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span>
                    {error_message ||
                      "An error occurred during verification. Please try again."}
                  </span>
                </div>
                <div className="card-actions justify-center gap-2">
                  <button
                    className="btn btn-ghost flex gap-2"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    className="btn btn-primary flex gap-2"
                    onClick={() => navigate("/login")}
                  >
                    <LogIn className="w-4 h-4" />
                    Go to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}

export function ThemeWrapper({
  children,
  className = "",
  ...props
}: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={className} data-theme="kudu" {...props}>
      {children}
    </div>
  );
}
