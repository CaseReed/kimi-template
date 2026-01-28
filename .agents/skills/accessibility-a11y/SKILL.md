---
name: accessibility-a11y
description: Web accessibility (a11y) best practices, ARIA patterns, and keyboard navigation
license: MIT
compatibility: React >=19.0.0, Next.js >=16.0.0, Tailwind CSS >=4.0.0
---

# Accessibility (a11y) Skill

Guidelines for building accessible web applications with React, Next.js, and Tailwind CSS.

---

## Core Principles

### The POUR Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Perceivable** | Info must be presentable in ways users can perceive | Alt text, color contrast, captions |
| **Operable** | Interface components must be operable by all | Keyboard navigation, focus management |
| **Understandable** | Info and UI operation must be understandable | Clear labels, error messages, consistency |
| **Robust** | Content must work with assistive technologies | Valid HTML, ARIA attributes, semantic markup |

---

## Semantic HTML First

Always use semantic HTML before adding ARIA. Semantic elements have built-in accessibility.

### ✅ Good: Semantic HTML

```tsx
// Native semantics - no ARIA needed
<button onClick={handleSubmit}>Submit</button>

<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content...</p>
  </article>
</main>

<form>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" required />
</form>
```

### ❌ Bad: Div Soup

```tsx
// Anti-pattern - requires ARIA to make accessible
<div onClick={handleSubmit}>Submit</div>

<div className="nav">
  <div className="link" onClick={() => router.push('/')}>Home</div>
</div>

<div className="main-content">
  <div className="title">Title</div>
</div>
```

### Semantic Elements Reference

| Element | Purpose | ARIA Equivalent (if needed) |
|---------|---------|----------------------------|
| `<button>` | Clickable action | `role="button"` |
| `<a href>` | Navigation link | `role="link"` |
| `<nav>` | Navigation section | `role="navigation"` |
| `<main>` | Main content | `role="main"` |
| `<article>` | Self-contained content | `role="article"` |
| `<section>` | Thematic grouping | `role="region"` |
| `<aside>` | Sidebar content | `role="complementary"` |
| `<header>` | Page/section header | `role="banner"` |
| `<footer>` | Page/section footer | `role="contentinfo"` |
| `<form>` | Form container | `role="form"` |
| `<table>` | Data table | `role="table"` |

---

## ARIA Attributes

### When to Use ARIA

1. **Dynamic content** that changes without page reload
2. **Custom widgets** (dropdowns, tabs, modals)
3. **Complex interactions** (drag & drop, tree views)
4. **Live regions** for status updates

### Common ARIA Patterns

#### Buttons and Links

```tsx
// Custom button that needs ARIA
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-pressed={isPressed}
>
  Toggle
</div>

// Better: use real button
<button
  aria-pressed={isPressed}
  onClick={handleClick}
>
  Toggle
</button>
```

#### Form Labels

```tsx
// Explicit label association
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// Or implicit (input inside label)
<label>
  Username
  <input type="text" />
</label>

// When label is not visible
<input
  type="search"
  aria-label="Search products"
  placeholder="Search..."
/>

// Or with aria-labelledby
<span id="search-label">Search products</span>
<input
  type="search"
  aria-labelledby="search-label"
/>
```

#### Dynamic Content

```tsx
// Live region for status updates
<div aria-live="polite" aria-atomic="true">
  {saveStatus === 'saving' && 'Saving...'}
  {saveStatus === 'saved' && 'Saved!'}
  {saveStatus === 'error' && 'Error saving'}
</div>

// Alert for important notifications
<div role="alert" className="text-red-600">
  {errorMessage}
</div>
```

#### Navigation Landmarks

```tsx
<header>
  <nav aria-label="Main navigation">
    {/* Navigation links */}
  </nav>
</header>

<aside aria-label="Sidebar">
  <nav aria-label="Secondary navigation">
    {/* Secondary links */}
  </nav>
</aside>

<main id="main-content">
  {/* Page content */}
</main>

// Skip link for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

---

## Keyboard Navigation

### Focus Management

```tsx
// Custom focus outline (Tailwind)
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</button>

