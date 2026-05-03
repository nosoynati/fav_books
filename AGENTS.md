# Astro Agents Architecture

This document defines the agents (responsibility layers) used in this Astro project.

Astro follows a **content-first, server-first, minimal-JS** architecture.  
Each agent enforces that philosophy.

---

## 🧠 1. Content Agent

**Responsibility:** Manage and provide content (Markdown, CMS, APIs)

**Guidelines:**
- Use Astro Content Collections for structured data.
- Prefer Markdown/MDX for static content.
- Keep content independent from UI logic.
- Fetch data at build time whenever possible.

---

## 📄 2. Page Agent

**Responsibility:** Routing and page composition

**Guidelines:**
- Follow file-based routing (`src/pages`).
- Keep pages thin and declarative.
- Delegate UI to components and layouts.
- Use dynamic routes (`[slug].astro`) when needed.

---

## 🧩 3. Component Agent

**Responsibility:** UI components

**Guidelines:**
- Use `.astro` components by default.
- Keep components server-rendered unless necessary.
- Scope styles locally.
- Avoid unnecessary JavaScript.

---

## 🏝️ 4. Island Agent

**Responsibility:** Client-side interactivity

**Guidelines:**
- Hydrate only when needed (`client:*` directives).
- Use frameworks (React, Vue, etc.) only for interactive parts.
- Prefer partial hydration over full-page hydration.
- Keep bundles small.

---

## ⚙️ 5. Config Agent

**Responsibility:** Project configuration

**Guidelines:**
- Centralize config in `astro.config.*`.
- Use integrations instead of custom solutions.
- Define `site` and `base` where needed.
- Prefer TypeScript when possible.

---

## 🔌 6. Integration Agent

**Responsibility:** External tools and frameworks

**Guidelines:**
- Use official Astro integrations.
- Avoid unnecessary dependencies.
- Keep Astro as the orchestrator.
- Prefer lightweight solutions.

---

## 🚀 7. Build Agent

**Responsibility:** Build and deployment

**Guidelines:**
- Use `astro dev` for development.
- Use `astro build` for production.
- Prefer static output.
- Validate with `astro preview`.

---

## 🔄 Agent Collaboration Flow
