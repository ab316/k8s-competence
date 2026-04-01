# Kubernetes Competence Playground

Three-tier monorepo playground for Kubernetes study sessions:
- `Next.js` frontend (`apps/web`)
- `Express + TypeScript` REST API (`apps/api`)
- `Postgres` database (Kubernetes `StatefulSet`)

The app demonstrates this chain:
`Browser -> Next.js route handlers -> Express API -> Postgres`

## 1. Prerequisites
- Docker
- Minikube
- kubectl

## 2. Start Minikube

```bash
minikube start
```

## 3. Build images for Minikube

### Linux/macOS
```bash
eval "$(minikube -p minikube docker-env)"
docker build -f apps/api/Dockerfile -t kc-api:local .
docker build -f apps/web/Dockerfile -t kc-web:local .
```

### Windows PowerShell
```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -f apps/api/Dockerfile -t kc-api:local .
docker build -f apps/web/Dockerfile -t kc-web:local .
```

## 4. Manual Kubernetes deployment (bare YAML)
Apply each manifest manually in this order:

```bash
kubectl apply -f infra/k8s/ingress-nginx/install.yaml
kubectl -n ingress-nginx rollout status deployment/ingress-nginx-controller

kubectl apply -f infra/k8s/db/service.yaml
kubectl apply -f infra/k8s/db/statefulset.yaml

kubectl apply -f infra/k8s/api/service.yaml
kubectl apply -f infra/k8s/api/deployment.yaml

kubectl apply -f infra/k8s/web/service.yaml
kubectl apply -f infra/k8s/web/deployment.yaml

kubectl apply -f infra/k8s/ingress/ingress.yaml
```

## 5. Verify resources
```bash
kubectl get pods,svc,ingress
```

Wait until all pods are `Running` and ready.

## 6. Access the app

```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

Then open `http://127.0.0.1:8080`.

## 7. Demo flow
1. Open app and verify status panel reports Next.js + API + DB.
2. Create one or more notes.
3. Refresh browser and verify notes persist.
4. Delete one API pod and verify service recovers.
5. Scale API to 3 and run round-robin demo.

```bash
kubectl scale deployment api --replicas=3
```

6. Delete DB pod and verify notes still exist.

```bash
kubectl delete pod db-0
```

## 8. Troubleshooting
- Bundled ingress controller not ready:
  - check: `kubectl -n ingress-nginx get pods`
  - check: `kubectl -n ingress-nginx logs deploy/ingress-nginx-controller`
- `ImagePullBackOff` for web/api:
  - image was not built in Minikube Docker context
  - rerun `minikube docker-env` and rebuild
- API health failing:
  - DB may still be starting
  - check API logs: `kubectl logs deploy/api`
  - check DB logs: `kubectl logs db-0`

---

## Optional: Run apps locally (without Kubernetes)

### A. Node.js setup (nvm)
This project pins Node.js major version in `.nvmrc`.

```bash
nvm install
nvm use
node -v
```

Expected: Node `v24.x.x`.

### B. pnpm via project-local corepack only
Do not enable corepack globally. Enable it in a local folder inside this repository:

```bash
corepack enable --install-directory ./.corepack/bin
export PATH="$PWD/.corepack/bin:$PATH"
corepack pnpm --version
```

Then install dependencies:

```bash
pnpm install
```

You can also run commands as `corepack pnpm <command>` if you do not want to modify `PATH`.

### C. pnpm dev servers

Terminal 1:

```bash
pnpm --filter @kc/api dev
```

Terminal 2:

```bash
API_BASE_URL=http://localhost:4000 pnpm --filter @kc/web dev
```

By default, API expects Postgres at:
- host: `db`
- port: `5432`
- db/user/password: `study`

For local non-k8s testing, override env vars for API as needed.

### D. Docker Compose
Start the full stack locally (web + api + db):

```bash
docker compose up --build
```

Open `http://localhost:3000`.

Stop and remove containers:

```bash
docker compose down
```

Reset database volume as well:

```bash
docker compose down -v
```
