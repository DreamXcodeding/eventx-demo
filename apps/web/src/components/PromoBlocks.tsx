const BLOCKS = [
  {
    title: "สำรวจรายการ",
    desc: "ค้นหาอีเวนต์ทุกหมวด ทั่วไทย ในที่เดียว",
    cta: "ดูทั้งหมด",
    href: "#events",
    icon: (
      <path d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    ),
  },
  {
    title: "คว้าดีลที่ดีที่สุด",
    desc: "โปรโมชัน Early Bird และส่วนลดพิเศษทุกสัปดาห์",
    cta: "ดูดีลเด็ด",
    href: "#promo",
    icon: <path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v0a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v0a2 2 0 0 1 0-4ZM12 6v12" />,
  },
  {
    title: "บัตร QR ปลอดภัย",
    desc: "รับบัตรทางอีเมลทันที สแกนเข้างานได้เลย",
    cta: "วิธีใช้บัตร",
    href: "#faq",
    icon: <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4M7 8h2v2H7zM7 14h2v2H7zM15 8h2v2h-2zM14 14h4v4h-4z" />,
  },
];

export default function PromoBlocks() {
  return (
    <section id="promo" className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {BLOCKS.map((b) => (
          <a key={b.title} href={b.href} className="group rounded-xl border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-e2">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{b.icon}</svg>
            </div>
            <h3 className="text-lg font-semibold text-ink">{b.title}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-slate">{b.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors group-hover:text-brand-hover">
              {b.cta} →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
