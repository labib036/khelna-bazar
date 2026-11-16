import React from "react";

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 1. Empty Cart / Basket Illustration
 * A playful open toy chest with friendly sparkles and bouncing block
 */
export function EmptyCartIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {/* Soft atmospheric background circle */}
      <circle cx="100" cy="100" r="82" fill="var(--surface-peach)" />
      
      {/* Floating decorative stars */}
      <path
        d="M152 48L154.5 54.5L161 57L154.5 59.5L152 66L149.5 59.5L143 57L149.5 54.5L152 48Z"
        fill="var(--warning)"
        opacity="0.9"
      />
      <path
        d="M48 64L49.5 68.5L54 70L49.5 71.5L48 76L46.5 71.5L42 70L46.5 68.5L48 64Z"
        fill="var(--accent)"
        opacity="0.8"
      />
      
      {/* Toy Chest Base */}
      <rect x="52" y="98" width="96" height="58" rx="14" fill="var(--surface)" stroke="var(--primary)" strokeWidth="4" />
      <path d="M52 118H148" stroke="var(--border)" strokeWidth="3" strokeDasharray="4 4" />
      
      {/* Chest Handles */}
      <rect x="42" y="112" width="10" height="20" rx="4" fill="var(--primary)" />
      <rect x="148" y="112" width="10" height="20" rx="4" fill="var(--primary)" />

      {/* Toy Chest Lid (Open angled) */}
      <path
        d="M44 94C44 86 52 78 62 76L138 64C148 62 156 68 156 78L156 94H44Z"
        fill="var(--surface-elevated)"
        stroke="var(--primary)"
        strokeWidth="4"
      />
      
      {/* Lock clasp */}
      <rect x="94" y="92" width="12" height="14" rx="3" fill="var(--warning)" />
      <circle cx="100" cy="98" r="2" fill="var(--text-primary)" />

      {/* Playful Floating Toy Block with smiley */}
      <g transform="translate(86, 42) rotate(8)">
        <rect width="28" height="28" rx="7" fill="var(--primary)" />
        <circle cx="9" cy="11" r="2.5" fill="var(--on-primary)" />
        <circle cx="19" cy="11" r="2.5" fill="var(--on-primary)" />
        <path d="M9 18C11 21 17 21 19 18" stroke="var(--on-primary)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * 2. Empty Wishlist / Favorites Illustration
 * A joyful heart with playful toy stars
 */
export function EmptyWishlistIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="82" fill="var(--surface-lilac)" />
      
      {/* Little floating bubbles */}
      <circle cx="48" cy="72" r="8" fill="var(--accent)" opacity="0.3" />
      <circle cx="152" cy="62" r="12" fill="var(--primary)" opacity="0.25" />
      <circle cx="158" cy="132" r="6" fill="var(--warning)" opacity="0.4" />
      
      {/* Heart Outline with Floating Depth */}
      <path
        d="M100 152C100 152 46 122 46 84C46 64 62 48 82 48C93 48 100 56 100 56C100 56 107 48 118 48C138 48 154 64 154 84C154 122 100 152 100 152Z"
        fill="var(--surface)"
        stroke="var(--danger)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Little toy ribbon / badge */}
      <circle cx="100" cy="94" r="18" fill="var(--surface-peach)" />
      <path
        d="M100 86L102.5 91.5L108 92.5L104 96.5L105 102L100 99L95 102L96 96.5L92 92.5L97.5 91.5L100 86Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

/**
 * 3. No Results / Search Rocket Illustration
 * A playful rocket searching through space with magnifying loop
 */
export function NoResultsIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="82" fill="var(--surface-sky)" />
      
      {/* Distant Planet */}
      <circle cx="150" cy="55" r="14" fill="var(--warning)" opacity="0.6" />
      <ellipse cx="150" cy="55" rx="20" ry="4" stroke="var(--warning)" strokeWidth="2" fill="none" opacity="0.7" />

      {/* Magnifying Glass Frame */}
      <circle cx="92" cy="92" r="42" fill="var(--surface)" stroke="var(--primary)" strokeWidth="5" />
      <path d="M124 124L156 156" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />

      {/* Inside Glass: Tiny Cute Puzzle Piece */}
      <g transform="translate(76, 76)">
        <rect width="32" height="32" rx="6" fill="var(--surface-elevated)" stroke="var(--accent)" strokeWidth="2.5" />
        <circle cx="16" cy="7" r="4" fill="var(--accent)" />
        <circle cx="25" cy="16" r="4" fill="var(--accent)" />
        <path d="M12 20C14 23 18 23 20 20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="11" cy="14" r="1.5" fill="var(--text-primary)" />
        <circle cx="21" cy="14" r="1.5" fill="var(--text-primary)" />
      </g>
    </svg>
  );
}

