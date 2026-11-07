import { useMemo, useRef, useState } from 'react';
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
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { contentApi } from '../api/content';
import ProductCard from '../components/ProductCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useResource } from '../hooks/useResource';
import { imageFor, money, plainText, priceFor } from '../utils/format';
import '../styles/home.css';

function TrendingShowcase({ products, countrySymbol }) {
  const track = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const items = products.data || [];

  const categoryTabs = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      const name = item?.sub_category?.name || item?.category?.name;
      if (name && !map.has(name)) map.set(name, name);
    });
    return Array.from(map.values()).slice(0, 5);
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter(
      item => (item?.sub_category?.name || item?.category?.name) === activeCategory,
    );
  }, [items, activeCategory]);

  const spotlight = filtered[0] || items[0];
  const rest = filtered.length > 1 ? filtered.slice(1) : filtered;
  const spotlightPrice = spotlight ? priceFor(spotlight) : null;
  const spotlightSymbol = spotlight?.store?.currency?.symbol || countrySymbol || '₦';

  const scroll = direction =>
    track.current?.scrollBy({
      left: direction * Math.max(track.current.clientWidth * 0.85, 280),
      behavior: 'smooth',
    });

  return (
    <section className="section section--trending">
      <div className="container">
        <div className="trending-shell">
          <div className="trending-shell__head">
            <div className="trending-shell__intro">
              <div className="trending-eyebrow">
                <span className="trending-eyebrow__badge">
                  <Flame size={14} /> LIVE PULSE
                </span>
                <span>TRENDING ON KUDUMART</span>
              </div>
              <h2>The finds everyone’s talking about.</h2>
              <p>
                Handpicked by KuduMart curators and rising fast across verified stores right now.
              </p>
            </div>

            <div className="trending-shell__controls">
              {categoryTabs.length > 1 && (
                <div className="trending-pills" role="tablist" aria-label="Filter trending products">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === 'all'}
                    className={`trending-pill ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    All ({items.length})
                  </button>
                  {categoryTabs.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      role="tab"
                      aria-selected={activeCategory === cat}
                      className={`trending-pill ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="trending-nav-group">
                {rest.length > 2 && (
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
                <Link to="/catalog?popular=true" className="trending-view-all">
                  Explore all <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {products.loading ? (
            <Skeleton className="product-skeleton" label="Curating trending finds" />
          ) : products.error ? (
            <EmptyState
              icon={RefreshCcw}
              title="We couldn’t load trending products"
              description="Please check your connection and try again."
            />
          ) : spotlight ? (
            <div className="trending-stage">
              <Link to={`/product/${spotlight.id}`} className="trending-spotlight">
                <div className="trending-spotlight__media">
                  {imageFor(spotlight) ? (
                    <img src={imageFor(spotlight)} alt={spotlight.name} loading="lazy" />
                  ) : (
                    <div className="trending-spotlight__placeholder">
                      <ShoppingBag size={42} />
                    </div>
                  )}
                  <div className="trending-spotlight__overlay" />
                  <div className="trending-spotlight__top">
                    <span className="trending-spotlight__rank">
                      <Flame size={14} /> #01 Most Wanted
                    </span>
                    {spotlight.condition && (
                      <span className="trending-spotlight__condition">
                        {String(spotlight.condition).replaceAll('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="trending-spotlight__content">
                  <div className="trending-spotlight__store">
                    <Store size={14} />
                    <span>{spotlight.store?.name || 'KuduMart Verified Store'}</span>
                    <BadgeCheck size={14} className="trending-spotlight__verified" />
                  </div>
                  <h3>{spotlight.name}</h3>
                  <p>
                    {plainText(
                      spotlight.description ||
                        'Standout quality and verified value, spotlighted by KuduMart shoppers.',
                    ).slice(0, 110)}
                  </p>
                  <div className="trending-spotlight__footer">
                    <div className="trending-spotlight__price">
                      <span>Featured price</span>
                      <strong>{money(spotlightPrice.current, spotlightSymbol)}</strong>
                      {spotlightPrice.discounted && (
                        <del>{money(spotlightPrice.original, spotlightSymbol)}</del>
                      )}
                    </div>
                    <span className="trending-spotlight__cta">
                      Shop find <ArrowUpRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>

              <div className="trending-carousel">
                <div className="trending-carousel__track" ref={track}>
                  {rest.map((product, idx) => (
                    <div className="trending-carousel__item" key={product.id}>
                      <ProductCard product={product} rank={idx + 2} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Trending products are on their way"
              description="Check back soon for more finds."
            />
          )}
        </div>
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
          <Skeleton className="product-skeleton" label="Loading fresh arrivals" />
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
  { id: 'brand_new', title: 'Brand new', description: 'Factory-sealed & fresh out of the box', icon: ShoppingBag },
  { id: 'refurbished', title: 'Refurbished', description: 'Expertly restored, tested & ready', icon: RefreshCcw },
  { id: 'fairly_used', title: 'Pre-loved', description: 'Quality checked at standout value', icon: Package },
];

export default function Home() {
  const { country } = useApp();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
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

  const heroPrimary = popular.data?.[0] || products.data?.[0];
  const heroSecondary = popular.data?.[1] || products.data?.[1];

  const submitHeroSearch = event => {
    event.preventDefault();
    const trimmed = heroSearch.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/catalog');
  };

  return (
    <>
      <section className="hero container">
        <div className="hero__glow hero__glow--one" aria-hidden="true" />
        <div className="hero__glow hero__glow--two" aria-hidden="true" />

        <div className="hero__content">
          <div className="hero__badge-bar">
            <span className="hero__badge-live">
              <span className="eyebrow__dot" /> MARKETPLACE LIVE
            </span>
            <span className="hero__badge-divider">·</span>
            <span>Products, Auctions & Professional Services</span>
          </div>

          <h1>
            Discover what’s next, from <em>sellers you trust.</em>
          </h1>

          <p>
            Shop verified stores, bid on standout live auctions, and book skilled professionals — all backed by secure checkout and nationwide delivery.
          </p>

          <form className="hero__search" onSubmit={submitHeroSearch} role="search">
            <Search size={18} className="hero__search-icon" aria-hidden="true" />
            <input
              type="search"
              value={heroSearch}
              onChange={event => setHeroSearch(event.target.value)}
              placeholder="Search electronics, fashion, home essentials, or services…"
              aria-label="Search marketplace"
            />
            <button type="submit">
              Search <ArrowRight size={16} />
            </button>
          </form>

          <div className="hero__quick-tags">
            <span>Popular:</span>
            <Link to="/catalog?popular=true">
              <Flame size={12} /> Trending finds
            </Link>
            <Link to="/catalog?condition=brand_new">Brand new</Link>
            <Link to="/auctions">Live auctions</Link>
            <Link to="/services">Book services</Link>
          </div>

          <div className="hero__actions">
            <Link to="/catalog">
              <Button icon={ShoppingBag}>Explore marketplace</Button>
            </Link>
            <Link to="/register?type=Vendor" className="hero__text-link">
              Start selling on KuduMart <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="hero__metrics">
            <div className="hero__metric">
              <span className="hero__metric-icon">
                <BadgeCheck size={18} />
              </span>
              <div>
                <strong>Verified Stores</strong>
                <small>KYC-vetted merchants</small>
              </div>
            </div>
            <div className="hero__metric">
              <span className="hero__metric-icon">
                <ShieldCheck size={18} />
              </span>
              <div>
                <strong>Protected Pay</strong>
                <small>Safe NGN & USD checkout</small>
              </div>
            </div>
            <div className="hero__metric">
              <span className="hero__metric-icon">
                <Truck size={18} />
              </span>
              <div>
                <strong>Clear Delivery</strong>
                <small>Instant city & state quotes</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-label="Featured marketplace highlights">
          <div className="hero-bento">
            <Link
              to={heroPrimary ? `/product/${heroPrimary.id}` : '/catalog?popular=true'}
              className="hero-bento__card hero-bento__card--main"
            >
              <img
                src={
                  imageFor(heroPrimary) ||
                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1100&q=85'
                }
                alt={heroPrimary?.name || 'Featured marketplace product'}
              />
              <div className="hero-bento__shade" />
              <span className="hero-bento__tag">
                <Sparkles size={13} /> Editor’s Pick
              </span>
              <div className="hero-bento__caption">
                <div>
                  <small>{heroPrimary?.store?.name || 'Curated Collection'}</small>
                  <strong>{heroPrimary?.name || 'Standout Everyday Essentials'}</strong>
                </div>
                <span className="hero-bento__price">
                  {heroPrimary
                    ? money(
                        priceFor(heroPrimary).current,
                        heroPrimary?.store?.currency?.symbol || country.symbol,
                      )
                    : 'Explore →'}
                </span>
              </div>
            </Link>

            <Link
              to={heroSecondary ? `/product/${heroSecondary.id}` : '/catalog'}
              className="hero-bento__card hero-bento__card--secondary"
            >
              <img
                src={
                  imageFor(heroSecondary) ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85'
                }
                alt={heroSecondary?.name || 'Trending product'}
              />
              <div className="hero-bento__shade" />
              <div className="hero-bento__mini-caption">
                <small>Trending Now</small>
                <strong>{heroSecondary?.name || 'Verified Quality Finds'}</strong>
              </div>
            </Link>

            <div className="hero-bento__card hero-bento__card--stat">
              <div className="hero-bento__stat-head">
                <span className="hero-bento__stat-icon">
                  <TrendingUp size={18} />
                </span>
                <span className="hero-bento__stat-pill">Live</span>
              </div>
              <strong>3 Ways to Shop</strong>
              <p>Instant buy, make an offer to sellers, or bid on live auctions.</p>
              <div className="hero-bento__stat-links">
                <Link to="/auctions">
                  Auctions <ArrowUpRight size={13} />
                </Link>
                <Link to="/services">
                  Services <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
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

      <TrendingShowcase products={popular} countrySymbol={country.symbol} />

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
              {(featuredAuction.image || featuredAuction.image_url) && (
                <img
                  src={featuredAuction.image || featuredAuction.image_url}
                  alt={featuredAuction.name || 'Auction product'}
                  loading="lazy"
                />
              )}
            </div>
            <div className="auction-spotlight__content">
              <span className="auction-spotlight__label">
                <Gavel size={16} />{' '}
                {featuredAuction.auctionStatus === 'ongoing' ? 'Ongoing auction' : 'Upcoming auction'}
              </span>
              <h3>{featuredAuction.name}</h3>
              <p>See the listing details and its starting price.</p>
              <strong>
                {money(featuredAuction.price, featuredAuction.store?.currency?.symbol || country.symbol)}
              </strong>
              <span className="auction-spotlight__link">
                View auction <ArrowUpRight size={18} />
              </span>
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
