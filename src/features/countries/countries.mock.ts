import type { Country, PaginationMeta } from '@/types/api'

export const mockCountries: Country[] = [
  {
    id: 'c001',
    name_en: 'Saudi Arabia',
    name_ar: 'السعودية',
    iso_code: 'SAU',
    image_url: 'https://flagcdn.com/w320/sa.png',
    is_enabled: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'c002',
    name_en: 'United Arab Emirates',
    name_ar: 'الإمارات',
    iso_code: 'ARE',
    image_url: 'https://flagcdn.com/w320/ae.png',
    is_enabled: true,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'c003',
    name_en: 'Kuwait',
    name_ar: 'الكويت',
    iso_code: 'KWT',
    image_url: 'https://flagcdn.com/w320/kw.png',
    is_enabled: true,
    sort_order: 3,
    created_at: '2024-02-15T00:00:00.000Z',
    updated_at: '2024-02-15T00:00:00.000Z',
  },
  {
    id: 'c004',
    name_en: 'Bahrain',
    name_ar: 'البحرين',
    iso_code: 'BHR',
    image_url: 'https://flagcdn.com/w320/bh.png',
    is_enabled: false,
    sort_order: 4,
    created_at: '2024-03-01T00:00:00.000Z',
    updated_at: '2024-06-10T00:00:00.000Z',
  },
  {
    id: 'c005',
    name_en: 'Qatar',
    name_ar: 'قطر',
    iso_code: 'QAT',
    image_url: 'https://flagcdn.com/w320/qa.png',
    is_enabled: true,
    sort_order: 5,
    created_at: '2024-03-10T00:00:00.000Z',
    updated_at: '2024-03-10T00:00:00.000Z',
  },
  {
    id: 'c006',
    name_en: 'Oman',
    name_ar: 'عُمان',
    iso_code: 'OMN',
    image_url: 'https://flagcdn.com/w320/om.png',
    is_enabled: false,
    sort_order: 6,
    created_at: '2024-04-01T00:00:00.000Z',
    updated_at: '2024-04-01T00:00:00.000Z',
  },
  {
    id: 'c007',
    name_en: 'Egypt',
    name_ar: 'مصر',
    iso_code: 'EGY',
    image_url: 'https://flagcdn.com/w320/eg.png',
    is_enabled: true,
    sort_order: 7,
    created_at: '2024-05-01T00:00:00.000Z',
    updated_at: '2024-05-01T00:00:00.000Z',
  },
  {
    id: 'c008',
    name_en: 'Jordan',
    name_ar: 'الأردن',
    iso_code: 'JOR',
    image_url: 'https://flagcdn.com/w320/jo.png',
    is_enabled: false,
    sort_order: 8,
    created_at: '2024-06-01T00:00:00.000Z',
    updated_at: '2024-06-01T00:00:00.000Z',
  },
]

export function getMockCountryList(params: {
  isEnabled?: string
  page?: number
  limit?: number
}): { data: Country[]; meta: PaginationMeta } {
  const { isEnabled, page = 1, limit = 10 } = params

  let filtered = [...mockCountries]

  if (isEnabled === 'true') {
    filtered = filtered.filter((c) => c.is_enabled)
  } else if (isEnabled === 'false') {
    filtered = filtered.filter((c) => !c.is_enabled)
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}
