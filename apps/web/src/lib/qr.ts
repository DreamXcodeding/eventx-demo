// สร้าง QR เป็น data URL (client-side, demo) — ภายหลัง backend จะ gen + เซ็นลายเซ็น
import QRCode from "qrcode";

export async function makeQr(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    width: 320,
    margin: 1,
    color: { dark: "#0a2540", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}
