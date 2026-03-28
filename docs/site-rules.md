# site_rules.md

## Purpose

Defines the required structure, layout, and constraints for all tool pages on TinyDataTool.  
This file governs what to build and how pages are structured.

Content quality and wording are handled by `seo_rules.md`.

## 1. Page Template (MANDATORY)

Every tool page MUST follow this exact structure and order:

### 1. Hero Section

Must include:

- H1 (matches primary keyword)
- Subheading (1-2 sentences)
- Tool UI (input + output)

### 2. How It Works

- Eyebrow: HOW IT WORKS
- H2: "How to [primary keyword]"
- Description: 1-2 sentences
- Exactly 3 steps

Each step:

- Action-based title
- One short sentence

### 3. Why Use This Tool

- Eyebrow: WHY USE THIS TOOL
- H2
- Short intro (1-2 sentences)

Include 3-4 benefit blocks:

- Title (3-5 words)
- One short sentence

### 4. Privacy Section

- Eyebrow: PRIVACY
- H2
- Short intro (1-2 sentences)

Must include:

- Data stays on device
- No uploads or storage
- Runs in browser

### 5. FAQ Section

- Eyebrow: FAQ
- H2: "Frequently asked questions"
- 5-7 questions

Each answer:

- 1-3 sentences max

### 6. Related Tools

- Section header
- 3-6 internal links

## 2. Structural Rules (STRICT)

### Section order is fixed

Do NOT:

- reorder sections
- insert new sections
- remove sections

### Section presence

All 6 sections are required on every page.

### Layout consistency

Match spacing, typography, and structure of existing pages.  
Reuse existing components whenever possible.

## 3. Tool UI Rules

### Placement

Always directly under the hero section.

### Behavior

- Prefer instant or near-instant results
- Prefer auto-detection where possible
- Minimize required user actions

### Avoid

- multi-step flows
- unnecessary buttons or friction

## 4. Content Boundaries

This file controls:

- structure
- layout
- section requirements

`seo_rules.md` controls:

- wording
- tone
- keyword usage

## 5. Internal Linking Rules

Each page MUST:

- Include 3-6 related tools
- Prefer same-category tools
- Use clear tool names as anchor text

## 6. Naming + Slugs

### H1

- Short and literal
- Matches search intent

### URL slug

- lowercase
- hyphen-separated
- matches tool name

Example:

- `json-to-csv`
- `remove-duplicate-lines`

## 7. Global Changes (Allowed with Constraints)

Global changes ARE allowed, but must follow these rules:

### When allowed

- Improving consistency across pages
- Fixing layout or spacing issues
- Reusing components
- Reducing duplication

### Requirements

- Changes must improve multiple pages, not just one
- Do not introduce new design systems or visual styles
- Do not break existing pages
- Maintain current look and feel

### Avoid

- unnecessary refactors
- visual redesigns
- one-off styling changes that do not scale

## 8. New Page Creation Rules

When creating a new tool page:

Must include:

- All 6 sections
- Correct structure
- Matching layout
- Related tools

Do NOT:

- skip sections
- invent new section types
- change structure

## 9. Editing Existing Pages

When updating a page:

Must:

- preserve structure
- improve within sections

Avoid:

- removing sections
- restructuring layout
- unnecessary rewrites

## 10. Definition of Done

A page is complete only if:

- All 6 sections exist
- Sections are in correct order
- "How It Works" has exactly 3 steps
- FAQ has 5-7 questions
- Related tools are included
- Page matches site layout

## 11. Execution Rules (Cursor)

When building or updating:

- Follow `site_rules.md` for structure
- Follow `seo_rules.md` for content
- Do not introduce new patterns
- Keep changes scoped and intentional
- Complete one page at a time
