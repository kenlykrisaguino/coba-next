import { Mark, mergeAttributes, getMarkRange, type Range } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'

export type CommentAttrs = {
  id: string
  text?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (attrs: CommentAttrs) => ReturnType
      unsetComment: () => ReturnType
    }
  }
}

export interface CommentOptions {
  onClick?: (payload: { id: string; text: string; event: MouseEvent }) => void
}

// Mark extension to attach inline comments with {id, text}
export const Comment = Mark.create<CommentOptions>({
  name: 'comment',

  inclusive() {
    // Do not expand while typing at edges
    return false
  },

  addOptions() {
    return {
      onClick: undefined,
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        renderHTML: (attrs) => ({ 'data-comment-id': attrs.id }),
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-comment-id'),
      },
      text: {
        default: '',
        renderHTML: (attrs) => ({ 'data-comment-text': attrs.text ?? '' }),
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-comment-text') || '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]'
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'comment-mark' }),
      0,
    ]
  },

  addCommands() {
    return {
      setComment:
        (attrs: CommentAttrs) =>
          ({ chain }) => chain().setMark(this.name, attrs).run(),
      unsetComment:
        () => ({ chain }) => chain().unsetMark(this.name).run(),
    }
  },

  addProseMirrorPlugins() {
    const onClick = this.options.onClick
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            click: (_view, event) => {
              const target = event.target as HTMLElement | null
              if (!target) return false
              const el = target.closest('[data-comment-id]') as HTMLElement | null
              if (!el) return false
              const id = el.getAttribute('data-comment-id') || ''
              const text = el.getAttribute('data-comment-text') || ''
              if (onClick) onClick({ id, text, event: event as MouseEvent })
              return false
            },
          },
        },
      }),
    ]
  },
})

// Helper: extract all comment ranges from TipTap JSON
export type CommentRange = Range & { id: string; text: string }

export function extractCommentRangesFromJSON(doc: any): CommentRange[] {
  const result: CommentRange[] = []

  function walk(node: any, pos: number) {
    if (!node) return pos
    if (node.type === 'text') {
      const text = node.text || ''
      const len = text.length
      const marks = (node.marks || []) as { type: string; attrs?: Record<string, any> }[]
      const commentMarks = marks.filter(m => m.type === 'comment')
      if (commentMarks.length) {
        commentMarks.forEach(m => {
          result.push({ from: pos, to: pos + len, id: m.attrs?.id ?? '', text: m.attrs?.text ?? '' })
        })
      }
      return pos + len
    }
    let cur = pos
    const content = node.content || []
    for (const child of content) {
      cur = walk(child, cur)
    }
    return cur
  }

  walk(doc, 0)
  return result
}

// Helper: find range for a comment mark by id at a specific position
export function findCommentRangeAtPosById(editor: any, pos: number, id: string): Range | null {
  const type = editor.schema.marks.comment
  const $pos = editor.state.doc.resolve(pos)
  return getMarkRange($pos, type, { id })
}

