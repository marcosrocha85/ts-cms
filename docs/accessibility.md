# Accessibility (A11y) Implementation Guide

## Overview

This document describes the accessibility improvements implemented in the TweetScheduler CMS frontend to ensure compliance with WCAG 2.1 AA standards and provide an excellent experience for all users, including those using assistive technologies.

## Implementation Date

December 8, 2025

## Key Features Implemented

### 1. ✅ Labels for All Inputs

**Implementation:**

- All form inputs now have properly associated `<label>` elements
- Labels use `htmlFor` attribute matching the input's `id`
- Required fields marked with visual indicator and `aria-required="true"`

**Files Updated:**

- `CreateTweetPage.tsx`
- `EditTweetPage.tsx`
- `LoginPage.tsx`
- `ProfilePage.tsx`

**Example:**

```tsx
<label htmlFor="postText" className="font-semibold">
    Post Text <span className="text-red-500">*</span>
</label>
<InputTextarea
    id="postText"
    value={text}
    onChange={(e) => setText(e.target.value)}
    aria-label="Post text content"
    aria-describedby="postText-help"
    aria-required="true"
/>
<small id="postText-help" className="block mt-2 text-500" role="status" aria-live="polite">
    {text.length} / {maxTweetChars} characters
</small>
```

### 2. ✅ Visible Focus States

**Implementation:**

- Created dedicated `_accessibility.scss` stylesheet
- Custom `:focus-visible` styles for all interactive elements
- Consistent 2px primary color outline with 2px offset
- Enhanced box-shadow for form elements
- High contrast mode support

**File Created:**

- `styles/layout/_accessibility.scss`

**Key Styles:**

```scss
:focus-visible {
  outline: 2px solid var(--primary-color) !important;
  outline-offset: 2px !important;
  border-radius: 4px;
}

.p-inputtext:focus,
.p-inputtextarea:focus,
.p-calendar input:focus {
  outline: 2px solid var(--primary-color) !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb), 0.25) !important;
}
```

**Supported Elements:**

- Input text fields
- Textareas
- Calendars
- Buttons (all variants)
- Checkboxes and radio buttons
- File upload buttons
- Menu items and navigation links
- Dialogs and overlays

### 3. ✅ Keyboard Navigation

**Implementation:**

- Skip to main content link (visible on focus)
- Proper tab order throughout all forms
- Semantic HTML structure with `<main>`, `<nav>`, `role` attributes
- Focus management in dialogs and overlays

**Files Updated:**

- `app/layout.tsx` - Added skip link
- `layout/layout.tsx` - Added semantic roles and main content ID

**Skip Link:**

```tsx
<a href="#main-content" className="skip-to-main">
    Skip to main content
</a>

<main id="main-content" className="layout-main" role="main" tabIndex={-1}>
    {children}
</main>
```

**Navigation:**

```tsx
<div
  ref={sidebarRef}
  className="layout-sidebar"
  role="navigation"
  aria-label="Main navigation"
>
  <AppSidebar />
</div>
```

### 4. ✅ ARIA Labels and Attributes

**Implementation:**

- `aria-label` on all interactive elements without visible text
- `aria-describedby` linking inputs to help text
- `aria-required` on required form fields
- `aria-live="polite"` for status messages
- `role` attributes for custom components
- `aria-hidden="true"` for decorative icons

**ARIA Attributes Used:**

| Attribute          | Purpose                              | Example                            |
| ------------------ | ------------------------------------ | ---------------------------------- |
| `aria-label`       | Descriptive label for screen readers | `aria-label="Post text content"`   |
| `aria-describedby` | Links input to help text             | `aria-describedby="postText-help"` |
| `aria-required`    | Marks required fields                | `aria-required="true"`             |
| `aria-live`        | Announces dynamic content            | `aria-live="polite"`               |
| `role`             | Defines element role                 | `role="status"`, `role="list"`     |
| `aria-hidden`      | Hides decorative elements            | `aria-hidden="true"`               |

**Examples:**

**Input with Help Text:**

```tsx
<InputTextarea
    id="postText"
    aria-label="Post text content"
    aria-describedby="postText-help"
    aria-required="true"
/>
<small id="postText-help" role="status" aria-live="polite">
    {text.length} / {maxTweetChars} characters
</small>
```

**Button with Icon Only:**

```tsx
<Button
  icon="pi pi-times"
  onClick={() => removeMedia(index)}
  aria-label={`Remove image ${media.name}`}
  tooltip={`Remove ${media.name}`}
  tooltipOptions={{ position: "bottom" }}
/>
```

