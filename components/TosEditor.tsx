//components/TosEditor.tsx

'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'

type Props = {
    content: string
    onChange: (html: string) => void
}

const btn = (active: boolean) =>
    `px-2 py-1 rounded text-xs transition-colors ${active
        ? 'bg-purple-600 text-white'
        : 'hover:bg-white/10 text-gray-400 hover:text-white'}`

export default function TosEditor({ content, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content,
        onCreate: ({ editor }) => {
            console.log('TosEditor mounted, content:', editor.getHTML())
        },
        onUpdate: ({ editor }) => {
            console.log('html:', editor.getHTML())
            onChange(editor.getHTML())
        },
    })
    console.log('editor state:', editor)
    if (!editor) return <div>editor is null</div>

    return (
        <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btn(editor.isActive('bold'))}>B</button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btn(editor.isActive('italic'))}><em>I</em></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={btn(editor.isActive('underline'))}><u>U</u></button>
                <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={btn(editor.isActive('heading', { level: 2 }))}>H2</button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={btn(editor.isActive('heading', { level: 3 }))}>H3</button>
                <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={btn(editor.isActive('bulletList'))}>• List</button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={btn(editor.isActive('orderedList'))}>1. List</button>
                <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={btn(editor.isActive({ textAlign: 'left' }))}>←</button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={btn(editor.isActive({ textAlign: 'center' }))}>↔</button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={btn(editor.isActive({ textAlign: 'right' }))}>→</button>
                <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={btn(editor.isActive('blockquote'))}>❝</button>
                <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className={btn(false)}>—</button>
            </div>

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]"
            />
        </div>
    )
}