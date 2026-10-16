import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { accountApi } from '../api/account';
import ProductCard from '../components/ProductCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
export default function Saved() {
  const { user } = useApp();
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const resource = useResource(signal => user ? accountApi.savedProducts(signal) : Promise.resolve([]), [user?.id]);
  if (!user) return <Navigate to="/login" replace/>;
  const items = (Array.isArray(resource.data) ? resource.data : resource.data?.data || []).filter(entry => !removedIds.has(entry.productId || entry.product?.id || entry.id));
  return <div className="container catalog-page"><div className="page-intro"><span className="eyebrow">YOUR COLLECTION</span><h1>Saved finds.</h1><p>Keep the good things close.</p></div>{resource.loading ? <div className="product-grid">{[1,2,3,4].map(item => <Skeleton key={item} className="product-skeleton"/>)}</div> : resource.error ? <EmptyState title="Saved items couldn’t be loaded" description={resource.error.message}/> : items.length ? <div className="product-grid">{items.map((entry, index) => { const product = entry.product || entry; return <ProductCard key={product.id || index} product={product} savedOverride onRemoved={productId => setRemovedIds(ids => new Set([...ids, productId]))}/>; })}</div> : <EmptyState icon={Heart} title="Nothing saved yet" description="Tap the heart on a product to keep it here." action={<Link to="/catalog"><Button>Discover products</Button></Link>}/>}</div>;
}
