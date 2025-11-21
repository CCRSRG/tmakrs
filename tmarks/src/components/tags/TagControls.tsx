/**
 * 标签控制组件 - 排序、布局、清空
 */
interface TagControlsProps {
  sortBy: 'usage' | 'name' | 'clicks'
  onSortChange: (sortBy: 'usage' | 'name' | 'clicks') => void
  layout: 'grid' | 'masonry'
  onLayoutChange: (layout: 'grid' | 'masonry') => void
  selectedCount: number
  onClearSelection: () => void
}

export function TagControls({
  sortBy,
  onSortChange,
  layout,
  onLayoutChange,
  selectedCount,
  onClearSelection,
}: TagControlsProps) {
  return (
    <div className="space-y-2">
      {/* 排序方式 */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground flex-shrink-0">排序</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'usage' | 'name' | 'clicks')}
          className="input input-sm flex-1 text-xs cursor-pointer"
        >
          <option value="usage">📊 使用频率</option>
          <option value="clicks">👆 点击次数</option>
          <option value="name">🔤 字母序</option>
        </select>
      </div>

      {/* 布局方式 */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground flex-shrink-0">布局</label>
        <select
          value={layout}
          onChange={(e) => onLayoutChange(e.target.value as 'grid' | 'masonry')}
          className="input input-sm flex-1 text-xs cursor-pointer"
        >
          <option value="grid">▦ 网格</option>
          <option value="masonry">▧ 瀑布流</option>
        </select>
      </div>

      {/* 清空选中 */}
      <button
        onClick={onClearSelection}
        disabled={selectedCount === 0}
        className={`btn btn-sm w-full text-xs ${
          selectedCount === 0
            ? 'btn-disabled'
            : 'btn-ghost hover:bg-error/10 hover:text-error'
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        清空选中标签 {selectedCount > 0 && `(${selectedCount})`}
      </button>
    </div>
  )
}
