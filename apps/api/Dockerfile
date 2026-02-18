FROM node:24-alpine

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN pnpm install --filter @kc/api... --frozen-lockfile=false

COPY apps/api apps/api
COPY packages/shared-types packages/shared-types

RUN pnpm --filter @kc/api build

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
