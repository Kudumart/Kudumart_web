import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  HelpCircle,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { contentApi } from "../api/content";
import { uploadFile } from "../api/upload";
import { useResource } from "../hooks/useResource";
import { Button, EmptyState, Skeleton } from "../components/ui";

const pageCopy = {
  about: {
    eyebrow: "OUR STORY",
    title: "A marketplace built around real connections.",
    intro:
      "KuduMart brings buyers, sellers, service providers and opportunity into one trusted place.",
    sections: [
      [
        "What we do",
        "We make it easier to discover products, compare choices, meet credible sellers and find useful services.",
      ],
      [
        "Why KuduMart",
        "Commerce should feel human, transparent and accessible. We are building tools that help people participate confidently.",
      ],
      [
        "Our promise",
        "We keep improving safety, support and marketplace quality as our community grows.",
      ],
    ],
  },
  privacy: {
    eyebrow: "YOUR PRIVACY",
    title: "Privacy policy.",
    intro:
      "This policy explains how KuduMart collects, uses and protects information when you use our services.",
    sections: [
      [
        "Information we collect",
        "We collect account, transaction, device and usage information needed to operate and improve KuduMart.",
      ],
      [
        "How we use information",
        "We use information to provide services, process transactions, prevent fraud, support users and communicate important updates.",
      ],
      [
        "Sharing and retention",
        "We share information only with service providers, transaction participants or authorities when required. We retain it only as long as necessary.",
      ],
      [
        "Your choices",
        "You may update your profile, communication preferences or request account deletion from your account settings.",
      ],
    ],
  },
  terms: {
    eyebrow: "USING KUDUMART",
    title: "Terms and conditions.",
    intro:
      "These terms govern access to KuduMart and the transactions made through the marketplace.",
    sections: [
      [
        "Marketplace responsibilities",
        "Users must provide accurate information, respect applicable laws and fulfil commitments made to other users.",
      ],
      [
        "Listings and transactions",
        "Sellers are responsible for their listings. Buyers should review product, service, delivery and return information before payment.",
      ],
      [
        "Safety and enforcement",
        "KuduMart may review, restrict or remove content and accounts that create risk or violate marketplace rules.",
      ],
      [
        "Changes to these terms",
        "We may update these terms as our services evolve. Continued use after an update means the revised terms apply.",
      ],
    ],
  },
  cookies: {
    eyebrow: "SITE PREFERENCES",
    title: "Cookie policy.",
    intro:
      "Cookies and similar technologies help KuduMart remember preferences, keep sessions secure and understand performance.",
    sections: [
      [
        "Essential cookies",
        "These support authentication, security, shopping-cart and core marketplace functions.",
      ],
      [
        "Analytics and preferences",
        "These help us understand product usage and remember choices such as country and currency.",
      ],
      [
        "Managing cookies",
        "Your browser lets you remove or block cookies, although some KuduMart features may then work differently.",
      ],
    ],
  },
  returns: {
    eyebrow: "BUY WITH CLARITY",
    title: "Return and refund policy.",
    intro:
      "Return eligibility depends on the listing, item condition and the circumstances of the transaction.",
    sections: [
      [
        "Before you buy",
        "Review the listing description, seller terms, condition, warranty and delivery information before placing an order.",
      ],
      [
        "Report an issue",
        "If an item is materially different, damaged or not delivered, contact support promptly and preserve relevant evidence.",
      ],
      [
        "Resolution",
        "Eligible cases may result in replacement, return or refund after review. Custom, consumed or misused items may not qualify.",
      ],
    ],
  },
};

