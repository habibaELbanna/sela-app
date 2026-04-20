import './SkeletonList.css'

export const SkeletonCard = ({ variant = 'default' }) => {
  if (variant === 'thread') {
    return (
      <div className='sk-thread'>
        <div className='sk-avatar sk-shimmer' />
        <div className='sk-thread-body'>
          <div className='sk-line sk-line-60 sk-shimmer' />
          <div className='sk-line sk-line-40 sk-shimmer' />
          <div className='sk-line sk-line-80 sk-shimmer' />
        </div>
      </div>
    )
  }

  if (variant === 'vendor') {
    return (
      <div className='sk-vendor-card'>
        <div className='sk-vendor-top'>
          <div className='sk-logo sk-shimmer' />
          <div className='sk-vendor-text'>
            <div className='sk-line sk-line-70 sk-shimmer' />
            <div className='sk-line sk-line-40 sk-shimmer' />
          </div>
        </div>
        <div className='sk-line sk-line-100 sk-shimmer' />
        <div className='sk-line sk-line-80 sk-shimmer' />
      </div>
    )
  }

  return (
    <div className='sk-card'>
      <div className='sk-line sk-line-70 sk-shimmer' />
      <div className='sk-line sk-line-40 sk-shimmer' />
      <div className='sk-line sk-line-90 sk-shimmer' />
      <div className='sk-line sk-line-60 sk-shimmer' />
    </div>
  )
}

const SkeletonList = ({ count = 4, variant = 'default' }) => (
  <div className='sk-list'>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} variant={variant} />
    ))}
  </div>
)

export default SkeletonList
