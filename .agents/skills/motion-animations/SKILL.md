---
name: motion-animations
description: Motion (Framer Motion) animations for Next.js 16, React 19, and Tailwind CSS - UPDATED with lessons learned
license: MIT
compatibility: React >=19.0.0, Next.js >=16.0.0, Motion >=12.0.0
---

# Motion (Framer Motion) Animations Skill

Production-ready animations for React 19 and Next.js 16 using Motion (formerly Framer Motion v12).

---

## ⚠️ CRITICAL LESSONS LEARNED (Read First!)

### 1. HTML Table Structure - Hydration Errors

**❌ WRONG - Causes hydration error:**
```tsx
<tbody>
  <motion.div> {/* ❌ div cannot be child of tbody */}
    {rows.map(row => <tr key={row.id}>...</tr>)}
  </motion.div>
</tbody>
```

**✅ CORRECT - Animate rows directly:**
```tsx
<tbody>
  {rows.map((row, index) => (
    <motion.tr
      key={row.id} // Important: unique key
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <td>{row.name}</td>
    </motion.tr>
  ))}
</tbody>
```

**Why:** HTML table elements (`tbody`, `tr`, `td`) have strict parent-child rules. `motion.div` inside `tbody` breaks hydration.

### 2. Reduced Motion - Always Required

**❌ WRONG - No accessibility support:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

**✅ CORRECT - With reduced motion support:**
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.5 
      }}
    />
  );
}
```

**Global Configuration (Recommended):**
```tsx
// app/layout.tsx or providers
import { MotionConfig } from "motion/react";

<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

### 3. AnimatePresence Keys

**❌ WRONG - Missing key:**
```tsx
<AnimatePresence>
  {show && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

**✅ CORRECT - Unique key required:**
```tsx
<AnimatePresence>
  {show && (
    <motion.div 
      key="unique-id" // Required for AnimatePresence to track
      exit={{ opacity: 0 }} 
    />
  )}
</AnimatePresence>
```

### 4. Card Hover with Shadow - Overflow Issues

**❌ WRONG - Shadow clipped on hover:**
```tsx
<motion.div
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
>
  <Card>...</Card> {/* Shadow clipped by parent */}
</motion.div>
```

**✅ CORRECT - Add overflow-hidden and rounded:**
```tsx
<motion.div
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
  className="rounded-xl overflow-hidden"
>
  <Card>...</Card>
</motion.div>
```

---

## Installation

```bash
pnpm add motion
```

---

## Core Concepts

### Basic Animation

```tsx
import { motion } from "motion/react";

// Animate on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Hello World
</motion.div>
```

### Animation Props

| Prop | Description | Example |
|------|-------------|---------|
| `initial` | Starting state | `{ opacity: 0, x: -100 }` |
| `animate` | End state | `{ opacity: 1, x: 0 }` |
| `transition` | Animation config | `{ duration: 0.5, ease: "easeOut" }` |
| `whileHover` | Hover animation | `{ scale: 1.05 }` |
| `whileTap` | Tap/click animation | `{ scale: 0.95 }` |
| `whileInView` | Scroll-triggered | `{ opacity: 1 }` |

---

## Common Animation Patterns

### Fade In Up (Page Elements)

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function FadeInUp({ children, delay = 0 }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1], // ease-out-quint
      }}
    >
      {children}
    </motion.div>
  );
}

// Usage
<FadeInUp>
  <h1>Welcome</h1>
</FadeInUp>
<FadeInUp delay={0.1}>
  <p>Subtitle</p>
</FadeInUp>
```

### Stagger Children

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StaggerList({ items }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  }
  
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={item}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Hover & Tap Effects

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  whileFocus={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  className="px-6 py-3 bg-primary text-white rounded-lg"
>
  Click Me
</motion.button>
```

### Card Hover with Lift

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function CardHover({ children, className }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      whileHover={
        shouldReduceMotion 
          ? undefined 
          : { y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }
      }
      transition={{ type: "spring", stiffness: 300 }}
      className={`rounded-xl overflow-hidden ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}
```

---

## Scroll Animations

### Fade In on Scroll

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function ScrollReveal({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

### Parallax Effect

```tsx
"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";

