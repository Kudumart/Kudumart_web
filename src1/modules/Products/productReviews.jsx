import ReactStars from "react-rating-stars-component";
import { dateFormat } from "../../helpers/dateHelper";

const ProductReview = ({ reviews }) => {
  const getInitials = (name) => {
    return name
      .trim() // Remove leading/trailing spaces
      .split(/\s+/) // Split by one or more spaces
      .map((word) => word[0]?.toUpperCase()) // Get first letter and capitalize
      .join("");
  };

  return (
    <div className="w-full mx-auto p-4 max-h-[400px] overflow-y-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-base md:text-lg font-semibold mb-4">
        Product Review
      </h2>

      {reviews.length > 0 ? (
        <div className="space-y-4 mb-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-3 rounded-sm shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-300 text-gray-700 font-bold rounded-full mr-3">
                  {getInitials(
                    `${review.user.firstName} ${review.user.lastName}`,
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {review.user.firstName} {review.user.lastName}
                    <span className="font-normal mx-2 text-sm text-gray-500">
                      {" "}
                      - {dateFormat(review.createdAt, "dd MMM yyyy")}
                    </span>
                  </p>
                  <p className="text-gray-600">{review.comment}</p>
                  <div>
                    <ReactStars
                      count={5}
                      size={15}
                      activeColor={"rgba(255, 111, 34, 1)"}
                      value={review.rating}
                    />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-black-500 hover:underline"></button>
                <button className="text-red-500 hover:underline"></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex justify-center p-6">
          <p className="md:text-lg font-semibold text-base">
            No Product Reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReview;
