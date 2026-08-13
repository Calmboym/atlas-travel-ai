# AI Travel Platform

# Development Guidelines Document

Version: 1.0

Status: Draft

Document Type: Engineering Rules & Standards

---

# 1. Purpose

This document defines the development rules, coding standards, AI implementation principles, security practices, and quality requirements for the AI Travel Platform.

All developers and AI coding assistants must follow these guidelines.

The goal is to maintain:

- Clean architecture
- High security
- Long-term scalability
- Easy maintenance
- Consistent development practices

---

# 2. General Development Principles

## Quality Over Speed

Do not create quick solutions that create future technical debt.

Prefer:

- Clean design
- Clear separation
- Maintainable code

---

## Simplicity Over Complexity

Do not introduce unnecessary technologies or abstractions.

Every component must have a clear purpose.

---

## Production First

All code should be written as production-ready code.

Avoid:

- Temporary hacks
- Hardcoded values
- Unfinished logic
- Hidden assumptions

---

# 3. Project Structure Rules

The project must maintain clear separation between:

- Frontend
- Backend
- AI Layer
- Database
- External Integrations
- Infrastructure

---

# 4. Coding Standards

## Backend

Language:

Python

Framework:

FastAPI

Requirements:

- Type hints required
- Clear function names
- Modular services
- Async where beneficial
- Proper error handling

---

## Frontend

Language:

TypeScript

Rules:

- Strict TypeScript mode enabled
- No unnecessary any types
- Reusable components
- Clear component responsibility

---

# 5. Naming Convention

## Files

Use:

lowercase-with-hyphens

Example:
destination-service.py
travel-profile.ts
---

## Functions

Use descriptive names.

Example:

Good:

calculate_trip_budget()

Bad:

calc()

---

## Classes

Use PascalCase.

Example:

TravelRecommendationService

---

# 6. Architecture Rules

Claude Code must NOT:

- Rewrite architecture without approval.
- Replace selected technologies.
- Remove abstraction layers.
- Mix frontend and backend responsibilities.
- Put business logic inside UI components.

---

# 7. AI Development Guidelines

## Agent Design

Every AI Agent must have:

- Clear mission
- Defined responsibility
- Allowed tools
- Input schema
- Output schema
- Error handling
- Evaluation metrics

---

## Agent Isolation

Agents must not directly communicate randomly.

Communication must happen through:

AI Orchestrator

---

## Prompt Management

System prompts must NOT be hardcoded inside application logic.

Prompts must be stored separately.

Recommended structure:
ai/
├── prompts/
├── agents/
├── schemas/
└── evaluations/
---

# 8. AI Safety Rules

The AI system must:

- Avoid hallucination.
- Mention uncertainty.
- Prefer verified sources.
- Never invent prices.
- Never invent visa requirements.
- Never fabricate availability.

---

# 9. Tool Usage Rules

Agents must:

- Use approved tools only.
- Validate tool responses.
- Respect API limits.
- Handle failures gracefully.

---

Never:

- Call external APIs directly from frontend.
- Expose API keys.
- Trust external responses without validation.

---

# 10. Database Guidelines

## PostgreSQL

Primary database.

Rules:

- Use migrations.
- Never manually modify production database.
- Maintain indexes.
- Optimize queries.

---

## Redis

Use for:

- Cache
- Sessions
- Rate limiting
- Temporary data

Do not use Redis as permanent storage.

---

# 11. Security Guidelines

## Authentication

Required:

- Secure password storage.
- Token expiration.
- OAuth security.
- Session protection.

---

## Rate Limiting

Mandatory.

Protect:

- Login endpoints.
- Registration.
- AI chat endpoints.
- Expensive API calls.

Recommended:

Redis-based rate limiting.

---

## Input Validation

Every user input must be validated.

Including:

- Text
- Files
- URLs
- API parameters

---

## Prompt Injection Protection

The system must detect and reduce:

- Attempts to reveal system prompts.
- Attempts to override AI rules.
- Malicious instructions inside retrieved data.

---

# 12. API Development Rules

Every API endpoint must have:

- Authentication rules.
- Input schema.
- Output schema.
- Error responses.
- Documentation.

---

# 13. External API Guidelines

Every provider must have:

- Adapter layer.
- Error handling.
- Timeout handling.
- Retry policy.
- Monitoring.

Never couple business logic directly to providers.

---

# 14. Testing Requirements

## Backend Testing

Required:

- Unit tests
- Integration tests

---

## Frontend Testing

Required:

- Component tests
- End-to-end tests

Recommended:

Playwright

---

## AI Testing

Required:

- Prompt evaluation
- Agent output validation
- Hallucination testing
- Regression testing

---

# 15. Git Guidelines

## Branch Strategy

Recommended:

main

↓

development

↓

feature branches

---

## Commit Messages

Use clear commits.

Examples:

Good:
add destination recommendation service
bad:
update
---

# 16. Documentation Rules

Every major feature requires:

- Documentation update.
- API documentation.
- Configuration explanation.

---

# 17. Environment Management

Different environments:

- Development
- Testing
- Production

Secrets must never be shared between environments.

---

# 18. Logging Rules

Logs must include:

- Timestamp
- Service name
- Error details
- Request identifier

Avoid logging:

- Passwords
- Tokens
- Personal sensitive data

---

# 19. Performance Guidelines

Optimize:

- Database queries.
- API calls.
- AI token usage.
- Cache usage.

Prefer:

- Streaming responses.
- Background jobs.
- Async processing.

---

# 20. Code Review Rules

Before merging:

Check:

- Security
- Performance
- Architecture consistency
- Tests
- Documentation

---

# 21. Forbidden Practices

Not allowed:

- Hardcoded secrets
- Hardcoded API responses
- Duplicate business logic
- Unvalidated user input
- Direct database access from UI
- Direct external API calls from agents
- Ignoring errors
- Skipping tests

---

# 22. Future Compatibility Rules

All implementation decisions should consider future support for:

- Telegram Bot
- Mobile Application
- Voice Assistant
- Booking System
- Public API

---

# 23. Definition of Done

A feature is complete only when:

- Code is implemented.
- Tests exist.
- Security is reviewed.
- Documentation is updated.
- Errors are handled.
- Architecture remains consistent.

---

# End of GUIDELINES.md