export function ContentPage({ kind }) {
  const copy = pageCopy[kind];
  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>
      <section className="container public-copy">
        {copy.sections.map(([title, body]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    emailAddress: "",
    phoneNumber: "",
    message: "",
  });
  const [state, setState] = useState({ busy: false, error: "", sent: false });
  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: "", sent: false });
    try {
      await contentApi.contact(form);
      setState({ busy: false, error: "", sent: true });
      setForm({ name: "", emailAddress: "", phoneNumber: "", message: "" });
    } catch (error) {
      setState({ busy: false, error: error.message, sent: false });
    }
  };
  return (
    <div className="container public-form-page">
      <div className="public-form-intro">
        <span className="eyebrow">CONTACT US</span>
        <h1>How can we help?</h1>
        <p>Tell us what you need and our support team will get back to you.</p>
        <div>
          <Mail />
          <span>
            <strong>Email</strong>
            <a href="mailto:support@kudumart.com">support@kudumart.com</a>
          </span>
        </div>
        <div>
          <MapPin />
          <span>
            <strong>Marketplace support</strong>
            <small>Nigeria</small>
          </span>
        </div>
      </div>
      <form className="public-form" onSubmit={submit}>
        <label>
          Full name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Email address
          <input
            type="email"
            value={form.emailAddress}
            onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
            required
          />
        </label>
        <label>
          Phone number
          <input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </label>
        <label>
          Message
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
        </label>
        {state.error && <p className="form-alert">{state.error}</p>}
        {state.sent && (
          <p className="form-success">
            Message sent. We’ll be in touch shortly.
          </p>
        )}
        <Button type="submit" loading={state.busy}>
          Send message
        </Button>
      </form>
    </div>
  );
}

