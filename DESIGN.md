---
version: alpha
name: Woodrow Rowoldt Portfolio
description: Minimal portfolio design guidance for consistent agent contributions.
colors:
  background: '#F5F4F3'
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

This is Woodrow Rowoldt's personal portfolio. Keep the presentation minimal, with clear typography, neutral surfaces, generous space, and focused interactive moments.

## Colors

Use the existing semantic theme roles for page surfaces, text, actions, borders, and focus. Keep ordinary interface chrome neutral so project imagery and content can carry visual interest. Preserve readable secondary text in both themes; subtlety must not make essential information disappear.

## Themes

The frontmatter records the light palette. Apply the corresponding dark values through the existing theme system, keeping the same semantic roles.

| Token              | Dark value           |
| ------------------ | -------------------- |
| background         | `#121212`            |
| foreground         | `oklch(0.985 0 0)`   |
| primary            | `oklch(0.922 0 0)`   |
| primary-foreground | `oklch(0.205 0 0)`   |
| muted              | `oklch(0.269 0 0)`   |
| muted-foreground   | `oklch(0.708 0 0)`   |
| border             | `oklch(1 0 0 / 10%)` |
| ring               | `oklch(0.556 0 0)`   |

Theme changes must take effect on button press. Run any transition alongside the state change, with a direct reduced-motion fallback. Preserve the saved theme choice and system preference behavior without an initial theme flash.

## Typography

Reuse the active font setup and neighboring component type roles before adding new typography. Establish hierarchy through weight, spacing, and readable contrast. Keep page headings, supporting copy, and metadata consistent with equivalent roles on other pages. Reflow content before shrinking text to fit.

Use concise, concrete visitor-facing copy. Keep implementation explanations out of the interface unless they help a visitor act. Remove redundant helper text while preserving accessible names and useful status information.

## Layout

Use centered, bounded content with responsive side padding. Choose width for the content: text-led pages can remain narrow, while project previews can use more room. Preserve space around the main content and fixed navigation without forcing every route into the same composition.

Keep the homepage focused on its landing content and reveal the separate footer through normal scrolling. The projects page gives image previews more room. Hardware and software reviews use a denser catalog; software cards show their category without a platform badge. Albums fill the viewport with a theme-matched, lensed art gallery that supports drag, trackpad, and keyboard navigation, shows album and artist captions in a navbar-matched pill above the navbar, fades artwork in when ready, and softly fades it into the page background at all four edges.

Keep layouts usable on narrow screens and with longer content. Resolve overflow at its source rather than hiding it at the page boundary.

## Elevation & Depth

Keep depth subordinate to content and controls. Reuse existing surface and control variants before introducing a new shadow or material treatment. Scope expressive effects to the feature the user requests; a local interaction is not a reason to restyle the whole site.

Non-review pages use the portfolio background. Reviews use a brighter light surface and a darker dark surface, with borderless review cards and distinct image and text surfaces. The inset page frame and navbar frame enter together on framed routes, including refresh. The navbar frame's curved joins follow the inner navbar's corner shape.

## Shapes

Use the shared radius system and existing component variants. Preserve consistent geometry for peer controls instead of choosing a new corner treatment for each addition.

## Components

- Reuse existing components, data structures, and Tailwind patterns. Extend the shared owner when a change should apply consistently across its consumers.
- Preserve visible keyboard focus, accessible names, native link and button semantics, and disabled states when refining controls.
- Make essential actions available through keyboard and touch. Hover, dragging, custom cursors, and animation must have usable alternatives where they convey an action or information.
- Keep navigation predictable. Preserve native scrolling and browser history gestures; do not reintroduce global swipe routing without an explicit request and target-device verification.
- Preserve current route destinations and visible labels by inspecting the live code before editing navigation.
- Keep interactive feedback immediate. Reduced-motion settings should retain the content and action while simplifying the effect.
- Keep the command menu compact with rounded corners and a steady size while filtering. Its search field and selected option use the same light surface; the selected shade moves between hovered options, while keyboard selection is immediate. The footer gives context for the selected command. Its entrance and exit scale evenly from the center.
- For a requested interactive hero, keep helper UI minimal and controls usable. Preserve the user's chosen material and hover behavior rather than adding unrelated shading or effects.

## Do's and Don'ts

- Treat literal visual and interaction feedback as acceptance criteria. If the user says the result looks unchanged, controls do nothing on mobile, or a transition is delayed, verify that exact behavior after the fix.
- Preserve unrelated work and keep rollbacks surgical.
- Fix causes of design and interaction defects; do not silence diagnostics to make a check pass.
- Do not turn a task-specific effect or an experimental component into a site-wide design rule.
