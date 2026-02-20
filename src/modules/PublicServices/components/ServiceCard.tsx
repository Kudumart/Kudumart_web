import { Link } from "react-router-dom";
import type { Service } from "../public-services";

export default function ServiceCard(props: Service) {
  const {
    title,
    description,
    image_url,
    price,
    discount_price,
    is_negotiable,
    provider,
    category,
    subCategory,
    location_city,
    location_state,
    location_country,
    work_experience_years,
    status,
  } = props;

  // Calculate discount percent if applicable
  let discountPercent: number | null = null;
  if (discount_price && parseFloat(price) > parseFloat(discount_price)) {
    discountPercent = Math.round(
      ((parseFloat(price) - parseFloat(discount_price)) / parseFloat(price)) *
        100,
    );
  }

  return (
    <div className="card card-bordered shadow-lg bg-base-100 transition hover:shadow-xl flex flex-col">
      <figure className="relative">
        <img
          src={image_url || "https://picsum.photos/400/300"}
          alt={title}
          className="w-full h-48 object-cover rounded-t-box"
        />
        {discountPercent && (
          <span className="badge badge-error badge-lg absolute top-4 left-4 z-10">
            -{discountPercent}%
          </span>
        )}
        <span
          className={`badge badge-sm absolute top-4 right-4 z-10 ${
            status === "active"
              ? "badge-success"
              : status === "inactive"
                ? "badge-neutral"
                : ""
          }`}
        >
          {status === "active"
            ? "Active"
            : status === "inactive"
              ? "Inactive"
              : ""}
        </span>
      </figure>
      <div className="card-body flex flex-col justify-between">
        <div>
          <h2 className="card-title text-lg font-semibold line-clamp-2 mb-2">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {category?.name && (
              <span className="badge badge-outline badge-primary">
                {category.name}
              </span>
            )}
            {subCategory && (
              <span className="badge badge-outline badge-secondary">
                {subCategory.name}
              </span>
            )}
          </div>
          <p className="text-sm text-base-content/70 line-clamp-3 mb-3">
            {description}
          </p>
          {/* Location separated, not a badge */}
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex flex-col gap-1 text-sm text-base-content/80">
              <span className="font-medium">Location:</span>
              <span>
                {location_city}
                {location_city && location_state ? ", " : ""}
                {location_state}
                {location_state && location_country ? ", " : ""}
                {location_country}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-ghost badge-sm">
                {work_experience_years} yrs exp
              </span>
              {is_negotiable && (
                <span className="badge badge-info badge-sm">Negotiable</span>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-primary">
              {discount_price ? (
                <>
                  <span>₦{discount_price}</span>
                  <span className="text-base-content/50 line-through ml-2">
                    ₦{price}
                  </span>
                </>
              ) : (
                <>₦{price}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    provider.photo ||
                    `https://ui-avatars.com/api/?name=${provider.firstName}+${provider.lastName}&background=primary&color=fff`
                  }
                  alt={provider.firstName}
                />
              </div>
            </div>
            <div>
              <span className="font-medium text-sm">
                {provider.firstName} {provider.lastName}
              </span>
              {provider.isVerified && (
                <span className="badge badge-success badge-xs ml-1">
                  Verified
                </span>
              )}
            </div>
          </div>
          <div className="card-actions mt-4">
            <Link
              to={`/services/${props.id}`}
              className="btn btn-primary btn-block"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
