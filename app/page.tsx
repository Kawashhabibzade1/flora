"use client";

import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  family: string;
  price: string;
  image: string;
  position?: string;
  colors: string[];
  note: string;
};

const navigation = [
  { label: "New in", href: "#new-in" },
  { label: "Hijabs", href: "#hijabs" },
  { label: "Modest wear", href: "#wear" },
  { label: "Our story", href: "#story" },
];

const edits = [
  {
    number: "01",
    title: "Ivory Column",
    subtitle: "Pearled contrast, effortless form",
    image: "/images/Hijabs/0081dc8a-1a8b-4aab-8073-ae084195cec5.JPG",
    alt: "Black and ivory FLORA abaya with delicate pearl detailing",
    position: "50% 48%",
    className: "edit-card--tall",
  },
  {
    number: "02",
    title: "Silver Poise",
    subtitle: "A quiet line of light",
    image: "/images/Hijabs/1ce8381f-74ed-4417-8e4d-9e65d8fe65fc.JPG",
    alt: "Flowing black FLORA abaya finished with silver accents",
    position: "44% 50%",
    className: "edit-card--wide",
  },
  {
    number: "03",
    title: "Noir Lace",
    subtitle: "Botanical lace, full movement",
    image: "/images/Hijabs/1a9c68a6-e076-4af3-ac54-54d916e633e3.JPG",
    alt: "Black FLORA abaya framed by floral lace",
    position: "50% 68%",
    className: "edit-card--short",
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Aurora Bloom Abaya",
    family: "Art panel",
    price: "Price on request",
    image: "/images/Hijabs/0c470774-9318-47ab-ad6d-ea154cfed48f.JPG",
    position: "50% 48%",
    colors: ["#171413", "#4f8e8a", "#7398a6"],
    note: "A clean black form transformed by an iridescent botanical panel.",
  },
  {
    id: 2,
    name: "Cocoa Bloom Abaya",
    family: "Botanical edition",
    price: "Price on request",
    image: "/images/Hijabs/deada83b-d61a-47f6-8a35-3e068e0c916a.JPG",
    position: "50% 50%",
    colors: ["#171413", "#5d4237", "#bca698"],
    note: "Warm cocoa contrast and oversized floral linework shape this open silhouette.",
  },
  {
    id: 3,
    name: "Silver Petal Abaya",
    family: "Embellished edition",
    price: "Price on request",
    image: "/images/Hijabs/c24e15f5-5b2a-45e9-a8ac-2e5c9d8f334d.JPG",
    position: "50% 57%",
    colors: ["#171413", "#d5d0ca", "#8c8781"],
    note: "Dimensional silver petals rise from the hem and return at the cuffs.",
  },
  {
    id: 4,
    name: "Silver Trace Abaya",
    family: "Embroidered line",
    price: "Price on request",
    image: "/images/Hijabs/fcfc2c9e-0740-432b-86d8-f01fc5a42b89.JPG",
    position: "52% 50%",
    colors: ["#171413", "#d5d0ca", "#77726e"],
    note: "A full-length black silhouette drawn through with delicate silver linework.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFabric, setActiveFabric] = useState(0);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setSelectedProduct(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "modal-open",
      menuOpen || searchOpen || Boolean(selectedProduct),
    );
    return () => document.body.classList.remove("modal-open");
  }, [menuOpen, searchOpen, selectedProduct]);

  const moveHero = (event: MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroRef.current.style.setProperty("--pointer-x", `${x * 18}px`);
    heroRef.current.style.setProperty("--pointer-y", `${y * 14}px`);
  };

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    );
  };

  const addToBag = () => {
    setBagCount((count) => count + 1);
    setSelectedProduct(null);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    if (!email.includes("@") || !email.includes(".")) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }
    setNewsletterMessage("Welcome to the FLORA private list.");
    event.currentTarget.reset();
  };

  return (
    <main className="flora-site">
      <div className="intro-curtain" aria-hidden="true">
        <div className="intro-curtain__panel intro-curtain__panel--left" />
        <div className="intro-curtain__panel intro-curtain__panel--right" />
        <p>FLORA · MAZAR-I-SHAREEF</p>
      </div>

      <header className="site-header">
        <button
          className="menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
        </button>

        <a className="brand" href="#top" aria-label="Flora home">
          <span className="brand-monogram">
            <img
              src="/images/flora-logo-round.png"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <span>FB</span>
          </span>
          <span className="brand-word">
            FLORA
            <small>Hijab & Women&apos;s Fashion</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" onClick={() => setSearchOpen(true)}>
            Search
          </button>
          <button type="button" aria-label={`Shopping bag, ${bagCount} items`}>
            Bag <span className={bagCount ? "bag-count has-items" : "bag-count"}>{bagCount}</span>
          </button>
        </div>
      </header>

      <section
        className="hero"
        id="top"
        ref={heroRef}
        onMouseMove={moveHero}
      >
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">The Soft Edit · Chapter 01</p>
          <h1>
            <span>Poise,</span>
            <span className="hero-title-indent">in every</span>
            <span>fold.</span>
          </h1>
          <div className="hero-copy__bottom">
            <p>
              Modern modest wear, shaped with intention and made to move as
              beautifully as you do.
            </p>
            <a className="text-link" href="#new-in">
              Discover the collection <span>↗</span>
            </a>
          </div>
        </div>

        <div className="hero-media" aria-label="FLORA campaign portrait">
          <div className="hero-media__frame">
            <img
              className="hero-media__image"
              src="/images/Hijabs/9ab14720-0822-4800-bcc8-8471c152dd96.JPG"
              alt="Woman presenting a black FLORA abaya with gold patterned panels"
              style={{ objectPosition: "50% 35%" }}
            />
          </div>
          <div className="cloth-ribbon cloth-ribbon--one" />
          <div className="cloth-ribbon cloth-ribbon--two" />
          <p className="hero-media__caption">
            <span>Campaign 01</span>
            <span>Light / Form / Grace</span>
          </p>
        </div>

        <div className="hero-issue">
          <span>No. 01</span>
          <p>Designed in Mazar-i-Shareef<br />for a life in motion</p>
        </div>
        <a className="scroll-cue" href="#manifesto" aria-label="Scroll to story">
          <span />
          Scroll
        </a>
      </section>

      <div className="editorial-marquee" aria-hidden="true">
        <div>
          <span>Grace in motion</span>
          <i>✦</i>
          <span>Considered silhouettes</span>
          <i>✦</i>
          <span>Made for every chapter</span>
          <i>✦</i>
          <span>Grace in motion</span>
          <i>✦</i>
          <span>Considered silhouettes</span>
          <i>✦</i>
          <span>Made for every chapter</span>
        </div>
      </div>

      <section className="manifesto section-shell" id="manifesto">
        <div className="manifesto-index" data-reveal>
          <span>( Our philosophy )</span>
          <span>01 — 03</span>
        </div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">A new language of modesty</p>
          <h2>
            Not simply covered.
            <br />
            <em>Composed.</em>
          </h2>
          <div className="manifesto-copy__note">
            <p>
              We design around the woman, never the trend. Every line begins
              with ease, every textile is chosen for its fall, and every detail
              leaves room for your own expression.
            </p>
            <a className="text-link" href="#story">
              Read our story <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="new-silhouettes section-shell" id="new-in">
        <header className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">Curated worlds · SS26</p>
            <h2>The new silhouettes</h2>
          </div>
          <p>
            Three edits. One quiet point of view.
            <br />
            Explore by mood, fabric and moment.
          </p>
        </header>

        <div className="edits-grid">
          {edits.map((edit, index) => (
            <a
              className={`edit-card ${edit.className}`}
              href="#hijabs"
              key={edit.title}
              data-reveal
              style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}
            >
              <div className="edit-card__image">
                <img
                  src={edit.image}
                  alt={edit.alt}
                  loading="lazy"
                  style={{ objectPosition: edit.position }}
                />
              </div>
              <div className="edit-card__meta">
                <span>{edit.number}</span>
                <div>
                  <h3>{edit.title}</h3>
                  <p>{edit.subtitle}</p>
                </div>
                <span className="round-arrow">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="tied-story" id="story">
        <div className="tied-story__visual" data-reveal>
          <img
            src="/images/Hijabs/d119ab5c-8f71-42aa-91f3-f4ecfe7cf6f6.JPG"
            alt="Black FLORA abaya with pearl embroidery photographed against golden architecture"
            loading="lazy"
          />
          <span className="image-stamp">FLORA / ATELIER NOTES</span>
        </div>
        <div className="tied-story__copy" data-reveal>
          <p className="eyebrow">Tied with intention</p>
          <h2>
            A line becomes
            <br />
            <em>a gesture.</em>
          </h2>
          <p className="tied-story__lead">
            The FLORA signature begins with a clean line, then opens into
            considered volume, hand-finished detail and effortless movement.
          </p>
          <ol>
            <li><span>01</span> Sketched for natural movement</li>
            <li><span>02</span> Tested across skin tones</li>
            <li><span>03</span> Finished by hand in small runs</li>
          </ol>
          <a className="text-link" href="#hijabs">
            Meet the signature drapes <span>↗</span>
          </a>
        </div>
      </section>

      <section className="bestsellers section-shell" id="hijabs">
        <header className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">The signatures</p>
            <h2>Most loved</h2>
          </div>
          <a className="text-link" href="#hijabs">
            View all pieces <span>↗</span>
          </a>
        </header>

        <div className="product-grid">
          {products.map((product, index) => (
            <article
              className="product-card"
              key={product.id}
              data-reveal
              style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
            >
              <div className="product-card__image">
                <button
                  className="wishlist-button"
                  type="button"
                  aria-label={`${wishlist.includes(product.id) ? "Remove" : "Add"} ${product.name} ${wishlist.includes(product.id) ? "from" : "to"} wishlist`}
                  onClick={() => toggleWishlist(product.id)}
                >
                  {wishlist.includes(product.id) ? "♥" : "♡"}
                </button>
                <button
                  className="quick-view"
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                >
                  Quick view
                </button>
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  style={{ objectPosition: product.position }}
                />
              </div>
              <div className="product-card__info">
                <div>
                  <p>{product.family}</p>
                  <h3>{product.name}</h3>
                </div>
                <span>{product.price}</span>
              </div>
              <div className="product-swatches" aria-label="Available colours">
                {product.colors.map((color) => (
                  <i key={color} style={{ backgroundColor: color }} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fabric-section" id="wear">
        <div className="fabric-heading" data-reveal>
          <p className="eyebrow">Feel the fabric</p>
          <h2>
            Chosen by touch,
            <br />
            <em>remembered by feel.</em>
          </h2>
        </div>

        <div className="fabric-lab">
          <div className="fabric-swatch" data-active={activeFabric}>
            <div className="fabric-swatch__fold fabric-swatch__fold--one" />
            <div className="fabric-swatch__fold fabric-swatch__fold--two" />
            <p>{["Air Chiffon", "Soft Modal", "Lustre Silk"][activeFabric]}</p>
          </div>
          <div className="fabric-details" data-reveal>
            {[
              {
                title: "Air Chiffon",
                text: "Featherlight with a quiet matte finish. Designed to hold a precise fold without feeling rigid.",
                specs: ["Lightweight", "Breathable", "Semi-sheer"],
              },
              {
                title: "Soft Modal",
                text: "Cloud-soft, naturally flexible and made for long days. An easy drape with gentle coverage.",
                specs: ["Opaque", "Breathable", "Everyday"],
              },
              {
                title: "Lustre Silk",
                text: "A subtle glow and liquid movement. Cut for evening light, celebrations and considered layers.",
                specs: ["Luminous", "Fluid", "Occasion"],
              },
            ].map((fabric, index) => (
              <button
                className={activeFabric === index ? "fabric-option active" : "fabric-option"}
                key={fabric.title}
                type="button"
                onClick={() => setActiveFabric(index)}
              >
                <span>0{index + 1}</span>
                <div>
                  <h3>{fabric.title}</h3>
                  {activeFabric === index && (
                    <>
                      <p>{fabric.text}</p>
                      <ul>
                        {fabric.specs.map((spec) => <li key={spec}>{spec}</li>)}
                      </ul>
                    </>
                  )}
                </div>
                <i>{activeFabric === index ? "−" : "+"}</i>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="craft-section section-shell">
        <div className="craft-section__intro" data-reveal>
          <span>( From sketch to drape )</span>
          <p>Made slowly. Worn often.</p>
        </div>
        <div className="craft-section__grid">
          <div className="craft-copy" data-reveal>
            <p className="eyebrow">The FLORA atelier</p>
            <h2>Beauty lives in the pause.</h2>
            <p>
              Between first sketch and final stitch, every silhouette is pinned,
              moved, lived in and refined. We produce in considered quantities
              so care never becomes an afterthought.
            </p>
            <a className="text-link" href="#newsletter">
              Step inside the atelier <span>↗</span>
            </a>
          </div>
          <div className="craft-image" data-reveal>
            <img
              src="/images/Hijabs/9edfb055-ee5f-4096-a5b1-1a118d3d0a4a.JPG"
              alt="Close view of FLORA floral embroidery and flowing black fabric"
              loading="lazy"
              style={{ objectPosition: "50% 60%" }}
            />
          </div>
          <div className="craft-stat" data-reveal>
            <strong>14</strong>
            <p>hands and eyes touch each limited piece before it leaves us.</p>
          </div>
        </div>
      </section>

      <section className="campaign-quote">
        <p className="eyebrow" data-reveal>Notes on grace · 01</p>
        <blockquote data-reveal>
          “She does not enter the room loudly.
          <br />
          The room simply <em>notices.</em>”
        </blockquote>
        <div className="campaign-quote__footer" data-reveal>
          <span>FLORA / SS26</span>
          <a href="#new-in">Enter the world <span>↗</span></a>
        </div>
      </section>

      <section className="newsletter section-shell" id="newsletter">
        <div className="newsletter-mark" aria-hidden="true">
          <span>F</span>
          <i />
          <span>B</span>
        </div>
        <div className="newsletter-copy" data-reveal>
          <p className="eyebrow">A private note from FLORA</p>
          <h2>
            New chapters,
            <br />
            sent softly.
          </h2>
          <p>
            First access to limited edits, atelier stories and private fittings.
            No noise, only what is worth opening.
          </p>
          <form onSubmit={submitNewsletter} noValidate>
            <label htmlFor="email">Email address</label>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                aria-describedby="newsletter-message"
              />
              <button type="submit">Join the list <span>↗</span></button>
            </div>
            <p id="newsletter-message" aria-live="polite">{newsletterMessage}</p>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="footer-brand">
            <img src="/images/flora-logo-full.png" alt="FLORA Brand logo" />
            <p>FLORA</p>
            <span>Hijab & Women&apos;s Fashion</span>
          </div>
          <div className="footer-links">
            <div>
              <h3>Explore</h3>
              <a href="#new-in">New in</a>
              <a href="#hijabs">Hijabs</a>
              <a href="#wear">Modest wear</a>
              <a href="#story">Our story</a>
            </div>
            <div>
              <h3>Care</h3>
              <a href="#newsletter">Shipping & returns</a>
              <a href="#newsletter">Fabric guide</a>
              <a href="#newsletter">Book a fitting</a>
              <a href="#newsletter">Contact</a>
            </div>
            <div>
              <h3>Follow</h3>
              <a
                href="https://www.instagram.com/flora.hijab23?igsh=MTRucm1iZWRseG1lcA%3D%3D"
                target="_blank"
                rel="noreferrer"
              >
                Instagram · @flora.hijab23
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbCgrZb5PO15pQJGrB1X"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp · FLORA
              </a>
              <a
                href="https://www.tiktok.com/@flora_hijab.23?_r=1"
                target="_blank"
                rel="noreferrer"
              >
                TikTok · @flora_hijab.23
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer__wordmark" aria-hidden="true">FLORA</div>
        <div className="site-footer__bottom">
          <span>© 2026 FLORA Brand</span>
          <span>Mazar-i-Shareef, Afghanistan</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      <div className={menuOpen ? "mobile-menu open" : "mobile-menu"} aria-hidden={!menuOpen}>
        <button type="button" className="overlay-close" onClick={() => setMenuOpen(false)}>
          Close
        </button>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{item.label}
            </a>
          ))}
        </nav>
        <div>
          <p>FLORA / MAZAR-I-SHAREEF</p>
          <div className="mobile-social">
            <a
              href="https://www.instagram.com/flora.hijab23?igsh=MTRucm1iZWRseG1lcA%3D%3D"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbCgrZb5PO15pQJGrB1X"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href="https://www.tiktok.com/@flora_hijab.23?_r=1"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>

      <div className={searchOpen ? "search-overlay open" : "search-overlay"} aria-hidden={!searchOpen}>
        <button type="button" className="overlay-close" onClick={() => setSearchOpen(false)}>
          Close
        </button>
        <div>
          <p className="eyebrow">Search the FLORA world</p>
          <label htmlFor="site-search">What are you looking for?</label>
          <input id="site-search" type="search" placeholder="Silk, blush, occasion…" autoFocus={searchOpen} />
          <p>Popular: Air Chiffon · Soft Modal · Atelier Abaya</p>
        </div>
      </div>

      {selectedProduct && (
        <div className="quick-modal" role="dialog" aria-modal="true" aria-label={`Quick view ${selectedProduct.name}`}>
          <button className="quick-modal__backdrop" type="button" aria-label="Close quick view" onClick={() => setSelectedProduct(null)} />
          <div className="quick-modal__panel">
            <button className="quick-modal__close" type="button" onClick={() => setSelectedProduct(null)}>Close</button>
            <div className="quick-modal__image">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ objectPosition: selectedProduct.position }}
              />
            </div>
            <div className="quick-modal__copy">
              <p className="eyebrow">{selectedProduct.family}</p>
              <h2>{selectedProduct.name}</h2>
              <strong>{selectedProduct.price}</strong>
              <p>{selectedProduct.note}</p>
              <div className="modal-swatches">
                <span>Colour</span>
                {selectedProduct.colors.map((color) => (
                  <button key={color} type="button" style={{ backgroundColor: color }} aria-label={`Select colour ${color}`} />
                ))}
              </div>
              <button className="add-to-bag" type="button" onClick={addToBag}>
                Add to bag <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
