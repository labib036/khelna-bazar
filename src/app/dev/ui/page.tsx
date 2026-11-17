"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Countdown } from "@/components/ui/countdown";
import { Timeline } from "@/components/ui/timeline";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Search,
  Package,
  Award,
} from "lucide-react";

export default function DevUiPage() {
  // If in production, disable this route
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const [stepperVal, setStepperVal] = React.useState(2);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const timelineSteps = [
    {
      id: "1",
      title: "Order Placed & Confirmed",
      description: "Payment confirmed via Cash on Delivery",
      time: "Today, 10:15 AM",
      status: "completed" as const,
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: "2",
      title: "Handpicked & Gift Wrapped",
      description: "Packed with care in Festive Confetti wrap",
      time: "Today, 12:40 PM",
      status: "completed" as const,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: "3",
      title: "Out for Express Dispatch (Steadfast)",
      description: "Rider on the way across Dhaka Metro",
      time: "Today, 02:10 PM",
      status: "current" as const,
      icon: <Truck className="w-4 h-4" />,
    },
    {
      id: "4",
      title: "Delivered to Leo",
      description: "Signature upon delivery",
      status: "upcoming" as const,
      icon: <Award className="w-4 h-4" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] text-xs font-black uppercase tracking-wider mb-2">
          <span>Stitch Sensory UI • Component System v4.8</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-[var(--text-primary)]">
          Khelna Bazar UI Primitive Showcase
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Slice 1 tokens, buttons, inputs, steppers, countdowns, and sensory components.
        </p>
      </div>

      {/* 1. BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
          <span>1. Tactile 3D &amp; Pill Buttons</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <Button variant="pill-primary" size="lg">
            <span>Explore Best Sellers</span>
            <Sparkles className="w-4 h-4" />
          </Button>

          <Button variant="pill-amber" size="lg">
            <ShoppingBag className="w-4 h-4" />
            <span>৳ 2,450 • 3 Items</span>
          </Button>

          <Button variant="pill-outline" size="lg">
            <span>Try 4-Step Gift Finder</span>
          </Button>

          <Button variant="pill-joy" size="lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Safety Specs</span>
          </Button>

          <Button variant="pill-primary" size="sm">
            Small Pill
          </Button>

          <Button variant="pill-amber" size="sm">
            Small Amber
          </Button>

          <Button variant="outline" size="md">
            Outline Pill
          </Button>

          <Button variant="ghost" size="md">
            Ghost Action
          </Button>

          <Button variant="danger" size="md">
            Alert Action
          </Button>
        </div>
      </section>

      {/* 2. BADGES & PILL CHIPS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          2. Micro-Pill Badges &amp; Status Indicators
        </h2>
        <div className="flex flex-wrap items-center gap-2.5 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <Badge variant="amber">4.9/5 Parent Trust Rating</Badge>
          <Badge variant="pill-trust">Same-Day Dispatch • Free Over ৳1500</Badge>
          <Badge variant="red">Hot Seller</Badge>
          <Badge variant="joy">Ages 3-6 Yrs</Badge>
          <Badge variant="safety">Inspect At Delivery</Badge>
          <Badge variant="warning">Only 4 Left!</Badge>
          <Badge variant="outline">STEM &amp; Robotics</Badge>
          <Badge variant="neutral" dot>
            Verified Buyer
          </Badge>
        </div>
      </section>

      {/* 3. INPUTS & SELECTS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          3. Pill Inputs, Search &amp; Dropdowns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <Input
            label="Search Catalog"
            placeholder="Search magical toys, LEGO, plushies..."
            leadingIcon={<Search className="w-4 h-4" />}
            variant="pill"
          />

          <Input
            label="Phone Number (+880)"
            placeholder="01712-345678"
            helperText="We send SMS delivery updates"
            variant="pill"
          />

          <Select
            label="Select Delivery Division"
            variant="pill"
            options={[
              { label: "Dhaka Division (24-48h)", value: "dhaka" },
              { label: "Chittagong Division", value: "chittagong" },
              { label: "Sylhet Division", value: "sylhet" },
              { label: "Rajshahi Division", value: "rajshahi" },
              { label: "Khulna Division", value: "khulna" },
            ]}
          />
        </div>
      </section>

      {/* 4. PRICE & RATING */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          4. Localized Price (৳ BDT) &amp; Ratings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="space-y-2 p-3 bg-[var(--surface-container-low)] rounded-2xl">
            <span className="text-[11px] font-extrabold uppercase text-[var(--text-muted)] block">Small Price</span>
            <Price amount={450} compareAmount={600} size="sm" />
          </div>

          <div className="space-y-2 p-3 bg-[var(--surface-container-low)] rounded-2xl">
            <span className="text-[11px] font-extrabold uppercase text-[var(--text-muted)] block">Medium Price</span>
            <Price amount={1850} compareAmount={2400} size="md" />
          </div>

          <div className="space-y-2 p-3 bg-[var(--surface-container-low)] rounded-2xl">
            <span className="text-[11px] font-extrabold uppercase text-[var(--text-muted)] block">Large Showcase</span>
            <Price amount={3200} compareAmount={4200} size="lg" />
          </div>

          <div className="space-y-2 p-3 bg-[var(--surface-container-low)] rounded-2xl">
            <span className="text-[11px] font-extrabold uppercase text-[var(--text-muted)] block">5-Star Rating</span>
            <Rating rating={4.9} reviewCount={42} size="md" />
          </div>
        </div>
      </section>

      {/* 5. STEPPER & COUNTDOWN */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          5. Tactile Quantity Stepper &amp; Live Flip Countdown
        </h2>
        <div className="flex flex-wrap items-center gap-6 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[var(--text-muted)] block">Quantity Stepper (Pill)</span>
            <QuantityStepper value={stepperVal} onChange={setStepperVal} max={10} size="md" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[var(--text-muted)] block">Flash Deals Timer</span>
            <Countdown label="Deals expire in:" size="md" initialHours={8} initialMinutes={14} initialSeconds={30} />
          </div>
        </div>
      </section>

      {/* 6. STAT CARDS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          6. KPI &amp; Metric Stat Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value="48,250"
            prefix="৳"
            change={18}
            changeLabel="vs yesterday"
            icon={<Sparkles className="w-5 h-5" />}
            variant="peach"
          />

          <StatCard
            title="Pending Orders"
            value="42"
            change={-4}
            changeLabel="fast fulfillment"
            icon={<ShoppingBag className="w-5 h-5" />}
            variant="default"
          />

          <StatCard
            title="Active Wonder Club"
            value="1,450"
            change={24}
            changeLabel="PlayPoints earned"
            icon={<Award className="w-5 h-5" />}
            variant="sun"
          />

          <StatCard
            title="Delivery Success"
            value="99.4%"
            change={2.1}
            changeLabel="64 districts"
            icon={<Truck className="w-5 h-5" />}
            variant="mint"
          />
        </div>
      </section>

      {/* 7. TIMELINE & TABLE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
            7. Order Shipment Timeline
          </h3>
          <Timeline steps={timelineSteps} />
        </div>

        <div className="lg:col-span-7 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
            8. Sensory Data Table
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-bold text-[var(--primary)]">#KB-8941</TableCell>
                <TableCell>Sarah &amp; Leo (Dhaka)</TableCell>
                <TableCell className="font-bold">৳ 2,450</TableCell>
                <TableCell>
                  <Badge variant="amber">Out for Delivery</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold text-[var(--primary)]">#KB-8940</TableCell>
                <TableCell>Tanvir Ahmed (Chittagong)</TableCell>
                <TableCell className="font-bold">৳ 1,850</TableCell>
                <TableCell>
                  <Badge variant="safety">Delivered</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold text-[var(--primary)]">#KB-8939</TableCell>
                <TableCell>Nadia Rahman (Sylhet)</TableCell>
                <TableCell className="font-bold">৳ 3,200</TableCell>
                <TableCell>
                  <Badge variant="joy">Packed</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 8. MODALS & TABS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          9. Sensory Tabs &amp; Modals
        </h2>
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <Tabs defaultValue="features" variant="pill-red">
            <TabsList>
              <TabsTrigger value="features">Toy Wonders</TabsTrigger>
              <TabsTrigger value="specs">Safety Specs</TabsTrigger>
              <TabsTrigger value="reviews">Parent Reviews (42)</TabsTrigger>
            </TabsList>
            <TabsContent value="features" className="p-4 bg-[var(--surface-container-low)] rounded-2xl">
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Featuring sensory sound gears, light-up LED eyes, and durable child-safe ABS build.
              </p>
            </TabsContent>
            <TabsContent value="specs" className="p-4 bg-[var(--surface-container-low)] rounded-2xl">
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Ages 3-6 Yrs • Tested BPA-Free • 3x AA Battery compartment child-secured with safety screw.
              </p>
            </TabsContent>
            <TabsContent value="reviews" className="p-4 bg-[var(--surface-container-low)] rounded-2xl">
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                &ldquo;My 4-year-old hasn&apos;t put this down since morning! Excellent build quality.&rdquo; — Sarah M.
              </p>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="pill-primary" onClick={() => setIsDialogOpen(true)}>
              Open Demo Dialog
            </Button>
            <Button variant="pill-amber" onClick={() => setIsDrawerOpen(true)}>
              Open Demo Drawer
            </Button>
          </div>
        </div>
      </section>

      {/* 10. EMPTY STATE */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
          10. Playful Empty States
        </h2>
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <EmptyState
            illustration={<Package className="w-16 h-16 text-[var(--secondary-container)] stroke-[1.5]" />}
            title="Your Magic Toy Bag is Empty"
            description="Explore our sensory Montessori toys, LEGO robots, and wooden blocks to spark Leo's imagination!"
            action={
              <Button variant="pill-primary" size="md">
                Discover Wonder Toys &rarr;
              </Button>
            }
          />
        </div>
      </section>

      {/* Dialog Preview */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Cosmic Bot 3000 • Quick View"
        description="Sensory STEM Interactive Learning Companion"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Carefully tested, sensory-rich play essentials from Khelna Bazar. 100% Cash on Delivery across all 64 districts.
          </p>
          <div className="flex justify-between items-center pt-2">
            <Price amount={2450} compareAmount={3200} size="lg" />
            <Button variant="pill-primary" onClick={() => setIsDialogOpen(false)}>
              Add to Bag
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Drawer Preview */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Your Magic Shopping Bag"
        description="Free shipping unlocked over ৳1500"
      >
        <div className="p-4 space-y-4">
          <p className="text-xs text-[var(--text-muted)]">Drawer content preview with free delivery meter.</p>
          <Button variant="pill-primary" className="w-full" onClick={() => setIsDrawerOpen(false)}>
            Close Drawer
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
