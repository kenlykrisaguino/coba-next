"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import { getMarkRange } from '@tiptap/core'
import { Comment, type CommentAttrs } from '@/lib/tiptap-comment'
import { extractCommentRangesFromJSON, findCommentRangeAtPosById } from '@/lib/tiptap-comment'
import { listThreads, loadDocument, saveDocument, upsertThread, deleteThread } from '@/lib/storage'
import type { CommentThread } from '@/lib/types'
import clsx from 'clsx'
import { Plugin } from 'prosemirror-state'

enum EditorMode {
  StudentInput = 'student_input',
  StudentView = 'student_view',
  TeacherComment = 'teacher_comment',
}

type ModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (text: string) => void
  threads: CommentThread[]
  onNavigate: (id: string) => void
}

function CommentModal({ open, onClose, onSubmit, threads, onNavigate }: ModalProps) {
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!open) {
      setText('')
      setQuery('')
      setIdx(0)
    }
  }, [open])

  const matches = useMemo(() => {
    if (!query) return threads
    const q = query.toLowerCase()
    return threads.filter(t => t.text.toLowerCase().includes(q))
  }, [threads, query])

  useEffect(() => {
    if (idx >= matches.length) setIdx(0)
  }, [matches, idx])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Add Comment</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          className="w-full border rounded-md p-2 mb-3 focus:outline-none focus:ring focus:ring-blue-200"
          rows={3}
          placeholder="Write your comment..."
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium">Find comments</label>
            <input
              className="flex-1 border rounded-md p-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Search existing comments"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <span className="text-xs text-gray-500">{matches.length} match</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={() => {
                const nextIdx = (idx - 1 + matches.length) % Math.max(matches.length, 1)
                setIdx(nextIdx)
                if (matches.length) onNavigate(matches[nextIdx].id)
              }}
            >Prev</button>
            <button
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={() => {
                const nextIdx = (idx + 1) % Math.max(matches.length, 1)
                setIdx(nextIdx)
                if (matches.length) onNavigate(matches[nextIdx].id)
              }}
            >Next</button>
            <span className="text-xs text-gray-500">{matches.length ? `${idx + 1}/${matches.length}` : '0/0'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={() => { onSubmit(text); onClose() }}
            disabled={!text.trim()}
          >Save</button>
          <button className="px-3 py-1.5 rounded bg-gray-100" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function Icon({ name, className }: { name: string; className?: string }) {
  const common = "w-4 h-4"
  switch (name) {
    case 'bold':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h6a4 4 0 010 8H7V5zm0 10h7a4 4 0 010 8H7v-8z"/></svg>)
    case 'italic':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z"/></svg>)
    case 'strike':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h16v2H4zM7 17h10v2H7zM7 5h10v2H7z"/></svg>)
    case 'ul':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 5h2v2H3zM3 11h2v2H3zM3 17h2v2H3z"/></svg>)
    case 'ol':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h14v2H7zM7 11h14v2H7zM7 17h14v2H7zM3 6h2V4H2v1h1zm-1 6h3v-1H3v-.5h2v-1H2v2.5zM3 18h2v1H3v1h3v-1H5v-1h1v-1H2v1z"/></svg>)
    case 'quote':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h6v6H7zM13 7h6v6h-6zM9 9v2h2V9zM15 9v2h2V9z"/></svg>)
    case 'code':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L8 18l-6-6 6-6 1.4 1.4L4.8 12zM14.6 7.4L16 6l6 6-6 6-1.4-1.4L19.2 12z"/></svg>)
    case 'undo':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6a6 6 0 01-6 6H6v-2h6a4 4 0 000-8H8V7z"/></svg>)
    case 'redo':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6a6 6 0 006 6h6v-2h-6a4 4 0 110-8h4V7z"/></svg>)
    case 'comment':
      return (<svg className={clsx(common, className)} viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v12H7l-3 3V4z"/></svg>)
    default:
      return null
  }
}

type PopoverState = {
  open: boolean
  id: string | null
  text: string
  x: number
  y: number
}

export default function RteWithComments() {
  const [mode, setMode] = useState<EditorMode>(EditorMode.StudentInput)
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [popover, setPopover] = useState<PopoverState>({ open: false, id: null, text: '', x: 0, y: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const addBtnPos = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const modeRef = useRef<EditorMode>(mode)
  modeRef.current = mode

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
      // Guard plugin based on current mode
      // - StudentInput: allow edits but block comment mark changes
      // - StudentView: block any doc changes
      // - TeacherComment: allow only comment mark add/remove
      // Use a ref so mode updates are observed
      Extension.create({
        name: 'modeGuard',
        addProseMirrorPlugins() {
          return [
            new Plugin({
              filterTransaction(tr, state) {
                const m = modeRef.current
                if (!tr.docChanged) return true
                const steps = (tr as any).steps || []
                if (m === EditorMode.StudentView) {
                  return false
                }
                const schema = state.schema
                const commentMark = schema.marks.comment
                const isAddOrRemoveCommentOnly = steps.every((s: any) => {
                  const type = s.constructor && s.constructor.name
                  if (type === 'AddMarkStep' || type === 'RemoveMarkStep') {
                    const mark = s.mark
                    return mark && mark.type === commentMark
                  }
                  return false
                })
                if (m === EditorMode.TeacherComment) {
                  return isAddOrRemoveCommentOnly
                }
                if (m === EditorMode.StudentInput) {
                  // Allow all edits except adding new comment marks.
                  // Removing existing comment marks is allowed.
                  const blocksAddComment = steps.some((s: any) => {
                    const type = s.constructor && s.constructor.name
                    if (type === 'AddMarkStep') {
                      const mark = s.mark
                      return mark && mark.type === commentMark
                    }
                    return false
                  })
                  return !blocksAddComment
                }
                return true
              },
            }),
          ]
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
      // Reconcile threads: remove any thread ids that no longer exist in doc
      try {
        const ranges = extractCommentRangesFromJSON(json)
        const present = new Set(ranges.map(r => r.id))
        const all = listThreads()
        for (const t of all) {
          if (!present.has(t.id)) {
            deleteThread(t.id)
          }
        }
        setThreads(listThreads())
      } catch {}
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    setThreads(listThreads())
  }, [])

  const selectionExists = !!editor?.state.selection && !editor?.state.selection.empty

  // Track selection to compute "after block" comment button position
  useEffect(() => {
    if (!editor) return
    const updatePos = () => {
      const sel = editor.state.selection
      if (sel.empty) {
        addBtnPos.current = null
        return
      }
      const $to = editor.state.doc.resolve(sel.to)
      // Only if selection is within a single block
      const $from = editor.state.doc.resolve(sel.from)
      if ($from.blockRange($to) == null) {
        addBtnPos.current = null
        return
      }
      // Find DOM node at end
      const coords = editor.view.coordsAtPos(sel.to)
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return
      addBtnPos.current = {
        x: coords.right - containerRect.left + 8,
        y: coords.bottom - containerRect.top - 20,
      }
    }
    updatePos()
    editor.on('selectionUpdate', updatePos)
    editor.on('transaction', updatePos)
    return () => {
      editor.off('selectionUpdate', updatePos)
      editor.off('transaction', updatePos)
    }
  }, [editor])

  // Helper: collect all comment ranges (unique by id+from)
  const collectCommentRanges = useCallback((): { id: string; from: number; to: number; text: string }[] => {
    if (!editor) return []
    const ranges: { id: string; from: number; to: number; text: string }[] = []
    const seen = new Set<string>()
    const commentType = editor.schema.marks.comment
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText) return
      const mark = commentType.isInSet(node.marks as any)
      if (!mark) return
      const id = mark.attrs?.id as string
      const text = mark.attrs?.text as string
      // Expand to full range by scanning left/right from pos
      let from = pos
      let to = pos + node.nodeSize
      // expand left
      while (from > 0) {
        const $p = editor.state.doc.resolve(from)
        const m = commentType.isInSet($p.marks())
        if (!m || m.attrs?.id !== id) break
        from--
      }
      // expand right
      const size = editor.state.doc.content.size
      while (to < size) {
        const $p = editor.state.doc.resolve(to)
        const m = commentType.isInSet($p.marks())
        if (!m || m.attrs?.id !== id) break
        to++
      }
      const key = `${id}:${from + 1}`
      if (!seen.has(key)) {
        seen.add(key)
        ranges.push({ id, from: from + 1, to, text })
      }
    })
    ranges.sort((a, b) => a.from - b.from)
    return ranges
  }, [editor])

  // Helper: precise range by id using getMarkRange at a position inside the mark
  const findRangeById = useCallback((id: string) => {
    if (!editor) return null
    const type = editor.schema.marks.comment
    let found: { from: number; to: number } | null = null
    editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node, pos) => {
      if (found) return false
      if (!node.isText) return
      const mark = type.isInSet(node.marks as any)
      if (!mark || mark.attrs?.id !== id) return
      // pos is before the text node; choose pos+1 to ensure inside
      const r = getMarkRange(editor.state.doc.resolve(Math.min(pos + 1, editor.state.doc.content.size - 1)), type, { id }) as any
      if (r) found = { from: r.from, to: r.to }
      return false
    })
    return found
  }, [editor])

  // Keyboard navigation + deletion for comments in Student Input mode
  useEffect(() => {
    if (!editor) return
    const getActiveCommentRange = () => {
      const { $from } = editor.state.selection as any
      const commentType = editor.schema.marks.comment
      const range = getMarkRange($from, commentType) as { from: number; to: number } | null
      if (!range) return null
      // derive id from first text node having the mark within range
      let foundId: string | null = null
      editor.state.doc.nodesBetween(range.from, range.to, (node) => {
        if (foundId) return false
        if (!node.isText) return
        const mark = commentType.isInSet(node.marks as any)
        if (mark && typeof mark.attrs?.id === 'string') {
          foundId = mark.attrs.id
          return false
        }
        return
      })
      return { id: foundId || '', from: range.from, to: range.to }
    }
    const onKey = (e: KeyboardEvent) => {
      if (modeRef.current !== EditorMode.StudentInput) return
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Delete' && e.key !== 'Backspace') return
      const ranges = collectCommentRanges()
      if (!ranges.length) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // If selection currently inside a comment, remove it fully and delete thread
        const range = getActiveCommentRange()
        if (range) {
          e.preventDefault()
          editor.chain().focus().setTextSelection({ from: range.from, to: range.to }).unsetComment().run()
          if (range.id) {
            deleteThread(range.id)
            setThreads(listThreads())
          }
        }
        return
      }
      e.preventDefault()
      const selFrom = editor.state.selection.from
      if (e.key === 'ArrowDown') {
        const next = ranges.find(r => r.from > selFrom) || ranges[0]
        editor.chain().focus().setTextSelection({ from: next.from, to: next.to }).scrollIntoView().run()
      } else if (e.key === 'ArrowUp') {
        let idx = ranges.findIndex(r => r.from >= selFrom)
        if (idx === -1) idx = ranges.length
        const prev = ranges[(idx - 1 + ranges.length) % ranges.length]
        editor.chain().focus().setTextSelection({ from: prev.from, to: prev.to }).scrollIntoView().run()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editor, collectCommentRanges])

  const addComment = useCallback(async (text: string) => {
    if (!editor || !selectionExists) return
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

  const navigateToNextComment = useCallback(() => {
    if (!editor) return
    const ranges = collectCommentRanges()
    if (!ranges.length) return
    const selFrom = editor.state.selection.from
    const next = ranges.find(r => r.from > selFrom) || ranges[0]
    editor.chain().focus().setTextSelection({ from: next.from, to: next.to }).scrollIntoView().run()
  }, [editor, collectCommentRanges])

  const navigateToPrevComment = useCallback(() => {
    if (!editor) return
    const ranges = collectCommentRanges()
    if (!ranges.length) return
    const selFrom = editor.state.selection.from
    let idx = ranges.findIndex(r => r.from >= selFrom)
    if (idx === -1) idx = ranges.length
    const prev = ranges[(idx - 1 + ranges.length) % ranges.length]
    editor.chain().focus().setTextSelection({ from: prev.from, to: prev.to }).scrollIntoView().run()
  }, [editor, collectCommentRanges])

  const deleteSpecificComment = useCallback(() => {
    if (!editor || !popover.id) return
    // Find by id using precise range, then unset
    const target = findRangeById(popover.id)
    if (target) editor.chain().focus().setTextSelection(target).unsetComment().run()
    // remove the thread metadata as well
    deleteThread(popover.id)
    setThreads(listThreads())
    setPopover({ open: false, id: null, text: '', x: 0, y: 0 })
  }, [editor, popover, setThreads, findRangeById])

  const scrollToComment = useCallback((id: string) => {
    if (!editor) return
    const target = findRangeById(id)
    if (!target) return
    editor.chain().focus().setTextSelection(target).scrollIntoView().run()
    // Reposition popover near end of selection
    const containerRect = containerRef.current?.getBoundingClientRect()
    const coords = editor.view.coordsAtPos(target.to)
    const x = coords.left - (containerRect?.left ?? 0)
    const y = coords.bottom - (containerRect?.top ?? 0) + 6
    // We keep same text from existing popover if any
    setPopover((p) => ({ open: true, id, text: p.text, x, y }))
  }, [editor, findRangeById])

  if (!editor) {
    return (
      <div className="space-y-4">
        <div className="editor-toolbar">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mode:</span>
            <div className="inline-flex border rounded-md overflow-hidden">
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700">Siswa Input</button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-500">Siswa View</button>
              <button className="px-3 py-1.5 bg-gray-100 text-gray-500">Teacher Comment</button>
            </div>
          </div>
        </div>
        <div className="editor-content">Loading editor…</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative" ref={containerRef}>
      {/* Toolbar with icons and mode switch */}
      <div className="editor-toolbar">
        <div className="flex items-center gap-1">
          <button
            className={clsx('px-2 py-1 rounded text-xs font-medium', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >H1</button>
          <button
            className={clsx('px-2 py-1 rounded text-xs font-medium', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >H2</button>
          <button
            className={clsx('px-2 py-1 rounded text-xs font-medium', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >H3</button>
          <span className="inline-block w-px h-5 bg-gray-200 mx-1" />
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('bold') && 'bg-gray-100 font-semibold')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleBold().run()}
            title="Bold"
          ><Icon name="bold" /></button>
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('italic') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleItalic().run()}
            title="Italic"
          ><Icon name="italic" /></button>
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('strike') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleStrike().run()}
            title="Strike"
          ><Icon name="strike" /></button>
          <span className="inline-block w-px h-5 bg-gray-200 mx-1" />
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('bulletList') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          ><Icon name="ul" /></button>
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('orderedList') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          ><Icon name="ol" /></button>
          <span className="inline-block w-px h-5 bg-gray-200 mx-1" />
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('blockquote') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          ><Icon name="quote" /></button>
          <button
            className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100', editor.isActive('codeBlock') && 'bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          ><Icon name="code" /></button>
          <span className="inline-block w-px h-5 bg-gray-200 mx-1" />
          <button className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')} onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().undo().run()} title="Undo"><Icon name="undo" /></button>
          <button className={clsx('p-2 rounded', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')} onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().redo().run()} title="Redo"><Icon name="redo" /></button>
          <span className="inline-block w-px h-5 bg-gray-200 mx-1" />
          <button
            className={clsx('px-2 py-1 rounded text-xs', mode !== EditorMode.StudentInput ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100')}
            onClick={() => mode === EditorMode.StudentInput && editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear formatting"
          >Clear</button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {(() => {
            const ranges = collectCommentRanges()
            const uniqueCount = new Set(ranges.map(r => r.id)).size
            const has = uniqueCount > 0
            return (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{uniqueCount} comment{uniqueCount !== 1 ? 's' : ''}</span>
                <button
                  className={clsx('px-2 py-1 rounded text-sm', has ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}
                  onClick={navigateToPrevComment}
                  disabled={!has}
                  title="Prev (Arrow Up)"
                >↑</button>
                <button
                  className={clsx('px-2 py-1 rounded text-sm', has ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}
                  onClick={navigateToNextComment}
                  disabled={!has}
                  title="Next (Arrow Down)"
                >↓</button>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* After-block Add Comment button (only in TeacherComment mode) */}
      {mode === EditorMode.TeacherComment && selectionExists && addBtnPos.current && (
        <button
          className="absolute px-2 py-1 rounded bg-blue-600 text-white text-sm shadow"
          style={{ left: addBtnPos.current.x, top: addBtnPos.current.y }}
          onClick={() => setModalOpen(true)}
          title="Add comment"
        >
          <span className="inline-flex items-center gap-1"><Icon name="comment" /> Comment</span>
        </button>
      )}

      {/* Popover for clicking on a comment mark */}
      {popover.open && (
        <div className="comment-popover" style={{ left: popover.x, top: popover.y }}>
          <div className="flex items-start justify-between mb-1">
            <div className="font-medium">Comment</div>
            <button
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
              onClick={() => setPopover({ open: false, id: null, text: '', x: 0, y: 0 })}
            >✕</button>
          </div>
          <div className="text-gray-700 whitespace-pre-wrap mb-2">{popover.text || '(no text)'}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm inline-flex items-center gap-1"
              onClick={deleteSpecificComment}
            >
              Solved <span>✓</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      <CommentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(t) => addComment(t)}
        threads={threads}
        onNavigate={(id) => scrollToComment(id)}
      />

      {/* Floating mode switch */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white shadow-lg border rounded-full p-1 flex items-center gap-1">
          <button
            className={clsx('w-9 h-9 rounded-full text-xs font-medium', mode === EditorMode.StudentInput ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}
            title="Student Input"
            onClick={() => setMode(EditorMode.StudentInput)}
          >ST</button>
          <button
            className={clsx('w-9 h-9 rounded-full text-xs font-medium', mode === EditorMode.StudentView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}
            title="Read Only"
            onClick={() => setMode(EditorMode.StudentView)}
          >RO</button>
          <button
            className={clsx('w-9 h-9 rounded-full text-xs font-medium', mode === EditorMode.TeacherComment ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800')}
            title="Teacher Comment"
            onClick={() => setMode(EditorMode.TeacherComment)}
          >TE</button>
        </div>
      </div>
    </div>
  )
}
