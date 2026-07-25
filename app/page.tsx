"use client";

import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";

const INSTAGRAM_URL =
  "https://www.instagram.com/flora.hijab23?igsh=MTRucm1iZWRseG1lcA%3D%3D";
const WHATSAPP_URL =
  "https://whatsapp.com/channel/0029VbCgrZb5PO15pQJGrB1X";
const TIKTOK_URL = "https://www.tiktok.com/@flora_hijab.23?_r=1";

type Product = {
  id: number;
  name: string;
  nameDr: string;
  family: string;
  familyDr: string;
  price: string;
  priceDr: string;
  image: string;
  position?: string;
  colors: string[];
  note: string;
  noteDr: string;
};

type CollectionImage = {
  filename: string;
  number: string;
  image: string;
  remote?: boolean;
};

type CollectionManifest = {
  images?: Array<{
    filename?: unknown;
    src?: unknown;
  }>;
};

const navigation = [
  { label: "New in", labelDr: "تازه‌رسیده‌ها", href: "#new-in" },
  { label: "Hijabs", labelDr: "حجاب‌ها", href: "#hijabs" },
  { label: "Modest wear", labelDr: "پوشاک باوقار", href: "#wear" },
  { label: "Our story", labelDr: "داستان ما", href: "#story" },
  { label: "Dashboard", labelDr: "داشبورد", href: "/owner" },
];

const edits = [
  {
    number: "01",
    title: "Ivory Column",
    titleDr: "ستون عاجی",
    subtitle: "Pearled contrast, effortless form",
    subtitleDr: "تضاد مرواریدی، فرمی روان",
    image: "/images/Hijabs/0081dc8a-1a8b-4aab-8073-ae084195cec5.JPG",
    alt: "Black and ivory FLORA abaya with delicate pearl detailing",
    position: "50% 48%",
    className: "edit-card--tall",
  },
  {
    number: "02",
    title: "Silver Poise",
    titleDr: "وقار نقره‌ای",
    subtitle: "A quiet line of light",
    subtitleDr: "خطی آرام از نور",
    image: "/images/Hijabs/1ce8381f-74ed-4417-8e4d-9e65d8fe65fc.JPG",
    alt: "Flowing black FLORA abaya finished with silver accents",
    position: "44% 50%",
    className: "edit-card--wide",
  },
  {
    number: "03",
    title: "Noir Lace",
    titleDr: "تور سیاه",
    subtitle: "Botanical lace, full movement",
    subtitleDr: "تور گل‌دار، حرکت آزاد",
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
    nameDr: "عبای شکوفهٔ شفق",
    family: "Art panel",
    familyDr: "پنل هنری",
    price: "Price on request",
    priceDr: "برای قیمت پیام بدهید",
    image: "/images/Hijabs/0c470774-9318-47ab-ad6d-ea154cfed48f.JPG",
    position: "50% 48%",
    colors: ["#171413", "#4f8e8a", "#7398a6"],
    note: "A clean black form transformed by an iridescent botanical panel.",
    noteDr: "فرم پاک و سیاه با پنل گل‌دار و درخشان جان تازه می‌گیرد.",
  },
  {
    id: 2,
    name: "Cocoa Bloom Abaya",
    nameDr: "عبای شکوفهٔ کاکائویی",
    family: "Botanical edition",
    familyDr: "مجموعهٔ گل‌دار",
    price: "Price on request",
    priceDr: "برای قیمت پیام بدهید",
    image: "/images/Hijabs/deada83b-d61a-47f6-8a35-3e068e0c916a.JPG",
    position: "50% 50%",
    colors: ["#171413", "#5d4237", "#bca698"],
    note: "Warm cocoa contrast and oversized floral linework shape this open silhouette.",
    noteDr: "تضاد گرم کاکائویی و گل‌های درشت، این فرم باز را شکل می‌دهند.",
  },
  {
    id: 3,
    name: "Silver Petal Abaya",
    nameDr: "عبای گلبرگ نقره‌ای",
    family: "Embellished edition",
    familyDr: "مجموعهٔ تزئین‌شده",
    price: "Price on request",
    priceDr: "برای قیمت پیام بدهید",
    image: "/images/Hijabs/c24e15f5-5b2a-45e9-a8ac-2e5c9d8f334d.JPG",
    position: "50% 57%",
    colors: ["#171413", "#d5d0ca", "#8c8781"],
    note: "Dimensional silver petals rise from the hem and return at the cuffs.",
    noteDr: "گلبرگ‌های نقره‌ای برجسته از دامن آغاز می‌شوند و روی آستین‌ها ادامه می‌یابند.",
  },
  {
    id: 4,
    name: "Silver Trace Abaya",
    nameDr: "عبای رد نقره‌ای",
    family: "Embroidered line",
    familyDr: "طرح گلدوزی‌شده",
    price: "Price on request",
    priceDr: "برای قیمت پیام بدهید",
    image: "/images/Hijabs/fcfc2c9e-0740-432b-86d8-f01fc5a42b89.JPG",
    position: "52% 50%",
    colors: ["#171413", "#d5d0ca", "#77726e"],
    note: "A full-length black silhouette drawn through with delicate silver linework.",
    noteDr: "فرم بلند و سیاه با خط‌های ظریف نقره‌ای نقش گرفته است.",
  },
];

