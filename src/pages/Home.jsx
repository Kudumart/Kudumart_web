import { useRef } from 'react';
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Gavel, Headphones, Package, RefreshCcw, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { contentApi } from '../api/content';
import ProductCard from '../components/ProductCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { money, plainText } from '../utils/format';
import '../styles/home.css';

function TrendingCarousel({ items }) {
  const track = useRef(null);
  const scroll = direction => track.current?.scrollBy({ left: direction * Math.max(track.current.clientWidth * 0.85, 260), behavior: 'smooth' });
  return <div className="trending-carousel">
    {items.length > 4 && <button type="button" className="trending-carousel__arrow trending-carousel__arrow--prev" aria-label="Scroll trending products left" onClick={() => scroll(-1)}><ChevronLeft size={22}/></button>}
    <div className="trending-carousel__track" ref={track}>{items.map(product => <div className="trending-carousel__item" key={product.id}><ProductCard product={product}/></div>)}</div>
    {items.length > 4 && <button type="button" className="trending-carousel__arrow trending-carousel__arrow--next" aria-label="Scroll trending products right" onClick={() => scroll(1)}><ChevronRight size={22}/></button>}
  </div>;
}

function ProductFeed({ eyebrow, title, description, link, products, emptyTitle, carousel }) {
  return <section className="section section--products"><div className="container">
    <div className="section__head"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div><Link to={link} className="section-link">View all <ArrowUpRight size={17}/></Link></div>
    {products.loading ? <div className="product-grid">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="product-skeleton"/>)}</div>
      : products.error ? <EmptyState icon={RefreshCcw} title="We couldn’t load these products" description="Please check your connection and try again."/>
      : products.data?.length && carousel ? <TrendingCarousel items={products.data}/>
      : products.data?.length ? <div className="product-grid">{products.data.map(product => <ProductCard key={product.id} product={product}/>)}</div>
      : <EmptyState title={emptyTitle} description="Check back soon for more finds."/>}
  </div></section>;
}

