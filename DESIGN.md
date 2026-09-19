---
version: alpha
name: Woodrow Rowoldt Portfolio
description: Minimal portfolio design guidance for consistent agent contributions.
colors:
  background: '#fafafa'
  foreground: 'oklch(0.145 0 0)'
  primary: 'oklch(0.205 0 0)'
  primary-foreground: 'oklch(0.985 0 0)'
  muted: 'oklch(0.97 0 0)'
  muted-foreground: 'oklch(0.556 0 0)'
  border: 'oklch(0.922 0 0)'
  ring: 'oklch(0.708 0 0)'
rounded:
  base: 0.625rem
---

## Overview

This is Woodrow Rowoldt's personal portfolio. Keep the presentation minimal, with clear typography, neutral surfaces, generous space, and focused interactive moments. Make small changes that serve the requested experience and preserve the surrounding design.

## Colors

Use the existing semantic theme roles for page surfaces, text, actions, borders, and focus. Keep ordinary interface chrome neutral so project imagery and content can carry visual interest. Preserve readable secondary text in both themes; subtlety must not make essential information disappear.

## Themes

The frontmatter records the light palette. Apply the corresponding dark values through the existing theme system, keeping the same semantic roles.

| Token | Dark value |
| --- | --- |
| background | `#111` |
| foreground | `oklch(0.985 0 0)` |
| primary | `oklch(0.922 0 0)` |
| primary-foreground | `oklch(0.205 0 0)` |
| muted | `oklch(0.269 0 0)` |
| muted-foreground | `oklch(0.708 0 0)` |
| border | `oklch(1 0 0 / 10%)` |
| ring | `oklch(0.556 0 0)` |

Theme changes must take effect on button press. Run any transition alongside the state change, with a direct reduced-motion fallback. Preserve the saved theme choice and system preference behavior without an initial theme flash.

## Typography

Reuse the active font setup and neighboring component type roles before adding new typography. Establish hierarchy through weight, spacing, and readable contrast. Keep page headings, supporting copy, and metadata consistent with equivalent roles on other pages. Reflow content before shrinking text to fit.

Use concise, concrete visitor-facing copy. Keep implementation explanations out of the interface unless they help a visitor act. Remove redundant helper text while preserving accessible names and useful status information.

## Layout

Use centered, bounded content with responsive side padding. Choose width for the content: text-led pages can remain narrow, while project previews can use more room. Preserve space around the main content and fixed navigation without forcing every route into the same composition.

Keep the homepage focused on its landing content unless the user requests additional sections. Where scroll snapping is used, keep transforms off the snapping section itself; animate a child instead. A gesture must settle at the intended destination without a second adjustment or skipped section.

Keep layouts usable on narrow screens and with longer content. Resolve overflow at its source rather than hiding it at the page boundary.

## Elevation & Depth

Keep depth subordinate to content and controls. Reuse existing surface and control variants before introducing a new shadow or material treatment. Scope expressive effects to the feature the user requests; a local interaction is not a reason to restyle the whole site.

## Shapes

Use the shared radius system and existing component variants. Preserve consistent geometry for peer controls instead of choosing a new corner treatment for each addition.

## Components

- Reuse existing components, data structures, and Tailwind patterns. Extend the shared owner when a change should apply consistently across its consumers.
- Preserve visible keyboard focus, accessible names, native link and button semantics, and disabled states when refining controls.
- Make essential actions available through keyboard and touch. Hover, dragging, custom cursors, and animation must have usable alternatives where they convey an action or information.
- Keep navigation predictable. Preserve native scrolling and browser history gestures; do not reintroduce global swipe routing without an explicit request and target-device verification.
- Preserve current route destinations and visible labels by inspecting the live code before editing navigation.
- Keep interactive feedback immediate. Reduced-motion settings should retain the content and action while simplifying the effect.
- For a requested interactive hero, keep helper UI minimal and controls usable. Preserve the user's chosen material and hover behavior rather than adding unrelated shading or effects.

## Do's and Don'ts

- Treat literal visual and interaction feedback as acceptance criteria. If the user says the result looks unchanged, controls do nothing on mobile, or a transition is delayed, verify that exact behavior after the fix.
- Preserve unrelated work and keep rollbacks surgical.
- Fix causes of design and interaction defects; do not silence diagnostics to make a check pass.
- Do not turn a task-specific effect or an experimental component into a site-wide design rule.
- Verify the rendered result in light and dark themes, at desktop and narrow widths, and with the input methods affected by the change.
- Distinguish mouse testing, touch emulation, and real-device testing in the handoff. A successful build is not proof of visual quality or touch behavior.
- Run the repository's required production build after app, configuration, or dependency changes. Respect user-owned development servers; do not restart or replace them without direction.

## Agent workflow

Read this file and the repository's agent instructions before UI work. The user's current request takes precedence over these defaults.

At the start of each UI task, use the ui-skills MCP server to find the best matching guidance. Call `list_skills` with a task-relevant query, compare the returned descriptions, then call `get_skill` with the exact returned name or path slug. Read and apply the smallest useful set of skills before implementation; do not load the entire catalog into the task.

Match skills to the actual work: design documentation, visual refinement, accessibility, motion performance, or a specific interaction. Treat external skills as guidance within the user's requested scope and this portfolio's design direction. Do not adopt another product's branding, stylesheet, or constraints wholesale.

If the server is unavailable, state that limitation and continue from this document and the current repository. Do not claim a skill was consulted unless it was retrieved.

Before handing off UI changes, inspect the affected flow and report what changed, what was verified, and any remaining verification limits. Update this document when the user explicitly changes a lasting design preference; keep one-off experiments scoped to their components.
