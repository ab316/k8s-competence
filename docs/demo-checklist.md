# Demo Checklist

## 1. Deploy stack manually
1. Apply DB service and statefulset.
2. Apply API service and deployment.
3. Apply Web service and deployment.
4. Apply ingress.

## 2. Validate workloads
1. `kubectl get pods,svc,ingress`
2. Confirm all pods are `Running` and readiness probes are passing.

## 3. Validate end-to-end data flow
1. Open the app.
2. Create a note.
3. Confirm note appears in the list.
4. Refresh the browser and confirm note persists.

## 4. Validate resilience
1. Delete one API pod.
2. Confirm API deployment recreates it and app remains functional.

## 5. Validate service round-robin
1. Scale API to 3 replicas: `kubectl scale deployment api --replicas=3`
2. Use the "Run 10 Calls" button.
3. Confirm responses show different pod names.

## 6. Validate stateful persistence
1. Delete db pod: `kubectl delete pod db-0`
2. Wait for restart.
3. Confirm previously created notes still exist.
