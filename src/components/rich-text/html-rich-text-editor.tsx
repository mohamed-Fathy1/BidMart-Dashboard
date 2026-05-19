import { useEffect, useImperativeHandle, useMemo, useRef, type ReactNode, type Ref } from 'react'
import { useTranslation } from 'react-i18next'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Quote,
  Redo2,
  Heading2,
  Heading3,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface HtmlRichTextEditorHandle {
  getHtml: () => string
}

interface HtmlRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  dir?: 'ltr' | 'rtl'
  placeholder?: string
  disabled?: boolean
  className?: string
  editorRef?: Ref<HtmlRichTextEditorHandle | null>
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-xs"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export function HtmlRichTextEditor({
  value,
  onChange,
  dir = 'ltr',
  placeholder,
  disabled = false,
  className,
  editorRef,
}: HtmlRichTextEditorProps) {
  const { t } = useTranslation()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-2',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
      }),
    ],
    [placeholder],
  )

  const editor = useEditor(
    {
      extensions,
      content: value,
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          dir,
          class: cn(
            'min-h-[380px] px-3 py-2 text-sm leading-relaxed text-foreground outline-none',
            'focus-visible:ring-0',
            '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold',
            '[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold',
            '[&_p]:mb-2 [&_p:last-child]:mb-0',
            '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:ps-5',
            '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:ps-5',
            '[&_li]:mb-0.5',
            '[&_blockquote]:mb-2 [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground',
            '[&_a]:text-primary [&_a]:underline',
          ),
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeRef.current(ed.getHTML())
      },
    },
    [extensions],
  )

  useImperativeHandle(editorRef, () => ({
    getHtml: () => editor?.getHTML() ?? value,
  }))

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          'min-h-[420px] animate-pulse rounded-md border border-border bg-muted/30',
          className,
        )}
      />
    )
  }

  const ed = editor

  function setLink() {
    const previous = ed.getAttributes('link').href as string | undefined
    const url = window.prompt(t('settings:content.toolbar.link_prompt'), previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      ed.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const toolbarDisabled = disabled

  return (
    <div
      className={cn(
        'flex min-h-[420px] flex-col overflow-hidden rounded-md border border-border bg-background',
        disabled && 'opacity-60',
        className,
      )}
    >
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1"
        role="toolbar"
        aria-label={t('settings:content.toolbar.label')}
      >
        <ToolbarButton
          label={t('settings:content.toolbar.bold')}
          active={editor.isActive('bold')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.italic')}
          active={editor.isActive('italic')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          label={t('settings:content.toolbar.heading2')}
          active={editor.isActive('heading', { level: 2 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.heading3')}
          active={editor.isActive('heading', { level: 3 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          label={t('settings:content.toolbar.bullet_list')}
          active={editor.isActive('bulletList')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.ordered_list')}
          active={editor.isActive('orderedList')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.blockquote')}
          active={editor.isActive('blockquote')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.link')}
          active={editor.isActive('link')}
          disabled={toolbarDisabled}
          onClick={setLink}
        >
          <Link2 className="size-3.5" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-5" />

        <ToolbarButton
          label={t('settings:content.toolbar.undo')}
          disabled={toolbarDisabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.redo')}
          disabled={toolbarDisabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-3.5" />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'flex-1 overflow-y-auto',
          '[&_.tiptap]:min-h-[380px]',
          '[&_.ProseMirror-focused]:outline-none',
        )}
      />
    </div>
  )
}
