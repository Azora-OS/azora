# Azora Service Mesh (Simulated)

> [!IMPORTANT]
> **SIMULATION NOTICE**
> This service mesh implementation is a **simulation** for development and testing purposes.

## Production Requirements

In a production environment, this service should be replaced or augmented by a real Service Mesh infrastructure such as:
*   **Istio**
*   **Linkerd**
*   **Consul Connect**

## mTLS Implementation

The current implementation simulates mTLS (Mutual TLS) behavior but does **not** enforce cryptographic certificate validation at the network layer.

### Current Behavior (Simulated)
*   Services exchange "identity tokens" in headers.
*   Traffic is routed through a sidecar proxy logic.
*   Encryption is handled at the application layer (simulated).

### Production Enforcement
For production, you must:
1.  Deploy **Cert-Manager** for automated certificate issuance.
2.  Enable **Strict mTLS** in the mesh configuration.
3.  Disable plain-text traffic between services.
