# Azora OS Project Overview

This document provides a comprehensive overview of the Azora OS project, its applications, and how to run them.

## Applications

### 1. Azora Academy UI (`azora-academy-ui`)

- **Location:** `c:\azora-os\synapse\academy-ui`
- **Purpose:** The user interface for Azora Academy, the world's first "Living University." It provides a platform for students to learn with a personal AI faculty, prove their skills, and earn while they learn.
- **Technologies:** Next.js, React, Prisma, Radix UI, Tailwind CSS.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\academy-ui
  npm run dev
  ```

### 2. Atlas UI (`atlas-ui`)

- **Location:** `c:\azora-os\synapse\atlas-ui`
- **Purpose:** A dashboard or administrative interface. The purpose is inferred from the file structure, which includes components like `app-sidebar`, `header`, and `team-switcher`.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\atlas-ui
  npm run dev
  ```

### 3. Council UI (`council-ui`)

- **Location:** `c:\azora-os\synapse\council-ui`
- **Purpose:** A user interface for governance or decision-making, likely for a council or a similar body. The purpose is inferred from the name.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\council-ui
  npm run dev
  ```

### 4. Azora Main App (`azora-main-app`)

- **Location:** `c:\azora-os\synapse\main-app`
- **Purpose:** The central application of the Azora OS. The purpose is inferred from the name.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\main-app
  npm run dev
  ```

### 5. Pulse UI (`pulse-ui`)

- **Location:** `c:\azora-os\synapse\pulse-ui`
- **Purpose:** A user interface for monitoring or real-time data visualization. The purpose is inferred from the name.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\pulse-ui
  npm run dev
  ```

### 6. Azora Signal UI (`azora-signal-ui`)

- **Location:** `c:\azora-os\synapse\signal-ui`
- **Purpose:** A user interface for messaging or notifications. The purpose is inferred from the name.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\synapse\signal-ui
  npm run dev
  ```

### 7. Azora UI (`azora-ui`)

- **Location:** `c:\azora-os\azora-ui`
- **Purpose:** A shared UI component library for the Azora OS. It contains a large number of React components that are used across the various applications. The `READMe.md` file in this directory provides a detailed description of the user interface for the entire Azora Sapiens University.
- **Technologies:** Next.js, React, Radix UI, Tailwind CSS.
- **How to run:** This is a component library and not a standalone application, so it does not have a `run` command.

### 8. Azora UI Portal (`azora-ui-portal`)

- **Location:** `c:\azora-os\cloud-ui`
- **Purpose:** A UI portal for Azora OS, managing cloud services, subscriptions, and dashboards. The purpose is inferred from the directory structure, which includes pages like Dashboard, Onboarding, and Subscription.
- **Technologies:** React, Vite, Radix UI, Tailwind CSS, React Router, Recharts, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\cloud-ui
  npm run dev
  ```

### 9. Azora UI Portal (Dev UI) (`azora-ui-portal`)

- **Location:** `c:\azora-os\dev-ui`
- **Purpose:** The Azora OS Development Portal, a unified services management dashboard for monitoring and managing AI-powered services, compliance, system health, and service configuration. It follows a similar structure to cloud-ui but includes detailed development plans in DEV-UI-PLAN.md and STRUCTURE-AND-UI-PLAN.md.
- **Technologies:** React, Vite, Radix UI, Tailwind CSS, React Router, Recharts, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\dev-ui
  npm run dev
  ```

### 10. Azora UI Portal (Learn UI) (`azora-ui-portal`)

- **Location:** `c:\azora-os\learn-ui`
- **Purpose:** A UI portal for Azora OS, likely focused on learning or educational services, with a structure similar to cloud-ui and dev-ui, including dashboards, onboarding, and subscription management.
- **Technologies:** React, Vite, Radix UI, Tailwind CSS, React Router, Recharts, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\learn-ui
  npm run dev
  ```

### 11. Azora UI Portal (Pay UI) (`azora-ui-portal`)

- **Location:** `c:\azora-os\pay-ui`
- **Purpose:** A UI portal for Azora OS, focused on payment processing, subscriptions, and financial services management, with a structure similar to other UI portals including dashboards and onboarding.
- **Technologies:** React, Vite, Radix UI, Tailwind CSS, React Router, Recharts, Framer Motion.
- **How to run:**
  ```bash
  cd c:\azora-os\pay-ui
  npm run dev
  ```