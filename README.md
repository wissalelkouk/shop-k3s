# ShopLite – Full-stack microservices on K3s

```
Browser ─► Traefik Ingress ─┬─ /            frontend (nginx)
                            ├─ /api/users     user-service    ─► PostgreSQL (db users)
                            ├─ /api/products  product-service ─► MongoDB
                            └─ /api/orders    order-service   ─► PostgreSQL (db orders)
                                                  └─ REST calls to user-service & product-service
```

## Run
```bash
curl -sfL https://get.k3s.io | sh -      # install K3s
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
./deploy.sh
```

## Best practices applied
- Dedicated namespace, ConfigMap (config) and Secret (credentials) separated from images
- StatefulSets + PVC (local-path) + headless services for both databases (SQL: PostgreSQL, NoSQL: MongoDB)
- Liveness/readiness probes, resource requests/limits, 2 replicas, RollingUpdate with maxUnavailable 0
- HPA (metrics-server is bundled with K3s)
- Non-root containers, read-only root FS, dropped capabilities, seccomp RuntimeDefault
- NetworkPolicies: default deny, only Traefik→apps, only order→user/product, only services→their DB
- Small alpine images, pinned versions, ClusterIP services, single Ingress entrypoint
