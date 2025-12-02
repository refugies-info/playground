# Component Architecture — Quick Reference

**TL;DR**: Design system components go in `/packages/ui`, feature components go in `/apps/frontend/src/components/{feature}`.

---

## Decision Tree (30 seconds)

```
Is this component reusable across multiple pages/features?
├─ YES → /packages/ui/src/{category}/
└─ NO → /apps/frontend/src/components/{feature}/
```

---

## Folder Structure

### Design System (`/packages/ui/src`)

```
primitives/          ← Button, Input, Card, etc.
forms/               ← FormField, FormLabel, etc.
feedback/            ← Alert, Toast, etc.
layout/              ← Container, Grid, etc.
hooks/               ← useMediaQuery, useClickOutside, etc.
utils/               ← cn(), classname utilities
styles/              ← Global CSS, theme config
themes/              ← Light, dark mode, etc.
```

### Feature Components (`/apps/frontend/src/components`)

```
auth/                ← LoginForm, SignupForm, etc.
dashboard/           ← ContentList, ContentCard, etc.
editor/              ← EditorPanel, MetadataForm, etc.
layout/              ← Header, Sidebar, Navigation, etc.
```

---

## Import Examples

### ✅ Correct

```typescript
// Design system
import { Button, Input, Card } from "@playground/ui";

// Feature components
import { LoginForm } from "@/components/auth";
```

### ❌ Avoid

```typescript
// Deep paths
import { Button } from "@playground/ui/src/primitives/button";

// Cross-feature imports
import { SomeComponent } from "../dashboard";
```

---

## Adding a Component

### Design System Component

```bash
# 1. Create folder
mkdir -p packages/ui/src/primitives/my-component

# 2. Create files
# packages/ui/src/primitives/my-component/MyComponent.tsx
# packages/ui/src/primitives/my-component/index.ts

# 3. Export from index.ts
export { MyComponent, type MyComponentProps } from "./MyComponent";

# 4. Update parent index.ts
# packages/ui/src/primitives/index.ts
export { MyComponent, type MyComponentProps } from "./my-component";

# 5. Update main export
# packages/ui/src/index.ts
export * from "./primitives";
```

### Feature Component

```bash
# 1. Create folder
mkdir -p apps/frontend/src/components/my-feature

# 2. Create files
# apps/frontend/src/components/my-feature/MyComponent.tsx
# apps/frontend/src/components/my-feature/index.ts

# 3. Export from index.ts
export { MyComponent, type MyComponentProps } from "./MyComponent";

# 4. Update parent index.ts
# apps/frontend/src/components/index.ts
export * from "./my-feature";
```

---

## Best Practices

### DO ✅

- Keep design system components **stateless** (presentational only)
- Use **TypeScript interfaces** for props
- Export from **index.ts** files
- Use **forwardRef** for DOM access
- Compose design system components in features
- Keep feature components **close to pages** that use them

### DON'T ❌

- Mix **business logic** into design system components
- Import **feature components** into design system (circular dependencies)
- Create **duplicate components** (check design system first)
- Use **deep path imports** (always use barrel exports)
- Create components in `/apps/frontend/src/components/ui` (that's for design system)

---

## File References

| Document | Purpose |
|----------|---------|
| [COMPONENT_STRATEGY.md](./COMPONENT_STRATEGY.md) | Full guide with templates and examples |
| [COMPONENT_STRATEGY_IMPLEMENTATION.md](./COMPONENT_STRATEGY_IMPLEMENTATION.md) | What was done and current status |
| [README.md](../README.md) | Project overview (see Component Architecture section) |
| [documentation/README.md](../documentation/README.md) | Documentation index |

---

## Examples

### Example 1: Add a new Button variant

**Question**: Should this go in design system or features?  
**Answer**: Design system (reusable across multiple pages)

```bash
# Location: /packages/ui/src/primitives/button/Button.tsx
# Already exists! Just add a new variant prop:

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost"; // ← add ghost
  // ...
}
```

### Example 2: Create a login form

**Question**: Should this go in design system or features?  
**Answer**: Features (specific to auth page)

```bash
# Location: /apps/frontend/src/components/auth/LoginForm.tsx
# Already exists! Imports design system components:

import { Button, Input, Card } from "@playground/ui";

export function LoginForm() {
  // Use design system components
  return (
    <Card>
      <Input label="Email" />
      <Button>Sign In</Button>
    </Card>
  );
}
```

### Example 3: Create a content list component

**Question**: Should this go in design system or features?  
**Answer**: Features (specific to dashboard page)

```bash
# Location: /apps/frontend/src/components/dashboard/ContentList.tsx

import { Card, Button } from "@playground/ui";

export function ContentList() {
  return (
    <div>
      {/* Use design system components */}
    </div>
  );
}
```

---

## Troubleshooting

**Q: Where should I put this component?**  
A: Use the decision tree above. If still unsure, ask: "Will this be used in multiple features?" YES → design system, NO → features.

**Q: I'm getting import errors**  
A: Check that the component is exported from `index.ts` and you're using the correct import path.

**Q: I need a component similar to one in the design system**  
A: Check if you can add a prop to the existing component instead of creating a new one.

**Q: I have a component used by multiple features**  
A: Move it to the design system to prevent duplication.

---

## Need More Details?

See [COMPONENT_STRATEGY.md](./COMPONENT_STRATEGY.md) for:
- Detailed folder structure
- Component templates with full code examples
- Import conventions and patterns
- Complete best practices guide
- Step-by-step component creation
- Refactoring guidelines
