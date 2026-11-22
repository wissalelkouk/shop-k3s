#!/usr/bin/env bash
set -euo pipefail
for s in user-service product-service order-service frontend; do
  d=services/${s%-service}; [ $s = frontend ] && d=frontend
  docker build -t shop/$s:1.0.0 $d
  docker save shop/$s:1.0.0 | sudo k3s ctr images import -   # load into K3s containerd
done
kubectl apply -k k8s/
kubectl -n shop rollout status deploy/user-service deploy/product-service deploy/order-service deploy/frontend
echo "App: http://<NODE_IP>/"
