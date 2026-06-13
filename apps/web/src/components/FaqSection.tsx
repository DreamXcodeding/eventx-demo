const FAQS = [
  { q: "ซื้อบัตรอย่างไร?", a: "เลือกอีเวนต์ → เลือกแพ็กบัตรและรอบ → กรอกข้อมูล → ชำระเงินผ่าน PromptPay/บัตร/Alipay/WeChat ระบบจะส่งบัตร QR ไปยังอีเมลทันที" },
  { q: "บัตรอยู่ที่ไหนหลังซื้อ?", a: "บัตร QR จะถูกส่งไปยังอีเมลของคุณ และดูได้ที่เมนู 'ตั๋วของฉัน' ใช้แสดงที่จุดสแกนหน้างานได้เลย" },
  { q: "โอน/เปลี่ยนชื่อผู้เข้างานได้ไหม?", a: "สามารถเปลี่ยนชื่อผู้เข้างานได้ก่อนวันงานตามเงื่อนไขของผู้จัดแต่ละงาน" },
  { q: "ขอคืนเงินได้ไหม?", a: "นโยบายคืนเงินขึ้นกับผู้จัดงานแต่ละงาน โปรดตรวจสอบเงื่อนไขในหน้ารายละเอียดอีเวนต์ก่อนซื้อ" },
  { q: "ชำระเงินช่องทางใดได้บ้าง?", a: "รองรับ PromptPay, บัตรเครดิต/เดบิต, Alipay และ WeChat Pay" },
];

export default function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-[820px] px-6 py-12">
      <div className="mb-6 text-center">
        <h2 className="text-[28px] font-semibold tracking-tight text-ink">คำถามที่พบบ่อย</h2>
        <p className="mt-1 text-[15px] text-slate">เรื่องที่ลูกค้าถามบ่อยเกี่ยวกับการซื้อบัตร</p>
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {FAQS.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink marker:hidden">
              {f.q}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand transition-transform group-open:rotate-45" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-5 text-center text-[14px] text-slate">
        ยังมีคำถาม? <a href="#" className="font-medium text-brand hover:underline">ติดต่อทีมงาน EventX</a>
      </p>
    </section>
  );
}
