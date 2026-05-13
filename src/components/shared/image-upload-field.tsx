import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, ImageOffIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  uploadFile,
  validateImageFile,
  DEFAULT_IMAGE_MIME_TYPES,
  type UploadCase,
} from '@/lib/upload'

const MIME_LABELS: Record<string, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'image/svg+xml': 'SVG',
}

function formatAllowedTypes(types: readonly string[]): string {
  const labels = Array.from(
    new Set(types.map((t) => MIME_LABELS[t] ?? t.replace(/^image\//, '').toUpperCase())),
  )
  return labels.join(', ')
}

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  uploadCase: UploadCase
  className?: string
  /** Restricts file picker and validation. Defaults to PNG, JPEG, WebP. */
  allowedMimeTypes?: readonly string[]
}

export function ImageUploadField({
  value,
  onChange,
  uploadCase,
  className,
  allowedMimeTypes = DEFAULT_IMAGE_MIME_TYPES,
}: ImageUploadFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [imgErrored, setImgErrored] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateImageFile(file, allowedMimeTypes)
      if (error === 'invalid_type') {
        toast.error(
          t('components:image_upload.invalid_type', {
            types: formatAllowedTypes(allowedMimeTypes),
          }),
        )
        return
      }
      if (error === 'too_large') {
        toast.error(t('components:image_upload.too_large'))
        return
      }

      setIsUploading(true)
      try {
        const mediaUrl = await uploadFile(file, uploadCase)
        onChange(mediaUrl)
        setImgErrored(false)
      } catch {
        toast.error(t('components:image_upload.upload_failed'))
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, uploadCase, allowedMimeTypes, t],
  )

  const acceptAttr = allowedMimeTypes.join(',')

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleRemove() {
    onChange('')
    setImgErrored(false)
  }

  const hasImage = !!value && !imgErrored

  return (
    <div className={cn('grid gap-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={handleInputChange}
      />

      {hasImage ? (
        /* ---- Preview state ---- */
        <div className="relative group w-full">
          <div className="overflow-hidden rounded-lg border border-border bg-muted aspect-[16/9] w-full">
            <img
              src={value}
              alt=""
              onError={() => setImgErrored(true)}
              className="size-full object-cover"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-default)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {t('components:image_upload.change')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="size-4" />
              {t('components:image_upload.remove')}
            </Button>
          </div>
        </div>
      ) : (
        /* ---- Empty / Upload state ---- */
        <button
          type="button"
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          disabled={isUploading}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground transition-colors duration-[var(--duration-hover)] ease-[var(--ease-default)]',
            'hover:bg-muted hover:border-ring/50',
            'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
            isDragging && 'border-2 border-primary/45 bg-primary/5 text-foreground',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? (
            <>
              <LoaderIcon className="size-5 animate-spin" />
              <span>{t('components:image_upload.uploading')}</span>
            </>
          ) : imgErrored ? (
            <>
              <ImageOffIcon className="size-5" />
              <span>{t('components:image_upload.drop_or_click')}</span>
            </>
          ) : (
            <>
              <Upload className="size-5" />
              <span>{t('components:image_upload.drop_or_click')}</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
