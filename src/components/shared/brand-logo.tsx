import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Unique gradient id base — pass when rendering multiple instances on one page. */
  gradientId?: string;
}

export function BrandLogo({
  className,
  gradientId = "bidmart-brand-gradient",
}: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="372.69 286.64 334.63 334.64"
      width={54}
      height={54}
      aria-hidden
      className={cn(className)}
    >
      <path
        d="M645.81,621.28H434.2c-33.97,0-61.51-27.54-61.51-61.51V348.15c0-33.97,27.54-61.51,61.51-61.51h211.61c33.97,0,61.51,27.54,61.51,61.51v211.61C707.32,593.74,679.78,621.28,645.81,621.28z"
        fill={`url(#${gradientId})`}
      />

      <polygon
        points="621.55,386.97 670.93,345.08 635.76,518.65 435.26,521.64 409.08,374.26"
        fill="#080D33"
      />
      <circle cx="499.6" cy="553.06" r="24.69" fill="#080D33" />
      <circle cx="577.41" cy="553.06" r="24.69" fill="#080D33" />
      <path
        d="M581.55,441.56c4.88,2.82,4.88,9.86,0,12.68l-35.48,20.49l-35.48,20.49c-4.88,2.82-10.98-0.7-10.98-6.34V447.9v-40.97c0-5.64,6.1-9.16,10.98-6.34l35.48,20.49L581.55,441.56z"
        fill="#FFFFFF"
      />

      <defs>
        <linearGradient
          id={gradientId}
          x1="850.7701"
          y1="273.9407"
          x2="402.3651"
          y2="533.6876"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.3979" stopColor="#4378E2" />
          <stop offset="0.9168" stopColor="#6A23FD" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface BrandWordmarkProps {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  gradientId?: string;
}

export function BrandWordmark({
  className,
  logoClassName,
  textClassName,
  gradientId,
}: BrandWordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandLogo
        className={cn("h-8 w-8 shrink-0", logoClassName)}
        gradientId={gradientId}
      />
      <BrandWordmarkText className={textClassName} />
    </span>
  );
}

interface BrandWordmarkTextProps {
  className?: string;
}

/** Vector "BidMart" wordmark (spec letterforms). Inherits color via currentColor. */
export function BrandWordmarkText({ className }: BrandWordmarkTextProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="341.12 653.8 402.47 74.95"
      role="img"
      aria-label="BidMart"
      fill="currentColor"
      className={cn("h-5 w-auto shrink-0 text-foreground", className)}
    >
      <path d="M341.12,657.5h35.46c17.18,0,24.76,8.52,24.76,18.53c0,7.6-3.99,13.03-9.7,15.38c5.34,1.9,11.67,6.9,11.67,16.11c0,11.68-8.72,21.23-26.5,21.23h-35.69V657.5z M373.04,684.97c5.75,0,8.07-2.96,8.07-6.82c0-4.42-3.21-6.59-8.23-6.59h-11.5v13.41H373.04z M361.39,714.72h10.67c6.86,0,9.78-2.98,9.78-8.08c0-4.48-2.76-7.64-9.4-7.64h-11.06V714.72z" />
      <path d="M412.11,653.8h20.17v14.06h-20.17V653.8z M412.11,674.51h20.17v54.23h-20.17V674.51z" />
      <path d="M498.15,653.8v58.55c0,5.44-0.04,11.72,0.1,16.4h-19.52c-0.31-1.58-0.58-3.85-0.69-5.17c-2.7,3.97-6.96,6.49-14.75,6.49c-14.24,0-21.92-12.21-21.92-28.09c0-16.52,8.88-28.77,24.12-28.77c6.4,0,10.97,1.97,12.48,4.5v-23.9H498.15z M462.04,701.48c0,9.5,2.79,14.4,8.44,14.4c7.62,0,8.3-6.93,8.3-14.34c0-9.1-0.82-14.33-8.06-14.33C465.05,687.23,462.04,691.82,462.04,701.48z" />
      <path d="M570.6,705.5c0-11.13,0.24-25.48,0.55-33.94h-0.55c-2.98,15.28-7.77,36.44-12.98,57.19H540.9c-4.09-20.12-8.77-41.33-11.55-57.18h-0.63c0.58,8.38,0.97,22.29,0.97,34.5v22.69h-18.59V657.5h30.05c3.51,14.42,7.62,35.32,9.22,45.85h0.36c1.83-11.46,6.58-30.36,10.73-45.85h29.2v71.25H570.6V705.5z" />
      <path d="M652.29,712.66c0,6.12,0.3,14.26,0.65,16.09h-18.61c-0.41-1.11-0.76-3.68-0.83-5.01c-2.58,3.37-6.57,6.32-15.3,6.32c-12.16,0-18.74-7.64-18.74-17.29c0-12.75,10.22-18.26,26.78-18.26c1.8,0,4.93,0,6.66,0v-3c0-3.48-1.24-6.02-6.1-6.02c-4.56,0-5.76,2.09-6.24,5.59h-18.62c0.72-9.05,6.09-17.95,25.37-17.88c17.78,0.07,24.98,6.92,24.98,20V712.66z M632.9,704.68c-1.03,0-2.89,0-4.47,0c-6.95,0-9.24,2.44-9.24,6.44c0,3.19,1.89,5.75,5.9,5.75c6.84,0,7.8-4.69,7.8-10.51V704.68z" />
      <path d="M663.93,690.08c0-5.19-0.04-10.74-0.14-15.57h19.72c0.24,1.68,0.49,6.43,0.49,8.81c2.09-5.21,7.35-10.05,16.67-10.13v18.44c-11.41-0.49-16.56,2.12-16.56,14.83v22.28h-20.17V690.08z" />
      <path d="M706.3,674.51h7.82v-14.06h19.95v14.06h9.52v13.6h-9.52v23.27c0,3.36,1.06,4.63,5.3,4.63c0.76,0,1.74,0,2.81-0.1v12.46c-3.14,1.03-8.4,1.25-11.76,1.25c-12.82,0-16.42-6.26-16.42-16.5v-25h-7.71V674.51z" />
    </svg>
  );
}
