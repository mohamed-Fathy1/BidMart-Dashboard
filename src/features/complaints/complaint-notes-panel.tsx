import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { FormDialog } from '@/components/shared/form-dialog'
import { Can } from '@/components/permissions/can'
import { PERMISSIONS } from '@/lib/permissions'
import { format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { InitialAvatar } from '@/features/complaints/complaint-ui'
import {
  useAddComplaintNoteMutation,
  useComplaintNotesQuery,
} from '@/features/complaints/complaints.queries'

interface ComplaintNotesPanelProps {
  complaintId: string
  isTerminal: boolean
}

const NOTE_MAX_LENGTH = 5000

export function ComplaintNotesPanel({
  complaintId,
  isTerminal,
}: ComplaintNotesPanelProps) {
  const { t } = useTranslation()
  const { data: notes, isLoading, isError } = useComplaintNotesQuery(complaintId)
  const addNoteMutation = useAddComplaintNoteMutation(complaintId)

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const noteFieldId = useId()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = note.trim()
    if (!trimmed) {
      setError(t('complaints:validation.note_required'))
      return
    }
    if (trimmed.length > NOTE_MAX_LENGTH) {
      setError(t('complaints:validation.note_too_long'))
      return
    }
    addNoteMutation.mutate(trimmed, {
      onSuccess: () => {
        setNote('')
        setError(null)
        setOpen(false)
      },
    })
  }

  return (
    <div className="space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {t('complaints:notes.title')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('complaints:notes.subtitle')}
          </p>
        </div>
        {!isTerminal && (
          <Can permission={PERMISSIONS.complaints.addNote}>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="size-4" aria-hidden />
              {t('complaints:notes.add_button')}
            </Button>
          </Can>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden />
        </div>
      ) : isError ? (
        <Card className="gap-0 py-0">
          <CardContent className="px-6 py-6 text-center text-sm text-muted-foreground">
            {t('complaints:errors.notes_load_failed')}
          </CardContent>
        </Card>
      ) : notes && notes.length > 0 ? (
        <ul className="space-y-2">
          {notes.map((noteItem) => (
            <li key={noteItem.id}>
              <Card className={cn('relative gap-0 overflow-hidden rounded-xl border-border py-0')}>
                <span
                  aria-hidden
                  className="absolute inset-y-2 inset-inline-start-0 w-[3px] rounded-e-full bg-amber-400/80"
                />
                <CardContent className="space-y-2 px-4 py-3 ps-5">
                  <div className="flex items-center gap-2">
                    <InitialAvatar name={noteItem.adminName} size="sm" tone="neutral" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-foreground">
                        {noteItem.adminName}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {format.dateTime(noteItem.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-pretty text-sm leading-relaxed text-foreground">
                    {noteItem.note}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="gap-0 border-dashed py-0">
          <CardContent className="px-6 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('complaints:notes.empty')}
            </p>
          </CardContent>
        </Card>
      )}

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setNote('')
            setError(null)
          }
          setOpen(next)
        }}
        title={t('complaints:notes.form_title')}
        description={t('complaints:notes.form_description')}
        onSubmit={handleSubmit}
        submitLabel={t('complaints:notes.submit')}
        isLoading={addNoteMutation.isPending}
        size="md"
        suppressInitialFocus
        errorMessage={error}
      >
        <div className="space-y-2">
          <label htmlFor={noteFieldId} className="sr-only">
            {t('complaints:notes.form_title')}
          </label>
          <Textarea
            id={noteFieldId}
            value={note}
            onChange={(e) => {
              setNote(e.target.value)
              if (error) setError(null)
            }}
            placeholder={t('complaints:notes.placeholder')}
            rows={6}
            maxLength={NOTE_MAX_LENGTH}
            autoFocus={false}
          />
          <p className="text-end font-mono text-[11px] tabular-nums text-muted-foreground">
            {t('complaints:notes.counter', { count: note.length })}
          </p>
        </div>
      </FormDialog>
    </div>
  )
}
