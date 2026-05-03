# Astro Rules & Best Practices

These rules define how to work consistently and efficiently in this Astro project.

---

## 🧭 Core Principles

### 1. Static First
- Default to Static Site Generation (SSG).
- Use SSR only when necessary.

---

### 2. Minimize JavaScript
- Ship zero JS by default.
- Hydrate only interactive components.
- Avoid turning Astro into a SPA.

---

### 3. Server-First Approach
- Fetch data on the server.
- Avoid client-side data fetching unless required.

---

### 4. Separation of Concerns
- Content ≠ UI ≠ Logic
- Pages orchestrate, components render.

---

### 5. Performance by Default
- Optimize images and assets.
- Avoid large client bundles.
- Keep dependencies minimal.

---

## 📁 Project Structure Rules
