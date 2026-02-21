# Kubernetes Development Setup

This directory contains Kubernetes manifests for running Zigflow locally with Minikube and Skaffold, connected to Temporal Cloud.

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Skaffold](https://skaffold.dev/docs/install/) v2.10.0 or later
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Temporal Cloud](https://temporal.io/cloud) account with namespace and mTLS certificates

## Setup

### 1. Configure Temporal Cloud Secrets

Copy the example secret file and fill in your Temporal Cloud credentials:

```bash
cp temporal-cloud-secret.example.yaml temporal-cloud-secret.yaml
```

Edit `temporal-cloud-secret.yaml` with your Temporal Cloud information:
- **address**: Your Temporal Cloud endpoint (e.g., `my-namespace.tmprl.cloud:7233`)
- **namespace**: Your Temporal Cloud namespace
- **client.pem**: Base64-encoded client certificate
- **client.key**: Base64-encoded client key

To base64 encode your certificates:
```bash
cat client.pem | base64 -w 0
cat client.key | base64 -w 0
```

### 2. Start Minikube

```bash
make minikube
# or
minikube start
```

### 3. Create Secrets

```bash
kubectl apply -f dev/k8s/temporal-cloud-secret.yaml
```

### 4. Deploy with Skaffold

**Production build (default):**
```bash
skaffold run
```

This builds the production image and deploys all resources.

**Development mode with live reload:**
```bash
skaffold dev --profile=dev
```

This uses the `builder` stage with Air for hot reloading and automatically syncs Go file changes.

## What's Deployed

1. **Namespace**: `zigflow` - Isolated namespace for all resources
2. **Zigflow**: The main application worker connected to Temporal Cloud

## Configuration

### Workflow Configuration

The workflow is mounted from a ConfigMap. Edit [deployment.yaml](deployment.yaml) and update the `zigflow-workflow` ConfigMap to change the workflow definition.

### Environment Variables

The Zigflow deployment uses these environment variables:
- `TEMPORAL_ADDRESS`: Temporal Cloud endpoint (from secret)
- `TEMPORAL_NAMESPACE`: Temporal Cloud namespace (from secret)
- `TEMPORAL_TLS_CERT`: Path to client certificate
- `TEMPORAL_TLS_KEY`: Path to client key
- `DISABLE_TELEMETRY`: Disable telemetry (default: `false`)
- `WORKFLOW_FILE`: Path to workflow definition (default: `/workflow.yaml`)

## Profiles

### Default Profile (Production)

Uses the final stage of the Dockerfile for production builds:

```bash
skaffold run
```

### Dev Profile (Development)

Uses the builder stage with Air for hot reloading:

```bash
skaffold dev --profile=dev
```

## Port Forwarding

To access the Zigflow health endpoint:
```bash
kubectl port-forward -n zigflow svc/zigflow 3000:3000
```

Then visit http://localhost:3000/health

## Cleanup

Stop Skaffold (Ctrl+C if running in dev mode) and clean up resources:

```bash
skaffold delete
```

Or manually delete the namespace:
```bash
kubectl delete namespace zigflow
```

## Troubleshooting

### Check pod status
```bash
kubectl get pods -n zigflow
```

### View logs
```bash
kubectl logs -n zigflow -l app=zigflow -f
```

### Describe resources
```bash
kubectl describe deployment zigflow -n zigflow
```

### Check secrets
```bash
kubectl get secrets -n zigflow
kubectl describe secret temporal-cloud -n zigflow
kubectl describe secret temporal-cloud-tls -n zigflow
```

### Restart deployment
```bash
kubectl rollout restart deployment/zigflow -n zigflow
```

### Common Issues

**Connection refused to Temporal Cloud:**
- Verify your Temporal Cloud endpoint is correct
- Ensure your mTLS certificates are valid and not expired
- Check that certificates are properly base64 encoded

**Pod fails to start:**
- Check logs with `kubectl logs`
- Verify secrets are created: `kubectl get secrets -n zigflow`
- Ensure namespace is created first

## Development Tips

- Use `skaffold dev --profile=dev` for the best development experience with automatic rebuilds and log streaming
- The dev profile uses the `builder` stage which includes Air for hot reloading
- Go file changes are automatically synced to the container
- Keep `temporal-cloud-secret.yaml` in `.gitignore` to avoid committing credentials
