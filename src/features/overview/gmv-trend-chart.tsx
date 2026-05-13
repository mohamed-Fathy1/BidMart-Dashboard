interface GmvTrendChartProps {
  data: number[]
}

export function GmvTrendChart({ data }: GmvTrendChartProps) {
  if (data.length < 2) return null
  const w = 800
  const h = 200
  const pad = 8
  const max = Math.max(...data) * 1.1
  const path = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2)
      const y = h - pad - (v / max) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
  const area = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`
  const last = data[data.length - 1] ?? 0
  const lastY = h - pad - (last / max) * (h - pad * 2)

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block h-[200px] w-full"
    >
      <defs>
        <linearGradient id="gmv-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={pad}
          x2={w - pad}
          y1={pad + p * (h - pad * 2)}
          y2={pad + p * (h - pad * 2)}
          stroke="var(--color-border)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill="url(#gmv-gradient)" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={w - pad}
        cy={lastY}
        r={4}
        fill="var(--color-primary)"
        stroke="var(--color-card)"
        strokeWidth={2}
      />
    </svg>
  )
}
