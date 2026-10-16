import { ArrowLeft, ImageOff } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useResource } from '../hooks/useResource';
import { money, plainText } from '../utils/format';
export default function DiscoveryDetail({ type }) {
  const { id } = useParams(); const isAuction = type === 'auction';
  const resource = useResource(signal => isAuction ? catalogApi.auction(id, signal) : catalogApi.service(id, signal), [id, type]);
  const item = resource.data; const image = item?.image_url || item?.image;
  if (resource.loading) return <div className="container product-page"><Skeleton className="product-detail-skeleton"/></div>;
  if (resource.error || !item) return <div className="container page-space"><EmptyState title="This listing is unavailable" description={resource.error?.message || 'Please try another listing.'} action={<Link to={isAuction ? '/auctions' : '/services'}><Button variant="outline">Explore more</Button></Link>}/></div>;
  return <div className="container product-page"><Link to={isAuction ? '/auctions' : '/services'} className="back-link"><ArrowLeft size={16}/> Back to {isAuction ? 'auctions' : 'services'}</Link><div className="product-detail"><div className="product-detail__gallery"><div className="product-detail__main-image">{image ? <img src={image} alt={item.title || item.name}/> : <ImageOff size={48}/>}</div></div><div className="product-detail__info"><span className="eyebrow">{isAuction ? 'KUDUMART AUCTIONS' : 'KUDUMART SERVICES'}</span><h1>{item.title || item.name}</h1>{(item.price || item.startingPrice) && <div className="product-detail__price"><strong>{money(item.price || item.startingPrice, item.currency?.symbol || '₦')}</strong></div>}<p className="product-detail__description">{plainText(item.description)}</p>{isAuction && <p className="product-detail__description">Status: {item.auctionStatus || 'See listing for updates'}</p>}<div className="product-detail__benefits"><span>{isAuction ? 'Bidding will be enabled after its transaction contract is verified.' : 'Service booking will be enabled after its transaction contract is verified.'}</span></div></div></div></div>;
}
