# Component Architecture Strategy

## Overview

This document defines how components are organized and managed across the Content Playground monorepo. We follow a **design-system-first approach** with clear separation between reusable design system components and page-specific feature components.

---

## Core Principles

1. **Design System Centralization** (`/packages/ui`)
   - All design system components live in one place
   - Single source of truth for styling, behavior, and accessibility
   - Reusable across all applications (frontend, future backends, etc.)

2. **Feature Isolation** (`/apps/frontend/src/components`)
   - Page-specific and feature-specific components stay close to where they're used
   - Design-agnostic: use design system components as building blocks
   - Easy to refactor or move without affecting the design system

3. **Clear Ownership**
   - Design system: owned by the entire team, changes require review
   - Feature components: owned by feature developers, can iterate quickly

4. **Discoverability**
   - LLMs and developers can quickly determine where a component belongs
   - Clear naming conventions and folder structure
   - Documentation is co-located with code

---

## Folder Structure

### Design System (`/packages/ui/src`)

```
packages/ui/src/
├── primitives/              # Low-level, reusable UI primitives
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── card/
│   │   ├── Card.tsx
│   │   ├── Card.stories.tsx
│   │   └── index.ts
│   ├── input/
│   │   ├── Input.tsx
│   │   ├── Input.stories.tsx
│   │   └── index.ts
│   └── index.ts             # Barrel export
├── forms/                   # Form-specific components (optional)
│   ├── FormField.tsx
│   ├── FormLabel.tsx
│   └── index.ts
├── feedback/                # Feedback components (alerts, toasts, etc.)
│   ├── Alert.tsx
│   ├── Toast.tsx
│   └── index.ts
├── layout/                  # Layout components (containers, grids, etc.)
│   ├── Container.tsx
│   ├── Grid.tsx
│   └── index.ts
├── hooks/                   # Custom hooks for UI logic
│   ├── useMediaQuery.ts
│   ├── useClickOutside.ts
│   └── index.ts
├── utils/                   # Utility functions (classname merging, etc.)
│   ├── cn.ts
│   └── index.ts
├── styles/                  # Global styles and theme configuration
│   ├── globals.css
│   └── theme.ts
├── themes/                  # Theme definitions (dark mode, etc.)
│   ├── light.ts
│   ├── dark.ts
│   └── index.ts
└── index.ts                 # Main barrel export for @refugies/ui
```

### Frontend Features (`/apps/frontend/src/components`)

```
apps/frontend/src/components/
├── auth/                    # Authentication-specific components
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── PasswordResetForm.tsx
│   └── index.ts
├── dashboard/               # Dashboard-specific components
│   ├── ContentList.tsx
│   ├── ContentCard.tsx
│   ├── FilterBar.tsx
│   └── index.ts
├── editor/                  # Content editor components
│   ├── EditorPanel.tsx
│   ├── MetadataForm.tsx
│   ├── RevisionHistory.tsx
│   └── index.ts
├── layout/                  # App layout components (header, sidebar, etc.)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Navigation.tsx
│   └── index.ts
└── index.ts                 # Barrel export for convenience
```

---

## Decision Tree: Where Does a Component Go?

Use this flowchart to determine where to place a new component:

```
Is this component reusable across multiple pages/features?
├─ YES → Is it a fundamental UI primitive (button, input, card, etc.)?
│        ├─ YES → /packages/ui/src/primitives/
│        ├─ NO → Is it form-related? → /packages/ui/src/forms/
│        ├─ NO → Is it feedback-related? → /packages/ui/src/feedback/
│        ├─ NO → Is it layout-related? → /packages/ui/src/layout/
│        └─ NO → /packages/ui/src/ (create new category if needed)
│
└─ NO → Is this specific to a feature (auth, dashboard, editor)?
         ├─ YES → /apps/frontend/src/components/{feature}/
         └─ NO → /apps/frontend/src/components/layout/ (if layout-related)
```

---

## Component Structure Guidelines

### Design System Component Template

```typescript
// /packages/ui/src/primitives/button/Button.tsx
import * as React from "react";
import { cn } from "@refugies/ui/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center font-medium transition-colors",
        // Variants
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        // Sizes
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        // States
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button };
```

