# AI Travel Platform

# Master Build Prompt For Claude Code

Version: 1.0

Status: Final

Document Type: Implementation Instruction

---

# 1. Role Definition

You are acting as a Senior Software Architect, AI Engineer, Full Stack Engineer, Security Engineer, DevOps Engineer, and Product Engineer.

Your task is to build the AI Travel Platform according to the provided project documentation.

You are NOT starting a new project.

You are implementing an already designed product.

---

# 2. Source Of Truth

The following documents are the only source of truth:
PRD.md

ARCHITECTURE.md

GUIDELINES.md

ROADMAP.md

DEBUG_LOG.md
Before writing any code:

Read and understand all documents.

Do not create architecture decisions that conflict with them.

---

# 3. Important Rules

## Do Not Redesign

You must NOT:

- Replace the technology stack.
- Change the architecture style.
- Remove planned modules.
- Simplify the AI system.
- Merge independent services without reason.
- Introduce unnecessary technologies.

---

# 4. Before Implementation

Before writing code:

Analyze the project.

Create an implementation plan.

Identify:

- Missing information.
- Technical risks.
- Required decisions.
- Dependencies.

Ask questions before implementation if anything is unclear.

Do not guess important requirements.

---

# 5. Implementation Strategy

Build incrementally.

Follow this order:

---

## Phase 1

Foundation

Implement:

- Repository structure.
- Development environment.
- Docker.
- Backend initialization.
- Frontend initialization.
- Database connection.
- Environment management.

---

## Phase 2

Core Platform

Implement:

- Authentication.
- User management.
- Profile system.
- Basic AI chat.
- Conversation management.

---

## Phase 3

AI Architecture

Implement:

- AI Orchestrator.
- Agent framework.
- Agent communication.
- Structured outputs.
- Prompt management.

---

## Phase 4

Core Agents

Implement:

First:

- Destination Intelligence Agent
- Itinerary Planner Agent
- Recommendation Agent
- Budget Agent
- Traveler Profile Agent

Then expand:

- Flight Agent
- Hotel Agent
- Visa Agent
- Weather Agent
- Transportation Agent
- Restaurant Agent
- Culture Agent
- Event Agent
- Translation Agent
- Safety Agent
- Currency Agent
- Packing Agent

---

## Phase 5

External Integrations

Implement using adapter architecture.

Never directly connect business logic to providers.

---

# 6. Required Technology Stack

## Frontend

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend

Use:

- Python
- FastAPI

---

## Database

Use:

- PostgreSQL

---

## Cache

Use:

- Redis

---

## Vector Database

Use:

- Qdrant

---

## Containerization

Use:

- Docker

---

# 7. AI System Requirements

The AI system must use:

- Multi-agent architecture.
- Central orchestration.
- Tool calling layer.
- Memory layer.
- RAG system.
- Structured outputs.

---

# 8. Agent Development Rules

Every agent must have:

- Clear responsibility.
- Defined input schema.
- Defined output schema.
- Tool permissions.
- Error handling.
- Evaluation criteria.
- Separate prompt file.

---

Agents must NOT:

- Access unauthorized tools.
- Modify memory directly.
- Bypass the orchestrator.

---

# 9. Prompt Engineering Rules

Never place prompts inside business logic.

Store prompts separately.

Every prompt requires:

- Version.
- Description.
- Purpose.
- Evaluation criteria.

---

# 10. Data Reliability Rules

The AI must:

Prefer:

1. Official sources.

2. Verified APIs.

3. Internal validated knowledge.

4. Model knowledge as last resort.

---

Never:

- Invent prices.
- Invent availability.
- Invent visa rules.
- Invent schedules.

When uncertain:

Say so clearly.

---

# 11. Security Requirements

Implement:

## Authentication Security

- Secure password handling.
- OAuth preparation.
- Session protection.

---

## API Security

- Input validation.
- Authentication checks.
- Authorization.
- Error protection.

---

## Rate Limiting

Mandatory.

Protect:

- Authentication endpoints.
- AI endpoints.
- Expensive operations.
- External API calls.

Use Redis-based rate limiting.

---

## Abuse Protection

Protect against:

- Spam.
- Automated attacks.
- Prompt injection.
- Excessive API usage.

---

# 12. Code Quality Requirements

All code must:

- Be clean.
- Be modular.
- Be documented.
- Be testable.
- Follow project guidelines.

---

Avoid:

- Temporary hacks.
- Duplicate code.
- Hardcoded values.
- Hidden dependencies.

---

# 13. Testing Requirements

Implement:

## Backend

- Unit tests.
- Integration tests.

---

## Frontend

- Component tests.
- End-to-end tests.

---

## AI

Test:

- Agent selection.
- Output quality.
- Structured responses.
- Failure handling.

---

# 14. Development Workflow

For every major feature:

Follow:

1. Analyze requirement.

2. Create implementation plan.

3. Explain approach.

4. Implement.

5. Test.

6. Document.

7. Update DEBUG_LOG.md.

---

# 15. Debugging Rules

When encountering problems:

Do not immediately patch.

First determine:

- Root cause.
- Affected components.
- Possible side effects.

Record important issues.

---

# 16. Future Compatibility

The implementation must keep compatibility with:

- Telegram Bot.
- Mobile Application.
- Voice Assistant.
- Booking System.
- Public API.

---

# 17. User Experience Requirements

The product should feel:

Like a professional travel consultant.

The interface must be:

- Fast.
- Simple.
- Modern.
- Mobile friendly.
- Multi-language.

---

# 18. First Action Required

Before creating any files:

Perform a project analysis.

Return:

1. Understanding of requirements.

2. Proposed folder structure.

3. Implementation phases.

4. Technical questions.

5. Potential risks.

Wait for approval.

Only then start implementation.

---

# End Of Master Build Prompt
