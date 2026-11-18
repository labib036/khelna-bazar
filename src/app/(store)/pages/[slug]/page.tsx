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
    title: "About Khelna Bazar / খেলনা বাজার পরিচিতি",
    html: `
      <h2>About Khelna Bazar / আমাদের কথা</h2>
      <p>Khelna Bazar (খেলনা বাজার) is an online toy store in Bangladesh dedicated to creative, engaging, and developmental toys for children. We help parents, guardians, and gift-givers discover quality toys with ease.</p>
      <p>খেলনা বাজার (khelnabazar.com.bd) বাংলাদেশের একটি বিশ্বস্ত অনলাইন খেলনা শপ। শিশুদের মানসিক বিকাশ, সৃজনশীলতা ও আনন্দের জন্য আমরা বাছাই করা খেলনা সরবরাহ করি।</p>
      <h3>Core Commitments / আমাদের মূল নীতি</h3>
      <ul>
        <li><strong>Inspect Before You Accept:</strong> Check your package in front of the delivery person before accepting it.</li>
        <li><strong>পণ্য পরীক্ষা করে গ্রহণ:</strong> পণ্য গ্রহণের আগে ডেলিভারি প্রতিনিধির সামনে পরীক্ষা করুন।</li>
        <li><strong>Cash on Delivery &amp; MFS:</strong> Cash on Delivery, bKash, and Nagad payments supported.</li>
        <li><strong>ক্যাশ অন ডেলিভারি ও মোবাইল পেমেন্ট:</strong> ক্যাশ অন ডেলিভারি এবং বিকাশ ও নগদ পেমেন্ট সুবিধা।</li>
      </ul>
      <p>For inquiries, call or WhatsApp: <strong>01712-039707</strong>.</p>
    `,
  },
  "toy-safety": {
    title: "Product Information & Safety Guidelines / পণ্যের তথ্য ও নিরাপত্তা নির্দেশিকা",
    html: `
      <h2>Product Information &amp; Safety Guidelines / পণ্যের তথ্য ও সতর্কতা</h2>
      <p>At Khelna Bazar, we care about child safety and transparency. Every product listing displays age recommendations, materials, and warnings where provided by the manufacturer.</p>
      <p>খেলনা বাজারে শিশুদের নিরাপত্তা আমাদের অগ্রাধিকার। প্রতিটি পণ্যের ক্ষেত্রে বয়সসীমা এবং প্রস্তুতকারকের নির্দেশিত সতর্কতা স্পষ্টভাবে উল্লেখ করা হয়।</p>
      <h3>Safety Guidelines / নিরাপত্তা নির্দেশিকা</h3>
      <ul>
        <li><strong>Age Suitability:</strong> Always check the recommended age range before purchasing for a child.</li>
        <li><strong>বয়সসীমা:</strong> শিশুর জন্য খেলনা কেনার আগে প্রস্তাবিত বয়সসীমা দেখে নিন।</li>
        <li><strong>Choking Hazard Warning:</strong> Toys with small parts are strictly not suitable for children under 3 years old.</li>
        <li><strong>ছোট অংশ সতর্কতা:</strong> ছোট যন্ত্রাংশযুক্ত খেলনা ৩ বছরের কম বয়সী শিশুদের জন্য অনুপযুক্ত।</li>
        <li><strong>Doorstep Inspection:</strong> Always inspect the toy in front of the delivery person upon arrival.</li>
        <li><strong>ডেলিভারির সময় পরীক্ষা:</strong> পণ্য পৌঁছালে ডেলিভারি প্রতিনিধির সামনে খেলনাটি পরীক্ষা করে নিন।</li>
      </ul>
    `,
  },
  "shipping-policy": {
    title: "Delivery Information / ডেলিভারি তথ্য",
    html: `
      <h2>Delivery Information / ডেলিভারি তথ্য</h2>
      <p>Delivery availability and the applicable delivery fee are confirmed for your delivery area before your order is dispatched. For help, call or WhatsApp <strong>01712-039707</strong>.</p>
      <p>আপনার ডেলিভারি এলাকার জন্য ডেলিভারি সুবিধা ও প্রযোজ্য চার্জ অর্ডার পাঠানোর আগে নিশ্চিত করা হবে। সহায়তার জন্য <strong>01712-039707</strong> নম্বরে কল বা WhatsApp করুন।</p>
      <h3>Payment Options / পেমেন্ট সুবিধা</h3>
      <ul>
        <li><strong>Cash on Delivery (COD):</strong> Pay the delivery person when your order arrives.</li>
        <li><strong>ক্যাশ অন ডেলিভারি:</strong> পণ্য পৌঁছালে ডেলিভারি প্রতিনিধিকে পেমেন্ট করুন।</li>
        <li><strong>bKash &amp; Nagad:</strong> Send Money to our official number <strong>01712-039707</strong> and provide the sender number and Transaction ID (TrxID) at checkout. Manual verification is conducted prior to dispatch.</li>
        <li><strong>বিকাশ ও নগদ:</strong> আমাদের অফিসিয়াল নম্বর <strong>01712-039707</strong>-এ টাকা পাঠিয়ে প্রেরক নম্বর ও TrxID প্রদান করুন। পাঠানোর আগে ম্যানুয়ালি যাচাই করা হবে।</li>
      </ul>
      <h3>Mandatory Doorstep Inspection / ডেলিভারির সময় পরীক্ষা</h3>
      <p>Please inspect the product in front of the delivery person before accepting it. Report any defect at the time of delivery.</p>
      <p>পণ্য গ্রহণ করার আগে ডেলিভারি প্রতিনিধির সামনে পরীক্ষা করুন। কোনো ত্রুটি থাকলে ডেলিভারির সময়ই জানান।</p>
    `,
  },
  "returns-policy": {
    title: "Returns and Refunds / পণ্য ফেরত ও রিফান্ড",
    html: `
      <h2>Returns and Refunds / পণ্য ফেরত ও রিফান্ড</h2>
      <p><strong>Inspect before accepting delivery.</strong> Please inspect the product in front of the delivery person before accepting it.</p>
      <p><strong>ডেলিভারি গ্রহণের আগে পরীক্ষা করুন।</strong> পণ্য গ্রহণ করার আগে ডেলিভারি প্রতিনিধির সামনে পণ্যটি পরীক্ষা করুন।</p>
      <hr />
      <p><strong>Defective products.</strong> A defective product can be returned or refunded if the defect is reported at the time of delivery.</p>
      <p><strong>ত্রুটিপূর্ণ পণ্য।</strong> ডেলিভারির সময় ত্রুটি জানালে ত্রুটিপূর্ণ পণ্য ফেরত দেওয়া বা রিফান্ড পাওয়া যেতে পারে।</p>
      <hr />
      <p><strong>After acceptance.</strong> Once you have inspected and accepted the product, it is not refundable.</p>
      <p><strong>পণ্য গ্রহণের পর।</strong> পণ্য পরীক্ষা করে গ্রহণ করার পর তা রিফান্ডযোগ্য নয়।</p>
      <hr />
      <p><strong>Change of mind.</strong> We do not accept change-of-mind returns after the product has been accepted.</p>
      <p><strong>মত পরিবর্তন।</strong> পণ্য গ্রহণ করার পর মত পরিবর্তনের কারণে পণ্য ফেরত নেওয়া হয় না।</p>
      <hr />
      <p><strong>Contact.</strong> For help, call or WhatsApp <strong>01712-039707</strong>.</p>
      <p><strong>যোগাযোগ।</strong> সহায়তার জন্য <strong>01712-039707</strong> নম্বরে কল বা WhatsApp করুন।</p>
    `,
  },
  "privacy-policy": {
    title: "Privacy Policy / গোপনীয়তা নীতি",
    html: `
      <h2>Privacy Policy / গোপনীয়তা নীতি</h2>
      <p>Khelna Bazar collects necessary information (such as recipient name, mobile number, and delivery address) strictly for processing and delivering your orders.</p>
      <p>খেলনা বাজার শুধুমাত্র অর্ডার প্রক্রিয়া ও ডেলিভারি সম্পন্ন করার জন্য প্রয়োজনীয় তথ্য (যেমন নাম, মোবাইল নম্বর এবং ডেলিভারির ঠিকানা) সংগ্রহ করে।</p>
      <p>Customer contact details are used solely for order confirmations, delivery updates, and customer support.</p>
      <p>গ্রাহকের তথ্য শুধুমাত্র অর্ডার নিশ্চিতকরণ, ডেলিভারি আপডেট এবং কাস্টমার সাপোর্টের কাজে ব্যবহৃত হয়।</p>
      <p>For privacy queries, contact <strong>01712-039707</strong>.</p>
    `,
  },
  "terms": {
    title: "Terms and Conditions / শর্তাবলি",
    html: `
      <h2>Terms and Conditions / ব্যবহারিক শর্তাবলি</h2>
      <p>By placing an order on Khelna Bazar (khelnabazar.com.bd), you agree to the following terms:</p>
      <ul>
        <li><strong>Currency:</strong> All prices are displayed in Bangladeshi Taka (BDT ৳).</li>
        <li><strong>মুদ্রা:</strong> সকল পণ্যের মূল্য বাংলাদেশি টাকা (৳)-য় প্রদর্শিত।</li>
        <li><strong>Mandatory Inspection:</strong> Customers must inspect the product in front of the delivery person before accepting it.</li>
        <li><strong>বাধ্যতামূলক পরীক্ষা:</strong> পণ্য গ্রহণ করার আগে ডেলিভারি প্রতিনিধির সামনে পরীক্ষা করে নিতে হবে।</li>
        <li><strong>Defects at Delivery:</strong> Defective products must be reported at the time of delivery to be eligible for return or refund.</li>
        <li><strong>ডেলিভারির সময় ত্রুটি:</strong> ত্রুটিপূর্ণ পণ্য ফেরত বা রিফান্ডের জন্য ডেলিভারির সময়ই তা জানাতে হবে।</li>
        <li><strong>Non-refundable After Acceptance:</strong> Once inspected and accepted, products are not refundable, and change-of-mind returns are not accepted.</li>
        <li><strong>গ্রহণের পর অফেরতযোগ্য:</strong> পণ্য পরীক্ষা করে গ্রহণ করার পর তা আর ফেরত বা রিফান্ডযোগ্য নয়।</li>
      </ul>
      <p>For assistance, call or WhatsApp <strong>01712-039707</strong>.</p>
    `,
  },
  "contact": {
    title: "Contact Us / যোগাযোগ করুন",
    html: `
      <h2>Contact Customer Support / যোগাযোগ</h2>
      <p>Have questions about your order, products, or delivery? Reach out to us directly:</p>
      <p>আপনার অর্ডার বা পণ্য সম্পর্কিত যে কোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন:</p>
      <ul>
        <li><strong>Hotline:</strong> 01712-039707 (Call)</li>
        <li><strong>WhatsApp:</strong> 01712-039707</li>
      </ul>
      <p>We are available to assist you via phone call or WhatsApp message.</p>
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
