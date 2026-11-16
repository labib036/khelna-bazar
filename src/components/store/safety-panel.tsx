"use client";

import { ShieldCheck, AlertTriangle, Droplets, BatteryCharging, ShieldAlert, Volume2, Award, FileText } from "lucide-react";

interface SafetyPanelProps {
  ageRange?: string;
  chokingHazard?: boolean;
}

export function SafetyPanel({ ageRange = "3–8 Years", chokingHazard = true }: SafetyPanelProps) {
  return (
    <section aria-labelledby="safety-heading" className="w-full mt-10">
      <div className="relative overflow-hidden rounded-4xl bg-[var(--surface-container-low)] p-6 sm:p-8 lg:p-10 border border-[var(--border)] shadow-xs">
        {/* Subtle Background Glow */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-[var(--secondary-container)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header with Shield Lockup */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary)] block">
                  Khelna Certified Lab Assurance
                </span>
                <h2 id="safety-heading" className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                  Toy Safety, Choking Hazard &amp; Lab Audit
                </h2>
              </div>
            </div>

            {/* Certified Lab Seal Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] font-bold text-xs text-[var(--text-primary)] shadow-xs border border-[var(--border)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--secondary)]" /> ASTM F963 (US)
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] font-bold text-xs text-[var(--text-primary)] shadow-xs border border-[var(--border)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--primary)]" /> EN71 / CE (EU)
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] font-bold text-xs text-[var(--text-primary)] shadow-xs border border-[var(--border)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent)]" /> BSTI Standard
              </span>
            </div>
          </div>

          {/* Mandatory Hazard Warning Alert Box */}
          {chokingHazard && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[var(--secondary-container)]/20 border-2 border-[var(--secondary-container)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                  WARNING: CHOKING HAZARD — Small Parts
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  This toy set includes small components and tactile pieces. <strong>Not intended for children under 3 years old.</strong> Recommended for kids aged {ageRange} under attentive guardian encouragement.
                </p>
              </div>
            </div>
          )}

          {/* Deep Trust Grid (4 Pillar Safety Pillars) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pillar 1 */}
            <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--primary)] font-black text-sm">
                <Droplets className="w-5 h-5" />
                <span>Zero-Toxin Resin</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                100% BPA-Free, Lead-Free &amp; Phthalate-Free food-grade ABS resin. Finished with odorless, non-leaching soy-based organic color pigments.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--primary)] font-black text-sm">
                <BatteryCharging className="w-5 h-5" />
                <span>Child-Proof Battery Seam</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Internal battery compartments encased in dual flame-retardant casing with recessed screw-lock to prevent curious toddler tampering.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--primary)] font-black text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>1.8m Drop Resistance</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Drop-tested 200+ times against hard tiled nursery floors. Engineered with shock-absorbing corners and zero sharp plastic burrs.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--primary)] font-black text-sm">
                <Volume2 className="w-5 h-5" />
                <span>Acoustic Decibel Cap</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Sound output strictly capped at &lt;78 dB (well below WHO pediatric acoustic thresholds) to protect tender auditory nerve development.
              </p>
            </div>
          </div>

          {/* Age Developmental Alignment Rationale Box */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                  Why is {ageRange} the &quot;Wonder Sweet Spot&quot;?
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mt-0.5 leading-relaxed">
                  During this stage, neuroplastic pathways for algorithmic thinking, spatial mapping, and symbolic reasoning bloom rapidly. Safe tactile toys turn abstract skills into playful floor exploration without passive screen fatigue.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="px-4 py-2 rounded-full bg-[var(--surface-container-high)] text-xs font-bold text-[var(--text-primary)]">
                Certificate #KB-LAB-2026-BD
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
