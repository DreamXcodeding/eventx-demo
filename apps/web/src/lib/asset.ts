// แปลง path รูปใน public/ ให้รองรับ base path ของ deploy (เช่น GitHub Pages /<repo>/)
// dev/base "/" → คืน path เดิม · base "/eventx-demo/" → เติม prefix ให้
const BASE = import.meta.env.BASE_URL; // ลงท้ายด้วย "/" เสมอ
export const asset = (p: string) => BASE + p.replace(/^\//, "");