// Focus trap for modals
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save previously focused element
      const previousFocus = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      modalRef.current?.querySelector('button, [href], input')?.focus();
      
      return () => previousFocus?.focus(); // Restore on close
    }
  }, [isOpen]);
  
  // Handle Tab key to trap focus
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      // Trap logic...
    }
    if (e.key === 'Escape') onClose();
  };
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
    </div>
  );
}
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Move to next focusable element |
| `Shift + Tab` | Move to previous focusable element |
| `Enter` / `Space` | Activate button or link |
| `Escape` | Close modal/dropdown |
| `Arrow Keys` | Navigate within widgets (tabs, menus) |
| `Home` / `End` | Jump to first/last item |

### Focusable Elements

```tsx
// Naturally focusable
<button>, <a href>, <input>, <textarea>, <select>

// Programmatically focusable
tabIndex={0}  // In tab order
tabIndex={-1} // Focusable via JS, not in tab order

// Not focusable
tabIndex={-1} on non-interactive elements (for container focus)
```

---

## Screen Reader Support

### Hidden Content

```tsx
// Visually hidden but available to screen readers
function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  );
}

// Usage
<button>
  <VisuallyHidden>Edit</VisuallyHidden>
  <PencilIcon aria-hidden="true" />
</button>

// Or with Tailwind's sr-only
<button>
  <span className="sr-only">Edit user</span>
  <PencilIcon aria-hidden="true" />
</button>
```

### Status Announcements

```tsx
function useAnnouncer() {
  const [message, setMessage] = useState('');
  
  const announce = useCallback((msg: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg);
  }, []);
  
  return { announce, Announcement: (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )};
}

// Usage
function SearchResults({ query }: { query: string }) {
  const { announce, Announcement } = useAnnouncer();
  const results = useSearch(query);
  
  useEffect(() => {
    announce(`Found ${results.length} results for ${query}`);
  }, [results.length, query]);
  
  return (
    <>
      {Announcement}
      <ul>{/* results */}</ul>
    </>
  );
}
```

### Images

