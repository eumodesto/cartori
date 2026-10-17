import * as React from "react";
import { cn } from "@/lib/utils";
import { testimonials, type Testimonial } from "@/lib/testimonials";

export function TestimonialsColumn({
  className,
  testimonials: items,
  duration = 18,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={cn("overflow-hidden", className)}>
      {/* Rolagem contínua em CSS (antes framer-motion); duas cópias = laço sem emenda. */}
      <div
        className="testimonials-marquee flex flex-col gap-4 pb-4"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {items.map((item) => (
              <article
                key={`${copy}-${item.name}`}
                aria-hidden={copy === 1 || undefined}
                className={cn(copy === 1 && "testimonials-copy", "w-full max-w-[13.75rem] rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-[0_12px_32px_rgba(2,31,80,0.35)] backdrop-blur-sm")}
              >
                <p className="text-xs leading-relaxed text-slate-200">{item.text}</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[11px] font-bold text-white"
                  >
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight text-white">
                      {item.name}
                    </p>
                    <p className="text-[11px] leading-tight text-slate-400">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const firstColumn = testimonials.slice(0, 5);
const secondColumn = testimonials.slice(5, 9);

export function Testimonials({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "testimonials-viewport relative flex justify-center gap-3 overflow-hidden py-1 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[420px] sm:max-h-[480px]",
        className
      )}
    >
      <TestimonialsColumn testimonials={firstColumn} duration={22} />
      <TestimonialsColumn
        testimonials={secondColumn}
        className="hidden min-[380px]:block"
        duration={26}
      />
    </div>
  );
}
