import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import './ProfileChart.css'

const ProfileChart = ({ isBuyer = false, isAr = false }) => {
  const vendorData = [
    { month: 'Nov', proposals: 8, accepted: 5 },
    { month: 'Dec', proposals: 12, accepted: 7 },
    { month: 'Jan', proposals: 15, accepted: 9 },
    { month: 'Feb', proposals: 18, accepted: 11 },
    { month: 'Mar', proposals: 22, accepted: 14 },
    { month: 'Apr', proposals: 24, accepted: 16 },
  ]

  const buyerData = [
    { month: 'Nov', proposals: 4, accepted: 2 },
    { month: 'Dec', proposals: 6, accepted: 3 },
    { month: 'Jan', proposals: 9, accepted: 4 },
    { month: 'Feb', proposals: 12, accepted: 6 },
    { month: 'Mar', proposals: 14, accepted: 7 },
    { month: 'Apr', proposals: 18, accepted: 9 },
  ]

  const data = isBuyer ? buyerData : vendorData
  const label1 = isBuyer
    ? isAr
      ? 'عروض مستلمة'
      : 'Received'
    : isAr
      ? 'عروض مقدمة'
      : 'Submitted'
  const label2 = isBuyer
    ? isAr
      ? 'مقبولة'
      : 'Accepted'
    : isAr
      ? 'فائزة'
      : 'Won'

  const total1 = data.reduce((s, d) => s + d.proposals, 0)
  const total2 = data.reduce((s, d) => s + d.accepted, 0)
  const rate = total1 > 0 ? Math.round((total2 / total1) * 100) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='pch-tooltip'>
          <span className='pch-tooltip-label'>{label}</span>
          {payload.map((p, i) => (
            <span
              key={i}
              className='pch-tooltip-row'
              style={{ color: p.color }}
            >
              {p.name}: <strong>{p.value}</strong>
            </span>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className='pch-wrap' dir={isAr ? 'rtl' : 'ltr'}>
      <div className='pch-header'>
        <div className='pch-header-text'>
          <h3 className='pch-title'>
            {isAr ? 'النشاط على مدار 6 أشهر' : '6-Month Activity'}
          </h3>
          <span className='pch-sub'>
            {isAr ? 'نوفمبر - أبريل' : 'Nov - Apr'}
          </span>
        </div>
        <div className='pch-stats'>
          <div className='pch-stat'>
            <span className='pch-stat-value'>{total1}</span>
            <span className='pch-stat-label'>{label1}</span>
          </div>
          <div className='pch-stat'>
            <span className='pch-stat-value pch-stat-green'>{rate}%</span>
            <span className='pch-stat-label'>
              {isAr ? 'معدل النجاح' : 'Success rate'}
            </span>
          </div>
        </div>
      </div>

      <div className='pch-chart'>
        <LineChart
          width={320}
          height={180}
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray='2 4'
            stroke='rgba(255,255,255,0.05)'
            vertical={false}
          />
          <XAxis
            dataKey='month'
            stroke='#6b7280'
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke='#6b7280'
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(0,167,229,0.2)', strokeWidth: 1 }}
          />
          <Line
            type='monotone'
            dataKey='proposals'
            name={label1}
            stroke='#00a7e5'
            strokeWidth={2.5}
            dot={{ fill: '#00a7e5', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type='monotone'
            dataKey='accepted'
            name={label2}
            stroke='#10B981'
            strokeWidth={2.5}
            dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </div>

      <div className='pch-legend'>
        <div className='pch-legend-item'>
          <span className='pch-legend-dot' style={{ background: '#00a7e5' }} />
          <span className='pch-legend-label'>{label1}</span>
        </div>
        <div className='pch-legend-item'>
          <span className='pch-legend-dot' style={{ background: '#10B981' }} />
          <span className='pch-legend-label'>{label2}</span>
        </div>
      </div>
    </div>
  )
}

export default ProfileChart