const fabrics = [
  {
    title: "Air Chiffon",
    titleDr: "شیفون سبک",
    text: "Featherlight with a quiet matte finish. Designed to hold a precise fold without feeling rigid.",
    textDr: "بسیار سبک با نمای مات و آرام؛ برای چین مرتب، بدون احساس خشکی.",
    specs: ["Lightweight", "Breathable", "Semi-sheer"],
    specsDr: ["سبک", "هواگذر", "نیمه‌شفاف"],
  },
  {
    title: "Soft Modal",
    titleDr: "مودال نرم",
    text: "Cloud-soft, naturally flexible and made for long days. An easy drape with gentle coverage.",
    textDr: "نرم و انعطاف‌پذیر برای روزهای طولانی، با افت زیبا و پوشش لطیف.",
    specs: ["Opaque", "Breathable", "Everyday"],
    specsDr: ["پوشیده", "هواگذر", "روزمره"],
  },
  {
    title: "Lustre Silk",
    titleDr: "ابریشم درخشان",
    text: "A subtle glow and liquid movement. Cut for evening light, celebrations and considered layers.",
    textDr: "درخشش ملایم و حرکت روان؛ مناسب مهمانی، جشن و لایه‌پوشی ظریف.",
    specs: ["Luminous", "Fluid", "Occasion"],
    specsDr: ["درخشان", "روان", "مجلسی"],
  },
];

const socialLinks = [
  {
    name: "Instagram",
    nameDr: "اینستاگرام",
    action: "Shop & send a DM",
    actionDr: "خرید و پیام مستقیم",
    description: "Browse the collection, ask about sizes and place your order directly.",
    descriptionDr: "مجموعه را ببینید، دربارهٔ اندازه بپرسید و مستقیم سفارش دهید.",
    handle: "@flora.hijab23",
    href: INSTAGRAM_URL,
    icon: FaInstagram,
    className: "social-card--instagram",
  },
  {
    name: "WhatsApp",
    nameDr: "واتساپ",
    action: "Follow the FLORA channel",
    actionDr: "کانال فلورا را دنبال کنید",
    description: "See new arrivals, collection drops and brand updates first.",
    descriptionDr: "تازه‌ها، مجموعه‌های جدید و خبرهای برند را زودتر ببینید.",
    handle: "FLORA Channel",
    href: WHATSAPP_URL,
    icon: FaWhatsapp,
    className: "social-card--whatsapp",
  },
  {
    name: "TikTok",
    nameDr: "تیک‌تاک",
    action: "Watch the latest looks",
    actionDr: "تازه‌ترین استایل‌ها را ببینید",
    description: "Discover styling ideas, details in motion and new FLORA pieces.",
    descriptionDr: "ایده‌های استایل، جزئیات در حرکت و مدل‌های تازهٔ فلورا را ببینید.",
    handle: "@flora_hijab.23",
    href: TIKTOK_URL,
    icon: FaTiktok,
    className: "social-card--tiktok",
  },
];

