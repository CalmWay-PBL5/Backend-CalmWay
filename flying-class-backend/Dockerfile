FROM node:22-alpine AS base
WORKDIR /app
RUN chown -R node:node /app

FROM base AS deps
COPY package*.json ./
# [SỬA LỖI 1]: Copy thư mục prisma vào TRƯỚC khi cài đặt thư viện
COPY prisma ./prisma 
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY package*.json ./
# [SỬA LỖI 2]: Tương tự, đưa thư mục prisma vào TRƯỚC khi cài bản production
COPY prisma ./prisma 
RUN npm ci --omit=dev && chown -R node:node /app

COPY --from=builder /app/dist ./dist
# (Đã bỏ dòng COPY --from=builder /app/prisma ./prisma cũ ở đây đi vì đã copy ở trên)

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER node
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]