import { ArrowRight, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import { accountApi } from "../api/account";
import { EmptyState, Skeleton } from "../components/ui";
import { useResource } from "../hooks/useResource";

const list = (payload) =>
  Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

export default function AuctionInterests() {
  const resource = useResource(
    (signal) => accountApi.auctionInterests(signal),
    [],
  );
  const items = list(resource.data);
  return (
    <div className="container public-list-page">
      <div className="public-list-head">
        <Gavel />
        <span className="eyebrow">YOUR AUCTIONS</span>
        <h1>Auctions you joined.</h1>
        <p>
          Return to an auction, review its status, and continue bidding while it
          is open.
        </p>
      </div>
      {resource.loading ? (
        <Skeleton className="public-loading" />
      ) : resource.error ? (
        <p className="form-alert">{resource.error.message}</p>
      ) : items.length ? (
        <div className="job-list">
          {items.map((entry, index) => {
            const auction =
              entry.auctionProduct ||
              entry.AuctionProduct ||
              entry.product ||
              entry;
            const id = auction.id || entry.auctionProductId;
            const title =
              auction.name ||
              auction.title ||
              auction.productName ||
              "Auction item";
            return (
              <Link to={`/auction/product/${id}`} key={entry.id || id || index}>
                <span>
                  <strong>{title}</strong>
                  <small>
                    {[
                      auction.status,
                      entry.bidAmount &&
                        `Your bid: ₦${Number(entry.bidAmount).toLocaleString()}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Registered interest"}
                  </small>
                </span>
                <ArrowRight />
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No auction activity yet"
          description="When you register interest in an auction, it will appear here."
        />
      )}
    </div>
  );
}
