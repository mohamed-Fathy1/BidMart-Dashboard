import { useState } from 'react'
import { ImageOffIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePreviewProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 rounded-md',
  md: 'size-12 rounded-lg',
  lg: 'size-20 rounded-lg',
  xl: 'size-24 rounded-xl',
} as const

export function ImagePreview({ src, alt, size = 'md', className }: ImagePreviewProps) {
  const [errored, setErrored] = useState(false)

  const showFallback = !src || errored

  return (
    <div
      data-slot="image-preview"
      className={cn(
        'shrink-0 overflow-hidden border border-border bg-muted',
        sizeClasses[size],
        className,
      )}
    >
      {showFallback ? (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOffIcon
            className={cn(
              size === 'sm' && 'size-3.5',
              (size === 'md' || size === 'lg') && 'size-5',
              size === 'xl' && 'size-6',
            )}
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          className="size-full object-cover"
        />
      )}
    </div>
  )
}
