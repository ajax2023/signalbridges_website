# 16 — Home Page UI Layout Refactor

**Date:** 2026-05-12  
**Scope:** `src/pages/Home.jsx`, `src/layout/Layout.jsx`

---

## Summary

Refactored the home page layout to reduce vertical height, improve information density, and present the architecture diagram in an integrated enterprise-grade panel. Visual theme (dark navy, sky-400 accents, slate palette) is unchanged.

---

## Changes Made

### `src/layout/Layout.jsx`
- Reduced main content wrapper padding: `py-12` → `py-8` (~33% reduction in top/bottom page margin)

### `src/pages/Home.jsx`

#### Hero Section
- Reduced section-level gap: `space-y-10` → `space-y-6`
- Tightened internal hero spacing: `space-y-4` → `space-y-2.5`
- Narrowed hero container: `max-w-3xl` → `max-w-2xl`
- Reduced headline size: `text-4xl/5xl` → `text-3xl/4xl` with `leading-snug`
- Reduced body text: `text-base` → `text-sm`; limited width with `max-w-xl`
- Reduced CTA button vertical padding: `py-2` → `py-1.5`
- Reduced CTA gap and top offset: `gap-3 pt-4` → `gap-2.5 pt-2`

#### Architecture Section (new)
- Replaced bare centered `<img>` with a dedicated elevated card:
  - `border border-slate-800`, `bg-slate-900/50`, `shadow-lg shadow-black/30`, `rounded-lg`, `p-5`
- Added sky-400 eyebrow label: **"Architecture Overview"**
- Implemented **2-column responsive layout** (`flex-col` → `lg:flex-row`):
  - **Left (40%):** short architectural summary + paragraph description of control plane and integration channels
  - **Right (60%):** architecture diagram image
- Image constrained: `w-full h-auto max-h-64 object-contain rounded-md`
- Collapses to single column on tablet/mobile

#### Feature Cards
- Reduced card padding: `p-5` → `p-4`
- Reduced card gap: `gap-6` → `gap-3`
- Reduced card heading size: `text-sm` → `text-xs uppercase tracking-wide`
- Reduced card body text: `text-sm` → `text-xs`
- Reduced top margin on card body: `mt-2` → `mt-1.5`
- Added `flex flex-col` for consistent equal-height card behaviour

---

## Responsive Behaviour

| Breakpoint | Architecture section | Feature cards |
|---|---|---|
| Mobile (`< lg`) | Single column, image below text | Single column stack |
| Desktop (`≥ lg`) | 2-column (text left, image right) | 3-column horizontal grid |

---

## Design Principles Preserved
- Dark navy (`slate-950`) background
- `sky-400` accent colour for eyebrow labels and interactive elements
- Restrained enterprise/operational tone — no gradients, animations, or consumer SaaS styling
- All architecture content retained verbatim