function FeaturedAdvert({ advert, index }) {
  const image = advert.media_url || advert.mediaUrl || advert.image || advert.image_url;
  const href = advert.link || advert.redirectUrl || advert.url || '/catalog';
  const external = /^https?:\/\//i.test(href);
  const title = advert.title || advert.name || 'Featured offer';
  const description = plainText(advert.description || advert.caption || 'A fresh find, selected for the KuduMart community.');
  return <a className={`home-advert-card home-advert-card--${index + 1} ${image ? '' : 'home-advert-card--no-image'}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
    <div className="home-advert-card__media">{image ? <img src={image} alt={title} loading="lazy"/> : <span aria-hidden="true">K</span>}</div>
    <div className="home-advert-card__shade" aria-hidden="true"/>
    <div className="home-advert-card__content"><span className="home-advert-card__label">Featured · 0{index + 1}</span><h3>{title}</h3><p>{description}</p><span className="home-advert-card__action">Explore this find <ArrowUpRight size={17}/></span></div>
  </a>;
}

const conditions = [
  { id: 'brand_new', title: 'Brand new', description: 'Fresh out of the box', icon: ShoppingBag },
  { id: 'refurbished', title: 'Refurbished', description: 'Restored and ready', icon: RefreshCcw },
  { id: 'fairly_used', title: 'Pre-loved', description: 'A good find, again', icon: Package },
];

export default function Home() {
  const { country } = useApp();
  const categories = useResource(signal => catalogApi.categories(signal), []);
  const products = useResource(signal => catalogApi.products({ country: country.name, limit: 8, signal }), [country.name]);
  const popular = useResource(signal => catalogApi.products({ country: country.name, popular: true, limit: 100, signal }), [country.name]);
  const auctions = useResource(signal => catalogApi.activeAuctions(country.name, signal), [country.name]);
  const adverts = useResource(signal => contentApi.adverts(signal), []);
  const jobs = useResource(signal => contentApi.jobs('', signal), []);
  const featuredAuction = auctions.data?.[0];

  return <>
    <section className="hero container"><div className="hero__content"><div className="eyebrow eyebrow--light"><span className="eyebrow__dot"/> A MARKETPLACE FOR EVERY POSSIBILITY</div><h1>Good things<br/>start with a <em>find.</em></h1><p>Discover products you’ll love, sellers you can trust, and ideas worth exploring — all in one place.</p><div className="hero__actions"><Link to="/catalog"><Button icon={ShoppingBag}>Explore the marketplace</Button></Link><Link to="/services" className="hero__text-link">Discover services <ArrowUpRight size={18}/></Link></div><div className="hero__proof"><div className="hero__proof-icon"><BadgeCheck size={20}/></div><span>Made for discovery.<br/><strong>Built around you.</strong></span></div></div><div className="hero__visual" aria-label="A curated mix of lifestyle products"><div className="hero-orbit hero-orbit--one"/><div className="hero-orbit hero-orbit--two"/><div className="hero-photo hero-photo--main"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1100&q=85" alt="Modern red sneaker"/></div><div className="hero-photo hero-photo--small"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85" alt="Minimal wristwatch"/></div><div className="hero-sticker"><Sparkles size={19}/><span>Find your<br/><strong>next favorite</strong></span></div><div className="hero-sparkle hero-sparkle--one">✦</div><div className="hero-sparkle hero-sparkle--two">✦</div></div></section>
    <section className="trust-strip"><div className="container trust-strip__inner"><div><ShieldCheck size={23}/><span><strong>Shop with confidence</strong><small>Thoughtful buying, every step</small></span></div><div><Truck size={23}/><span><strong>Find it all in one place</strong><small>Products, services, and more</small></span></div><div><Headphones size={23}/><span><strong>Here when you need us</strong><small>Support for your journey</small></span></div></div></section>
    <ProductFeed eyebrow="TRENDING PRODUCTS" title="The finds everyone’s noticing." description="Explore products handpicked by KuduMart and trending right now." link="/catalog?popular=true" products={popular} carousel emptyTitle="Trending products are on their way"/>
    {adverts.data?.length > 0 && <section className="section container home-adverts"><div className="home-adverts__intro"><div><div className="eyebrow">FEATURED ON KUDUMART</div><h2>Offers worth discovering.</h2><p>A rotating edit of standout products, useful finds, and offers selected for right now.</p></div><Link to="/catalog" className="home-adverts__all">Browse the marketplace <ArrowUpRight size={18}/></Link></div><div className="home-adverts__grid">{adverts.data.slice(0, 4).map((advert, index) => <FeaturedAdvert advert={advert} index={index} key={advert.id || index}/>)}</div></section>}
    <section className="section container"><div className="section__head"><div><div className="eyebrow">EXPLORE YOUR WAY</div><h2>What are you looking for?</h2><p>Start somewhere that sparks your curiosity.</p></div><Link to="/catalog" className="section-link">View all categories <ArrowUpRight size={17}/></Link></div><div className="category-grid">{categories.loading ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="category-skeleton"/>) : categories.data?.length ? categories.data.slice(0, 5).map((category, index) => <Link to={`/catalog?category=${encodeURIComponent(category.id)}&name=${encodeURIComponent(category.name)}`} className={`category-card category-card--${index % 5}`} key={category.id}><span className="category-card__number">0{index + 1}</span>{category.image && <img src={category.image} alt="" loading="lazy"/>}<span className="category-card__title">{category.name}</span><span className="category-card__arrow"><ArrowUpRight size={19}/></span></Link>) : <div className="category-grid__empty"><EmptyState title="Categories are on their way" description="Explore the full catalog while we load the latest categories." action={<Link to="/catalog"><Button variant="outline">Shop all</Button></Link>}/></div>}</div></section>
    <ProductFeed eyebrow="JUST LANDED" title="Fresh finds, just for you." description="See what’s new in the marketplace." link="/catalog" products={products} emptyTitle="No products available yet"/>
    <section className="section container"><div className="section__head"><div><div className="eyebrow">CHOOSE YOUR KIND OF FIND</div><h2>Shop by condition.</h2><p>Discover something that fits what you need.</p></div></div><div className="condition-grid">{conditions.map(({ id, title, description, icon: Icon }) => <Link to={`/catalog?condition=${id}`} className="condition-card" key={id}><span className="condition-card__icon"><Icon size={26}/></span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight className="condition-card__arrow" size={20}/></Link>)}</div></section>
    {featuredAuction && <section className="section container auction-spotlight-section"><div className="section__head"><div><div className="eyebrow">LIVE ON KUDUMART</div><h2>An auction worth a look.</h2><p>Take a closer look at an active listing.</p></div><Link to="/auctions" className="section-link">Explore auctions <ArrowUpRight size={17}/></Link></div><Link to={`/auction/product/${featuredAuction.id}`} className="auction-spotlight"><div className="auction-spotlight__image">{(featuredAuction.image || featuredAuction.image_url) && <img src={featuredAuction.image || featuredAuction.image_url} alt={featuredAuction.name || 'Auction product'} loading="lazy"/>}</div><div className="auction-spotlight__content"><span className="auction-spotlight__label"><Gavel size={16}/> {featuredAuction.auctionStatus === 'ongoing' ? 'Ongoing auction' : 'Upcoming auction'}</span><h3>{featuredAuction.name}</h3><p>See the listing details and its starting price.</p><strong>{money(featuredAuction.price, featuredAuction.store?.currency?.symbol || country.symbol)}</strong><span className="auction-spotlight__link">View auction <ArrowUpRight size={18}/></span></div></Link></section>}
    <section className="feature-grid container"><Link to="/auctions" className="feature-card feature-card--orange"><div className="eyebrow">THE THRILL OF THE FIND</div><h2>Discover it.<br/>Bid for it.<br/>Make it yours.</h2><span>Explore auctions <ArrowUpRight size={18}/></span><div className="feature-card__shape feature-card__shape--ring"/></Link><Link to="/services" className="feature-card feature-card--blue"><div className="eyebrow">MORE THAN PRODUCTS</div><h2>Find the right<br/>people for<br/>the job.</h2><span>Explore services <ArrowUpRight size={18}/></span><div className="feature-card__shape feature-card__shape--star">✳</div></Link></section>
    {jobs.data?.length > 0 && <section className="section container home-jobs"><div className="section__head"><div><div className="eyebrow">GROW WITH US</div><h2>Help build what’s next.</h2><p>Explore open opportunities at KuduMart.</p></div><Link to="/careers" className="section-link">See all roles <ArrowUpRight size={17}/></Link></div><div className="job-list">{jobs.data.slice(0, 3).map(job => <Link to={`/careers/${job.id}`} key={job.id}><span><strong>{job.title || job.jobTitle}</strong><small>{[job.department, job.location].filter(Boolean).join(' · ')}</small></span><ArrowRight/></Link>)}</div></section>}
    <section className="closing-cta container"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Have something great to share?</h2><p>Bring your products and ideas to a marketplace built for connection.</p></div><Link to="/register?type=Vendor"><Button variant="dark" icon={ArrowRight}>Become a seller</Button></Link></section>
  </>;
}
