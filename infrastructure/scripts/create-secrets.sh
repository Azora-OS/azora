#!/bin/bash
# Create Kubernetes Secrets
set -e

NAMESPACE=${1:-azora-staging}

echo "🔐 Creating secrets for $NAMESPACE..."

# Read secrets from environment or prompt
read -sp "PostgreSQL Password: " POSTGRES_PASSWORD
echo
read -sp "JWT Secret: " JWT_SECRET
echo
read -sp "Stripe API Key: " STRIPE_KEY
echo
read -sp "OpenAI API Key: " OPENAI_KEY
echo

# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=$POSTGRES_PASSWORD \
  -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic jwt-secret \
  --from-literal=secret=$JWT_SECRET \
  --from-literal=refresh-secret=$(openssl rand -base64 32) \
  -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic stripe-secret \
  --from-literal=api-key=$STRIPE_KEY \
  -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic openai-secret \
  --from-literal=api-key=$OPENAI_KEY \
  -n $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secrets created successfully!"
