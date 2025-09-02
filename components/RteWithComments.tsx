"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Comment, type CommentAttrs } from '@/lib/tiptap-comment'
import { listThreads, loadDocument, saveDocument, upsertThread, deleteThread } from '@/lib/storage'
import type { CommentThread } from '@/lib/types'
import clsx from 'clsx'

type PopoverState = {
  open: boolean
  id: string | null
  text: string
  x: number
  y: number
}

export default function RteWithComments() {
  const [commentMode, setCommentMode] = useState<boolean>(true)
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [popover, setPopover] = useState<PopoverState>({ open: false, id: null, text: '', x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  const initialContent = useMemo(() => loadDocument(), [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Comment.configure({
        onClick: ({ id, text, event }) => {
          // Only show popover on click if mark is clicked
          const rect = (event.target as HTMLElement).getBoundingClientRect()
          const containerRect = containerRef.current?.getBoundingClientRect()
          const x = rect.left - (containerRect?.left ?? 0)
          const y = rect.bottom - (containerRect?.top ?? 0) + 6
          setPopover({ open: true, id, text, x, y })
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'editor-content focus:outline-none',
      },
    },
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      saveDocument(json)
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    setThreads(listThreads())
  }, [])

  const selectionExists = !!editor?.state.selection && !editor?.state.selection.empty

  const addComment = useCallback(async () => {
    if (!editor || !selectionExists) return
    const text = window.prompt('Comment text?') ?? ''
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())
    const attrs: CommentAttrs = { id, text }
    editor.chain().focus().setComment(attrs).run()
    const thread: CommentThread = { id, text }
    upsertThread(thread)
    setThreads(listThreads())
  }, [editor, selectionExists])

  const removeCommentOnSelection = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetComment().run()
  }, [editor])

  const copyDocJson = useCallback(async () => {
    if (!editor) return
    const json = JSON.stringify(editor.getJSON(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      // simple feedback
      alert('Doc JSON copied to clipboard')
    } catch {
      // fallback
      console.log(json)
    }
  }, [editor])

  const deleteSpecificComment = useCallback(() => {
    if (!editor || !popover.id) return
    // Resolve position from last click coordinates
    const view = editor.view
    const coords = { left: popover.x + (containerRef.current?.getBoundingClientRect().left ?? 0), top: popover.y + (containerRef.current?.getBoundingClientRect().top ?? 0) }
    const pos = view.posAtCoords(coords as any)?.pos
    if (typeof pos === 'number') {
      // Set selection to encompass the mark range with this id, then unset
      const $pos = editor.state.doc.resolve(pos)
      // Find range: walk marks at $pos
      const markType = editor.schema.marks.comment
      // naive scan around pos to find the mark range
      let from = $pos.pos, to = $pos.pos
      // expand left
      while (from > 0) {
        const $from = editor.state.doc.resolve(from)
        const marks = markType.isInSet($from.marks())
        if (!marks) break
        if (marks.attrs?.id !== popover.id) break
        from--
      }
      // expand right
      const size = editor.state.doc.content.size
      while (to < size) {
        const $to = editor.state.doc.resolve(to)
        const marks = markType.isInSet($to.marks())
        if (!marks) break
        if (marks.attrs?.id !== popover.id) break
        to++
      }
      if (to > from) {
        editor.chain().focus().setTextSelection({ from: from + 1, to }).unsetComment().run()
      }
    }
    // remove the thread metadata as well
    deleteThread(popover.id)
    setThreads(listThreads())
    setPopover({ open: false, id: null, text: '', x: 0, y: 0 })
  }, [editor, popover, setThreads])

  const scrollToComment = useCallback((id: string) => {
    if (typeof document === 'undefined') return
    const el = document.querySelector(`[data-comment-id="${id}"]`)
    if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  if (!editor) {
    return (
      <div className="space-y-4">
        <div className="editor-toolbar">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={commentMode} onChange={(e) => setCommentMode(e.target.checked)} />
            <span>Comment mode</span>
          </label>
          <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 cursor-not-allowed" disabled>
            Add comment
          </button>
          <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 cursor-not-allowed" disabled>
            Remove comment
          </button>
        </div>
        <div className="editor-content">Loading editor…</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={commentMode}
            onChange={(e) => setCommentMode(e.target.checked)}
          />
          <span>Comment mode</span>
        </label>

        <button
          className={clsx(
            'px-3 py-1.5 rounded',
            commentMode && selectionExists ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          )}
          disabled={!(commentMode && selectionExists)}
          onClick={addComment}
        >
          Add comment
        </button>

        <button
          className={clsx(
            'px-3 py-1.5 rounded',
            selectionExists ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-700'
          )}
          disabled={!selectionExists}
          onClick={removeCommentOnSelection}
        >
          Remove comment
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={copyDocJson}>
            Copy doc JSON
          </button>
        </div>
      </div>

      {/* Bubble menu shown when selecting text and comment mode is on */}
      {commentMode && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }} shouldShow={({ editor }) => !editor.state.selection.empty}>
          <button
            className="px-2 py-1 rounded bg-blue-600 text-white text-sm"
            onClick={addComment}
          >
            Add comment
          </button>
        </BubbleMenu>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Popover for clicking on a comment mark */}
      {popover.open && (
        <div className="comment-popover" style={{ left: popover.x, top: popover.y }}>
          <div className="font-medium mb-1">Comment</div>
          <div className="text-gray-700 whitespace-pre-wrap mb-2">{popover.text || '(no text)'}</div>
          <div className="flex gap-2">
            <button
              className="px-2 py-1 rounded bg-rose-600 text-white text-sm"
              onClick={deleteSpecificComment}
            >
              Delete
            </button>
            {popover.id && (
              <button
                className="px-2 py-1 rounded bg-gray-100 text-gray-900 text-sm"
                onClick={() => scrollToComment(popover.id!)}
              >
                Scroll to
              </button>
            )}
            <button
              className="ml-auto px-2 py-1 rounded bg-gray-100 text-gray-900 text-sm"
              onClick={() => setPopover({ open: false, id: null, text: '', x: 0, y: 0 })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