const staticCollectionImages: CollectionImage[] = [
  "flora-ms0ma8xe-4ad3fa8a-d15c-4c34-9440-49d549232a99.jpg",
  "0081dc8a-1a8b-4aab-8073-ae084195cec5.JPG",
  "06f42d1f-7180-4fb6-92bc-8375e8c66013.JPG",
  "0c470774-9318-47ab-ad6d-ea154cfed48f.JPG",
  "1351c005-e30d-49fa-a554-6f68c7392a38.JPG",
  "1a2a11b8-2235-436b-8d6c-9f1dbfa77f59.JPG",
  "1a9c68a6-e076-4af3-ac54-54d916e633e3.JPG",
  "1c096fb2-99ce-4ee4-a6c8-9f8a2b84096c.JPG",
  "1ce8381f-74ed-4417-8e4d-9e65d8fe65fc.JPG",
  "2d52f895-ba4e-499e-808f-e6a338fe67e7.JPG",
  "3f0a72e7-2c31-420a-9f81-0346da2c8a9f.JPG",
  "41807b6c-72fd-4b1b-b1ab-832219d87817.JPG",
  "4221a39b-0b47-4089-81ac-cfd7975b3887.JPG",
  "5a010329-3ba4-4799-8aa7-4ef606c2ab40.JPG",
  "5eee2287-cabb-4882-a5aa-4eedffca4553.JPG",
  "75567b40-6f13-42a0-bc85-1f5ef1b58779.JPG",
  "780acdf0-5789-4304-9482-958890408de4.JPG",
  "7ba04af9-262b-41bf-9cc3-c959d2912683.JPG",
  "891a0a52-f3e3-4ba1-a859-9cf9a7614c25.JPG",
  "90f718c5-7cec-4097-bbc5-b5efebefab9b.JPG",
  "91c5e379-8dac-4153-bf1f-ac8844477d35.JPG",
  "9ab14720-0822-4800-bcc8-8471c152dd96.JPG",
  "9edfb055-ee5f-4096-a5b1-1a118d3d0a4a.JPG",
  "9f29cd05-8ed5-4953-b53f-378af7bfd2ec.JPG",
  "ae98c50c-4f11-4674-89f6-8f0a8c6843d7.JPG",
  "af195f1e-7bf9-4a7e-af53-1d18c01c2eee.JPG",
  "b0c00a62-5d8e-46e0-ac99-3d8afdf8a854.JPG",
  "b1b4b77a-14c8-444d-aa57-da18dd4665a5.JPG",
  "ba4175c7-7b17-470c-9b15-3980df116bea.JPG",
  "bdbcd1eb-e5ee-411d-99d9-1e5c0400286e.JPG",
  "c24e15f5-5b2a-45e9-a8ac-2e5c9d8f334d.JPG",
  "cb085eb1-e6e6-4d49-97fd-60d461f69db6.JPG",
  "d119ab5c-8f71-42aa-91f3-f4ecfe7cf6f6.JPG",
  "d4f9829a-45fd-4970-81c5-15ab704421e9.JPG",
  "da4dc7c2-b02b-41b2-bb6b-747a632fe257.JPG",
  "db587481-1884-4688-839b-09988093eff8.JPG",
  "dba67f9a-8ecb-4969-b735-10b9e1de4fb3.JPG",
  "dddf994e-bab5-469c-816e-9a609d3dde2a.JPG",
  "deada83b-d61a-47f6-8a35-3e068e0c916a.JPG",
  "e3352168-290e-4e7d-adce-a8a6e13a1e9e.JPG",
  "f06d7b85-4b9e-4443-b1d0-b4efc8f538ac.JPG",
  "f413646e-e9c3-40d2-90ad-9a9eead86f5a.JPG",
  "fcd1fc70-ea3c-4cc6-9707-ad867e9c692d.JPG",
  "fcfc2c9e-0740-432b-86d8-f01fc5a42b89.JPG",
].map((filename, index) => ({
  filename,
  number: String(index + 1).padStart(2, "0"),
  image: `/images/Hijabs/${filename}`,
}));

