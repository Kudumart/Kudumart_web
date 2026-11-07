import { ArrowRight, Gavel, ImageOff, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { money, plainText } from '../utils/format';
import { useResource } from '../hooks/useResource';
import { useApp } from '../contexts/AppContext';

export default function Discovery({ type }) {
  const isAuction = type === 'auctions';
  const { country } = useApp();
  const resource = useResource(signal => isAuction ? catalogApi.auctions(country.name, signal) : catalogApi.services(signal), [type, country.name]);

  return (
    <div className="container discovery-page">
      <div className="page-intro">
        <span className="eyebrow">EXPLORE MORE</span>
        <h1>{isAuction ? 'Discover auctions.' : 'Discover services.'}</h1>
        <p>{isAuction ? 'Browse ongoing, upcoming, and completed auctions.' : 'Find people and services that move things forward.'}</p>
      </div>
      {resource.loading ? (
        <div className="discovery-grid">
          {[1, 2, 3, 4].map(item => <Skeleton key={item} className="discovery-skeleton"/>)}
        </div>
      ) : resource.error ? (
        <EmptyState title="We couldn’t load this section" description={resource.error.message}/>
      ) : resource.data?.length ? (
        <div className="discovery-grid">
          {resource.data.map(item => {
            const detailUrl = isAuction ? `/auction/product/${item.id}` : `/services/${item.id}`;
            const itemTitle = item.name || item.title || (isAuction ? 'Auction item' : 'Service');
            const itemImg = item.image_url || item.image;

            return (
              <article className="discovery-card" key={item.id}>
                <Link to={detailUrl} className="discovery-card__image" aria-label={`View ${itemTitle}`}>
                  {itemImg ? (
                    <img src={itemImg} alt={itemTitle} loading="lazy" />
                  ) : (
                    <span className="image-fallback"><ImageOff size={32} /></span>
                  )}
                  {isAuction && (
                    <span className={`discovery-status discovery-status--${item.auctionStatus || 'ended'}`}>
                      {item.auctionStatus === 'ongoing' ? 'Ongoing' : item.auctionStatus === 'upcoming' ? 'Upcoming' : item.auctionStatus === 'cancelled' ? 'Cancelled' : 'Ended'}
                    </span>
                  )}
                </Link>
                <div className="discovery-card__body">
                  <span className="eyebrow">{isAuction ? 'AUCTION' : 'SERVICE'}</span>
                  <h3>{itemTitle}</h3>
                  {isAuction && (
                    <strong className="discovery-card__price">
                      {money(item.price || item.startingPrice, item.store?.currency?.symbol || country.symbol)}
                    </strong>
                  )}
                  <p>{plainText(item.description).slice(0, 140)}</p>
                  <Link to={detailUrl} className="discovery-card__link">
                    View details <ArrowRight size={16}/>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={isAuction ? Gavel : Sparkles}
          title="More is coming soon"
          description="Check back for fresh opportunities."
          action={<Link to="/catalog"><Button variant="outline">Explore products</Button></Link>}
        />
      )}
    </div>
  );
}
