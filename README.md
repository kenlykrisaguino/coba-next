# Next.js 15 + TipTap Inline Comments (SSR-safe)

A minimal, production-readable example of a TipTap-based rich text editor in a Next.js App Router project with SSR safety and an inline comment feature built as a custom Mark extension.

## Features

- Next.js App Router (Next 15 compatible), React 19 RC.
- TipTap + StarterKit with a custom `comment` mark storing `{ id, text }`.
- Comment mode toggle: enable/disable annotation flow.
- Toolbar: Comment mode, Add comment, Remove comment, Copy doc JSON.
- Bubble menu: Add comment when selecting text and Comment mode is ON.
- Click comment-mark to open a popover with the comment content and a Delete button (deletes only that range’s mark).
- SSR safe: client-only editor, no browser globals accessed during server render, `immediatelyRender: false`.
- In-memory persistence for doc and threads that can be replaced with API/DB.

## Structure

- `app/layout.tsx`: Base shell + Tailwind injection.
- `app/page.tsx`: Renders the client editor component.
- `components/RteWithComments.tsx`: Main client editor with toolbar/bubble menu/popover.
- `lib/tiptap-comment.ts`: Custom `comment` mark extension with click handler plugin.
- `lib/types.ts`: Minimal types.
- `lib/storage.ts`: In-memory doc + comment threads store.
- `styles/globals.css`: Tailwind base + `.comment-mark` styles.
- `vitest.config.ts` + `__tests__/comment-extension.test.ts`: Unit tests for add/remove mark and attribute serialization.

## Run

Using pnpm:

```bash
pnpm i
pnpm dev
```

Using npm:

```bash
npm i
npm run dev
```

Open the printed URL (usually http://localhost:3000). You should see the editor page without SSR errors.

## Build and Start

```bash
pnpm build && pnpm start
# or npm run build && npm start
```

## Test

```bash
pnpm test
# or npm test
```

The test validates that:
- The `comment` mark can be added and removed over a selection.
- `id` and `text` attributes are serialized in the editor JSON.

## SSR Notes

- The editor component is a Client Component (`'use client'`).
- `immediatelyRender: false` prevents the editor from trying to render synchronously during initialization, which avoids `window is not defined` or DOM-dependent work during SSR.
- Avoid direct access to `window`/`document` during render. Browser APIs are only touched inside event handlers or effects.

## Persistence

`lib/storage.ts` is an in-memory mock for the doc and comment threads. To swap in a real API/DB:

- Replace `loadDocument`/`saveDocument` with fetch calls to your backend.
- Replace `upsertThread`/`deleteThread`/`listThreads` similarly.
- Keep the shape `{ id, text }` to preserve compatibility with the mark attributes.

## Implementation Details

- The `comment` Mark uses `inclusive: false` so marks don’t “grow” when typing at edges.
- HTML rendering: `span.comment-mark[data-comment-id][data-comment-text]`.
- A ProseMirror plugin (`handleDOMEvents.click`) calls the provided `onClick` option to display the popover.
- Toolbar and bubble menu expose `setComment({ id, text })` and `unsetComment()` commands.
- A helper `extractCommentRangesFromJSON` is included for future side panels/debugging.
- Bonus: a “Copy doc JSON” button is included, and a `scrollToComment(id)` helper is wired from the popover.