export default function Home() {
  const [language, setLanguage] = useState<"en" | "dr">("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFabric, setActiveFabric] = useState(0);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [collectionImages, setCollectionImages] = useState(
    staticCollectionImages,
  );
  const [collectionStatus, setCollectionStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [collectionRefreshKey, setCollectionRefreshKey] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const isDari = language === "dr";
  const t = (english: string, dari: string) => (isDari ? dari : english);
  const collectionCount = isDari
    ? collectionImages.length.toLocaleString("fa-AF")
    : String(collectionImages.length);

  useEffect(() => {
    document.documentElement.lang = isDari ? "fa-AF" : "en";
    document.documentElement.dir = isDari ? "rtl" : "ltr";
  }, [isDari]);

  useEffect(() => {
    const controller = new AbortController();

    const refreshCollection = async () => {
      setCollectionStatus("loading");

      try {
        const response = await fetch("/api/collection", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Collection refresh failed.");
        }

        const payload = (await response.json()) as CollectionManifest;

        if (!Array.isArray(payload.images)) {
          throw new Error("Collection response is invalid.");
        }

        const staticNames = new Set(
          staticCollectionImages.map((item) => item.filename.toLowerCase()),
        );
        const remoteNames = new Set<string>();
        const newImages: CollectionImage[] = [];

        for (const image of payload.images) {
          if (
            typeof image.filename !== "string" ||
            typeof image.src !== "string" ||
            staticNames.has(image.filename.toLowerCase()) ||
            remoteNames.has(image.filename.toLowerCase())
          ) {
            continue;
          }

          const source = new URL(image.src, window.location.origin);

          if (
            source.origin !== window.location.origin ||
            source.pathname !== "/api/collection/image"
          ) {
            continue;
          }

          remoteNames.add(image.filename.toLowerCase());
          newImages.push({
            filename: image.filename,
            image: `${source.pathname}${source.search}`,
            number: "",
            remote: true,
          });
        }

        if (controller.signal.aborted) return;

        setCollectionImages(
          [...newImages, ...staticCollectionImages].map((item, index) => ({
            ...item,
            number: String(index + 1).padStart(2, "0"),
          })),
        );
        setCollectionStatus("ready");
      } catch {
        if (!controller.signal.aborted) {
          setCollectionStatus("error");
        }
      }
    };

    void refreshCollection();
    window.addEventListener("focus", refreshCollection);

    return () => {
      controller.abort();
      window.removeEventListener("focus", refreshCollection);
    };
  }, [collectionRefreshKey]);

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
  }, [collectionImages.length]);

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

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    if (!email.includes("@") || !email.includes(".")) {
      setNewsletterMessage(
        t("Please enter a valid email address.", "لطفاً یک ایمیل معتبر وارد کنید."),
      );
      return;
    }
    setNewsletterMessage(
      t("Welcome to the FLORA private list.", "به فهرست ویژهٔ فلورا خوش آمدید."),
    );
    event.currentTarget.reset();
  };

  return (
    <main
      className="flora-site"
      dir={isDari ? "rtl" : "ltr"}
      lang={isDari ? "fa-AF" : "en"}
    >
      <div className="intro-curtain" aria-hidden="true">
        <div className="intro-curtain__panel intro-curtain__panel--left" />
        <div className="intro-curtain__panel intro-curtain__panel--right" />
        <p>FLORA · MAZAR-I-SHAREEF</p>
      </div>

      <header className="site-header">
        <button
          className="menu-button"
          type="button"
          aria-label={t("Open menu", "باز کردن فهرست")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <span />
          <span />
        </button>

        <a className="brand" href="#top" aria-label={t("Flora home", "صفحهٔ اصلی فلورا")}>
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

        <nav className="desktop-nav" aria-label={t("Main navigation", "منوی اصلی")}>
          {navigation.map((item) => (
            <a key={item.label} href={item.href}>
              {isDari ? item.labelDr : item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div
            className="language-switch"
            role="group"
            aria-label={t("Language", "زبان")}
            dir="ltr"
          >
            <button
              className={isDari ? "active" : ""}
              type="button"
              aria-pressed={isDari}
              onClick={() => setLanguage("dr")}
            >
              دری
            </button>
            <span aria-hidden="true">/</span>
            <button
              className={!isDari ? "active" : ""}
              type="button"
              aria-pressed={!isDari}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>
          <button className="header-search" type="button" onClick={() => setSearchOpen(true)}>
            {t("Search", "جست‌وجو")}
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
          <p className="eyebrow hero-eyebrow">
            {t("The Soft Edit · Chapter 01", "گزیدهٔ لطیف · فصل ۰۱")}
          </p>
          <h1>
            <span>{t("Poise,", "وقار،")}</span>
            <span className="hero-title-indent">{t("in every", "در هر")}</span>
            <span>{t("fold.", "چین.")}</span>
          </h1>
          <div className="hero-copy__bottom">
            <p>
              {t(
                "Modern modest wear, shaped with intention and made to move as beautifully as you do.",
                "پوشاک مدرن و باوقار، با دقت طراحی شده تا به زیبایی همراه حرکت شما باشد.",
              )}
            </p>
            <a className="text-link" href="#new-in">
              {t("Discover the collection", "مجموعه را ببینید")} <span>↗</span>
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
            <span>{t("Campaign 01", "کمپاین ۰۱")}</span>
            <span>{t("Light / Form / Grace", "نور / فرم / وقار")}</span>
          </p>
        </div>

        <div className="hero-issue">
          <span>No. 01</span>
          <p>
            {t("Designed in Mazar-i-Shareef", "طراحی‌شده در مزار شریف")}
            <br />
            {t("for a life in motion", "برای زندگی پُرتحرک")}
          </p>
        </div>
        <a
          className="scroll-cue"
          href="#manifesto"
          aria-label={t("Scroll to story", "رفتن به داستان")}
        >
          <span />
          {t("Scroll", "پایین")}
        </a>
      </section>

      <div className="editorial-marquee" aria-hidden="true">
        <div>
          <span>{t("Grace in motion", "وقار در حرکت")}</span>
          <i>✦</i>
          <span>{t("Considered silhouettes", "فرم‌های سنجیده")}</span>
          <i>✦</i>
          <span>{t("Made for every chapter", "برای هر فصل زندگی")}</span>
          <i>✦</i>
          <span>{t("Grace in motion", "وقار در حرکت")}</span>
          <i>✦</i>
          <span>{t("Considered silhouettes", "فرم‌های سنجیده")}</span>
          <i>✦</i>
          <span>{t("Made for every chapter", "برای هر فصل زندگی")}</span>
        </div>
      </div>

      <section className="manifesto section-shell" id="manifesto">
        <div className="manifesto-index" data-reveal>
          <span>{t("( Our philosophy )", "( فلسفهٔ ما )")}</span>
          <span>01 — 03</span>
        </div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">{t("A new language of modesty", "زبانی نو برای پوشیدگی")}</p>
          <h2>
            {t("Not simply covered.", "فقط پوشیده نیست.")}
            <br />
            <em>{t("Composed.", "آراسته است.")}</em>
          </h2>
          <div className="manifesto-copy__note">
            <p>
              {t(
                "We design around the woman, never the trend. Every line begins with ease, every textile is chosen for its fall, and every detail leaves room for your own expression.",
                "ما برای زن طراحی می‌کنیم، نه برای موج زودگذر مد. هر خط با راحتی آغاز می‌شود، هر پارچه برای افت زیبایش انتخاب می‌گردد و هر جزئیات جایی برای بیان خود شما می‌گذارد.",
              )}
            </p>
            <a className="text-link" href="#story">
              {t("Read our story", "داستان ما را بخوانید")} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="new-silhouettes section-shell" id="new-in">
        <header className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">{t("Curated worlds · SS26", "جهان‌های گزیده · SS26")}</p>
            <h2>{t("The new silhouettes", "فرم‌های تازه")}</h2>
          </div>
          <p>
            {t("Three edits. One quiet point of view.", "سه گزیده، یک نگاه آرام.")}
            <br />
            {t("Explore by mood, fabric and moment.", "بر پایهٔ حس، پارچه و لحظه کشف کنید.")}
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
                  <h3>{isDari ? edit.titleDr : edit.title}</h3>
                  <p>{isDari ? edit.subtitleDr : edit.subtitle}</p>
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
          <span className="image-stamp">
            {t("FLORA / ATELIER NOTES", "فلورا / یادداشت‌های آتلیه")}
          </span>
        </div>
        <div className="tied-story__copy" data-reveal>
          <p className="eyebrow">{t("Tied with intention", "با ظرافت بسته شده")}</p>
          <h2>
            {t("A line becomes", "یک خط،")}
            <br />
            <em>{t("a gesture.", "به حرکتی ظریف بدل می‌شود.")}</em>
          </h2>
          <p className="tied-story__lead">
            {t(
              "The FLORA signature begins with a clean line, then opens into considered volume, hand-finished detail and effortless movement.",
              "امضای فلورا با خطی پاک آغاز می‌شود و به حجم سنجیده، جزئیات دست‌دوز و حرکتی روان می‌رسد.",
            )}
          </p>
          <ol>
            <li><span>01</span> {t("Sketched for natural movement", "طراحی‌شده برای حرکت طبیعی")}</li>
            <li><span>02</span> {t("Tested across skin tones", "هماهنگ با رنگ‌های گوناگون پوست")}</li>
            <li><span>03</span> {t("Finished by hand in small runs", "پرداخت دست‌دوز در تعداد محدود")}</li>
          </ol>
          <a className="text-link" href="#hijabs">
            {t("Meet the signature drapes", "مدل‌های شاخص را ببینید")} <span>↗</span>
          </a>
        </div>
      </section>

      <section className="bestsellers section-shell" id="hijabs">
        <header className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">{t("The signatures", "مدل‌های شاخص")}</p>
            <h2>{t("Most loved", "محبوب‌ترین‌ها")}</h2>
          </div>
          <a className="text-link" href="#connect">
            {t("Shop through Instagram", "خرید از اینستاگرام")} <span>↗</span>
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
                  aria-label={t(
                    `${wishlist.includes(product.id) ? "Remove" : "Add"} ${product.name} ${
                      wishlist.includes(product.id) ? "from" : "to"
                    } wishlist`,
                    `${wishlist.includes(product.id) ? "حذف" : "افزودن"} ${product.nameDr} ${
                      wishlist.includes(product.id) ? "از" : "به"
                    } علاقه‌مندی‌ها`,
                  )}
                  onClick={() => toggleWishlist(product.id)}
                >
                  {wishlist.includes(product.id) ? "♥" : "♡"}
                </button>
                <button
                  className="quick-view"
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                >
                  {t("Quick view", "نمایش سریع")}
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
                  <p>{isDari ? product.familyDr : product.family}</p>
                  <h3>{isDari ? product.nameDr : product.name}</h3>
                </div>
                <span>{isDari ? product.priceDr : product.price}</span>
              </div>
              <div
                className="product-swatches"
                aria-label={t("Available colours", "رنگ‌های موجود")}
              >
                {product.colors.map((color) => (
                  <i key={color} style={{ backgroundColor: color }} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="full-collection" id="full-collection">
        <header className="full-collection__heading section-shell" data-reveal>
          <div>
            <p className="eyebrow">
              {t(
                `Every FLORA piece · ${collectionCount} images`,
                `همهٔ مدل‌های FLORA · ${collectionCount} تصویر`,
              )}
            </p>
            <h2>{t("The full collection", "مجموعهٔ کامل")}</h2>
            <div
              className="collection-refresh"
              data-status={collectionStatus}
              aria-live="polite"
            >
              {collectionStatus === "loading" && (
                <span>
                  {t(
                    "Checking for new pieces…",
                    "در حال بررسی مدل‌های تازه…",
                  )}
                </span>
              )}
              {collectionStatus === "error" && (
                <>
                  <span>
                    {t(
                      "New uploads could not be refreshed. Showing the saved collection.",
                      "مدل‌های تازه بارگیری نشدند؛ مجموعهٔ ذخیره‌شده نمایش داده می‌شود.",
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCollectionRefreshKey((current) => current + 1)
                    }
                  >
                    {t("Try again", "تلاش دوباره")}
                  </button>
                </>
              )}
            </div>
          </div>
          <p>
            {t(
              "Swipe or scroll to see every product image. Tap any piece to ask about it on Instagram.",
              "برای دیدن همهٔ تصاویر ورق بزنید یا اسکرول کنید. برای پرسش و سفارش روی هر مدل بزنید.",
            )}
          </p>
        </header>

        <div
          className="full-collection__track"
          aria-label={t("All FLORA product images", "همهٔ تصاویر محصولات FLORA")}
        >
          {collectionImages.map((item, index) => (
            <a
              className="collection-tile"
              href={INSTAGRAM_URL}
              key={item.filename}
              target="_blank"
              rel="noreferrer"
              data-reveal
              style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
              aria-label={t(
                `Ask about FLORA piece ${item.number} on Instagram`,
                `پرسش دربارهٔ مدل ${item.number} در اینستاگرام`,
              )}
            >
              <img
                src={item.image}
                alt={t(
                  `FLORA collection piece ${item.number}`,
                  `مدل ${item.number} از مجموعهٔ FLORA`,
                )}
                loading="lazy"
                onError={() => {
                  if (!item.remote) return;

                  setCollectionImages((current) =>
                    current
                      .filter((candidate) => candidate.filename !== item.filename)
                      .map((candidate, itemIndex) => ({
                        ...candidate,
                        number: String(itemIndex + 1).padStart(2, "0"),
                      })),
                  );
                }}
              />
              <span className="collection-tile__meta">
                <i>FLORA · {item.number}</i>
                <b>
                  <FaInstagram aria-hidden="true" />
                  {t("Ask / Order", "پرسش / سفارش")}
                </b>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="fabric-section" id="wear">
        <div className="fabric-heading" data-reveal>
          <p className="eyebrow">{t("Feel the fabric", "پارچه را لمس کنید")}</p>
          <h2>
            {t("Chosen by touch,", "با لمس انتخاب می‌شود،")}
            <br />
            <em>{t("remembered by feel.", "با حس به یاد می‌ماند.")}</em>
          </h2>
        </div>

        <div className="fabric-lab">
          <div className="fabric-swatch" data-active={activeFabric}>
            <div className="fabric-swatch__fold fabric-swatch__fold--one" />
            <div className="fabric-swatch__fold fabric-swatch__fold--two" />
            <p>
              {isDari
                ? fabrics[activeFabric].titleDr
                : fabrics[activeFabric].title}
            </p>
          </div>
          <div className="fabric-details" data-reveal>
            {fabrics.map((fabric, index) => (
              <button
                className={activeFabric === index ? "fabric-option active" : "fabric-option"}
                key={fabric.title}
                type="button"
                onClick={() => setActiveFabric(index)}
              >
                <span>0{index + 1}</span>
                <div>
                  <h3>{isDari ? fabric.titleDr : fabric.title}</h3>
                  {activeFabric === index && (
                    <>
                      <p>{isDari ? fabric.textDr : fabric.text}</p>
                      <ul>
                        {(isDari ? fabric.specsDr : fabric.specs).map((spec) => (
                          <li key={spec}>{spec}</li>
                        ))}
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
          <span>{t("( From sketch to drape )", "( از طرح تا ریزش پارچه )")}</span>
          <p>{t("Made slowly. Worn often.", "آهسته ساخته شده، بارها پوشیده می‌شود.")}</p>
        </div>
        <div className="craft-section__grid">
          <div className="craft-copy" data-reveal>
            <p className="eyebrow">{t("The FLORA atelier", "آتلیهٔ FLORA")}</p>
            <h2>{t("Beauty lives in the pause.", "زیبایی در مکث جان می‌گیرد.")}</h2>
            <p>
              {t(
                "Between first sketch and final stitch, every silhouette is pinned, moved, lived in and refined. We produce in considered quantities so care never becomes an afterthought.",
                "میان نخستین طرح و آخرین بخیه، هر فرم سنجاق می‌شود، به حرکت درمی‌آید، پوشیده و پالوده می‌شود. ما به تعداد سنجیده تولید می‌کنیم تا دقت و مراقبت هرگز به حاشیه نرود.",
              )}
            </p>
            <a className="text-link" href="#connect">
              {t("Contact the atelier", "با آتلیه تماس بگیرید")} <span>↗</span>
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
            <p>
              {t(
                "hands and eyes touch each limited piece before it leaves us.",
                "دست‌ها و چشم‌های ماهر، پیش از بیرون‌رفتن هر مدل محدود، روی آن کار و نظارت می‌کنند.",
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="campaign-quote">
        <p className="eyebrow" data-reveal>
          {t("Notes on grace · 01", "یادداشت‌هایی دربارهٔ وقار · ۰۱")}
        </p>
        <blockquote data-reveal>
          “{t("She does not enter the room loudly.", "او با هیاهو وارد اتاق نمی‌شود؛")}
          <br />
          {t("The room simply", "اتاق فقط حضورش را")}{" "}
          <em>{t("notices.", "حس می‌کند.")}</em>”
        </blockquote>
        <div className="campaign-quote__footer" data-reveal>
          <span>FLORA / SS26</span>
          <a href="#new-in">
            {t("Enter the world", "وارد دنیای FLORA شوید")} <span>↗</span>
          </a>
        </div>
      </section>

      <section className="newsletter section-shell" id="newsletter">
        <div className="newsletter-mark" aria-hidden="true">
          <span>F</span>
          <i />
          <span>B</span>
        </div>
        <div className="newsletter-copy" data-reveal>
          <p className="eyebrow">{t("A private note from FLORA", "یادداشتی خصوصی از FLORA")}</p>
          <h2>
            {t("New chapters,", "فصل‌های تازه،")}
            <br />
            {t("sent softly.", "آرام به شما می‌رسند.")}
          </h2>
          <p>
            {t(
              "First access to limited edits, atelier stories and private fittings. No noise, only what is worth opening.",
              "پیش از همه به مجموعه‌های محدود، داستان‌های آتلیه و پروهای خصوصی دسترسی داشته باشید. بدون شلوغی؛ فقط آنچه ارزش بازکردن دارد.",
            )}
          </p>
          <form onSubmit={submitNewsletter} noValidate>
            <label htmlFor="email">{t("Email address", "نشانی ایمیل")}</label>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                placeholder="you@example.com"
                aria-describedby="newsletter-message"
              />
              <button type="submit">
                {t("Join the list", "عضویت در فهرست")} <span>↗</span>
              </button>
            </div>
            <p id="newsletter-message" aria-live="polite">{newsletterMessage}</p>
          </form>
        </div>
      </section>

      <section className="social-connect section-shell" id="connect">
        <header className="social-connect__heading" data-reveal>
          <p className="eyebrow">
            {t("Shop & connect with FLORA", "با FLORA خرید کنید و در ارتباط باشید")}
          </p>
          <div>
            <h2>
              {t(
                "Your next piece is one message away.",
                "مدل بعدی‌تان فقط یک پیام فاصله دارد.",
              )}
            </h2>
            <p>
              {t(
                "For availability, sizes and orders, send us a DM on Instagram. Follow WhatsApp and TikTok for every new arrival.",
                "برای موجودی، اندازه و سفارش در اینستاگرام پیام بدهید. برای تازه‌رسیده‌ها واتساپ و تیک‌تاک را دنبال کنید.",
              )}
            </p>
          </div>
        </header>

        <div className="social-connect__grid">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                className={`social-card ${social.className}`}
                href={social.href}
                key={social.name}
                target="_blank"
                rel="noreferrer"
                data-reveal
                style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
                aria-label={`${isDari ? social.nameDr : social.name}: ${
                  isDari ? social.actionDr : social.action
                }`}
              >
                <div className="social-card__top">
                  <span className="social-card__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="social-card__handle" dir="ltr">{social.handle}</span>
                </div>
                <div className="social-card__copy">
                  <p>{isDari ? social.nameDr : social.name}</p>
                  <h3>{isDari ? social.actionDr : social.action}</h3>
                  <span>
                    {isDari ? social.descriptionDr : social.description}
                  </span>
                </div>
                <i aria-hidden="true">↗</i>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="footer-brand">
            <img src="/images/flora-logo-full.png" alt="FLORA Brand logo" />
            <p>FLORA</p>
            <span>{t("Hijab & Women's Fashion", "حجاب و مُد زنانه")}</span>
          </div>
          <div className="footer-links">
            <div>
              <h3>{t("Explore", "گشت‌وگذار")}</h3>
              <a href="#new-in">{t("New in", "تازه‌رسیده‌ها")}</a>
              <a href="#hijabs">{t("Hijabs", "حجاب‌ها")}</a>
              <a href="#wear">{t("Modest wear", "پوشاک باوقار")}</a>
              <a href="#story">{t("Our story", "داستان ما")}</a>
            </div>
            <div>
              <h3>{t("Care", "راهنما")}</h3>
              <a href="#newsletter">{t("Shipping & returns", "ارسال و بازگشت")}</a>
              <a href="#wear">{t("Fabric guide", "راهنمای پارچه‌ها")}</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                {t("Book a fitting", "رزرو پرو")}
              </a>
              <a href="#connect">{t("Contact", "تماس با ما")}</a>
            </div>
            <div className="footer-social-column">
              <h3>{t("Shop & follow", "خرید و دنبال‌کردن")}</h3>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    className="footer-social-link"
                    href={social.href}
                    key={social.name}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>
                      <Icon aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{isDari ? social.nameDr : social.name}</strong>
                      <small dir="ltr">{social.handle}</small>
                    </span>
                    <i aria-hidden="true">↗</i>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="site-footer__wordmark" aria-hidden="true">FLORA</div>
        <div className="site-footer__bottom">
          <span>© 2026 FLORA Brand</span>
          <span>{t("Mazar-i-Shareef, Afghanistan", "مزار شریف، افغانستان")}</span>
          <a
            className="footer-credit"
            href="https://www.linkedin.com/in/kawash-habibzada-790964158/"
            target="_blank"
            rel="noreferrer"
            dir="ltr"
          >
            Designed and developed by Mir Kawash Habibazada
          </a>
          <a href="#top">{t("Back to top", "بازگشت به بالا")} ↑</a>
        </div>
      </footer>

      <aside
        className="social-rail"
        aria-label={t("Quick shop and social links", "لینک‌های سریع خرید و شبکه‌های اجتماعی")}
      >
        {[...socialLinks].reverse().map((social) => {
          const Icon = social.icon;
          return (
            <a
              className={social.className.replace("social-card", "social-rail")}
              href={social.href}
              key={social.name}
              target="_blank"
              rel="noreferrer"
              aria-label={`${isDari ? social.nameDr : social.name}: ${
                isDari ? social.actionDr : social.action
              }`}
            >
              <Icon aria-hidden="true" />
            </a>
          );
        })}
      </aside>

      <div className={menuOpen ? "mobile-menu open" : "mobile-menu"} aria-hidden={!menuOpen}>
        <button type="button" className="overlay-close" onClick={() => setMenuOpen(false)}>
          {t("Close", "بستن")}
        </button>
        <nav aria-label={t("Mobile navigation", "منوی موبایل")}>
          {navigation.map((item, index) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{isDari ? item.labelDr : item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__footer">
          <div>
            <p>{t("FLORA / MAZAR-I-SHAREEF", "FLORA / مزار شریف")}</p>
            <div
              className="mobile-language"
              role="group"
              aria-label={t("Language", "زبان")}
              dir="ltr"
            >
              <button
                className={isDari ? "active" : ""}
                type="button"
                aria-pressed={isDari}
                onClick={() => setLanguage("dr")}
              >
                دری
              </button>
              <span>/</span>
              <button
                className={!isDari ? "active" : ""}
                type="button"
                aria-pressed={!isDari}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
          <div className="mobile-social">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a href={social.href} key={social.name} target="_blank" rel="noreferrer">
                  <Icon aria-hidden="true" />
                  {isDari ? social.nameDr : social.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className={searchOpen ? "search-overlay open" : "search-overlay"} aria-hidden={!searchOpen}>
        <button type="button" className="overlay-close" onClick={() => setSearchOpen(false)}>
          {t("Close", "بستن")}
        </button>
        <div>
          <p className="eyebrow">
            {t("Search the FLORA world", "در دنیای FLORA جست‌وجو کنید")}
          </p>
          <label htmlFor="site-search">
            {t("What are you looking for?", "دنبال چه چیزی هستید؟")}
          </label>
          <input
            id="site-search"
            type="search"
            placeholder={t("Silk, blush, occasion…", "ابریشم، گلبهی، مجلسی…")}
            autoFocus={searchOpen}
          />
          <p>
            {t(
              "Popular: Air Chiffon · Soft Modal · Atelier Abaya",
              "محبوب‌ها: شیفون سبک · مودال نرم · عبای آتلیه",
            )}
          </p>
        </div>
      </div>

      {selectedProduct && (
        <div
          className="quick-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${t("Quick view", "دیدن سریع")} ${
            isDari ? selectedProduct.nameDr : selectedProduct.name
          }`}
        >
          <button
            className="quick-modal__backdrop"
            type="button"
            aria-label={t("Close quick view", "بستن نمایش سریع")}
            onClick={() => setSelectedProduct(null)}
          />
          <div className="quick-modal__panel">
            <button className="quick-modal__close" type="button" onClick={() => setSelectedProduct(null)}>
              {t("Close", "بستن")}
            </button>
            <div className="quick-modal__image">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ objectPosition: selectedProduct.position }}
              />
            </div>
            <div className="quick-modal__copy">
              <p className="eyebrow">
                {isDari ? selectedProduct.familyDr : selectedProduct.family}
              </p>
              <h2>{isDari ? selectedProduct.nameDr : selectedProduct.name}</h2>
              <strong>{isDari ? selectedProduct.priceDr : selectedProduct.price}</strong>
              <p>{isDari ? selectedProduct.noteDr : selectedProduct.note}</p>
              <div className="modal-swatches">
                <span>{t("Colour", "رنگ")}</span>
                {selectedProduct.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    aria-label={`${t("Select colour", "انتخاب رنگ")} ${color}`}
                  />
                ))}
              </div>
              <div className="product-contact-actions">
                <a
                  className="social-order-button"
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram aria-hidden="true" />
                  <span>{t("Ask & order on Instagram", "پرسش و سفارش در اینستاگرام")}</span>
                  <i aria-hidden="true">↗</i>
                </a>
                <a
                  className="social-order-secondary"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaWhatsapp aria-hidden="true" />
                  <span>{t("Follow the WhatsApp channel", "کانال واتساپ را دنبال کنید")}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
