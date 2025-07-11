# SnapQL Animation Effects Specification

This document outlines 10 subtle animation polish ideas designed to enhance the user experience of SnapQL while maintaining the professional, developer-focused aesthetic.

## Design Philosophy

- **Subtle & Purposeful**: Animations should enhance functionality, not distract
- **Performance-Conscious**: Maintain 60fps, minimal impact on app performance
- **Developer-Appropriate**: Professional feel with personality, suitable for a dev tool
- **Consistent Timing**: Build on existing 67ms duration and `[0.4, 0, 0.2, 1]` easing

## Current Animation Foundation

SnapQL already has a sophisticated Framer Motion implementation with:
- Layout animations with AnimatePresence
- Shared layout animations (layoutId)
- Staggered list reveals
- Micro-interactions (hover, tap)
- Consistent timing and easing

---

## 🎯 Animation Effects Specification

### **1. Query Execution Pulse Wave**
**Purpose**: Visual connection between query execution action and results  
**Trigger**: When "Run Query" button is clicked  
**Animation**: 
- Subtle pulse wave travels from Run button → SQL editor → results panel
- Duration: 800ms total journey
- Effect: Subtle border highlight that travels along the execution path
- Easing: `ease-out` for natural deceleration

```tsx
// Implementation hint: Use coordinated motion across components
motion.div({
  initial: { scale: 1, borderColor: "transparent" },
  animate: { scale: [1, 1.02, 1], borderColor: ["transparent", "#10b981", "transparent"] },
  transition: { duration: 0.8, ease: "easeOut", delay: staggerDelay }
})
```

### **2. Connection Status Breathing**
**Purpose**: Indicate live database connection health  
**Trigger**: When database connection is active  
**Animation**:
- Green status dot gently "breathes" (scale 0.9 → 1.1 → 0.9)
- Cycle duration: 3-4 seconds
- Infinite loop while connected
- Pause animation on hover

```tsx
// Implementation hint: Gentle infinite scale animation
motion.div({
  animate: { scale: [0.9, 1.1, 0.9] },
  transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
})
```

### **3. Schema Table Hover Lift**
**Purpose**: Enhanced interactivity for schema exploration  
**Trigger**: Mouse hover over schema table cards  
**Animation**:
- Subtle 3D lift: `translateY(-2px)` + enhanced shadow
- Duration: 150ms in, 200ms out
- Spring physics for natural feel

```tsx
// Implementation hint: Combine transform and shadow
motion.div({
  whileHover: { 
    y: -2, 
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
  },
  transition: { type: "spring", stiffness: 300, damping: 20 }
})
```

### **4. Query History Time Travel**
**Purpose**: Visual feedback when reverting to historical queries  
**Trigger**: Clicking on query in history panel  
**Animation**:
- SQL editor content morphs character-by-character from current → historical
- Duration: 300ms
- Typewriter-style reveal effect
- Highlight changed portions briefly

```tsx
// Implementation hint: Animate text content with staggered character reveals
// Use AnimatePresence with custom text animation component
```

### **5. Data Loading Skeleton Cascade**
**Purpose**: Elegant loading states instead of spinners  
**Trigger**: Loading table data, schema information  
**Animation**:
- Skeleton placeholders cascade in from top-left to bottom-right
- Stagger delay: 50ms between rows/items
- Shimmer effect across skeleton elements
- Crossfade to real content when loaded

```tsx
// Implementation hint: Grid-based staggered animation
motion.div({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: row * 0.05 + col * 0.02 }
})
```

### **6. AI Thinking Dots**
**Purpose**: Personality for AI query generation  
**Trigger**: While AI is generating SQL queries  
**Animation**:
- 3 dots that grow/shrink in sequence near prompt input
- Duration: 1.2s cycle, infinite loop
- Scale: 0.8 → 1.2 → 0.8
- Stagger: 0.2s between dots

