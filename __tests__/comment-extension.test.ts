import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Comment } from '@/lib/tiptap-comment'

describe('comment mark extension', () => {
  function createEditor(initial = 'Hello world') {
    const editor = new Editor({
      extensions: [StarterKit, Comment],
      content: `<p>${initial}</p>`,
      immediatelyRender: false,
    })
    return editor
  }

  it('adds and removes comment mark', () => {
    const editor = createEditor('Hello world')
    // select "Hello"
    editor.chain().setTextSelection({ from: 2, to: 7 }).run()
    editor.chain().setComment({ id: 'c1', text: 'note' }).run()

    const json = editor.getJSON()
    // find a text node with marks of type comment
    let found = false
    const walk = (node: any) => {
      if (!node) return
      if (node.marks?.some((m: any) => m.type === 'comment' && m.attrs?.id === 'c1' && m.attrs?.text === 'note')) {
        found = true
      }
      if (node.content) node.content.forEach(walk)
    }
    walk(json)
    expect(found).toBe(true)

    // Now remove
    editor.chain().unsetComment().run()
    const json2 = editor.getJSON()
    let still = false
    const walk2 = (node: any) => {
      if (!node) return
      if (node.marks?.some((m: any) => m.type === 'comment')) still = true
      if (node.content) node.content.forEach(walk2)
    }
    walk2(json2)
    expect(still).toBe(false)
  })
})

