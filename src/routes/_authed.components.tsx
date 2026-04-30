import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { type ColumnDef, type RowSelectionState } from '@tanstack/react-table'
import {
  PlusIcon,
  DownloadIcon,
  BanIcon,
  ShieldAlertIcon,
  TrashIcon,
  CheckCircleIcon,
  InboxIcon,
  EyeIcon,
  PencilIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { DataTable, type RowActionItem } from '@/components/data-table/data-table'
import { format } from '@/lib/format'

import { StatusBadge } from '@/components/shared/status-badge'
import { SearchInput } from '@/components/shared/search-input'
import { FilterSelect } from '@/components/shared/filter-select'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ReasonDialog } from '@/components/shared/reason-dialog'
import { FormDialog } from '@/components/shared/form-dialog'
import { DetailField } from '@/components/shared/detail-field'
import { DetailCard } from '@/components/shared/detail-card'
import { StatCard } from '@/components/shared/stat-card'
import { PasswordInput } from '@/components/shared/password-input'
import { OtpInput } from '@/components/shared/otp-input'
import { ImagePreview } from '@/components/shared/image-preview'

export const Route = createFileRoute('/_authed/components')({
  component: ComponentsShowcasePage,
})

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface MockUser {
  id: string
  accountName: string
  phoneNumber: string
  email: string
  status: 'active' | 'suspended' | 'banned' | 'pending_verification' | 'deleted'
  accountType: 'user_only' | 'upgraded_to_seller'
  registrationDate: string
  city: string
  language: string
  nationalId: string
  lastLogin: string
  ordersCount: number
  totalSpent: number
  referralCode: string
}

const MOCK_USERS: MockUser[] = [
  {
    id: '1a2b3c4d',
    accountName: 'Ahmed Ali',
    phoneNumber: '+966500000001',
    email: 'ahmed@example.com',
    status: 'active',
    accountType: 'user_only',
    registrationDate: '2025-11-03T14:23:00.000Z',
    city: 'Riyadh',
    language: 'Arabic',
    nationalId: '***4521',
    lastLogin: '2026-04-24T09:15:00.000Z',
    ordersCount: 42,
    totalSpent: 18750.5,
    referralCode: 'AHM-7X2K',
  },
  {
    id: '2b3c4d5e',
    accountName: 'Sara Mohammed',
    phoneNumber: '+966500000002',
    email: 'sara@example.com',
    status: 'suspended',
    accountType: 'upgraded_to_seller',
    registrationDate: '2025-10-15T09:00:00.000Z',
    city: 'Jeddah',
    language: 'Arabic',
    nationalId: '***8832',
    lastLogin: '2026-04-10T14:30:00.000Z',
    ordersCount: 156,
    totalSpent: 94320.0,
    referralCode: 'SAR-3M9P',
  },
  {
    id: '3c4d5e6f',
    accountName: 'Khalid Ibrahim',
    phoneNumber: '+966500000003',
    email: 'khalid@example.com',
    status: 'banned',
    accountType: 'user_only',
    registrationDate: '2025-09-20T11:30:00.000Z',
    city: 'Dammam',
    language: 'English',
    nationalId: '***1103',
    lastLogin: '2026-03-01T08:00:00.000Z',
    ordersCount: 3,
    totalSpent: 450.0,
    referralCode: 'KHL-6R1N',
  },
  {
    id: '4d5e6f7g',
    accountName: 'Noura Hassan',
    phoneNumber: '+966500000004',
    email: 'noura@example.com',
    status: 'pending_verification',
    accountType: 'user_only',
    registrationDate: '2026-01-05T16:45:00.000Z',
    city: 'Mecca',
    language: 'Arabic',
    nationalId: '***2290',
    lastLogin: '2026-01-05T16:45:00.000Z',
    ordersCount: 0,
    totalSpent: 0,
    referralCode: 'NOU-4W8J',
  },
  {
    id: '5e6f7g8h',
    accountName: 'Faisal Al-Rashidi',
    phoneNumber: '+966500000005',
    email: 'faisal@example.com',
    status: 'active',
    accountType: 'upgraded_to_seller',
    registrationDate: '2025-12-12T08:15:00.000Z',
    city: 'Riyadh',
    language: 'English',
    nationalId: '***7764',
    lastLogin: '2026-04-25T07:00:00.000Z',
    ordersCount: 89,
    totalSpent: 52100.75,
    referralCode: 'FAI-2K5L',
  },
]

