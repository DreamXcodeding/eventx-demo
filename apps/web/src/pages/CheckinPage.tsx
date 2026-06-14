import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import jsQR from "jsqr";
import { useTicketsStore, type CheckInResult, type MyTicket } from "../stores/ticketsStore";
import CnxFooter from "../components/CnxFooter";
import { api } from "../lib/api";
import { USE_MOCK } from "../lib/http";

function parseTicketNo(text: string): string {
  try {
    const o = JSON.parse(text);
    return (o.ticketNo || o.ticket || "").toString().trim();
  } catch {
    return text.trim();
  }
}

type Scan = { result: CheckInResult; ticketNo: string; at: number };

export default function CheckinPage() {
  const { t } = useTranslation();
  const tickets = useTicketsStore((s) => s.tickets);
  const checkIn = useTicketsStore((s) => s.checkIn);

  const [manual, setManual] = useState("");
  const [last, setLast] = useState<Scan | null>(null);
  const [log, setLog] = useState<Scan[]>([]);
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [apiCheckedIn, setApiCheckedIn] = useState(0); // นับเช็คอินสำเร็จ (real mode)

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cooldown = useRef(0);

  // real mode: สร้าง ticket ย่อจาก response (banner ใช้แค่ eventTitle/ticketName/ticketNo)
  const partialTicket = (ticketNo: string, eventTitle?: string, ticketName?: string): MyTicket => ({
    id: ticketNo, ticketNo, orderNo: "", eventTitle: eventTitle ?? "", eventImage: undefined,
    ticketName: ticketName ?? "", sessionLabel: undefined, qr: "", status: "CHECKED_IN", purchasedAt: 0,
  });

  const doCheckIn = async (raw: string) => {
    const ticketNo = parseTicketNo(raw);
    if (!ticketNo) return;
    let result: CheckInResult;
    if (USE_MOCK) {
      result = checkIn(ticketNo);
    } else {
      try {
        const r = await api.checkin.scan(ticketNo);
        if (r.ok) { result = { ok: true, ticket: partialTicket(r.ticketNo, r.eventTitle, r.ticketName) }; setApiCheckedIn((n) => n + 1); }
        else result = { ok: false, reason: r.reason, ticket: r.eventTitle ? partialTicket(r.ticketNo, r.eventTitle, r.ticketName) : undefined };
      } catch {
        result = { ok: false, reason: "NOT_FOUND" };
      }
    }
    const scan = { result, ticketNo, at: Date.now() };
    setLast(scan);
    setLog((l) => [scan, ...l].slice(0, 8));
    setManual("");
  };

  // กล้องสแกน QR
  useEffect(() => {
    if (!camOn) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height);
        if (code && Date.now() > cooldown.current) {
          cooldown.current = Date.now() + 2500; // กันสแกนรัวซ้ำ
          doCheckIn(code.data);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        video.srcObject = s;
        video.play();
        raf = requestAnimationFrame(tick);
      })
      .catch(() => setCamErr(t("checkin.camErr")));

    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkedInCount = USE_MOCK ? tickets.filter((t) => t.status === "CHECKED_IN").length : apiCheckedIn;

  const banner = (() => {
    if (!last) return null;
    if (last.result.ok)
      return { cls: "bg-success/10 border-success/30 text-success", icon: "✓", title: t("checkin.successTitle"), tk: last.result.ticket };
    if (last.result.reason === "ALREADY_USED")
      return { cls: "bg-warning/10 border-warning/40 text-[#8a6500]", icon: "!", title: t("checkin.usedTitle"), tk: last.result.ticket };
    return { cls: "bg-error/10 border-error/30 text-error", icon: "✕", title: t("checkin.notFound"), tk: undefined as never };
  })();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-navy-hero">
        <div className="mx-auto flex h-16 max-w-[820px] items-center gap-3 px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">EventX</Link>
          <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white">{t("checkin.portal")}</span>
          <span className="ml-auto text-[13px] text-white/80">{t("checkin.checkedIn")} {checkedInCount} {t("checkin.unit")}</span>
        </div>
      </header>

      <main className="mx-auto max-w-[560px] px-6 py-8">
        {/* ผลล่าสุด */}
        {banner && (
          <div className={`mb-5 flex items-center gap-4 rounded-xl border p-4 ${banner.cls}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold">{banner.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold">{banner.title}</p>
              {banner.tk ? (
                <p className="truncate text-[13px] opacity-90">{banner.tk.eventTitle} · {banner.tk.ticketName} · {banner.tk.ticketNo}</p>
              ) : (
                <p className="font-mono text-[12px] opacity-80">{last?.ticketNo}</p>
              )}
            </div>
          </div>
        )}

        {/* กล้อง */}
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          {camOn ? (
            <div className="relative bg-navy">
              <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-44 w-44 rounded-xl border-2 border-white/80" />
              </div>
              {camErr && <p className="absolute inset-x-0 bottom-3 text-center text-[12px] text-white/90">{camErr}</p>}
            </div>
          ) : (
            <button onClick={() => { setCamErr(""); setCamOn(true); }} className="flex w-full flex-col items-center gap-2 py-12 text-slate transition-colors hover:bg-surface">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" /></svg>
              <span className="text-sm font-medium text-ink">{t("checkin.openCam")}</span>
            </button>
          )}
        </div>

        {/* กรอกเลขบัตร / วาง QR */}
        <form onSubmit={(e) => { e.preventDefault(); doCheckIn(manual); }} className="mt-4">
          <label htmlFor="tn" className="mb-1 block text-[13px] font-medium text-ink">{t("checkin.orEnter")}</label>
          <div className="flex gap-2">
            <input id="tn" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="EVX-2026-xxxxxx-01" className="h-11 flex-1 rounded-md border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10" />
            <button type="submit" disabled={!manual.trim()} className="rounded-md bg-brand px-5 text-sm font-medium text-white transition-all hover:bg-brand-hover active:scale-95 disabled:opacity-50">{t("checkin.check")}</button>
          </div>
        </form>

        {/* ประวัติล่าสุด */}
        {log.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-2 text-[13px] font-medium text-slate">{t("checkin.recent")}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              {log.map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <span className="truncate font-mono text-slate">{s.ticketNo}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.result.ok ? "bg-success/10 text-success" : s.result.reason === "ALREADY_USED" ? "bg-warning/15 text-[#8a6500]" : "bg-error/10 text-error"}`}>
                    {s.result.ok ? t("checkin.pass") : s.result.reason === "ALREADY_USED" ? t("checkin.used") : t("checkin.missing")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <CnxFooter />
    </div>
  );
}