export function ParallaxSection() {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  return (
    <div ref={ref} className="relative h-[500px] overflow-hidden">
      <motion.div 
        style={{ y: shouldReduceMotion ? 0 : y }} 
        className="absolute inset-0"
      >
        <img src="/image.jpg" alt="" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
}
```

### Scroll Progress Bar

```tsx
"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
      style={{ scaleX: shouldReduceMotion ? scrollYProgress : scaleX }}
    />
  );
}
```

---

## Next.js Page Transitions

### AnimatePresence for Page Exit

```tsx
// src/components/PageTransition.tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

```tsx
// layout.tsx
import { PageTransition } from "@/components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
```

### Layout Group Animations

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <Link href={href} className="relative px-4 py-2">
      {children}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
          transition={shouldReduceMotion ? { duration: 0 } : { 
            type: "spring", 
            stiffness: 380, 
            damping: 30 
          }}
        />
      )}
    </Link>
  );
}
```

---

## Layout Animations

### Layout Prop (Auto-animate on resize/reorder)

```tsx
"use client";

import { motion, Reorder, useReducedMotion } from "motion/react";
import { useState } from "react";

export function ReorderList() {
  const [items, setItems] = useState(["A", "B", "C"]);
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <Reorder.Group 
      axis="y" 
      values={items} 
      onReorder={setItems}
    >
      {items.map((item) => (
        <Reorder.Item key={item} value={item}>
          <motion.div
            layout={!shouldReduceMotion}
            className="p-4 bg-white rounded-lg shadow mb-2 cursor-grab active:cursor-grabbing"
          >
            {item}
          </motion.div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### Expanding Card

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useState } from "react";

export function ExpandableCard({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      layout={!shouldReduceMotion}
      onClick={() => setIsOpen(!isOpen)}
      className="bg-white rounded-xl overflow-hidden cursor-pointer"
      style={{ borderRadius: 16 }}
    >
      <motion.div layout="position" className="p-4 font-semibold">
        {title}
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### LayoutGroup

Coordinate layout animations across multiple components:

```tsx
"use client";

import { motion, LayoutGroup, useReducedMotion } from "motion/react";
import { useState } from "react";

export function AnimatedList() {
  const shouldReduceMotion = useReducedMotion();
  const [items, setItems] = useState(['A', 'B', 'C']);
  
  return (
    <LayoutGroup>
      <ul>
        {items.map((item) => (
          <motion.li
            key={item}
            layout={!shouldReduceMotion}
            layoutId={item}
            onClick={() => setItems(items.filter(i => i !== item))}
            className="p-4 bg-white rounded-lg shadow mb-2 cursor-pointer"
          >
            {item}
          </motion.li>
        ))}
      </ul>
      
      <motion.button
        layout={!shouldReduceMotion}
        onClick={() => setItems([...items, String.fromCharCode(65 + items.length)])}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
      >
        Add Item
      </motion.button>
    </LayoutGroup>
  );
}
```

**When to use LayoutGroup:**
- Multiple components animate together
- Shared layout animations
- List reordering with multiple items
- Cross-component layout transitions

---

## Presence Hooks

Motion provides hooks for fine-grained control over component presence and animations.

### useIsPresent

Check if a component is currently mounted (present in the DOM):

```tsx
"use client";

import { useIsPresent, motion } from "motion/react";

export function FadeOutComponent() {
  const isPresent = useIsPresent();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: isPresent ? 1 : 0 }}
    >
      {isPresent ? 'Visible' : 'Leaving...'}
    </motion.div>
  );
}
```

### usePresenceData

Access custom data passed to AnimatePresence:

```tsx
"use client";

import { usePresenceData, motion } from "motion/react";

export function SlideTransition() {
  const direction = usePresenceData(); // "left" or "right"
  
  return (
    <motion.div
      initial={{ x: direction === 'left' ? -100 : 100 }}
      animate={{ x: 0 }}
      exit={{ x: direction === 'left' ? 100 : -100 }}
    >
      Content
    </motion.div>
  );
}

// Usage with AnimatePresence
<AnimatePresence custom={slideDirection}>
  <SlideTransition key={currentPage} />
</AnimatePresence>
```

### usePresence

Low-level hook for manual presence control:

```tsx
"use client";

import { usePresence, motion } from "motion/react";
import { useEffect } from "react";

export function ManualControl() {
  const [isPresent, safeToRemove] = usePresence();
  
  // Custom logic before removal
  useEffect(() => {
    if (!isPresent) {
      // Perform cleanup
      setTimeout(safeToRemove, 500);
    }
  }, [isPresent, safeToRemove]);
  
  return <motion.div>Content</motion.div>;
}
```

---

## Gesture Animations

### Draggable

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
  className="w-32 h-32 bg-primary rounded-xl"
/>
```

### Swipeable Cards (Tinder-style)

```tsx
"use client";

import { motion, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import { useState } from "react";

export function SwipeableCard({ onSwipe }) {
  const x = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(
    x, 
    [-200, -100, 0, 100, 200], 
    [0, 1, 1, 1, 0]
  );
  
  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={shouldReduceMotion ? false : "x"}
      dragConstraints={{ x: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
          onSwipe(offset.x > 0 ? "right" : "left");
        }
      }}
      className="w-80 h-96 bg-white rounded-2xl shadow-xl p-6"
    >
      {/* Card content */}
    </motion.div>
  );
}
```

---

## Advanced Transitions

### Spring Physics

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: "spring",
    stiffness: 300,  // Higher = snappier
    damping: 20,     // Higher = less bounce
    mass: 1,         // Weight
  }}
/>
```

### Custom Easing

```tsx
// Cubic bezier
<motion.div
  animate={{ x: 100 }}
  transition={{ 
    duration: 0.8,
    ease: [0.43, 0.13, 0.23, 0.96] // custom curve
  }}
/>

// Named easings
const easings = {
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
};
```

### Keyframes

```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

---

## Text Animations

### Character by Character

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function AnimatedText({ text }) {
  const letters = Array.from(text);
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <span>{text}</span>;
  }
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };
  
  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };
  
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} aria-hidden="true">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
```

### Typewriter Effect

```tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Typewriter({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayText(text);
      return;
    }
    
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 50);
      
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [text, delay, shouldReduceMotion]);
  
  return (
    <span>
      {displayText}
      {!shouldReduceMotion && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}
```

---

## Performance Best Practices

### 1. Use `will-change` for GPU Acceleration

```tsx
<motion.div
  initial={{ x: 0 }}
  animate={{ x: 100 }}
  style={{ willChange: "transform" }}
/>
```

### 2. Prefer `transform` and `opacity`

```tsx
// ✅ Good - GPU accelerated
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// ❌ Avoid - triggers layout
<motion.div animate={{ width: 200, height: 200 }} />
```

### 3. Use `layout` Prop Carefully

```tsx
// Only on elements that need layout animation
<motion.div layout>{/* content changes size */}</motion.div>
```

### 4. Reduce Motion (Accessibility)

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function AccessibleAnimation({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Integration with shadcn/ui

### Animated Button

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AnimatedButton({ isLoading, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: isLoading ? 1 : 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: isLoading ? 1 : 0.98 }}
    >
      <Button disabled={isLoading} {...props}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
```

### Animated Card Grid

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AnimatedCardGrid({ items }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>{item.content}</CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={item}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>{item.content}</CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Common Recipes

### Modal Animation

```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function AnimatedDialog({ open, onOpenChange, children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent asChild forceMount>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              {children}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
```

### Skeleton Loading Animation

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function AnimatedSkeleton({ className }) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <Skeleton className={className} />;
  }
  
  return (
    <motion.div
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
    >
      <Skeleton className={className} />
    </motion.div>
  );
}
```

---

## Quick Reference

### Transition Presets

```typescript
const transitions = {
  // Smooth fade
  smooth: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  
  // Snappy spring
  spring: { type: "spring", stiffness: 400, damping: 30 },
  
  // Bouncy
  bounce: { type: "spring", stiffness: 300, damping: 10 },
  
  // Slow and elegant
  slow: { duration: 0.8, ease: "easeInOut" },
  
  // Stagger children
  stagger: { staggerChildren: 0.1 },
};
```

### Common Variants

```typescript
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const slideIn = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};
```

---

## Resources

- [Motion Documentation](https://motion.dev/)
- [Motion Examples](https://motion.dev/examples)
- [React Quick Start](https://motion.dev/docs/react)
- [AnimatePresence Guide](https://motion.dev/docs/react-animate-presence)
- [React 19 Compatibility](https://motion.dev/docs/react-19)
- [Performance Guide](https://motion.dev/docs/performance)
- [Accessibility in Motion](https://motion.dev/docs/accessibility)
