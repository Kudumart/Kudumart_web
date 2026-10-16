import { ArrowRight, Gavel, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { plainText } from '../utils/format';
import { useResource } from '../hooks/useResource';
import { useApp } from '../contexts/AppContext';
export default function Discovery({ type }) {
  const isAuction = type === 'auctions';
  const { country } = useApp();
  const resource = useResource(signal => isAuction ? catalogApi.auctions(country.name, signal) : catalogApi.services(signal), [type, country.name]);
  return <div className="container discovery-page"><div className="page-intro"><span className="eyebrow">EXPLORE MORE</span><h1>{isAuction ? 'Discover auctions.' : 'Discover services.'}</h1><p>{isAuction ? 'A little excitement makes every find better.' : 'Find people and services that move things forward.'}</p></div>{resource.loading ? <div className="discovery-grid">{[1,2,3,4].map(item => <Skeleton key={item} className="discovery-skeleton"/>)}</div> : resource.error ? <EmptyState title="We couldn’t load this section" description={resource.error.message}/> : resource.data?.length ? <div className="discovery-grid">{resource.data.map(item => <article className="discovery-card" key={item.id}>{(item.image_url || item.image) && <img src={item.image_url || item.image} alt=""/>}<div><span className="eyebrow">{isAuction ? 'AUCTION' : 'SERVICE'}</span><h3>{item.name || item.title}</h3><p>{plainText(item.description).slice(0, 140)}</p><Link to={isAuction ? `/auction/product/${item.id}` : `/services/${item.id}`}>View details <ArrowRight size={16}/></Link></div></article>)}</div> : <EmptyState icon={isAuction ? Gavel : Sparkles} title="More is coming soon" description="Check back for fresh opportunities." action={<Link to="/catalog"><Button variant="outline">Explore products</Button></Link>}/>}</div>;
}
