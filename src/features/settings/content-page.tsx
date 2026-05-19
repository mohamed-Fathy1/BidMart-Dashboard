import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useResourceMutation } from '@/lib/use-resource-mutation'
import { Loader2, Save, Clock, Hash, Code2, Eye, Pencil } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS, usePermission } from '@/lib/permissions'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  HtmlRichTextEditor,
  type HtmlRichTextEditorHandle,
} from '@/components/rich-text/html-rich-text-editor'
import {
  getGeneralInfo,
  updateGeneralInfo,
  type ContentType,
} from './content.api'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CONTENT_TYPES: ContentType[] = ['PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'ABOUT_US']

const PREVIEW_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px; line-height: 1.75; color: #1c1c1e;
    padding: 20px 24px; margin: 0;
  }
  h1 { font-size: 1.375rem; font-weight: 700; margin: 0 0 1rem; }
  h2 { font-size: 1.0625rem; font-weight: 600; margin: 1.75rem 0 0.5rem; }
  h3 { font-size: 0.9375rem; font-weight: 600; margin: 1.25rem 0 0.375rem; }
  p  { margin: 0 0 0.875rem; }
  ul, ol { padding-inline-start: 1.5rem; margin: 0 0 0.875rem; }
  li { margin-bottom: 0.3rem; }
  a  { color: #3660B5; text-decoration: underline; }
  strong { font-weight: 600; }
  blockquote {
    border-inline-start: 3px solid #e5e5e5;
    margin: 0 0 1rem; padding: 0.25rem 0 0.25rem 1rem;
    color: #666;
  }
`.trim()

function buildSrcdoc(html: string, dir: 'ltr' | 'rtl' = 'ltr') {
  return `<!DOCTYPE html><html dir="${dir}" lang="${dir === 'rtl' ? 'ar' : 'en'}">
<head><meta charset="utf-8"><style>${PREVIEW_STYLES}</style></head>
<body>${html || '<p style="color:#aaa;font-style:italic">Nothing to preview yet.</p>'}</body>
</html>`
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

function useContentQuery(type: ContentType) {
  return useQuery({
    queryKey: ['general-info', type],
    queryFn: () => getGeneralInfo(type),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

function useUpdateContentMutation(type: ContentType) {
  const queryClient = useQueryClient()
  return useResourceMutation({
    mutationFn: (payload: { content_en: string; content_ar: string }) =>
      updateGeneralInfo(type, payload),
    successKey: 'settings:content.toasts.update_success',
    errorKey: 'settings:content.errors.update_failed',
    onSuccess: (updated) => {
      queryClient.setQueryData(['general-info', type], updated)
    },
  })
}

/* ------------------------------------------------------------------ */
/*  View-mode toggle                                                   */
/* ------------------------------------------------------------------ */

type ViewMode = 'editor' | 'code' | 'preview'

const VIEW_MODES: ViewMode[] = ['editor', 'code', 'preview']

const VIEW_MODE_ICONS = {
  editor: Pencil,
  code: Code2,
  preview: Eye,
} as const

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className="inline-flex items-center rounded-md border border-border bg-muted/60 p-0.5"
    >
      {VIEW_MODES.map((mode) => {
        const Icon = VIEW_MODE_ICONS[mode]
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-[background-color,color] duration-(--duration-hover)',
              value === mode
                ? 'bg-card text-foreground shadow-rest'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3" />
            {t(`settings:content.view_toggle.${mode}`)}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Editor column                                                      */
/* ------------------------------------------------------------------ */

function EditorColumn({
  label,
  value,
  placeholder,
  dir = 'ltr',
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  dir?: 'ltr' | 'rtl'
  disabled?: boolean
  onChange: (v: string) => void
}) {
  const [view, setView] = useState<ViewMode>('editor')
  const [previewHtml, setPreviewHtml] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const richTextRef = useRef<HtmlRichTextEditorHandle>(null)

  function handleViewChange(next: ViewMode) {
    if (view === 'editor' && richTextRef.current) {
      const html = richTextRef.current.getHtml()
      if (html !== value) onChange(html)
    }
    setView(next)
  }

  useEffect(() => {
    if (view === 'preview') {
      setPreviewHtml(value)
      return
    }
    if (view === 'editor') return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPreviewHtml(value), 350)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, view])

  useEffect(() => {
    setPreviewHtml(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <ViewToggle value={view} onChange={handleViewChange} />
      </div>

      {view === 'editor' ? (
        <HtmlRichTextEditor
          value={value}
          onChange={onChange}
          dir={dir}
          placeholder={placeholder}
          disabled={disabled}
          editorRef={richTextRef}
        />
      ) : view === 'code' ? (
        <Textarea
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[420px] resize-y font-mono text-xs leading-relaxed"
          spellCheck={false}
        />
      ) : (
        <div className="relative min-h-[420px] overflow-hidden rounded-md border border-border bg-white">
          <iframe
            srcDoc={buildSrcdoc(previewHtml, dir)}
            sandbox="allow-same-origin"
            title={`${label} preview`}
            className="h-full min-h-[420px] w-full border-0"
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Content tab                                                        */
/* ------------------------------------------------------------------ */

function ContentTab({ type }: { type: ContentType }) {
  const { t } = useTranslation()
  const canUpdate = usePermission(PERMISSIONS.settings.update)
  const { data, isLoading, isError } = useContentQuery(type)
  const mutation = useUpdateContentMutation(type)

  const [contentEn, setContentEn] = useState('')
  const [contentAr, setContentAr] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (data) {
      setContentEn(data.content_en ?? '')
      setContentAr(data.content_ar ?? '')
      setIsDirty(false)
    }
  }, [data])

  function handleChange(lang: 'en' | 'ar', value: string) {
    if (lang === 'en') setContentEn(value)
    else setContentAr(value)
    setIsDirty(true)
  }

  function handleSave() {
    mutation.mutate(
      { content_en: contentEn, content_ar: contentAr },
      { onSuccess: () => setIsDirty(false) },
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">{t('settings:content.errors.load_failed')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {data && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="size-3.5 shrink-0" />
            {t('settings:content.meta.version', { v: data.version })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5 shrink-0" />
            {t('settings:content.meta.updated_at', { date: format.dateTime(data.updated_at) })}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <EditorColumn
          label={t('settings:content.fields.content_en')}
          value={contentEn}
          placeholder={t('settings:content.fields.content_en_placeholder')}
          dir="ltr"
          disabled={!canUpdate}
          onChange={(v) => handleChange('en', v)}
        />
        <EditorColumn
          label={t('settings:content.fields.content_ar')}
          value={contentAr}
          placeholder={t('settings:content.fields.content_ar_placeholder')}
          dir="rtl"
          disabled={!canUpdate}
          onChange={(v) => handleChange('ar', v)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p
          className={cn(
            'text-sm transition-opacity duration-(--duration-hover)',
            isDirty ? 'text-amber-600 opacity-100' : 'opacity-0 select-none',
          )}
          aria-live="polite"
        >
          {t('settings:content.actions.unsaved')}
        </p>
        <Can permission={PERMISSIONS.settings.update}>
          <Button size="sm" onClick={handleSave} disabled={mutation.isPending || !isDirty}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {mutation.isPending
              ? t('settings:content.actions.saving')
              : t('settings:content.actions.save')}
          </Button>
        </Can>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ContentPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings:content.title')}
        description={t('settings:content.description')}
      />

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="PRIVACY_POLICY">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                {CONTENT_TYPES.map((type) => (
                  <TabsTrigger key={type} value={type}>
                    {t(`settings:content.types.${type}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <p className="text-xs text-muted-foreground">{t('settings:content.html_hint')}</p>
            </div>

            {CONTENT_TYPES.map((type) => (
              <TabsContent key={type} value={type}>
                <ContentTab type={type} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