const userColumns: ColumnDef<MockUser>[] = [
  {
    accessorKey: 'accountName',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.accountName}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-sm">{row.original.phoneNumber}</span>
    ),
  },
  {
    accessorKey: 'nationalId',
    header: 'National ID',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-sm">{row.original.nationalId}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} type="account" />,
  },
  {
    accessorKey: 'accountType',
    header: 'Account Type',
    cell: ({ row }) => <StatusBadge status={row.original.accountType} type="accountType" />,
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'language',
    header: 'Language',
  },
  {
    accessorKey: 'ordersCount',
    header: () => <span className="block text-end">Orders</span>,
    cell: ({ row }) => (
      <span className="block text-end font-mono tabular-nums">{format.number(row.original.ordersCount)}</span>
    ),
  },
  {
    accessorKey: 'totalSpent',
    header: () => <span className="block text-end">Total Spent</span>,
    cell: ({ row }) => (
      <span className="block text-end font-mono tabular-nums">{format.currency(row.original.totalSpent)}</span>
    ),
  },
  {
    accessorKey: 'referralCode',
    header: 'Referral Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.referralCode}</span>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-sm text-muted-foreground">
        {format.dateTime(row.original.lastLogin)}
      </span>
    ),
  },
  {
    accessorKey: 'registrationDate',
    header: 'Registered',
    cell: ({ row }) => (
      <span className="font-mono tabular-nums text-sm text-muted-foreground">
        {format.date(row.original.registrationDate)}
      </span>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Row actions builder                                                */
/* ------------------------------------------------------------------ */

function getUserActions(user: MockUser): RowActionItem<MockUser>[] {
  const items: RowActionItem<MockUser>[] = [
    {
      label: 'View',
      icon: EyeIcon,
      onClick: (row) => toast.info(`View: ${row.accountName}`),
    },
    {
      label: 'Edit',
      icon: PencilIcon,
      onClick: (row) => toast.info(`Edit: ${row.accountName}`),
    },
  ]

  if (user.status !== 'banned') {
    items.push(
      { type: 'separator' },
      {
        label: 'Ban',
        icon: BanIcon,
        onClick: (row) => toast.error(`Ban: ${row.accountName}`),
        variant: 'destructive',
      },
    )
  }

  if (user.status === 'banned') {
    items.push(
      { type: 'separator' },
      {
        label: 'Unban',
        icon: CheckCircleIcon,
        onClick: (row) => toast.success(`Unban: ${row.accountName}`),
      },
    )
  }

  return items
}

/* ------------------------------------------------------------------ */
/*  Showcase sections                                                  */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="pt-2">
      <h2 className="text-[length:var(--type-h2-size)] font-[number:var(--type-h2-weight)] leading-[var(--type-h2-leading)] tracking-[var(--type-h2-tracking)] text-foreground">
        {children}
      </h2>
      <Separator className="mt-3" />
    </div>
  )
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

function ComponentsShowcasePage() {
  const { t } = useTranslation()

  // Dialog states
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmDestructiveOpen, setConfirmDestructiveOpen] = useState(false)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  // Search state
  const [search, setSearch] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')

  // OTP state
  const [otp, setOtp] = useState('')

  // Table selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Table pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  return (
    <div className="space-y-8">
      {/* ---- Page Header ---- */}
      <PageHeader
        title="Component Showcase"
        description="All shared components for Sprint 1 review"
        onBack={() => toast.info('Back navigation clicked')}
        actions={
          <Button size="sm">
            <PlusIcon className="size-4" />
            {t('common:buttons.create')}
          </Button>
        }
      />

      {/* ---- Status Badges ---- */}
      <SectionTitle>Status Badges</SectionTitle>

      <SubSection label="Account Status">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="active" type="account" />
          <StatusBadge status="suspended" type="account" />
          <StatusBadge status="banned" type="account" />
          <StatusBadge status="pending_verification" type="account" />
          <StatusBadge status="deleted" type="account" />
        </div>
      </SubSection>

      <SubSection label="Seller Status">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="PENDING" type="seller" />
          <StatusBadge status="APPROVED" type="seller" />
          <StatusBadge status="REJECTED" type="seller" />
          <StatusBadge status="SUSPENDED" type="seller" />
        </div>
      </SubSection>

      <SubSection label="Application Status">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="PENDING" type="application" />
          <StatusBadge status="APPROVED" type="application" />
          <StatusBadge status="REJECTED" type="application" />
        </div>
      </SubSection>

      <SubSection label="Verification Status">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="pending" type="verification" />
          <StatusBadge status="approved" type="verification" />
          <StatusBadge status="rejected" type="verification" />
        </div>
      </SubSection>

      <SubSection label="Boolean (Enabled/Disabled)">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="true" type="boolean" />
          <StatusBadge status="false" type="boolean" />
        </div>
      </SubSection>

      <SubSection label="Account Type">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="user_only" type="accountType" />
          <StatusBadge status="upgraded_to_seller" type="accountType" />
        </div>
      </SubSection>

      {/* ---- Stat Cards ---- */}
      <SectionTitle>Stat Cards</SectionTitle>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value="12,458" delta={{ value: 12.5, positive: true }} />
        <StatCard label="Active Sellers" value="342" delta={{ value: 3.2, positive: true }} />
        <StatCard label="Pending Reviews" value="18" />
        <StatCard label="Banned Accounts" value="7" delta={{ value: 2.1, positive: false }} />
      </div>

      {/* ---- Search Input ---- */}
      <SectionTitle>Search Input</SectionTitle>

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Debounced value: &quot;{search}&quot;
        </p>
      </div>

      {/* ---- Data Table with Selection + Actions + Horizontal Scroll ---- */}
      <SectionTitle>Data Table</SectionTitle>

      <DataTable
        columns={userColumns}
        data={MOCK_USERS}
        getRowId={(row) => row.id}
        enableSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        actions={getUserActions}
        onRowClick={(row) => toast.info(`Row clicked: ${row.accountName}`)}
        pageCount={5}
        totalRecords={50}
        pagination={pagination}
        onPaginationChange={setPagination}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value="" onChange={() => {}} className="w-64" />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('common:labels.status')}
              options={[
                { value: 'active', label: t('components:status.active') },
                { value: 'banned', label: t('components:status.banned') },
                { value: 'suspended', label: t('components:status.suspended') },
              ]}
            />
            <FilterSelect
              value={accountTypeFilter}
              onChange={setAccountTypeFilter}
              placeholder="Account Type"
              options={[
                { value: 'user_only', label: t('components:status.user_only') },
                { value: 'upgraded_to_seller', label: t('components:status.upgraded_to_seller') },
              ]}
            />
            <div className="flex-1" />
            <Button variant="outline" size="sm">
              <DownloadIcon className="size-4" />
              {t('common:buttons.export')}
            </Button>
            <Button size="sm">
              <PlusIcon className="size-4" />
              {t('common:buttons.create')}
            </Button>
          </div>
        }
      />

      {/* ---- Empty State ---- */}
      <SectionTitle>Empty State</SectionTitle>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            message="No providers match your filters"
            actionLabel="Clear filters"
            onAction={() => {}}
          />
        </div>
        <div className="rounded-lg border border-border bg-card">
          <EmptyState
            icon={InboxIcon}
            message="No pending requests"
          />
        </div>
      </div>

      {/* ---- Detail Card ---- */}
      <SectionTitle>Detail Card</SectionTitle>

      <DetailCard
        title="User Information"
        actions={
          <div className="flex gap-1">
            <Button variant="outline" size="sm">
              <CheckCircleIcon className="size-4" />
              Activate
            </Button>
            <Button variant="destructive" size="sm">
              <BanIcon className="size-4" />
              Ban
            </Button>
          </div>
        }
      >
        <DetailField label="Full Name" value="Ahmed Ali Al-Rashidi" />
        <DetailField label="Email" value="ahmed@example.com" />
        <DetailField label="Phone" value="+966 500 000 001" mono />
        <DetailField label="Role" value="USER" />
        <DetailField label="Account Status" value={<StatusBadge status="active" />} />
        <DetailField label="Store" value={null} />
        <DetailField label="Registered" value="Nov 3, 2025" mono />
        <DetailField label="Language" value="Arabic" />
        <DetailField
          label="Account Type"
          value={<StatusBadge status="user_only" type="accountType" />}
        />
      </DetailCard>

      <DetailCard title="Store Information" columns={2}>
        <DetailField label="Store Name" value="Ahmed Store" />
        <DetailField label="Status" value={<StatusBadge status="APPROVED" type="seller" />} />
        <DetailField label="Verified" value={<StatusBadge status="true" type="boolean" />} />
        <DetailField label="Owner" value="Ahmed Al-Rashidi" />
        <DetailField label="City" value="Riyadh" />
        <DetailField label="CR Number" value="CR-SAU-2024-001" mono />
        <DetailField
          label="Detailed Address"
          value="Al Olaya District, King Fahad Road, Building 12, Suite 4B, Riyadh 12211"
          span={2}
        />
      </DetailCard>

      {/* ---- Image Preview ---- */}
      <SectionTitle>Image Preview</SectionTitle>

      <div className="flex items-end gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Small</p>
          <ImagePreview
            src="https://flagcdn.com/w320/sa.png"
            alt="Saudi Arabia"
            size="sm"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Medium</p>
          <ImagePreview
            src="https://flagcdn.com/w320/sa.png"
            alt="Saudi Arabia"
            size="md"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Large</p>
          <ImagePreview
            src="https://flagcdn.com/w320/sa.png"
            alt="Saudi Arabia"
            size="lg"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Fallback</p>
          <ImagePreview src={null} alt="Missing" size="md" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Error</p>
          <ImagePreview src="https://invalid.url/404.png" alt="Broken" size="md" />
        </div>
      </div>

      {/* ---- Form Elements ---- */}
      <SectionTitle>Form Elements</SectionTitle>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <SubSection label="Password Input">
            <PasswordInput placeholder="Enter password" />
          </SubSection>
        </div>

        <div className="space-y-3">
          <SubSection label="OTP Input (6-digit)">
            <OtpInput value={otp} onChange={setOtp} />
            <p className="text-xs text-muted-foreground">
              Value: &quot;{otp}&quot;
            </p>
          </SubSection>
        </div>
      </div>

      {/* ---- Dialogs ---- */}
      <SectionTitle>Dialogs</SectionTitle>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          <CheckCircleIcon className="size-4" />
          Confirm Dialog
        </Button>
        <Button variant="destructive" onClick={() => setConfirmDestructiveOpen(true)}>
          <TrashIcon className="size-4" />
          Destructive Confirm
        </Button>
        <Button variant="outline" onClick={() => setReasonOpen(true)}>
          <ShieldAlertIcon className="size-4" />
          Reason Dialog (Ban)
        </Button>
        <Button variant="outline" onClick={() => setFormOpen(true)}>
          <PlusIcon className="size-4" />
          Form Dialog (Create)
        </Button>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Activate User"
        description="This will restore the user to active status and allow them to log in again."
        onConfirm={() => setConfirmOpen(false)}
      />

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        open={confirmDestructiveOpen}
        onOpenChange={setConfirmDestructiveOpen}
        title="Delete User"
        description="This will permanently soft-delete this user account. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => setConfirmDestructiveOpen(false)}
      />

      {/* Reason Dialog */}
      <ReasonDialog
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        title="Ban User"
        description="Banning this user will revoke all tokens and prevent them from logging in."
        onConfirm={(reason) => {
          console.log('Ban reason:', reason)
          setReasonOpen(false)
        }}
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Create Country"
        description="Add a new country to the system."
        onSubmit={() => setFormOpen(false)}
        contentClassName="sm:max-w-xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="name_en">Name (English)</Label>
          <Input id="name_en" placeholder="Saudi Arabia" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name_ar">Name (Arabic)</Label>
          <Input id="name_ar" placeholder="المملكة العربية السعودية" dir="rtl" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="iso_code">ISO Code</Label>
            <Input id="iso_code" placeholder="SAU" maxLength={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" type="number" placeholder="0" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="image_url">Flag Image URL</Label>
          <Input id="image_url" placeholder="https://flagcdn.com/w320/sa.png" />
        </div>
      </FormDialog>
    </div>
  )
}
