import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Metadata } from "next";

interface CmsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const STATIC_FALLBACK_PAGES: Record<string, { title: string; html: string }> = {
  "about-us": {
    title: "About Khelna Bazar",
    html: `
      <h2>Welcome to KHELNA BAZAR</h2>
      <p>Khelna Bazar is Bangladesh's premier online boutique dedicated to certified-safe, joy-sparking, and intellectually stimulating toys. We believe play is essential to childhood—fostering analytical problem solving, emotional resilience, fine motor skills, and boundless imagination.</p>
      <h3>Why Parents Trust Us</h3>
      <ul>
        <li><strong>Strict Child-Safety Standards:</strong> Every single toy is vetted against international ASTM F963 and European EN71 safety directives.</li>
        <li><strong>Reliable Cash on Delivery:</strong> Inspect the package at your doorstep anywhere in Bangladesh before paying the courier.</li>
        <li><strong>Authentic Brands:</strong> We directly import genuine items from top manufacturers with zero counterfeit items.</li>
      </ul>
    `,
  },
  "toy-safety": {
    title: "Toy Safety & Compliance Standards",
    html: `
      <h2>Our Zero-Compromise Child Safety Guarantee</h2>
      <p>Nothing matters more than your child's well-being. At Khelna Bazar, every item in our inventory passes strict non-toxic testing.</p>
      <h3>Safety Directives We Follow</h3>
      <ul>
        <li><strong>BPA & Phthalate-Free:</strong> Only food-grade silicone and virgin ABS plastics are accepted.</li>
        <li><strong>Lead-Free Water Paints:</strong> Colored with non-toxic, eco-friendly pigments that will not leach if mouthed.</li>
        <li><strong>Choking Hazard Warning Badges:</strong> Clear labeling on every product containing small balls, marbles, or small parts unsuitable for under-3-year-olds.</li>
        <li><strong>Smooth Sanded Edges:</strong> Wooden toys are splinter-free with rounded corners.</li>
      </ul>
    `,
  },
  "shipping-policy": {
    title: "Cash on Delivery & Shipping Policy",
    html: `
      <h2>Nationwide Cash on Delivery (COD)</h2>
      <p>We deliver across all 64 districts of Bangladesh with convenient cash payment on delivery.</p>
      <h3>Delivery Charges & Timeline</h3>
      <ul>
        <li><strong>Inside Dhaka City:</strong> ৳60 flat fee. Delivered within 24 to 48 hours.</li>
        <li><strong>Outside Dhaka (Nationwide):</strong> ৳120 flat fee. Delivered within 2 to 4 business days.</li>
        <li><strong>FREE DELIVERY:</strong> All orders totaling ৳1,500 or more receive 100% free home delivery!</li>
      </ul>
      <h3>How Doorstep Cash on Delivery Works</h3>
      <p>When the courier reaches your address, they will call your mobile number. You can verify the parcel's condition and hand the exact cash amount to the delivery agent.</p>
    `,
  },
  "returns-policy": {
    title: "7-Day Easy Returns & Exchange Guarantee",
    html: `
      <h2>Hassle-Free Returns</h2>
      <p>If an item arrives damaged, defective, or missing components, we provide a 100% free replacement or full refund within 7 days of delivery.</p>
      <h3>How to Initiate a Return</h3>
      <ol>
        <li>Contact our customer care team via our hotline or official email address.</li>
        <li>Provide your Order Number (e.g. KB-2611-XXXXXX) and a quick photo/video of the issue.</li>
        <li>Our courier partner will pick up the parcel from your address at zero extra cost to you.</li>
      </ol>
    `,
  },
  "privacy-policy": {
    title: "Privacy Policy",
    html: `
      <h2>Your Privacy is Respected</h2>
      <p>Khelna Bazar values your privacy. We collect only necessary delivery information (Name, Contact Number, and Shipping Address) solely to fulfill your orders.</p>
      <p>We do not share your information with third-party marketing brokers. All customer data is encrypted and securely maintained.</p>
    `,
  },
  "terms": {
    title: "Terms & Conditions",
    html: `
      <h2>Terms of Service</h2>
      <p>By placing an order on Khelna Bazar, you agree to inspect the delivery package and provide cash payment upon arrival. All prices are listed in Bangladeshi Taka (BDT) including applicable taxes.</p>
    `,
  },
  "contact": {
    title: "Contact Customer Care",
    html: `
      <h2>We are Here to Help</h2>
      <p>Have questions about toy safety, delivery timeline, or placing a bulk order? Reach out to our dedicated support team in Dhaka.</p>
      <ul>
        <li><strong>Operating Hours:</strong> Saturday – Thursday: 9:00 AM – 10:00 PM BST</li>
        <li><strong>Coverage:</strong> All 64 Districts of Bangladesh</li>
      </ul>
    `,
  },
};

// Aliases for common routing variations
STATIC_FALLBACK_PAGES["shipping"] = STATIC_FALLBACK_PAGES["shipping-policy"];
STATIC_FALLBACK_PAGES["returns"] = STATIC_FALLBACK_PAGES["returns-policy"];
STATIC_FALLBACK_PAGES["return-refund-policy"] = STATIC_FALLBACK_PAGES["returns-policy"];
STATIC_FALLBACK_PAGES["privacy"] = STATIC_FALLBACK_PAGES["privacy-policy"];
STATIC_FALLBACK_PAGES["terms-and-conditions"] = STATIC_FALLBACK_PAGES["terms"];

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = STATIC_FALLBACK_PAGES[slug];
  return {
    title: page ? page.title : "Policy",
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  let pageData: { title: string; html: string } | null = null;

  try {
    const dbPage = await db.page.findUnique({
      where: { slug },
    });
    if (dbPage) {
      pageData = {
        title: dbPage.title,
        html: dbPage.contentHtml,
      };
    }
  } catch {
    // DB offline fallback
  }

  if (!pageData) {
    pageData = STATIC_FALLBACK_PAGES[slug] || null;
  }

  if (!pageData) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <div className="p-8 sm:p-12 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-6">
        <h1 className="font-heading text-3xl sm:text-4xl font-black text-[var(--text-primary)] pb-4 border-b border-[var(--border)]">
          {pageData.title}
        </h1>
        <div
          className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: pageData.html }}
        />
      </div>
    </div>
  );
}
