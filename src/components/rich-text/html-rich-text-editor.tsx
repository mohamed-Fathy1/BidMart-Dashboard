import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Editor } from '@tiptap/core'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function LinkToolbarButton({
  editor,
  disabled,
}: {
  editor: Editor
  disabled: boolean
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('https://')

  function handleOpen(next: boolean) {
    if (next) {
      const href = editor.getAttributes('link').href as string | undefined
      setUrl(href ?? 'https://')
    }
    setOpen(next)
  }

  function applyLink() {
    const trimmed = url.trim()
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
    }
    setOpen(false)
  }

  const active = editor.isActive('link')

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label={t('settings:content.toolbar.link')}
              aria-pressed={active}
              className={cn(
                active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
              )}
            >
              <Link2 className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('settings:content.toolbar.link')}</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80" align="start">
        <PopoverHeader>
          <PopoverTitle>{t('settings:content.toolbar.link_dialog_title')}</PopoverTitle>
        </PopoverHeader>
        <div className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rich-text-link-url">{t('settings:content.toolbar.link_url')}</Label>
            <Input
              id="rich-text-link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyLink()
                }
              }}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setUrl('')
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                setOpen(false)
              }}
            >
              {t('settings:content.toolbar.link_remove')}
            </Button>
            <Button type="button" size="sm" onClick={applyLink}>
              {t('settings:content.toolbar.link_apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
  /** Skip onUpdate while syncing props → editor (TipTap normalizes HTML on load). */
  const suppressOnUpdateRef = useRef(true)

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
      shouldRerenderOnTransaction: true,
      editorProps: {
        attributes: {
          dir,
          class: cn(
            'min-h-[360px] max-w-prose px-4 py-3 text-sm leading-relaxed text-foreground outline-none',
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
        if (suppressOnUpdateRef.current) return
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
    suppressOnUpdateRef.current = true
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
    const id = window.setTimeout(() => {
      suppressOnUpdateRef.current = false
    }, 0)
    return () => window.clearTimeout(id)
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

  const toolbarDisabled = disabled

  return (
    <div
      className={cn(
        'flex min-h-[420px] flex-col overflow-hidden rounded-md border border-border bg-card',
        disabled && 'opacity-60',
        className,
      )}
    >
      <div
        className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5"
        role="toolbar"
        aria-label={t('settings:content.toolbar.label')}
      >
        <ToolbarButton
          label={t('settings:content.toolbar.bold')}
          active={editor.isActive('bold')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.italic')}
          active={editor.isActive('italic')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <ToolbarButton
          label={t('settings:content.toolbar.heading2')}
          active={editor.isActive('heading', { level: 2 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.heading3')}
          active={editor.isActive('heading', { level: 3 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <ToolbarButton
          label={t('settings:content.toolbar.bullet_list')}
          active={editor.isActive('bulletList')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.ordered_list')}
          active={editor.isActive('orderedList')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.blockquote')}
          active={editor.isActive('blockquote')}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <LinkToolbarButton editor={editor} disabled={toolbarDisabled} />

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <ToolbarButton
          label={t('settings:content.toolbar.undo')}
          disabled={toolbarDisabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('settings:content.toolbar.redo')}
          disabled={toolbarDisabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'flex-1 overflow-y-auto bg-background',
          '[&_.tiptap]:mx-auto [&_.tiptap]:w-full',
          '[&_.ProseMirror-focused]:outline-none',
        )}
      />
    </div>
  )
}
