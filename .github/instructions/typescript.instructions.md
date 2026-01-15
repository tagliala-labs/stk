---
applyTo: '**/*.{ts,tsx}'
---

## TypeScript Guidelines for STK

When working with TypeScript files in this project, follow these specific guidelines:

### Type System

1. **Interfaces for Objects** - Prefer `interface` over `type` for object shapes
2. **Type Aliases for Unions** - Use `type` aliases for union types
3. **Explicit Return Types** - Use explicit return types for functions when beneficial for clarity
4. **No Any** - Avoid using `any` type; use proper types or `unknown` if necessary

### Type Definitions

1. **Interface Naming** - Use PascalCase for interfaces (e.g., `Photo`, `Settings`)
2. **Complex Structures** - Define interfaces for complex data structures
3. **Component Props** - Use inline props typing or define interface with descriptive name
4. **Export Types** - Export types that are used across multiple files

### Naming Conventions

1. **Components** - PascalCase (e.g., `ImageUploader`, `CanvasPreview`)
2. **Functions/Variables** - camelCase (e.g., `handleExport`, `processFiles`)
3. **Constants** - SCREAMING_SNAKE_CASE for truly constant values (e.g., `FORMATS`)
4. **Types/Interfaces** - PascalCase (e.g., `Photo`, `Settings`)

### TypeScript Configuration

1. **Type Safety** - Follow the TypeScript settings in `tsconfig.json`
2. **Module System** - Use ESNext modules with `import`/`export`
3. **JSX** - Use `react-jsx` mode for automatic JSX transform
4. **Path Aliases** - Use `@/` for root-level imports as configured in `tsconfig.json`

### Best Practices

1. **Null Safety** - Check for null/undefined before accessing properties
2. **Type Guards** - Use type guards for narrowing types when needed
3. **Generic Types** - Use generic types for reusable components and functions
4. **Readonly** - Use `readonly` for arrays and properties that shouldn't be mutated

### React with TypeScript

1. **Functional Components** - Use plain function declarations for components
2. **Hooks Typing** - Properly type `useState`, `useRef`, and other hooks
3. **Event Types** - Use proper React event types (e.g., `React.ChangeEvent<HTMLInputElement>`)
4. **Ref Types** - Use `React.RefObject` or `React.MutableRefObject` for refs

### Error Handling

1. **Type Checking** - Check types before operations that could fail
2. **Optional Chaining** - Use optional chaining (`?.`) for potentially undefined values
3. **Nullish Coalescing** - Use nullish coalescing (`??`) for default values
4. **Type Assertions** - Use type assertions sparingly and only when absolutely necessary
