// สร้าง QR เป็น data URL ฝั่ง server (เก็บลง tickets.qr → frontend แสดงเป็นรูปได้เลย)
import QRCode from "qrcode";

export const makeQr = (payload: string): Promise<string> =>
  QRCode.toDataURL(payload, { margin: 1, width: 240, errorCorrectionLevel: "M" });