**Status Messages:**

```tsx
<div className="flex align-items-center gap-2" role="status" aria-live="polite">
  <i className="pi pi-spin pi-spinner" aria-hidden="true" />
  <span>Loading...</span>
</div>
```

**Action Groups:**

```tsx
<div
  className="flex gap-2 justify-content-end"
  role="group"
  aria-label="Form actions"
>
  <Button label="Cancel" aria-label="Cancel and go back" />
  <Button label="Save" aria-label="Save post changes" />
</div>
```

## Additional Features

### Screen Reader Only Content

Utility class for content that should only be read by screen readers:

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### High Contrast Mode Support

```scss
@media (prefers-contrast: high) {
  :focus-visible {
    outline-width: 3px !important;
  }
}
```

### Reduced Motion Support

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Checklist

### Manual Testing

- [x] Tab through all forms - focus is visible on all elements
- [x] Use screen reader (NVDA/JAWS/VoiceOver) - all content announced correctly
- [x] Navigate with keyboard only - all functionality accessible
- [x] Test skip to main content link - jumps to main content
- [x] Test with high contrast mode - outlines are visible
- [x] Test with animations disabled - no jarring transitions

### Automated Testing (Recommended)

Tools to use for validation:

- **axe DevTools** - Browser extension for automated accessibility testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Chrome DevTools accessibility audit
- **Pa11y** - Automated accessibility testing tool

### Screen Reader Testing

Recommended screen readers:

- **NVDA** (Windows) - Free and open source
- **JAWS** (Windows) - Industry standard
- **VoiceOver** (macOS/iOS) - Built-in Apple screen reader
- **TalkBack** (Android) - Built-in Android screen reader

## Best Practices Applied

1. **Semantic HTML** - Use proper HTML5 elements (`<main>`, `<nav>`, `<section>`)
2. **Label Association** - Every input has an associated label
3. **Keyboard Support** - All functionality available via keyboard
4. **Focus Management** - Clear, visible focus indicators
5. **Alternative Text** - Descriptive alt text for images
6. **Color Contrast** - Sufficient contrast ratios
7. **Error Identification** - Clear error messages linked to inputs
8. **Status Messages** - Dynamic content announced to screen readers
9. **Skip Navigation** - Skip links for keyboard users
10. **Consistent Navigation** - Predictable navigation patterns

## File Structure

```
apps/frontend/
├── styles/layout/
│   ├── _accessibility.scss      # ✨ NEW - Accessibility styles
│   └── layout.scss               # Updated to import _accessibility.scss
├── app/
│   └── layout.tsx                # Updated with skip link
├── layout/
│   └── layout.tsx                # Updated with semantic roles
└── src/presentation/pages/
    ├── CreateTweetPage.tsx       # Updated with ARIA attributes
    ├── EditTweetPage.tsx         # Updated with ARIA attributes
    ├── LoginPage.tsx             # Updated with ARIA attributes
    └── ProfilePage.tsx           # Updated with ARIA attributes
```

## Browser Support

The accessibility features are supported in:

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Opera 74+

## WCAG 2.1 Compliance

These implementations help achieve:

- **1.3.1 Info and Relationships** (Level A) - Semantic structure
- **2.1.1 Keyboard** (Level A) - Full keyboard access
- **2.4.1 Bypass Blocks** (Level A) - Skip to main content
- **2.4.3 Focus Order** (Level A) - Logical tab order
- **2.4.7 Focus Visible** (Level AA) - Visible focus indicators
- **3.2.4 Consistent Identification** (Level AA) - Consistent UI
- **3.3.2 Labels or Instructions** (Level A) - Clear labels
- **4.1.2 Name, Role, Value** (Level A) - ARIA attributes
- **4.1.3 Status Messages** (Level AA) - aria-live regions

## Future Improvements

Consider implementing:

- [ ] Keyboard shortcuts documentation
- [ ] Increased font size options
- [ ] Color theme options for better contrast
- [ ] More comprehensive screen reader announcements
- [ ] Focus trap in modal dialogs
- [ ] Advanced keyboard navigation (arrow keys in lists)

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [PrimeReact Accessibility](https://primereact.org/accessibility/)
- [WebAIM](https://webaim.org/)

---

**Author:** Marcos Rocha (@marcosrochagpm)  
**Project:** TweetScheduler CMS  
**Date:** December 8, 2025
