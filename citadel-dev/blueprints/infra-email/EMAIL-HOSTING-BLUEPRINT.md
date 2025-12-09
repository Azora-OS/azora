# Azora Email & Domain Blueprint v0.1

## 0. Scope

This document defines how **azora.world** and related subdomains are used for products and email, and captures a pragmatic near-term email hosting strategy (no Google Workspace), with room to evolve into an Azora-native mail/notification layer.

This is **architecture only** – no DNS or provider changes are assumed yet.

---

## 1. Domains & Subdomains

### 1.1 Primary domains

- **Root**: `azora.world` – main brand and marketing surface.
- **Registrar/DNS**: `domain.co.za` (current).

### 1.2 Product subdomains (Google-style)

Patterns (examples, not exhaustive):

- `sapiens.azora.world` – Azora Sapiens (AI university/school).
- `citadel.azora.world` – Citadel & Virtual Citadel / CSI.
- `library.azora.world` – Azora Library.
- `marketplace.azora.world` – JobSpaces & Forge.
- `studio.azora.world` – AzStudio / orchestration surfaces.

Paths under these subdomains (instead of more subdomains) for product areas:

- `citadel.azora.world/buildspaces` – BuildSpaces.
- `citadel.azora.world/csi` – Citadel State Intelligence console.
- `sapiens.azora.world/classroom` – classroom UI.

---

## 2. Email Addressing Scheme

All official mail uses `@azora.world` as root.

### 2.1 Founders

- Pattern: `name.lastname@azora.world`
- Example: `thabo.nxumalo@azora.world`

### 2.2 Students

Use **student number / ID** + suffixes:

- **University students**:
  - Pattern: `studentId.ac@azora.world`
  - Example: `u2025-001.ac@azora.world`
- **School students**:
  - Pattern: `studentId.edu@azora.world`
  - Example: `hs2027-034.edu@azora.world`

(Short name for student identifier in docs: `stn`.)

### 2.3 Employees

- Pattern: `lastname.role@azora.world`, where `role` is 2–3 letters.
- Examples:
  - `dlamini.hr@azora.world`
  - `khan.dev@azora.world`
  - `smith.pm@azora.world`
  - `molefe.sls@azora.world` (sales → `sls`).

Roles remain a controlled vocabulary (HR, DEV, PM, SLS, MKT, OPS, FIN, etc.).

### 2.4 Shared addresses

Core shared addresses to provision first when going public:

- `hello@azora.world` – general enquiries.
- `support@azora.world` – product support (e.g. BuildSpaces launch).
- `billing@azora.world` or `finance@azora.world` – payments and finance.

### 2.5 Normal users

- Normal Azora users **do not receive full inboxes** by default.
- They use internal identities inside Sapiens, Library, Marketplace, etc.

---

## 3. Near-Term Hosting Strategy (Pre-Launch)

Constraints:

- Google Workspace is not an option (cost).
- No real inbound volume yet; this is about **being ready** for launch (e.g., BuildSpaces on the 8th).

### 3.1 Minimal viable setup

- **Goal**: keep `@azora.world` addresses alive and usable, without a full corporate mail stack.
- Approach (to be implemented closer to launch):
  - Use **DNS-level forwarding or a simple provider** so that:
    - Founder and shared addresses forward into 1–3 real inboxes (e.g. personal Gmail/Outlook or a small paid mailbox).
  - Configure "Send as" identity in those inboxes to send mail **from** `@azora.world`.

Implementation options (to be chosen later):

1. **domain.co.za forwarding** (if available):
   - MX → domain.co.za mail servers.
   - Define aliases:
     - `name.lastname@azora.world` → founder inbox.
     - `support@azora.world` → shared support inbox.
   - Use recipient provider SMTP for outbound "send as".

2. **Cloudflare Email Routing** (if DNS is moved to Cloudflare):
   - MX → Cloudflare.
   - Routing rules for founders and shared addresses → target inboxes.

3. **Low-cost mailbox provider or Microsoft trial**:
   - MX → provider.
   - Create a small number of full mailboxes for founders + shared addresses.
   - Still keep students/employees as aliases or internal-only identities initially.

No final choice is made here; decision deferred until closer to public launch.

---

## 4. Long-Term Direction – Azora Mail & Notifications

Longer term, Azora should own:

- **Notification & mail orchestration service**:
  - Outbound: `no-reply@azora.world`, `alerts@azora.world`, domain-specific senders.
  - Inbound hooks for support threads, reply-by-email, ticketing.
  - Integration with observability (delivery metrics, bounce rates).

- **Identity & Addressing integration**:
  - Student and employee addresses generated from Sapiens/HR systems.
  - Strong alignment with Identity & Access domain (SSO, RBAC/ABAC).

- **Separation of concerns**:
  - Human mailboxes remain on a stable provider (or self-hosted if justified).
  - Azora services use a dedicated **Notification/Mail service** with clear APIs.

---

## 5. Tasks & Next Steps (Pointers)

High-level tasks (to be elaborated in infra/identity tasklists):

- Define canonical **role codes** for employee addresses.
- Decide on **initial hosting option** (forwarding vs low-cost provider vs Microsoft trial) before first public launches.
- Implement minimal MX + alias configuration and "send as" for founders and support.
- Add **email identity rules** to Identity & Access blueprint and student lifecycle flows in Sapiens.

This blueprint is sufficient to keep email architecture aligned with Azora principles until concrete DNS/provider work is scheduled closer to launch.
