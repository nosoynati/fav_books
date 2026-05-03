
---

## 🧩 Component Rules

- Prefer `.astro` components.
- Use framework components only when necessary.
- Keep components small and reusable.

---

## 🏝️ Island Rules

- Use `client:load` only when critical.
- Prefer `client:idle` or `client:visible`.
- Never hydrate entire pages unnecessarily.

---

## 🔌 Integration Rules

- Install only required integrations.
- Prefer official Astro integrations.
- Avoid duplicating functionality.

---

## ⚙️ Config Rules

- Keep config minimal and explicit.
- Avoid hidden behavior.
- Document any non-standard setup.

---

## 🚀 Build Rules

- Always test with `astro preview`.
- Ensure output is optimized.
- Validate SEO and performance.

---

## ❌ Anti-Patterns

- Turning Astro into a full SPA
- Overusing React/Vue everywhere
- Fetching all data on the client
- Large global state management
- Ignoring static optimization

---

## ✅ Recommended Patterns

- Content collections for structured data
- Static pages with dynamic routes
- Small interactive islands
- Server-side data fetching
- Lightweight components

---

## 🧠 Decision Checklist

Before implementing something, ask:

- Can this be static?
- Does this need JavaScript?
- Can Astro handle this without a framework?
- Is this adding unnecessary complexity?

---

## 🎯 Goal

Build fast, maintainable, content-driven applications  
with minimal client-side overhead.