FROM guergeiro/pnpm:16 as production
WORKDIR /usr/src/app
COPY . .
RUN pnpm install --production

FROM gcr.io/distroless/nodejs:16
WORKDIR /usr/src/app
COPY --from=production /usr/src/app .

CMD ["dist/main.js"]
