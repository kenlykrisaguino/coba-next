import type { CommentThread, JSONContent } from './types'

// Simple in-memory store. Swap with API/DB easily.
let currentDoc: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Select some text, then add comments. ' },
        { type: 'text', text: 'Toggle Comment mode to annotate ranges inline.' },
      ],
    },
  ],
}

const threads = new Map<string, CommentThread>()

export function loadDocument(): JSONContent {
  return currentDoc
}

export function saveDocument(doc: JSONContent): void {
  currentDoc = doc
}

export function upsertThread(thread: CommentThread): void {
  threads.set(thread.id, thread)
}

export function deleteThread(id: string): void {
  threads.delete(id)
}

export function listThreads(): CommentThread[] {
  return Array.from(threads.values())
}

