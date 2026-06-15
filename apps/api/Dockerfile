# EventX API — Bun + Hono · image สำหรับ deploy cloud (Fly.io / Railway)
FROM oven/bun:1.3-alpine
WORKDIR /app

# ติดตั้ง deps (ใช้ lockfile เพื่อ reproducible)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# โค้ด + migrations
COPY . .

ENV PORT=3000
EXPOSE 3000

# รัน migration (idempotent) แล้วเริ่ม server — seed รันครั้งเดียวแยก (ดู DEPLOY.md)
CMD ["sh", "-c", "bun run src/migrate.ts && bun run src/index.ts"]
