---
applyTo: '**/*.tsx'
---

## React Component Guidelines for STK

When working with React components (`.tsx` files) in this project, follow these specific guidelines:

### Component Structure

1. **Functional Components Only** - Use functional components exclusively with hooks
2. **Component Organization** - Order: imports → types → constants → sub-components → main component
3. **Export Pattern** - Export main component as default
4. **Ref Forwarding** - Use `forwardRef` when components need to expose refs to parent components

### Hooks Usage

1. **State Management** - Use `useState` for component state
2. **DOM References** - Use `useRef` for DOM references and values that don't trigger re-renders
3. **Side Effects** - Use `useEffect` with proper cleanup functions
4. **Imperative Handles** - Use `useImperativeHandle` when exposing methods to parent components

### Styling

1. **Tailwind CSS** - Use Tailwind utility classes directly in `className` props
2. **Dark Mode** - Support both light and dark modes using `dark:` prefix
3. **Color Scheme** - Follow the existing color scheme:
   - Primary: `indigo-600`, `indigo-500`, `indigo-400`
   - Neutral light: `slate-50` to `slate-400`
   - Neutral dark: `slate-600` to `slate-900`
   - Backgrounds: `white`/`dark:bg-slate-900`, `slate-50`/`dark:bg-slate-800`
4. **Rounded Corners** - Use generous rounded corners: `rounded-3xl`, `rounded-2xl`, `rounded-xl`
5. **Transitions** - Add smooth transitions: `transition-all`, `transition-colors` with `duration-200` or `duration-300`

### Internationalization

1. **Translation Keys** - Access translations via the `t` variable (e.g., `t.addPhoto`, `t.title`)
2. **New Text** - Always add both English and Italian translations for new user-facing text
3. **Translation Object** - Update the `translations` object in `App.tsx`

### Accessibility

1. **Semantic HTML** - Use semantic HTML elements when possible
2. **Alt Text** - Include descriptive `alt` text for images
3. **Button Elements** - Use proper button elements for interactive elements
4. **Keyboard Navigation** - Ensure keyboard navigation works properly
5. **Disabled State** - Use `disabled` attribute appropriately

### Event Handlers

1. **Naming** - Prefix event handlers with `handle` (e.g., `handleDragStart`, `handleExport`)
2. **Drag and Drop** - Use `e.preventDefault()` in drag event handlers
3. **State Updates** - Use functional state updates when new state depends on previous state

### Performance

1. **Cleanup Functions** - Use `useEffect` cleanup functions to prevent memory leaks
2. **Ref Values** - Use `useRef` for values that don't need to trigger re-renders
3. **State Locality** - Keep state as close to where it's used as possible

### File Processing

1. **FileReader API** - Use `FileReader` API for reading image files
2. **Image Objects** - Create `Image` objects to get dimensions
3. **Promises** - Use Promises for async file operations
4. **Cleanup** - Always clean up file input values after processing
