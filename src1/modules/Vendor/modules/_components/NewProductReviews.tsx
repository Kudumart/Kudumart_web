import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../../api/apiFactory";
import ReactStars from "react-rating-stars-component";
import { dateFormat } from "../../../../helpers/dateHelper";

function ErrorMessage({ error }: { error: unknown }) {
  return (
    <div className="alert alert-error shadow-lg">
      <div>
        <span>
          <strong>Error:</strong>{" "}
          {error instanceof Error ? error.message : "An error occurred."}
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="skeleton h-20 w-full rounded-box" />
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default function NewProductReviews({ id }: { id: string }) {
  const query = useQuery<{ data: any[] }>({
    queryKey: ["newProductReviews", id],
    queryFn: async () => {
      const response = await apiClient.get(`/user/get/review?productId=${id}`);
      return response.data;
    },
  });

  return (
    <div
      data-theme="kudu"
      className="p-6 rounded-box w-full space-y-4 bg-base-100 shadow"
    >
      <h2 className="text-xl font-bold mb-4">New Product Reviews</h2>
      {query.isLoading ? (
        <LoadingSkeleton />
      ) : query.isError ? (
        <ErrorMessage error={query.error} />
      ) : query.data && query.data.length > 0 ? (
        <div className="space-y-4">
          {query.data.map((review: any) => (
            <div
              key={review.id}
              className="card card-side bg-base-200 shadow-sm p-4 flex items-center"
            >
              <div className="avatar mr-4">
                <div className="w-12 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-lg">
                  {getInitials(
                    `${review.user?.firstName ?? ""} ${review.user?.lastName ?? ""}`,
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base-content">
                    {review.user?.firstName} {review.user?.lastName}
                  </span>
                  <span className="badge badge-ghost badge-sm">
                    {dateFormat(review.createdAt, "dd MMM yyyy")}
                  </span>
                </div>
                <p className="text-base-content mt-1">{review.comment}</p>
                <div className="mt-2">
                  <ReactStars
                    count={5}
                    size={18}
                    activeColor={"#FF6F22"}
                    value={review.rating}
                    edit={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex justify-center p-6">
          <div className="alert alert-info shadow alert-soft">
            <span>No Product Reviews</span>
          </div>
        </div>
      )}
    </div>
  );
}
