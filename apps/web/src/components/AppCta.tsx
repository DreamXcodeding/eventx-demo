// แถบชวนโหลดแอป (แนว EventPass)
export default function AppCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="overflow-hidden rounded-2xl bg-navy-hero">
        <div className="flex flex-col items-center gap-6 px-8 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">ดาวน์โหลดแอป EventX</h2>
            <p className="mt-2 max-w-md text-[15px] text-white/70">จองบัตร เก็บตั๋ว QR และสแกนเข้างาน ครบในแอปเดียว</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { sub: "ดาวน์โหลดบน", store: "App Store" },
              { sub: "ดาวน์โหลดบน", store: "Google Play" },
            ].map((s) => (
              <a key={s.store} href="#" className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 transition-colors hover:bg-white/10">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2h-4Z" /></svg>
                <span className="text-left">
                  <span className="block text-[10px] leading-tight text-white/60">{s.sub}</span>
                  <span className="block text-sm font-semibold leading-tight text-white">{s.store}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
