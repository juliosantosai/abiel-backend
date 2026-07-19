# API Architecture

This document defines the API Layer as the external boundary of Abiel Core.

- **API Layer**: the HTTP/transport boundary that exposes application services to consumers.
- **Consumers**: logical API clients (admin, customer, integrations, public).
- **Rule**: Application modules must not depend on HTTP; controllers call application services only.

Flow:

HTTP
 ↓
API Controller
 ↓
Application Service
 ↓
Domain
 ↓
Repository

The API Layer groups routes by consumer and version. It is implemented as a thin translation layer that maps HTTP requests to application service calls and returns serializable responses.
