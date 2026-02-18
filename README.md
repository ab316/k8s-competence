# Kubernetes Competence Playground

Three-tier monorepo playground for Kubernetes study sessions:
- `Next.js` frontend (`apps/web`)
- `Express + TypeScript` REST API (`apps/api`)
- `Postgres` database (Kubernetes `StatefulSet`)

The app demonstrates this chain:
`Browser -> Next.js route handlers -> Express API -> Postgres`

## 1. Prerequisites
- `nvm`
- Docker
- Minikube
- kubectl

## 2. Node.js setup (nvm)
This project pins Node.js major version in `.nvmrc`.

```bash
nvm install
nvm use
node -v
```

Expected: Node `v24.x.x`.

## 3. pnpm via project-local corepack only
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

## 4. Run apps locally (without Kubernetes)
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

## 5. Start Minikube and enable ingress
```bash
minikube start
minikube addons enable ingress
```

## 6. Quick test with Docker Compose
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

## 7. Build images for Minikube

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

## 8. Manual Kubernetes deployment (bare YAML)
Apply each manifest manually in this order:

```bash
kubectl apply -f infra/k8s/db/service.yaml
kubectl apply -f infra/k8s/db/statefulset.yaml

kubectl apply -f infra/k8s/api/service.yaml
kubectl apply -f infra/k8s/api/deployment.yaml

kubectl apply -f infra/k8s/web/service.yaml
kubectl apply -f infra/k8s/web/deployment.yaml

kubectl apply -f infra/k8s/ingress/ingress.yaml
```

## 9. Verify resources
```bash
kubectl get pods,svc,ingress
```

Wait until all pods are `Running` and ready.

## 10. Access the app (IP-only ingress)
```bash
minikube ip
minikube service -n ingress-nginx ingress-nginx-controller --url
```

Use the ingress controller URL from the command above. If direct ingress access is not reachable in your environment, use port-forward fallback:

```bash
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```

Then open `http://127.0.0.1:8080`.

## 11. Demo flow
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

## 12. Troubleshooting
- Ingress has no address yet:
  - wait 1-2 minutes after enabling addon
  - check: `kubectl -n ingress-nginx get pods`
- `ImagePullBackOff` for web/api:
  - image was not built in Minikube Docker context
  - rerun `minikube docker-env` and rebuild
- API health failing:
  - DB may still be starting
  - check API logs: `kubectl logs deploy/api`
  - check DB logs: `kubectl logs db-0`
