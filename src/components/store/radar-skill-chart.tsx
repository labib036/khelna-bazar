"use client";

import { Sparkles, Brain, Compass, Hand, MessageCircle, Lightbulb } from "lucide-react";

interface SkillMetric {
  name: string;
  score: number; // 0 to 100
  icon: typeof Brain;
  color: string;
  description: string;
}

const DEFAULT_METRICS: SkillMetric[] = [
  {
    name: "Fine Motor Control",
    score: 94,
    icon: Hand,
    color: "var(--primary)",
    description: "Strengthens finger dexterity, hand-eye coordination & tactile grasping.",
  },
  {
    name: "Spatial & 3D Logic",
    score: 88,
    icon: Compass,
    color: "var(--accent)",
    description: "Builds depth perception, balance awareness, and physical geometry intuition.",
  },
  {
    name: "Cognitive Problem Solving",
    score: 92,
    icon: Brain,
    color: "var(--secondary)",
    description: "Encourages trial-and-error reasoning, pattern sequencing, and perseverance.",
  },
  {
    name: "Creative Imagination",
    score: 96,
    icon: Lightbulb,
    color: "var(--secondary-container)",
    description: "Sparks open-ended world-building, sensory curiosity, and storytelling.",
  },
  {
    name: "Communication & Language",
    score: 82,
    icon: MessageCircle,
    color: "var(--success)",
    description: "Introduces foundational bilingual vocabulary and collaborative turn-taking.",
  },
];

export function RadarSkillChart() {
  return (
    <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar SVG Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
              Cognitive Development Radar
            </h4>
          </div>

          <svg
            aria-label="Developmental skill radar chart"
            className="w-56 h-56 sm:w-64 sm:h-64 overflow-visible"
            role="img"
            viewBox="0 0 300 300"
          >
            {/* Concentric Guide Polygons */}
            <polygon
              fill="none"
              opacity="0.4"
              points="150,30 264,113 220,248 80,248 36,113"
              stroke="var(--border)"
              strokeDasharray="3,3"
              strokeWidth="1.5"
            />
            <polygon
              fill="none"
              opacity="0.3"
              points="150,70 226,125 197,215 103,215 74,125"
              stroke="var(--border)"
              strokeDasharray="3,3"
              strokeWidth="1.5"
            />
            <polygon
              fill="none"
              opacity="0.2"
              points="150,110 188,138 173,183 127,183 112,138"
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* Axis Lines */}
            <line opacity="0.3" stroke="var(--border)" strokeWidth="1" x1="150" x2="150" y1="150" y2="30" />
            <line opacity="0.3" stroke="var(--border)" strokeWidth="1" x1="150" x2="264" y1="150" y2="113" />
            <line opacity="0.3" stroke="var(--border)" strokeWidth="1" x1="150" x2="220" y1="150" y2="248" />
            <line opacity="0.3" stroke="var(--border)" strokeWidth="1" x1="150" x2="80" y1="150" y2="248" />
            <line opacity="0.3" stroke="var(--border)" strokeWidth="1" x1="150" x2="36" y1="150" y2="113" />

            {/* Filled Radar Polygon */}
            <polygon
              fill="var(--primary)"
              fillOpacity="0.2"
              points="150,42 250,120 210,235 90,230 48,122"
              stroke="var(--primary)"
              strokeWidth="3"
            />

            {/* Vertices */}
            <circle cx="150" cy="42" fill="var(--primary)" r="5" />
            <circle cx="250" cy="120" fill="var(--primary)" r="5" />
            <circle cx="210" cy="235" fill="var(--primary)" r="5" />
            <circle cx="90" cy="230" fill="var(--primary)" r="5" />
            <circle cx="48" cy="122" fill="var(--primary)" r="5" />

            {/* Labels */}
            <text x="150" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              Motor Skills (94%)
            </text>
            <text x="270" y="115" textAnchor="start" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              Spatial (88%)
            </text>
            <text x="225" y="265" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              Logic (92%)
            </text>
            <text x="75" y="265" textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              Language (82%)
            </text>
            <text x="30" y="115" textAnchor="end" fontSize="11" fontWeight="bold" fill="var(--text-primary)">
              Creativity (96%)
            </text>
          </svg>
        </div>

        {/* Skill Progress Bars & Insights */}
        <div className="lg:col-span-7 space-y-4">
          <div className="mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary)] block">
              Pediatric Developmental Alignment
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Targeted Growth Milestones
            </h3>
          </div>

          <div className="space-y-3">
            {DEFAULT_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.name}
                  className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-[var(--text-primary)] flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[var(--primary)]" />
                      {metric.name}
                    </span>
                    <span className="font-extrabold text-[var(--primary)]">{metric.score}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--surface-container-high)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">{metric.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