```tsx
// Decorative image
<img src="banner.jpg" alt="" role="presentation" />

// Informative image
<img src="chart.png" alt="Sales increased 25% in Q4" />

// Complex image with description
<figure>
  <img src="diagram.png" alt="System architecture diagram" />
  <figcaption>Figure 1: High-level system architecture showing...</figcaption>
</figure>

// Icon buttons
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

---

## Component Patterns

### Accordion

```tsx
function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div className="divide-y">
      {items.map((item, index) => (
        <div key={index}>
          <button
            aria-expanded={openIndex === index}
            aria-controls={`panel-${index}`}
            id={`header-${index}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full py-4 text-left focus:outline-none focus:ring-2"
          >
            {item.title}
            <ChevronIcon
              className={cn('transition-transform', openIndex === index && 'rotate-180')}
              aria-hidden="true"
            />
          </button>
          <div
            id={`panel-${index}`}
            role="region"
            aria-labelledby={`header-${index}`}
            hidden={openIndex !== index}
            className={cn('py-4', openIndex !== index && 'hidden')}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Tabs

```tsx
function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist" aria-label="Content sections">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                setActiveTab((prev) => (prev + 1) % tabs.length);
              }
              if (e.key === 'ArrowLeft') {
                setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length);
              }
            }}
            className={cn(
              'px-4 py-2',
              activeTab === index && 'border-b-2 border-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className={cn('p-4', activeTab !== index && 'hidden')}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Modal/Dialog

```tsx
function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const firstFocusable = overlayRef.current?.querySelector(
        'button, [href], input, select, textarea'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="bg-white rounded-lg p-6 max-w-lg w-full"
      >
        <h2 id="dialog-title" className="text-xl font-bold mb-4">
          {title}
        </h2>
        <div>{children}</div>
        <button onClick={onClose} className="mt-4">
          Close
        </button>
      </div>
    </div>
  );
}
```

---

## Color and Contrast

### Contrast Ratios

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | - |

```tsx
// Check contrast with Tailwind colors
// bg-gray-900 (text) on bg-white = 16.1:1 ✅
// bg-gray-400 (text) on bg-white = 3.9:1 ❌ (too low)

// Good contrast
<p className="text-gray-900 bg-white">High contrast text</p>

// Poor contrast - avoid
<p className="text-gray-400 bg-gray-200">Low contrast text</p>

// Use tools like:
// - WebAIM Contrast Checker
// - Stark (Figma plugin)
// - axe DevTools
```

### Don't Rely on Color Alone

```tsx
// ❌ Bad: Only color indicates state
<span className="text-red-500">Error</span>

// ✅ Good: Color + icon + text
<span className="text-red-600 flex items-center gap-1">
  <ErrorIcon aria-hidden="true" />
  <span>Error: Please check your input</span>
</span>

// ❌ Bad: Only color for required fields
<label className="text-red-500">Email</label>

// ✅ Good: Explicit indicator
<label>
  Email <span aria-label="required">*</span>
</label>
```

---

## Form Accessibility

### Error Handling

```tsx
function FormField({
  label,
  error,
  id,
  ...props
}: FormFieldProps) {
  const errorId = `${id}-error`;
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <div id={errorId} role="alert" className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Required Fields

```tsx
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### Grouping

```tsx
<fieldset>
  <legend>Preferred contact method</legend>
  <label>
    <input type="radio" name="contact" value="email" />
    Email
  </label>
  <label>
    <input type="radio" name="contact" value="phone" />
    Phone
  </label>
</fieldset>
```

---

## Testing Accessibility

### Automated Testing

```bash
# Install axe-core
pnpm add -D @axe-core/react

# In development
import React from 'react';
import ReactDOM from 'react-dom';
import axe from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}
```

### Manual Testing Checklist

- [ ] Navigate with **Tab** key only
- [ ] Check **focus indicators** are visible
- [ ] Test with **screen reader** (NVDA, JAWS, VoiceOver)
- [ ] Validate **color contrast** (WCAG AA minimum)
- [ ] Test **zoom** up to 200%
- [ ] Check **reduced motion** preferences
- [ ] Verify **alt text** for all images
- [ ] Test **mobile** touch targets (44x44px minimum)

### Keyboard Test Flow

1. Unplug mouse / disable trackpad
2. Navigate entire app using only:
   - Tab / Shift+Tab
   - Enter / Space
   - Arrow keys
   - Escape
3. Can you complete all tasks?

---

## Quick Reference

### Essential Attributes

| Attribute | Use Case | Example |
|-----------|----------|---------|
| `alt` | Image descriptions | `<img alt="User profile" />` |
| `aria-label` | Accessible name | `<button aria-label="Close" />` |
| `aria-labelledby` | Reference visible label | `<input aria-labelledby="name-label" />` |
| `aria-describedby` | Additional context | `<input aria-describedby="hint error" />` |
| `aria-expanded` | Toggle state | `<button aria-expanded={isOpen} />` |
| `aria-hidden` | Hide from screen readers | `<Icon aria-hidden="true" />` |
| `aria-live` | Announce changes | `<div aria-live="polite" />` |
| `role` | Element purpose | `<div role="alert" />` |

### Tailwind Utilities

```tsx
// Screen reader only
<span className="sr-only">Hidden text</span>

// Focus visible
<button className="focus:outline-none focus:ring-2 focus:ring-primary">

// Reduced motion
<div className="motion-reduce:transition-none">

// Print styles
<div className="print:hidden">
```

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
