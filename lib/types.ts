export type CommentThread = {
  id: string
  text: string
}

// TipTap JSON content type (lightweight subset)
export type JSONContent = {
  type?: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  marks?: { type: string; attrs?: Record<string, any> }[]
  text?: string
}

