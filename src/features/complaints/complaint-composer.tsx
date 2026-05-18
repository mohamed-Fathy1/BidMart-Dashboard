import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Info,
  Loader2,
  Paperclip,
  SendHorizonal,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  DEFAULT_IMAGE_MIME_TYPES,
  uploadFile,
  validateImageFile,
} from '@/lib/upload'
import type { ComplaintSocketStatus } from '@/features/complaints/complaint-socket'

interface ComplaintComposerProps {
  connectionStatus: ComplaintSocketStatus
  onSend: (payload: { text?: string; fileUrl?: string }) => void | Promise<void>
  onTyping: (active: boolean) => void
}

const TEXT_MAX = 1000

export function ComplaintComposer({
  connectionStatus,
  onSend,
  onTyping,
}: ComplaintComposerProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState<{
    url: string
    name: string
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)

  const isConnected = connectionStatus === 'connected'
  const isReady = isConnected && !uploading && !sending
  const trimmed = text.trim()
  const canSend = isReady && (trimmed.length > 0 || !!pendingImage)

  const connectionLabel =
    connectionStatus === 'connecting'
      ? t('complaints:chat.connecting')
      : connectionStatus === 'reconnecting'
        ? t('complaints:chat.reconnecting')
        : connectionStatus === 'disconnected'
          ? t('complaints:chat.disconnected')
          : null

  function handleTextChange(value: string) {
    setText(value)
    if (value.trim().length > 0 && isConnected) {
      onTyping(true)
    } else {
      onTyping(false)
    }
  }

  async function handleFileSelected(file: File) {
    const error = validateImageFile(file)
    if (error === 'invalid_type') {
      toast.error(t('common:errors.unsupported_image_type', { defaultValue: 'Unsupported image type.' }))
      return
    }
    if (error === 'too_large') {
      toast.error(t('complaints:chat.image_too_large', { defaultValue: 'Image is over 5 MB.' }))
      return
    }
    setUploading(true)
    try {
      const url = await uploadFile(file, 'chat_media')
      setPendingImage({ url, name: file.name })
    } catch {
      toast.error(t('complaints:chat.send_failed'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function submit() {
    if (!canSend) return
    const textPayload = trimmed.length > 0 ? trimmed : undefined
    const imagePayload = pendingImage?.url
    setSending(true)
    try {
      await onSend({ text: textPayload, fileUrl: imagePayload })
      setText('')
      setPendingImage(null)
      onTyping(false)
    } catch {
      toast.error(t('complaints:chat.send_failed'))
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      if (e.shiftKey) return
      if (e.metaKey || e.ctrlKey || !e.altKey) {
        // Enter (no modifier) and Cmd/Ctrl+Enter both submit; Shift+Enter inserts a newline.
        e.preventDefault()
        submit()
      }
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="space-y-1.5 border-t border-border bg-muted/30 px-4 py-2.5 sm:px-5"
    >
      {pendingImage && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs">
          <img
            src={pendingImage.url}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-foreground">{pendingImage.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {t('complaints:chat.image_attached', {
                defaultValue: 'Ready to send',
              })}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPendingImage(null)}
            aria-label={t('complaints:chat.composer.attach_remove')}
          >
            <X className="size-3.5" aria-hidden />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('complaints:chat.attach_image')}
          disabled={!isReady}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
          ) : (
            <Paperclip className="size-4" aria-hidden />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={DEFAULT_IMAGE_MIME_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFileSelected(file)
          }}
        />

        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={TEXT_MAX}
          placeholder={t('complaints:chat.input_placeholder')}
          disabled={!isConnected}
          className={cn(
            'min-h-[44px] max-h-[140px] resize-none rounded-xl',
            'field-sizing-content',
          )}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={t('complaints:chat.send')}
          className="rounded-xl"
        >
          {sending ? (
            <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
          ) : (
            <SendHorizonal className="size-4 rtl:rotate-180" aria-hidden />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          {connectionLabel ? (
            <>
              <Info className="size-3.5" aria-hidden />
              <span>{connectionLabel}</span>
            </>
          ) : (
            <span>{t('complaints:chat.composer.shortcut_hint')}</span>
          )}
        </span>
        {trimmed.length >= TEXT_MAX - 100 && (
          <span className="font-mono tabular-nums">
            {trimmed.length} / {TEXT_MAX}
          </span>
        )}
      </div>
    </form>
  )
}