### Feature Component Template

```typescript
// /apps/frontend/src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@refugies/ui";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>

          <div className="space-y-2 text-center text-sm">
            <p>
              <Link
                href="/password-reset"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## Import Conventions

### From Design System

```typescript
// ✅ Correct: Import from @refugies/ui
import { Button, Input, Card } from "@refugies/ui";

// ❌ Avoid: Direct path imports
import { Button } from "@refugies/ui/src/primitives/button";
```

### From Feature Components

```typescript
// ✅ Correct: Relative imports within the same feature
import { LoginForm } from "./LoginForm";

// ✅ Correct: Absolute imports from app root
import { LoginForm } from "@/components/auth";

// ❌ Avoid: Cross-feature imports (use design system instead)
import { SomeComponentFromOtherFeature } from "../dashboard";
```

---

## Best Practices

### ✅ DO

- **Keep design system components stateless** — they should be presentational only
- **Use TypeScript interfaces** for all component props
- **Export components from index.ts** files for cleaner imports
- **Document component props** with JSDoc comments
- **Use forwardRef** for components that need DOM access
- **Test design system components** with Storybook or unit tests
- **Create feature components** that compose design system components
- **Keep feature components close to pages** that use them

### ❌ DON'T


- **Mix business logic into design system components** — keep them pure
- **Import feature components into the design system** — creates circular dependencies
- **Create duplicate components** — check if one exists in the design system first
- **Hardcode colors or spacing** — use Tailwind utilities and theme tokens
- **Import from deep paths** — always use barrel exports (index.ts)
- **Create components in /apps/frontend/src/components/ui** — that's for design system only
- **Mix page-specific logic with reusable components** — separate concerns

---

## Adding a New Component

### Step 1: Determine Location

Use the decision tree above to decide if it belongs in `/packages/ui` or `/apps/frontend/src/components`.

### Step 2: Create the Component

Follow the component template for your category.

### Step 3: Export from index.ts

```typescript
// /packages/ui/src/primitives/button/index.ts
export { Button, type ButtonProps } from "./Button";
```

### Step 4: Update Parent index.ts

```typescript
// /packages/ui/src/primitives/index.ts
export { Button, type ButtonProps } from "./button";
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
export { Input, type InputProps } from "./input";
```

### Step 5: Update Main Export

```typescript
// /packages/ui/src/index.ts
export * from "./primitives";
export * from "./forms";
export * from "./feedback";
export * from "./layout";
```

### Step 6: Document (Optional)

Add a Storybook story or inline documentation:

```typescript
// /packages/ui/src/primitives/button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Click me",
    variant: "primary",
  },
};
```

---

## Refactoring Existing Components

When refactoring or moving existing components:

1. **Identify the component's purpose** — is it reusable or feature-specific?
2. **Move to the correct location** — use the decision tree
3. **Update all imports** — use find-and-replace across the codebase
4. **Update barrel exports** — ensure index.ts files are updated
5. **Test imports** — verify the component can be imported from the new location
6. **Update documentation** — if applicable

---

## Troubleshooting

### "I'm not sure where this component goes"

Use the decision tree. If still unsure, ask: **"Will this component be used in multiple features?"**
- YES → Design system (`/packages/ui`)
- NO → Feature components (`/apps/frontend/src/components/{feature}`)

### "I need a component that's similar to one in the design system"

Check `/packages/ui/src` first. If you need a variant, consider:
1. Adding a prop to the existing component
2. Creating a new component that composes the existing one
3. Creating a new category in the design system

### "I have a component that's used by multiple features"

Move it to the design system (`/packages/ui`). This prevents duplication and ensures consistency.

### "I'm getting import errors after moving a component"

1. Check that the component is exported from `index.ts`
2. Verify the import path is correct
3. Run `pnpm install` to ensure dependencies are resolved
4. Check for circular dependencies

---

## Related Documentation

- [README.md](../README.md) — Project overview
- [Tech Stack](../README.md#-tech-stack) — Frontend framework and styling details
- Storybook — Interactive component documentation (when available)

---

## Questions?

If you have questions about component placement or architecture, refer to this document or ask the team. Keep this document updated as the architecture evolves.
