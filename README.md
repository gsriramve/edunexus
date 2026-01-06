# EduNexus

AI-First College Management Platform for Indian Engineering Colleges

## Overview

EduNexus is a comprehensive B2B SaaS platform designed to manage the complete lifecycle of engineering college operations - from student admission to placement.

## Key Features

- **Multi-Tenant Architecture**: Each college gets isolated data with custom branding
- **7 User Personas**: Platform Owner, Principal, HOD, Admin Staff, Teacher, Lab Assistant, Student, Parent
- **AI-Powered**: Score predictions, placement probability, smart content generation
- **Mobile-First**: Progressive Web App (PWA) for all devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, PostgreSQL, Redis
- **AI/LLM (NestJS)**: Claude SDK, LlamaIndex.TS, Qdrant (self-hosted)
- **ML Inference (Python)**: FastAPI, PyTorch, XGBoost (minimal service)
- **Infrastructure**: AWS (Mumbai), Kubernetes, Terraform

### Hybrid AI Architecture

```
NestJS (Primary AI)          Python (ML Only)
├── Claude SDK               ├── Score Prediction (PyTorch)
├── LlamaIndex.TS (RAG)      └── Placement Prediction (XGBoost)
├── Qdrant Client
├── Chatbot
└── Content Generation
```

## Documentation

- [Complete Plan & Architecture](./docs/PLAN.md)

## Business Model

- B2B SaaS: ₹500/student/year
- Target: Engineering colleges in India
- Pilot: 2-3 colleges (~15K students)

## Status

🚧 **In Development** - Phase 1: Foundation

---

Built with ❤️ for Indian Engineering Education
