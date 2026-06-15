// สร้าง QR เป็น data URL (SVG) — pure JS รันได้บน Cloudflare Workers (ไม่พึ่ง Buffer/zlib แบบ PNG)
// frontend แสดงด้วย <img src> ได้ตรง ๆ
import QRCode from "qrcode";

export const makeQr = async (payload: string): Promise<string> => {
  const svg = await QRCode.toString(payload, { type: "svg", margin: 1, width: 240, errorCorrectionLevel: "M" });
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
