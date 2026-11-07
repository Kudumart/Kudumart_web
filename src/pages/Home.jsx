import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gavel,
  Headphones,
  Package,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { contentApi } from '../api/content';
import ProductCard from '../components/ProductCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { money, plainText } from '../utils/format';
import '../styles/home.css';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=85',
    label: 'Electronics & Gadgets',
    caption: 'Laptops, audio, phones & everyday tech from verified stores',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85',
    label: 'Fashion & Footwear',
    caption: 'Standout sneakers, apparel & accessories for every style',
  },
  {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    label: 'Home & Living',
    caption: 'Furniture, appliances & essentials to elevate your space',
  },
  {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    label: 'Curated Essentials',
    caption: 'Brand new, refurbished & pre-loved finds at great value',
  },
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=85',
    label: 'One Marketplace for All',
    caption: 'Shop fixed-price products, bid on auctions & book services',
  },
];

function HeroImageShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Only auto-switch carousel on desktop screens
    if (typeof window !== 'undefined' && window.innerWidth <= 800) return;
    const timer = setInterval(() => {
      setActive(current => (current + 1) % HERO_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero__visual" aria-label="Featured marketplace categories">
      <div className="hero-slider">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className={`hero-slide ${index === active ? 'is-active' : ''}`}
            aria-hidden={index !== active}
          >
            <img src={slide.image} alt={slide.label} loading={index === 0 ? 'eager' : 'lazy'} />
            <div className="hero-slide__shade" />
            <div className="hero-slide__info">
              <span className="hero-slide__tag">{slide.label}</span>
              <p>{slide.caption}</p>
            </div>
          </div>
        ))}

        <div className="hero-slider__dots" role="tablist" aria-label="Showcase slides">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.label}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Show ${slide.label}`}
              className={`hero-slider__dot ${index === active ? 'is-active' : ''}`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendingSection({ products }) {
  const track = useRef(null);
  const [filterMode, setFilterMode] = useState('all');
  const items = products.data || [];

  const categoryTabs = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      const name = item?.sub_category?.name || item?.category?.name;
      if (name && !map.has(name)) map.set(name, name);
    });
    return Array.from(map.values()).slice(0, 6);
  }, [items]);

  const hasVerified = useMemo(
    () => items.some(item => item?.vendor?.isVerified || item?.store?.isVerified || item?.admin),
    [items],
  );

  const filtered = useMemo(() => {
    if (filterMode === 'all') return items;
    if (filterMode === 'verified') {
      return items.filter(
        item => item?.vendor?.isVerified || item?.store?.isVerified || item?.admin,
      );
    }
    return items.filter(
      item => (item?.sub_category?.name || item?.category?.name) === filterMode,
    );
  }, [items, filterMode]);

  const scroll = direction =>
    track.current?.scrollBy({
      left: direction * Math.max(track.current.clientWidth * 0.75, 260),
      behavior: 'smooth',
    });

  return (
    <section className="section section--products trending-section">
      <div className="container">
        <div className="section__head trending-head">
          <div>
            <div className="eyebrow eyebrow--trending">
              <Flame size={15} className="trending-fire-icon" />
              <span>TRENDING PRODUCTS</span>
            </div>
            <h2>The finds everyone’s noticing.</h2>
            <p>Popular picks and rising discoveries across verified KuduMart sellers.</p>
          </div>
          <div className="trending-head__actions">
            {filtered.length > 5 && (
              <div className="trending-arrows">
                <button
                  type="button"
                  className="trending-arrow"
                  aria-label="Scroll trending products left"
                  onClick={() => scroll(-1)}
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  type="button"
                  className="trending-arrow"
                  aria-label="Scroll trending products right"
                  onClick={() => scroll(1)}
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            )}
            <Link to="/catalog?popular=true" className="section-link">
              View all <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>

        <div className="trending-subbar">
          <div className="trending-pills" role="tablist" aria-label="Filter trending products">
            <button
              type="button"
              role="tab"
              aria-selected={filterMode === 'all'}
              className={`trending-pill ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All trending {items.length ? `(${items.length})` : ''}
            </button>
            {hasVerified && (
              <button
                type="button"
                role="tab"
                aria-selected={filterMode === 'verified'}
                className={`trending-pill ${filterMode === 'verified' ? 'active' : ''}`}
                onClick={() => setFilterMode('verified')}
              >
                Verified stores
              </button>
            )}
            {categoryTabs.map(cat => (
              <button
                type="button"
                key={cat}
                role="tab"
                aria-selected={filterMode === cat}
                className={`trending-pill ${filterMode === cat ? 'active' : ''}`}
                onClick={() => setFilterMode(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="trending-highlights">
            <span className="trending-highlight-tag">
              <BadgeCheck size={14} /> Verified merchants
            </span>
            <span className="trending-highlight-tag">
              <ShieldCheck size={14} /> Protected checkout
            </span>
          </div>
        </div>

        {products.loading ? (
          <Skeleton className="product-skeleton" label="Loading trending products" />
        ) : products.error ? (
          <EmptyState
            icon={RefreshCcw}
            title="We couldn’t load these products"
            description="Please check your connection and try again."
          />
        ) : filtered.length ? (
          <div className="trending-carousel">
            <div className="trending-carousel__track" ref={track}>
              {filtered.map(product => (
                <div className="trending-carousel__item" key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No matching trending products"
            description="Try switching categories or explore the full catalog."
            action={
              <Button variant="outline" onClick={() => setFilterMode('all')}>
                Show all trending
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}

function ProductFeed({ eyebrow, title, description, link, products, emptyTitle }) {
  return (
    <section className="section section--products">
      <div className="container">
        <div className="section__head">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Link to={link} className="section-link">
            View all <ArrowUpRight size={17} />
          </Link>
        </div>
        {products.loading ? (
          <Skeleton className="product-skeleton" label="Loading products" />
        ) : products.error ? (
          <EmptyState
            icon={RefreshCcw}
            title="We couldn’t load these products"
            description="Please check your connection and try again."
          />
        ) : products.data?.length ? (
          <div className="product-grid">
            {products.data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState title={emptyTitle} description="Check back soon for more finds." />
        )}
      </div>
    </section>
  );
}

function FeaturedAdvert({ advert, index }) {
  const image = advert.media_url || advert.mediaUrl || advert.image || advert.image_url;
  const href = advert.link || advert.redirectUrl || advert.url || '/catalog';
  const external = /^https?:\/\//i.test(href);
  const title = advert.title || advert.name || 'Featured offer';
  const description = plainText(
    advert.description || advert.caption || 'A fresh find, selected for the KuduMart community.',
  );
  return (
    <a
      className={`home-advert-card home-advert-card--${index + 1} ${image ? '' : 'home-advert-card--no-image'}`}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <div className="home-advert-card__media">
        {image ? <img src={image} alt={title} loading="lazy" /> : <span aria-hidden="true">K</span>}
      </div>
      <div className="home-advert-card__shade" aria-hidden="true" />
      <div className="home-advert-card__content">
        <span className="home-advert-card__label">Featured · 0{index + 1}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="home-advert-card__action">
          Explore this find <ArrowUpRight size={17} />
        </span>
      </div>
    </a>
  );
}

const conditions = [
  { id: 'brand_new', title: 'Brand new', description: 'Fresh out of the box', icon: ShoppingBag },
  { id: 'refurbished', title: 'Refurbished', description: 'Restored and ready', icon: RefreshCcw },
  { id: 'fairly_used', title: 'Pre-loved', description: 'A good find, again', icon: Package },
];

export default function Home() {
  const { country } = useApp();
  const categories = useResource(signal => catalogApi.categories(signal), []);
  const products = useResource(
    signal => catalogApi.products({ country: country.name, limit: 8, signal }),
    [country.name],
  );
  const popular = useResource(
    signal => catalogApi.products({ country: country.name, popular: true, limit: 100, signal }),
    [country.name],
  );
  const auctions = useResource(signal => catalogApi.activeAuctions(country.name, signal), [country.name]);
  const adverts = useResource(signal => contentApi.adverts(signal), []);
  const jobs = useResource(signal => contentApi.jobs('', signal), []);
  const featuredAuction = auctions.data?.[0];

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <h1>
            Good things
            <br />
            start with a <em>find.</em>
          </h1>
          <p>
            Discover products you’ll love, sellers you can trust, and ideas worth exploring — all in one place.
          </p>
          <div className="hero__actions">
            <Link to="/catalog">
              <Button icon={ShoppingBag}>Explore the marketplace</Button>
            </Link>
            <Link to="/services" className="hero__text-link">
              Discover services <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="hero__proof">
            <div className="hero__proof-icon">
              <BadgeCheck size={20} />
            </div>
            <span>
              Made for discovery.
              <br />
              <strong>Built around you.</strong>
            </span>
          </div>
        </div>

        <HeroImageShowcase />
      </section>

      <section className="trust-strip">
        <div className="container trust-strip__inner">
          <div>
            <ShieldCheck size={23} />
            <span>
              <strong>Shop with confidence</strong>
              <small>Thoughtful buying, every step</small>
            </span>
          </div>
          <div>
            <Truck size={23} />
            <span>
              <strong>Find it all in one place</strong>
              <small>Products, services, and more</small>
            </span>
          </div>
          <div>
            <Headphones size={23} />
            <span>
              <strong>Here when you need us</strong>
              <small>Support for your journey</small>
            </span>
          </div>
        </div>
      </section>

      <TrendingSection products={popular} />

      {adverts.data?.length > 0 && (
        <section className="section container home-adverts">
          <div className="home-adverts__intro">
            <div>
              <div className="eyebrow">FEATURED ON KUDUMART</div>
              <h2>Offers worth discovering.</h2>
              <p>
                A rotating edit of standout products, useful finds, and offers selected for right now.
              </p>
            </div>
            <Link to="/catalog" className="home-adverts__all">
              Browse the marketplace <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="home-adverts__grid">
            {adverts.data.slice(0, 4).map((advert, index) => (
              <FeaturedAdvert advert={advert} index={index} key={advert.id || index} />
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section__head">
          <div>
            <div className="eyebrow">EXPLORE YOUR WAY</div>
            <h2>What are you looking for?</h2>
            <p>Start somewhere that sparks your curiosity.</p>
          </div>
          <Link to="/catalog" className="section-link">
            View all categories <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.loading ? (
            <Skeleton className="category-skeleton" label="Loading categories" />
          ) : categories.data?.length ? (
            categories.data.slice(0, 5).map((category, index) => (
              <Link
                to={`/catalog?category=${encodeURIComponent(category.id)}&name=${encodeURIComponent(category.name)}`}
                className={`category-card category-card--${index % 5}`}
                key={category.id}
              >
                <span className="category-card__number">0{index + 1}</span>
                {category.image && <img src={category.image} alt="" loading="lazy" />}
                <span className="category-card__title">{category.name}</span>
                <span className="category-card__arrow">
                  <ArrowUpRight size={19} />
                </span>
              </Link>
            ))
          ) : (
            <div className="category-grid__empty">
              <EmptyState
                title="Categories are on their way"
                description="Explore the full catalog while we load the latest categories."
                action={
                  <Link to="/catalog">
                    <Button variant="outline">Shop all</Button>
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>

      <ProductFeed
        eyebrow="JUST LANDED"
        title="Fresh finds, just for you."
        description="See what’s new in the marketplace."
        link="/catalog"
        products={products}
        emptyTitle="No products available yet"
      />

      <section className="section container">
        <div className="section__head">
          <div>
            <div className="eyebrow">CHOOSE YOUR KIND OF FIND</div>
            <h2>Shop by condition.</h2>
            <p>Discover something that fits what you need.</p>
          </div>
        </div>
        <div className="condition-grid">
          {conditions.map(({ id, title, description, icon: Icon }) => (
            <Link to={`/catalog?condition=${id}`} className="condition-card" key={id}>
              <span className="condition-card__icon">
                <Icon size={26} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowUpRight className="condition-card__arrow" size={20} />
            </Link>
          ))}
        </div>
      </section>

      {featuredAuction && (
        <section className="section container auction-spotlight-section">
          <div className="section__head">
            <div>
              <div className="eyebrow">LIVE ON KUDUMART</div>
              <h2>An auction worth a look.</h2>
              <p>Take a closer look at an active listing.</p>
            </div>
            <Link to="/auctions" className="section-link">
              Explore auctions <ArrowUpRight size={17} />
            </Link>
          </div>
          <Link to={`/auction/product/${featuredAuction.id}`} className="auction-spotlight">
            <div className="auction-spotlight__image">
              {(featuredAuction.image || featuredAuction.image_url) ? (
                <img
                  src={featuredAuction.image || featuredAuction.image_url}
                  alt={featuredAuction.name || 'Auction product'}
                  loading="lazy"
                />
              ) : (
                <Package size={48} />
              )}
              <span className="auction-spotlight__badge">
                <Gavel size={13} />{' '}
                {featuredAuction.auctionStatus === 'ongoing' ? 'Live bidding' : 'Upcoming'}
              </span>
            </div>
            <div className="auction-spotlight__content">
              <span className="auction-spotlight__label">
                <Gavel size={15} />{' '}
                {featuredAuction.auctionStatus === 'ongoing' ? 'Ongoing auction' : 'Upcoming auction'}
              </span>
              <h3>{featuredAuction.name}</h3>
              <p>Explore live bidding and see the opening price on this listing.</p>
              <div className="auction-spotlight__footer">
                <div className="auction-spotlight__price-row">
                  <span className="auction-spotlight__price-label">Starting bid</span>
                  <strong>
                    {money(featuredAuction.price, featuredAuction.store?.currency?.symbol || country.symbol)}
                  </strong>
                </div>
                <span className="auction-spotlight__link">
                  View auction <ArrowUpRight size={17} />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="feature-grid container">
        <Link to="/auctions" className="feature-card feature-card--orange">
          <div className="eyebrow">THE THRILL OF THE FIND</div>
          <h2>
            Discover it.
            <br />
            Bid for it.
            <br />
            Make it yours.
          </h2>
          <span>
            Explore auctions <ArrowUpRight size={18} />
          </span>
          <div className="feature-card__shape feature-card__shape--ring" />
        </Link>
        <Link to="/services" className="feature-card feature-card--blue">
          <div className="eyebrow">MORE THAN PRODUCTS</div>
          <h2>
            Find the right
            <br />
            people for
            <br />
            the job.
          </h2>
          <span>
            Explore services <ArrowUpRight size={18} />
          </span>
          <div className="feature-card__shape feature-card__shape--star">✳</div>
        </Link>
      </section>

      {jobs.data?.length > 0 && (
        <section className="section container home-jobs">
          <div className="section__head">
            <div>
              <div className="eyebrow">GROW WITH US</div>
              <h2>Help build what’s next.</h2>
              <p>Explore open opportunities at KuduMart.</p>
            </div>
            <Link to="/careers" className="section-link">
              See all roles <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="job-list">
            {jobs.data.slice(0, 3).map(job => (
              <Link to={`/careers/${job.id}`} key={job.id}>
                <span>
                  <strong>{job.title || job.jobTitle}</strong>
                  <small>{[job.department, job.location].filter(Boolean).join(' · ')}</small>
                </span>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="closing-cta container">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>Have something great to share?</h2>
          <p>Bring your products and ideas to a marketplace built for connection.</p>
        </div>
        <Link to="/register?type=Vendor">
          <Button variant="dark" icon={ArrowRight}>
            Become a seller
          </Button>
        </Link>
      </section>
    </>
  );
}