export function Faqs() {
  const groups = useResource((signal) => contentApi.faqGroups(signal), []);
  const [query, setQuery] = useState("");
  const entries = useMemo(
    () =>
      (groups.data || [])
        .flatMap((group) =>
          (group.faqs || group.Faqs || []).map((faq) => ({
            ...faq,
            category: group.name,
          })),
        )
        .filter((item) =>
          `${item.question} ${item.answer}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [groups.data, query],
  );
  return (
    <div className="container public-list-page">
      <div className="public-list-head">
        <HelpCircle />
        <span className="eyebrow">HELP CENTRE</span>
        <h1>Frequently asked questions.</h1>
        <p>Quick answers about buying, selling, payments and using KuduMart.</p>
        <label>
          <Search size={18} />
          <input
            placeholder="Search questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {groups.loading ? (
        <Skeleton className="public-loading" />
      ) : entries.length ? (
        <div className="faq-list">
          {entries.map((faq, index) => (
            <details key={faq.id || index}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching answers"
          description="Try another search or contact our support team."
        />
      )}
    </div>
  );
}

export function Testimonials() {
  const items = useResource((signal) => contentApi.testimonials(signal), []);
  return (
    <div className="container public-list-page">
      <div className="public-list-head">
        <span className="eyebrow">COMMUNITY STORIES</span>
        <h1>What people say about KuduMart.</h1>
      </div>
      {items.loading ? (
        <Skeleton className="public-loading" />
      ) : items.data?.length ? (
        <div className="testimonial-grid">
          {items.data.map((item, index) => (
            <blockquote key={item.id || index}>
              <p>“{item.message || item.testimonial || item.description}”</p>
              <footer>
                <strong>
                  {item.name || item.fullName || "KuduMart customer"}
                </strong>
                <span>{item.title || item.role || ""}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Stories are coming soon"
          description="We’re collecting experiences from the KuduMart community."
        />
      )}
    </div>
  );
}

export function DownloadApp() {
  return (
    <div className="download-page">
      <section className="container download-card">
        <div>
          <span className="eyebrow">KUDUMART, EVERYWHERE</span>
          <h1>Take the marketplace with you.</h1>
          <p>
            Shop, sell, follow orders and manage your business from the KuduMart
            mobile app.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.kudu.app"
            target="_blank"
            rel="noreferrer"
          >
            <Button icon={Download}>Get it on Google Play</Button>
          </a>
        </div>
        <div className="download-phone">
          <ShoppingPhone />
        </div>
      </section>
    </div>
  );
}

export function AdvertiseWithUs() {
  return (
    <div className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="eyebrow">GROW ON KUDUMART</span>
          <h1>Put your brand in front of ready buyers.</h1>
          <p>
            Promote a product, store, or campaign across KuduMart with
            placements designed for marketplace discovery.
          </p>
          <Link to="/register?type=Vendor">
            <Button icon={ArrowRight}>Create a seller account</Button>
          </Link>
        </div>
      </section>
      <section className="container public-copy">
        <article>
          <h2>Marketplace visibility</h2>
          <p>
            Reach customers while they browse products, stores, and categories
            that match their interests.
          </p>
        </article>
        <article>
          <h2>Campaign control</h2>
          <p>
            Create adverts from your seller workspace, choose the right
            placement, and submit them for review.
          </p>
        </article>
        <article>
          <h2>Trusted presentation</h2>
          <p>
            Every campaign is reviewed to help maintain a clear, useful
            experience for KuduMart shoppers.
          </p>
        </article>
        <article>
          <h2>Ready to begin?</h2>
          <p>
            Existing sellers can create a campaign from the Adverts section of
            their workspace.
          </p>
          <Link to="/seller/adverts/new">Create an advert →</Link>
        </article>
      </section>
    </div>
  );
}
const ShoppingPhone = () => (
  <div className="phone-art">
    <div>
      <ShieldCheck />
      <strong>Shop confidently</strong>
      <span>Products, services and auctions wherever you are.</span>
    </div>
  </div>
);

export function Careers() {
  const [query, setQuery] = useState("");
  const jobs = useResource((signal) => contentApi.jobs("", signal), []);
  const visible = (jobs.data || []).filter((job) =>
    `${job.title} ${job.location} ${job.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="container public-list-page">
      <div className="public-list-head">
        <BriefcaseBusiness />
        <span className="eyebrow">JOIN THE TEAM</span>
        <h1>Build what commerce can become.</h1>
        <p>Explore opportunities to help KuduMart grow.</p>
        <label>
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search open roles"
          />
        </label>
      </div>
      {jobs.loading ? (
        <Skeleton className="public-loading" />
      ) : visible.length ? (
        <div className="job-list">
          {visible.map((job) => (
            <Link to={`/careers/${job.id}`} key={job.id}>
              <span>
                <strong>{job.title || job.jobTitle}</strong>
                <small>
                  {[job.department, job.location, job.jobType]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </span>
              <ArrowRight />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No open roles right now"
          description="Please check back as the team grows."
        />
      )}
    </div>
  );
}

export function JobDetail() {
  const { jobId } = useParams();
  const job = useResource((signal) => contentApi.job(jobId, signal), [jobId]);
  const [form, setForm] = useState({
    name: "",
    emailAddress: "",
    phoneNumber: "",
  });
  const [file, setFile] = useState(null);
  const [state, setState] = useState({ busy: false, error: "", sent: false });
  const submit = async (event) => {
    event.preventDefault();
    if (!file || file.type !== "application/pdf")
      return setState({
        busy: false,
        error: "Please attach your résumé as a PDF.",
        sent: false,
      });
    setState({ busy: true, error: "", sent: false });
    try {
      const resume = await uploadFile(file);
      await contentApi.apply({ ...form, jobId, resumeType: "pdf", resume });
      setState({ busy: false, error: "", sent: true });
    } catch (error) {
      setState({ busy: false, error: error.message, sent: false });
    }
  };
  if (job.loading)
    return (
      <div className="container">
        <Skeleton className="public-loading" />
      </div>
    );
  if (job.error || !job.data)
    return (
      <div className="container public-list-page">
        <EmptyState
          title="This role is unavailable"
          description="It may have closed or moved."
        />
      </div>
    );
  const item = job.data;
  return (
    <div className="container job-detail">
      <Link to="/careers" className="back-link">
        <ArrowLeft /> All roles
      </Link>
      <header>
        <span className="eyebrow">OPEN ROLE</span>
        <h1>{item.title || item.jobTitle}</h1>
        <p>
          {[item.department, item.location, item.jobType]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      <div className="job-detail__grid">
        <article>
          <h2>About the role</h2>
          <p>{item.description || item.jobDescription}</p>
          {item.requirements && (
            <>
              <h2>What we’re looking for</h2>
              <p>{item.requirements}</p>
            </>
          )}
        </article>
        <form className="public-form" onSubmit={submit}>
          <h2>Apply now</h2>
          <label>
            Full name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.emailAddress}
              onChange={(e) =>
                setForm({ ...form, emailAddress: e.target.value })
              }
              required
            />
          </label>
          <label>
            Phone number
            <input
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              required
            />
          </label>
          <label>
            Résumé (PDF)
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          {state.error && <p className="form-alert">{state.error}</p>}
          {state.sent && (
            <p className="form-success">
              <CheckCircle2 /> Application received. We’ll contact you if there
              is a match.
            </p>
          )}
          <Button type="submit" loading={state.busy}>
            Submit application
          </Button>
        </form>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="not-found container">
      <span>404</span>
      <h1>That page wandered off.</h1>
      <p>The link may be old, or the page may have moved.</p>
      <Link to="/">
        <Button icon={ArrowLeft}>Back to home</Button>
      </Link>
    </div>
  );
}
