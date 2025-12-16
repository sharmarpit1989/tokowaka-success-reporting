/**
 * Skeleton Loader Component
 * Provides smooth loading placeholders for better perceived performance
 */

function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const loaders = Array(count).fill(0)

  const CardSkeleton = () => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className} animate-pulse`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )

  const TableRowSkeleton = () => (
    <div className={`bg-white border-b border-gray-200 p-4 ${className} animate-pulse`}>
      <div className="grid grid-cols-5 gap-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )

  const StatCardSkeleton = () => (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className} animate-pulse`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  )

  const TextBlockSkeleton = () => (
    <div className={`${className} animate-pulse`}>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )

  const ListItemSkeleton = () => (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className} animate-pulse`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  const skeletonComponents = {
    card: CardSkeleton,
    tableRow: TableRowSkeleton,
    statCard: StatCardSkeleton,
    textBlock: TextBlockSkeleton,
    listItem: ListItemSkeleton
  }

  const SkeletonComponent = skeletonComponents[type] || CardSkeleton

  return (
    <div className="space-y-4">
      {loaders.map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  )
}

export default SkeletonLoader