/**
 * 4. No Orders / Sleeping Delivery Truck Illustration
 */
export function NoOrdersIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="82" fill="var(--surface-mint)" />

      {/* ZZZ Sleeping indicator */}
      <text x="145" y="60" fill="var(--accent)" fontSize="18" fontWeight="bold" fontFamily="sans-serif">Z</text>
      <text x="135" y="75" fill="var(--accent)" fontSize="14" fontWeight="bold" fontFamily="sans-serif">z</text>
      <text x="127" y="86" fill="var(--accent)" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>

      {/* Delivery Truck Body */}
      <rect x="42" y="98" width="68" height="42" rx="8" fill="var(--surface)" stroke="var(--success)" strokeWidth="4" />
      {/* Truck Cab */}
      <path d="M110 110H132C136 110 140 114 142 118L148 128V140H110V110Z" fill="var(--surface-elevated)" stroke="var(--success)" strokeWidth="4" />
      {/* Window */}
      <path d="M116 116H130L135 125H116V116Z" fill="var(--surface-sky)" />

      {/* Wheels */}
      <circle cx="65" cy="142" r="12" fill="var(--text-primary)" />
      <circle cx="65" cy="142" r="5" fill="var(--surface)" />
      <circle cx="132" cy="142" r="12" fill="var(--text-primary)" />
      <circle cx="132" cy="142" r="5" fill="var(--surface)" />

      {/* Parcel on Truck */}
      <rect x="54" y="106" width="22" height="20" rx="3" fill="var(--surface-peach)" stroke="var(--warning)" strokeWidth="2" />
      <path d="M65 106V126M54 116H76" stroke="var(--warning)" strokeWidth="2" />
    </svg>
  );
}

/**
 * 5. Order Success / Confetti Popper Illustration
 */
export function OrderSuccessIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="82" fill="var(--surface-mint)" />

      {/* Confetti pieces */}
      <rect x="45" y="45" width="8" height="8" rx="2" fill="var(--primary)" transform="rotate(25 45 45)" />
      <rect x="145" y="52" width="9" height="6" rx="2" fill="var(--warning)" transform="rotate(-15 145 52)" />
      <circle cx="152" cy="98" r="4" fill="var(--accent)" />
      <circle cx="48" cy="112" r="5" fill="var(--danger)" />
      <rect x="75" y="38" width="6" height="12" rx="2" fill="var(--success)" transform="rotate(45 75 38)" />

      {/* Giant Success Badge */}
      <circle cx="100" cy="104" r="44" fill="var(--success)" />
      <circle cx="100" cy="104" r="36" fill="var(--surface)" />
      <path
        d="M86 104L96 114L116 94"
        stroke="var(--success)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 6. Child Safety Shield Guarantee Illustration
 */
export function SafetyShieldIllustration({ className = "w-16 h-16", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {/* Shield Body */}
      <path
        d="M50 12L20 25V48C20 68 33 84 50 90C67 84 80 68 80 48V25L50 12Z"
        fill="var(--surface)"
        stroke="var(--success)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Inner checkmark with playful star */}
      <path
        d="M38 50L46 58L64 40"
        stroke="var(--success)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="28" r="3" fill="var(--warning)" />
    </svg>
  );
}

/**
 * 7. 404 Toy Wandered Away Illustration
 */
export function NotFoundIllustration({ className = "w-44 h-44", size }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {/* Background soft orb */}
      <circle cx="100" cy="100" r="76" fill="var(--surface-sun)" opacity="0.8" />

      {/* Playful tilted toy block */}
      <rect
        x="60"
        y="65"
        width="65"
        height="65"
        rx="16"
        fill="var(--surface)"
        stroke="var(--primary)"
        strokeWidth="4"
        transform="rotate(-8 92 97)"
      />
      {/* Block face expression */}
      <circle cx="82" cy="94" r="4" fill="var(--primary)" />
      <circle cx="104" cy="92" r="4" fill="var(--primary)" />
      <path
        d="M88 106C92 110 98 109 101 106"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Floating question bubble */}
      <circle cx="140" cy="65" r="22" fill="var(--surface-elevated)" stroke="var(--warning)" strokeWidth="3" />
      <text
        x="140"
        y="73"
        textAnchor="middle"
        fill="var(--warning)"
        fontSize="24"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        ?
      </text>

      {/* Wandering sparkles */}
      <path
        d="M48 50L50 55L55 57L50 59L48 64L46 59L41 57L46 55L48 50Z"
        fill="var(--accent)"
      />
      <path
        d="M152 140L154 144L158 145L154 147L152 151L150 147L146 145L150 144L152 140Z"
        fill="var(--primary)"
      />
    </svg>
  );
}
