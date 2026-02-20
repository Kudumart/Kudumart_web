import type { QueryObserverResult } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import type { JSX } from "react/jsx-runtime";
import type { AxiosError } from "axios";

import type React from "react";
import { extract_message } from "../../helpers/auth";
import SimpleLoader from "./SimpleLoader";

interface QueryPageLayoutProps<TData> {
  query: QueryObserverResult<TData>;
  children?: React.ReactNode | ((data: TData) => React.ReactNode);
  customLoadingComponent?: React.ReactNode;
  customErrorComponent?: (
    error: string,
    refetch: () => void,
  ) => React.ReactNode;

  // title?: string | JSX.Element;
  // headerActions?: React.ReactNode | any;
}

export default function QueryCage<TData>(props: QueryPageLayoutProps<TData>) {
  if (props.query.isLoading) {
    if (props.customLoadingComponent) {
      return <>{props.customLoadingComponent}</>;
    }
    return (
      <>
        <SimpleLoader />
      </>
    );
  }

  if (props.query.error) {
    const error = extract_message(props.query.error as AxiosError<any>);
    if (props.customErrorComponent) {
      return <>{props.customErrorComponent(error, props.query.refetch)}</>;
    }
    return (
      <>
        <div className="p-4 min-h-[420px] grid place-items-center bg-base-300 rounded-md">
          <div className="p-4 space-y-4 ">
            <div className="text-lg text-center fieldset-label font-bold floating-label  wrap-anywhere">
              {error}
            </div>
            <button
              className="btn btn-error btn-block"
              onClick={() => props.query.refetch()}
            >
              Reload
            </button>
          </div>
        </div>
      </>
    );
  }
  if (props.query.isSuccess && props.query.data)
    return (
      <>
        <div className="">
          {typeof props.children === "function"
            ? props.children(props.query.data) // ✅ fully inferred
            : props.children}
        </div>
      </>
    );

  return null;
}
