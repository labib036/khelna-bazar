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
      <p>Khelna Bazar is an online toy marketplace dedicated to joyful, engaging, and developmental toys in Bangladesh. We believe creative play is essential to childhood—fostering analytical problem solving, coordination, and imagination.</p>
      <h3>Why Shop With Us</h3>
      <ul>
        <li><strong>Curated Quality:</strong> Every toy is selected with care, clearly labeled with recommended age ranges and safety notices.</li>
        <li><strong>Inspect Before You Accept:</strong> Check your package in front of the delivery person before accepting or paying.</li>
        <li><strong>Cash on Delivery:</strong> Safe and reliable Cash on Delivery available.</li>
      </ul>
    `,
  },
  "toy-safety": {
    title: "Toy Safety & Quality Guidelines",
    html: `
      <h2>Our Commitment to Child Safety</h2>
      <p>Nothing matters more than your child's well-being. At Khelna Bazar, every item in our catalog is chosen with developmental appropriateness and safety in mind.</p>
      <h3>Our Guidelines</h3>
      <ul>
        <li><strong>Age-Appropriate Design:</strong> Every product includes clear age recommendations so you can choose the right toy for your child.</li>
        <li><strong>Choking Hazard Warnings:</strong> Transparent labels on all toys containing small components unsuitable for children under 3 years old.</li>
        <li><strong>Inspect At Delivery:</strong> We encourage all parents to inspect their toys in front of the delivery person upon arrival.</li>
      </ul>
    `,
  },
  "shipping-policy": {
    title: "Shipping & Delivery Policy",
    html: `
      <h2>Delivery Across Bangladesh</h2>
      <p>We provide doorstep delivery with Cash on Delivery options.</p>
      <h3>Delivery Options &amp; Coverage</h3>
      <ul>
        <li><strong>Coverage:</strong> Cash on Delivery available across all 64 districts in Bangladesh. bKash and Nagad mobile payments also accepted.</li>
        <li><strong>Delivery Zones:</strong> Inside Dhaka (Dhaka Metro) and Outside Dhaka (All Bangladesh).</li>
        <li><strong>Fees &amp; Timelines:</strong> Delivery fee and delivery timeline are displayed transparently at checkout based on your delivery address and order details.</li>
      </ul>
      <h3>Mandatory Doorstep Inspection</h3>
      <p>When the delivery rider arrives, please open the package and inspect the item in front of the delivery person before accepting and paying. Once inspected and accepted, items are non-refundable.</p>
    `,
  },
  "returns-policy": {
    title: "Returns and Refund Policy",
    html: `
      <h2>Returns and Refund Policy</h2>
      <ol>
        <li><strong>Inspect at delivery:</strong> When your order arrives, please open and check the product in front of the delivery person before you accept it and before you pay (for Cash on Delivery).</li>
        <li><strong>Defective or wrong products:</strong> If the product is defective, damaged, or not what you ordered, inform the delivery person and refuse the item at the door. Contact us on 01712-039707 (call or WhatsApp) the same day. We will refund you (or replace the item if you prefer, subject to stock).</li>
        <li><strong>Cash on Delivery orders:</strong> If you refuse a defective item at delivery, you do not pay for it.</li>
        <li><strong>Prepaid orders (bKash/Nagad):</strong> If a defective item is returned at delivery, we refund the amount to the number you paid from.</li>
        <li><strong>After you accept the product:</strong> Once you have inspected the product, accepted it, and received it, it cannot be refunded or returned.</li>
        <li><strong>Change of mind:</strong> Products cannot be returned or refunded due to a change of mind after acceptance.</li>
        <li><strong>Contact:</strong> Call or WhatsApp 01712-039707.</li>
      </ol>
    `,
  },
  "privacy-policy": {
    title: "Privacy Policy",
    html: `
      <h2>Your Privacy is Respected</h2>
      <p>Khelna Bazar values your privacy. We collect only necessary delivery information (Name, Contact Number, and Shipping Address) solely to fulfill your orders.</p>
      <p>We do not share your information with third-party marketing brokers. All customer data is maintained securely.</p>
    `,
  },
  "terms": {
    title: "Terms & Conditions",
    html: `
      <h2>Terms of Service</h2>
      <p>By placing an order on Khelna Bazar, you agree to inspect the delivery package and provide payment upon arrival. All prices are listed in Bangladeshi Taka (BDT) including applicable taxes.</p>
      <p>Customers agree to inspect goods in front of the courier before acceptance. Items cannot be returned or refunded once inspected and accepted.</p>
    `,
  },
  "contact": {
    title: "Contact Customer Care",
    html: `
      <h2>We are Here to Help</h2>
      <p>Have questions about your order or product inquiries? Contact our customer care:</p>
      <ul>
        <li><strong>Hotline:</strong> 01712-039707 (Call)</li>
        <li><strong>WhatsApp:</strong> 01712-039707</li>
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