```tsx
// Implementation hint: Staggered scale animations
motion.div({
  animate: { scale: [0.8, 1.2, 0.8] },
  transition: { 
    duration: 1.2, 
    repeat: Infinity, 
    delay: index * 0.2,
    ease: "easeInOut"
  }
})
```

### **7. Tab Switch Page Flip**
**Purpose**: Enhanced navigation between Editor and Schema Browser  
**Trigger**: Clicking tab headers  
**Animation**:
- Current tab rotates away (`rotateY: 90deg`)
- New tab rotates in from behind (`rotateY: -90deg → 0deg`)
- Duration: 200ms each phase
- Perspective effect for 3D feel

```tsx
// Implementation hint: Coordinated 3D rotation with AnimatePresence
motion.div({
  initial: { rotateY: -90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: 90, opacity: 0 },
  transition: { duration: 0.2 },
  style: { transformPerspective: 1000 }
})
```

### **8. Query Success Ripple**
**Purpose**: Positive feedback for successful query execution  
**Trigger**: When query completes successfully  
**Animation**:
- Green ripple effect emanates from results panel
- Expands outward and fades over 600ms
- Subtle scale effect on results container
- Single occurrence per successful query

```tsx
// Implementation hint: Absolute positioned ripple with scale + opacity
motion.div({
  initial: { scale: 0, opacity: 0.6 },
  animate: { scale: 2, opacity: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
})
```

### **9. Sidebar Accordion Breathe**
**Purpose**: Enhanced section expand/collapse feedback  
**Trigger**: Expanding/collapsing sidebar sections (connections, history, favorites)  
**Animation**:
- Content slightly scales during height transition (0.98 → 1.0)
- Duration: Matches height animation timing
- Spring physics for natural feel
- Coordinates with existing height animations

```tsx
// Implementation hint: Combine with existing height animations
motion.div({
  animate: { height: isOpen ? "auto" : 0, scale: isOpen ? 1 : 0.98 },
  transition: { type: "spring", stiffness: 300, damping: 25 }
})
```

### **10. Error State Shake + Recovery**
**Purpose**: Clear feedback for validation errors and connection failures  
**Trigger**: Form validation errors, connection failures  
**Animation**:
- Horizontal shake: `translateX(-2px → 2px → -2px → 0)`
- 3 shake cycles over 300ms
- Followed by gentle "recovery" bounce
- Red border flash during shake

```tsx
// Implementation hint: Keyframe animation with coordinated color change
motion.div({
  animate: { 
    x: [-2, 2, -2, 2, 0],
    borderColor: ["#ef4444", "#ef4444", "#ef4444", "#ef4444", "transparent"]
  },
  transition: { 
    duration: 0.3,
    times: [0, 0.25, 0.5, 0.75, 1],
    ease: "easeInOut"
  }
})
```

---

## Implementation Guidelines

### **Performance Considerations**
- Use `transform` and `opacity` properties when possible (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left` except when necessary
- Implement `will-change` CSS property for complex animations
- Use `layoutId` for shared element transitions

### **Accessibility**
- Respect `prefers-reduced-motion` media query
- Provide option to disable animations in settings
- Ensure animations don't interfere with screen readers
- Maintain focus management during transitions

### **Integration with Existing System**
- Build on current Framer Motion setup
- Use existing easing curve: `[0.4, 0, 0.2, 1]`
- Maintain 67ms base duration for consistency
- Leverage existing AnimatePresence patterns

### **Testing**
- Test on lower-end hardware for performance
- Verify animations work across all supported platforms (macOS, Windows, Linux)
- Test with large datasets to ensure animations don't impact data handling performance

---

## Priority Implementation Order

1. **High Impact, Low Effort**: Connection Status Breathing, Query Success Ripple
2. **Medium Impact, Medium Effort**: Schema Table Hover Lift, AI Thinking Dots
3. **High Impact, High Effort**: Query Execution Pulse Wave, Query History Time Travel
4. **Polish Phase**: Tab Switch Page Flip, Sidebar Accordion Breathe, Data Loading Skeleton Cascade, Error State Shake + Recovery