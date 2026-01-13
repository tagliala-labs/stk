# GitHub Copilot Instructions for STK

## Project Overview
STK (Creative Stacker) is a React-based web application that allows users to create vertical image stacks with customizable layouts. The app provides a visual canvas where users can upload multiple photos, arrange them in a stack, and export the result as a JPG image.

## Tech Stack
- **React 19.2.3** with TypeScript
- **Vite 6.2.0** as build tool and dev server
- **Tailwind CSS** (via CDN) for styling
- **Lucide React 0.460.0** for icons
- **TypeScript 5.8.2** with strict mode disabled

## Code Style and Conventions

### TypeScript
- Use TypeScript for all `.tsx` and `.ts` files
- Define interfaces for complex data structures
- Use type aliases for union types
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions when beneficial for clarity
- Use `React.FC` for functional components that don't use `forwardRef`

### React Patterns
- Use functional components exclusively
- Use hooks for state management (`useState`, `useRef`, `useEffect`, `useImperativeHandle`)
- Use `forwardRef` when components need to expose refs to parent components
- Use `React.StrictMode` in the application entry point
- Place all component logic in the same file unless extracted for reusability

### Component Structure
- Keep related sub-components in the same file when they're not reusable elsewhere
- Export main component as default
- Order: imports → types → constants → sub-components → main component
- Use descriptive variable names in PascalCase for components and camelCase for functions/variables

### State Management
- Use `useState` for local component state
- Use `useRef` for DOM references and mutable values that don't trigger re-renders
- Avoid prop drilling; keep state as close to where it's used as possible
- Use functional state updates when new state depends on previous state: `setState(prev => ...)`

### Naming Conventions
- Components: PascalCase (e.g., `ImageUploader`, `CanvasPreview`)
- Functions/variables: camelCase (e.g., `handleExport`, `processFiles`)
- Constants: SCREAMING_SNAKE_CASE for truly constant values (e.g., `FORMATS`)
- Interfaces/Types: PascalCase (e.g., `Photo`, `Settings`)
- Props interfaces: Use inline props typing or define interface with descriptive name
- Event handlers: prefix with `handle` (e.g., `handleDragStart`, `handleExport`)

### Styling with Tailwind CSS
- Use Tailwind utility classes directly in JSX `className` props
- Use template literals for conditional classes
- Support both light and dark modes using `dark:` prefix
- Follow the existing color scheme:
  - Primary: `indigo-600`, `indigo-500`, `indigo-400`
  - Neutral light: `slate-50` to `slate-400`
  - Neutral dark: `slate-600` to `slate-900`
  - Backgrounds: `white`/`dark:bg-slate-900`, `slate-50`/`dark:bg-slate-800`
  - Borders: `slate-200`/`dark:border-slate-800`
- Use rounded corners generously: `rounded-3xl`, `rounded-2xl`, `rounded-xl` for cards and buttons
- Use smooth transitions: `transition-all`, `transition-colors` with `duration-200` or `duration-300`
- Use shadow utilities for depth: `shadow-sm`, `shadow-md`, `shadow-xl`, `shadow-2xl`

### Internationalization (i18n)
- Store all user-facing text in the `translations` object
- Define translations for both `en` (English) and `it` (Italian)
- Access translations via the `t` variable: `t.addPhoto`, `t.title`, etc.
- Keep translation keys concise and descriptive (camelCase)
- Always add both English and Italian translations for new text

### Accessibility
- Use semantic HTML elements when possible
- Include descriptive `alt` text for images when applicable
- Use proper button elements for interactive elements
- Ensure keyboard navigation works properly
- Maintain sufficient color contrast in both light and dark modes
- Use `disabled` attribute appropriately on interactive elements

### File Processing
- Use `FileReader` API for reading image files
- Create `Image` objects to get dimensions of uploaded images
- Use Promises for async file operations
- Always clean up file input values after processing

### Canvas Operations
- Use `getContext('2d', { alpha: false })` for better performance with opaque canvases
- Clear/redraw canvas on settings or photo changes
- Use async image loading with Promise.all for multiple images
- Calculate image scaling to fit within canvas width minus padding
- Center content vertically on the canvas
- Export as JPEG with quality 0.95

### Drag and Drop
- Implement both file drag-and-drop and photo reordering
- Provide visual feedback during dragging (opacity, borders, colors)
- Use `e.preventDefault()` in drag event handlers
- Clean up drag state after operations complete
- Make drag handles visually distinct (use `GripVertical` icon)

### Theme Management
- Initialize theme from `localStorage` or system preference
- Toggle between light and dark modes
- Update `document.documentElement.classList` and localStorage on theme changes
- Prevent flash of unstyled content with inline script in HTML

### Performance Considerations
- Use `useEffect` cleanup functions to prevent memory leaks
- Optimize canvas redraws by checking if component is still mounted
- Use `useRef` for values that don't need to trigger re-renders
- Minimize re-renders by keeping state updates localized

### Error Handling
- Check for null/undefined before accessing DOM elements or refs
- Provide user feedback for operations that can fail
- Gracefully handle edge cases (e.g., empty photo arrays, exceeded height limits)

## Common Patterns

### Adding New UI Elements
1. Add translation strings to both `en` and `it` in the `translations` object
2. Use Tailwind classes matching the existing design system
3. Support dark mode with `dark:` prefixes
4. Add hover states with `hover:` prefix
5. Include appropriate transitions

### Adding New Settings
1. Add property to `Settings` interface
2. Add to default settings in `useState<Settings>`
3. Add UI control in the settings sidebar
4. Update canvas rendering logic if needed

### Adding New Format Options
1. Add entry to `FORMATS` constant with width, height, and label
2. UI will automatically generate button in format selector grid

## Build and Development
- Run dev server: `npm run dev` (starts on port 3000)
- Build for production: `npm run build`
- Preview production build: `npm run preview`
- Environment variable: `GEMINI_API_KEY` in `.env.local` (optional, for AI features)

## File Organization
- Main application: `App.tsx`
- Entry point: `index.tsx`
- Type definitions: `types.ts` (currently empty, types defined inline)
- Components: `components/` directory (currently unused, components are inline)
- Build configuration: `vite.config.ts`
- TypeScript configuration: `tsconfig.json`

## Best Practices
- Keep the monolithic `App.tsx` structure unless refactoring is explicitly requested
- Maintain consistency with existing patterns
- Test both light and dark modes
- Test in different viewport sizes (mobile, tablet, desktop)
- Verify translations work in both English and Italian
- Ensure exported images maintain quality and correct dimensions
- Test drag-and-drop functionality thoroughly
