import Link from "next/link";

/** Coy's lowercase wordmark with the pink dot. */
export function Wordmark() {
  return (
    <Link href="/home" aria-label="coy home" className="inline-flex items-baseline gap-[2px] text-[1.75rem] leading-none font-extrabold tracking-[-0.04em] text-ink">
      coy
      <span className="inline-block size-[9px] rounded-full bg-pink" aria-hidden />
    </Link>
  );
}
