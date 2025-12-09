# C4 - Azora Sapiens (AI University & Curriculum)

## System View
- Purpose: Provide AI-powered education: adaptive curriculum, tutoring, assessments, credentialing, research tools.

## Containers
- `services/azora-sapiens/` — Core service: contains learning engines, tutoring engine, search & knowledge connectors.
- `apps/azora-classroom/` — UI for students/educators.
- `apps/azora-sapiens/` — public site for learners.
- Assessment Engine: `services/azora-sapiens/src/engines/AssessmentEngine.ts`.
- Curriculum & Learning Path Engine: `services/azora-sapiens/src/engines/LearningPathEngine.ts`.
- Tutoring Engine: `services/azora-sapiens/src/engines/TutoringEngine.ts`.
- Proctoring / Integrity Service: component to do proctoring & exam analysis.

## Components
- Curriculum Graph
  - Node: topic or lesson; edges represent prerequisites.
  - Persisted as a graph DB or normalized tables with a graph-layer interface.
- Adaptive Tutoring Engine
  - Uses student state & mastery to adapt nodes and suggestions.
- Assessment Engine
  - Executes assessments; contains integrity checks and scoring.
- Credentialing & Verifiable Credentials
  - Issue signed credentials via VCs (DID/VC standard) on successful assessments.

## Data Model
- Student profile {studentId, progress, achievements, verifiableCredentials[]}
- Curriculum Node {nodeId, title, prerequisites, metadata}
- Assessment {assessmentId, outcomes, signatures}

## Integrations
- Library & Knowledge Ocean for course content and retrievals.
- Proctoring services (on the platform or external) for exam integrity.
- Credential registries for VCs and badges.

## Security & Privacy
- Exam data & student PII must be stored encrypted with access controls.
- Exams and assessment outputs must be auditable and retained as per jurisdictional regulation.

## Repo References
- `services/azora-sapiens/` with engines and `prisma/` schema.
- `apps/azora-classroom/`, `apps/azora-sapiens/` for UI.

## Acceptance Criteria
- Students get adaptive curriculum suggestions and measurable improvement in sample measures.
- Verifiable credentials generated for completed courses; integrity checks pass for suspicious activity.

## Next Steps
- Start with integration between a simple course (intro to LLMs) running on Sapiens with Knowledge Ocean ingestion & assess results.
- Launch credentialing tests with VCs in staging.
