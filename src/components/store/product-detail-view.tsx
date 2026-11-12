"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToyProduct } from "@/server/mock-data";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCompareStore } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/store/product-card";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Heart,
  Scale,
  Gift,
  AlertTriangle,
  CheckCircle,
  Share2,
  Clock,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailViewProps {
  product: ToyProduct;
  relatedProducts: ToyProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addProduct: addToCompare, isInCompare } = useCompareStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || "var-default"
  );
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "safety" | "reviews" | "qa">("desc");

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0] || {
      id: "var-default",
      sku: "SKU-DEFAULT",
      title: "Standard",
      price: product.basePrice,
      comparePrice: product.comparePrice,
      stock: product.stock,
    };

  const discountPercent = calculateDiscountPercentage(currentVariant.price, currentVariant.comparePrice);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = (openDrawer = true) => {
    addItem(
      {
        id: `${product.id}-${currentVariant.id}`,
        productId: product.id,
        variantId: currentVariant.id,
        name: product.name,
        title: currentVariant.title,
        price: currentVariant.price,
        comparePrice: currentVariant.comparePrice,
        image: product.images[activeImageIndex] || product.images[0],
        sku: currentVariant.sku,
        maxStock: currentVariant.stock,
      },
      quantity
    );

    if (openDrawer) {
      toast.success(`Added ${product.name} to your basket!`);
      openCart();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentVariant.price,
      comparePrice: currentVariant.comparePrice,
      image: product.images[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    });
    if (added) toast.success("Added to your wishlist!");
    else toast.info("Removed from your wishlist.");
  };

  const handleToggleCompare = () => {
    const res = addToCompare({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentVariant.price,
      comparePrice: currentVariant.comparePrice,
      image: product.images[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      minAgeMonths: product.minAgeMonths,
      maxAgeMonths: product.maxAgeMonths,
      material: product.material,
      batteryInfo: product.batteryInfo,
      chokingHazard: product.chokingHazard,
      brandName: product.brand,
      categoryName: product.category,
    });
    if (res.success) toast.success(res.message);
    else toast.warning(res.message);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Khelna Bazar!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#1E5BFF]">
          Home
        </Link>
        <span>/</span>
        <Link href={`/c/${product.categorySlug}`} className="hover:text-[#1E5BFF]">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[#14213D] dark:text-white font-medium truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Grid: Gallery (Left) & Buy Box / Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* GALLERY (Left 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails Column */}
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[#1E5BFF] shadow-sm scale-105"
                      : "border-[#E3E8F2] dark:border-[#263050] hover:border-slate-400"
                  }`}
                  aria-label={`View image angle ${idx + 1}`}
                >
                  <Image src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Image */}
          <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] shadow-sm">
            <Image
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 600px"
            />

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {discountPercent > 0 && (
                <Badge variant="coral" className="font-extrabold text-xs">
                  -{discountPercent}% OFF
                </Badge>
              )}
              {product.isFeatured && <Badge variant="sun">Best Seller</Badge>}
            </div>
          </div>
        </div>

        {/* INFO & BUY BOX (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold uppercase tracking-wider text-[#7B5CFA]">
                {product.brand}
              </span>
              <span className="font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Age: {Math.floor(product.minAgeMonths / 12)}+ Years
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <div className="flex items-center text-[#FFC93C]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.ratingAvg) ? "fill-current" : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {product.ratingAvg.toFixed(1)}
              </span>
              <span className="text-slate-400">({product.ratingCount} Customer Reviews)</span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E2742] border border-[#E3E8F2] dark:border-[#263050]">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#14213D] dark:text-white">
                {formatPrice(currentVariant.price)}
              </span>
              {currentVariant.comparePrice && currentVariant.comparePrice > currentVariant.price && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(currentVariant.comparePrice)}
                  </span>
                  <span className="text-xs font-bold text-[#FF6B6B]">
                    Save {formatPrice(currentVariant.comparePrice - currentVariant.price)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Includes applicable taxes &bull; Pay with cash upon doorstep delivery.
            </p>
          </div>

          {/* Variants Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Option / Edition:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedVariantId === v.id
                        ? "bg-[#1E5BFF] text-white border-[#1E5BFF] shadow-xs"
                        : "border-[#E3E8F2] dark:border-[#263050] text-[#14213D] dark:text-white hover:border-[#1E5BFF]"
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="ml-1 opacity-80">({formatPrice(v.price)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Buy Box Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase text-slate-500">Qty:</span>
              <div className="flex items-center border border-[#E3E8F2] dark:border-[#263050] rounded-full bg-white dark:bg-[#161D33] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-[#14213D] dark:text-white select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentVariant.stock || 99, quantity + 1))}
                  className="p-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> In Stock &bull; Ready to Dispatch
              </span>
            </div>

            {/* Gift Wrap Toggle */}
            <div className="p-3 rounded-xl border border-dashed border-[#FFC93C] bg-[#FFFDF5] dark:bg-[#2B230B]/40 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#14213D] dark:text-white">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFC93C] focus:ring-[#FFC93C] cursor-pointer"
                />
                <Gift className="w-4 h-4 text-[#B88700]" />
                <span>Add Premium Gift Wrapping &amp; Birthday Ribbon (+৳50)</span>
              </label>

              {giftWrap && (
                <input
                  type="text"
                  placeholder="Enter custom gift message (optional)"
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full text-xs h-8 px-3 rounded-lg border border-[#E3E8F2] dark:border-[#263050] bg-white dark:bg-[#161D33] text-black dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              )}
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button onClick={() => handleAddToCart(true)} variant="primary" size="lg" className="shadow-md">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                <span>Add to Basket</span>
              </Button>

              <Button onClick={handleBuyNow} variant="sun" size="lg" className="shadow-md">
                <span>Buy Now (COD)</span>
              </Button>
            </div>

            {/* Wishlist & Compare Icons */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <button
                onClick={handleToggleWishlist}
                className="flex items-center gap-1.5 hover:text-[#FF6B6B] transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? "fill-[#FF6B6B] text-[#FF6B6B]" : ""}`} />
                <span>{inWishlist ? "In Wishlist" : "Save to Wishlist"}</span>
              </button>

              <button
                onClick={handleToggleCompare}
                className="flex items-center gap-1.5 hover:text-[#7B5CFA] transition-colors cursor-pointer"
              >
                <Scale className="w-4 h-4 text-[#7B5CFA]" />
                <span>{inCompare ? "In Comparison" : "Compare Toy"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-[#1E5BFF] transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="space-y-2.5 pt-4 border-t border-[#E3E8F2] dark:border-[#263050] text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#2EC4B6] shrink-0" />
              <span>
                <strong>Cash on Delivery:</strong> 24–48 hours in Dhaka (৳60), 2–4 days nationwide (৳120).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E5BFF] shrink-0" />
              <span>
                <strong>Zero-Risk Guarantee:</strong> Inspect package upon delivery before paying the courier.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#FF6B6B] shrink-0" />
              <span>
                <strong>7-Day Returns:</strong> Free replacement for defective or missing components.
              </span>
            </div>
          </div>

          {/* Choking Hazard Alert Panel */}
          {product.chokingHazard && (
            <div className="p-3.5 rounded-2xl bg-[#FFF0F0] dark:bg-[#3D1414] border border-[#FF6B6B]/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF6B6B] shrink-0 mt-0.5" />
              <div className="text-xs text-[#14213D] dark:text-slate-200">
                <strong className="text-[#FF6B6B] block">SAFETY NOTICE: CHOKING HAZARD</strong>
                <span>{product.chokingWarning || "Small parts. Not suitable for children under 3 years old."}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABS: Description, Specs, Safety & Certifications, Reviews */}
      <div className="pt-8 border-t border-[#E3E8F2] dark:border-[#263050]">
        <div className="flex border-b border-[#E3E8F2] dark:border-[#263050] overflow-x-auto gap-4 text-sm font-bold">
          <button
            onClick={() => setActiveTab("desc")}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === "desc"
                ? "border-b-2 border-[#1E5BFF] text-[#1E5BFF]"
                : "text-slate-500 hover:text-[#14213D] dark:hover:text-white"
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === "specs"
                ? "border-b-2 border-[#1E5BFF] text-[#1E5BFF]"
                : "text-slate-500 hover:text-[#14213D] dark:hover:text-white"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === "safety"
                ? "border-b-2 border-[#1E5BFF] text-[#1E5BFF]"
                : "text-slate-500 hover:text-[#14213D] dark:hover:text-white"
            }`}
          >
            Safety &amp; Compliance
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === "reviews"
                ? "border-b-2 border-[#1E5BFF] text-[#1E5BFF]"
                : "text-slate-500 hover:text-[#14213D] dark:hover:text-white"
            }`}
          >
            Customer Reviews ({product.ratingCount})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-6">
          {activeTab === "desc" && (
            <div
              className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl divide-y divide-[#E3E8F2] dark:divide-[#263050] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400 font-medium">Recommended Age</span>
                <span className="font-bold text-[#14213D] dark:text-white">
                  {Math.floor(product.minAgeMonths / 12)} to {Math.floor(product.maxAgeMonths / 12)} Years
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400 font-medium">Materials</span>
                <span className="font-bold text-[#14213D] dark:text-white">{product.material}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400 font-medium">Battery Requirements</span>
                <span className="font-bold text-[#14213D] dark:text-white">{product.batteryInfo}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400 font-medium">SKU</span>
                <span className="font-mono text-[#14213D] dark:text-white">{currentVariant.sku}</span>
              </div>
              {product.attributes.map((a, i) => (
                <div key={i} className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">{a.name}</span>
                  <span className="font-bold text-[#14213D] dark:text-white">{a.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "safety" && (
            <div className="space-y-4 max-w-2xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Safety Certifications
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 font-bold border border-emerald-300"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <p>
                This product has been independently tested in accredited laboratory facilities according to the American
                Society for Testing and Materials (ASTM F963) and European Standard EN71 directives.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Non-toxic child-safe pigments (lead-free and phthalate-free).</li>
                <li>Smooth drop-tested rounded corners with no sharp mechanical burrs.</li>
                <li>Secure enclosed battery compartments where applicable.</li>
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 max-w-3xl">
              {/* Review summary block */}
              <div className="p-5 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E2742] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-[#14213D] dark:text-white">
                      {product.ratingAvg.toFixed(1)}
                    </span>
                    <div className="flex text-[#FFC93C]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Based on {product.ratingCount} verified purchases</p>
                </div>
              </div>

              {/* Sample verified review cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E3E8F2] dark:border-[#263050] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white">Farhana I.</span>
                    <span className="text-[10px] text-slate-400">2 days ago</span>
                  </div>
                  <div className="flex text-[#FFC93C]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    "Delivered to Dhanmondi in 24 hours. The packaging was immaculate and my son was overjoyed.
                    Cash on delivery payment was very convenient."
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold block">✓ Verified Purchase &bull; Cash on Delivery</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CROSS SELL: RELATED TOYS */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-[#E3E8F2] dark:border-[#263050]">
          <h2 className="font-heading text-xl sm:text-2xl font-black text-[#14213D] dark:text-white mb-6">
            You May Also Love These Toys
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
