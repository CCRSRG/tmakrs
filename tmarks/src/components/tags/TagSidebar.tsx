import { useState, useEffect, useRef } from 'react'
import { useTags, useCreateTag } from '@/hooks/useTags'
import type { Bookmark } from '@/lib/types'
import { TagManageModal } from './TagManageModal'
import { TagControls } from './TagControls'
import { TagItem } from './TagItem'
import { useTagFiltering } from './useTagFiltering'
import { logger } from '@/lib/logger'

interface TagSidebarProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  isLoadingBookmarks?: boolean
  bookmarks: Bookmark[]
  tagLayout: 'grid' | 'masonry'
  onTagLayoutChange: (layout: 'grid' | 'masonry') => void
  readOnly?: boolean
  availableTags?: Tag[]
  tagSortBy?: 'usage' | 'name' | 'clicks'
  onTagSortChange?: (sortBy: 'usage' | 'name' | 'clicks') => void
}

export function TagSidebar({
  selectedTags,
  onTagsChange,
  bookmarks,
  tagLayout,
  onTagLayoutChange,
  readOnly = false,
  availableTags,
  tagSortBy: externalTagSortBy,
  onTagSortChange,
}: TagSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [internalSortBy, setInternalSortBy] = useState<'usage' | 'name' | 'clicks'>('usage')
  const searchCleanupTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 使用外部传入的 sortBy 或内部状态
  const sortBy = externalTagSortBy !== undefined ? externalTagSortBy : internalSortBy
  const setSortBy = onTagSortChange || setInternalSortBy

  const { data, isLoading } = useTags({ sort: sortBy }, { enabled: !availableTags })
  const createTag = useCreateTag()

  const tags = useMemo(() => availableTags || data?.tags || [], [availableTags, data?.tags])
  const isTagLoading = availableTags ? false : isLoading

  // 搜索防抖：延迟200ms更新实际搜索关键词
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 标签搜索自动清空
  useEffect(() => {
    // 清除之前的定时器
    if (searchCleanupTimerRef.current) {
      clearTimeout(searchCleanupTimerRef.current)
      searchCleanupTimerRef.current = null
    }

    // 如果有搜索关键词，设置15秒后自动清空
    if (searchQuery.trim()) {
      searchCleanupTimerRef.current = setTimeout(() => {
        setSearchQuery('')
        setDebouncedSearchQuery('')
      }, 15000) // 15秒
    }

    // 清理函数
    return () => {
      if (searchCleanupTimerRef.current) {
        clearTimeout(searchCleanupTimerRef.current)
        searchCleanupTimerRef.current = null
      }
    }
  }, [searchQuery])

  // 使用自定义 Hook 处理标签筛选逻辑
  const { orderedTags, relatedTagIds } = useTagFiltering(
    tags,
    bookmarks,
    selectedTags,
    debouncedSearchQuery
  )

  const handleToggleTag = (tagId: string) => {
    let newSelectedTags: string[]
    if (selectedTags.includes(tagId)) {
      newSelectedTags = selectedTags.filter((id) => id !== tagId)
    } else {
      newSelectedTags = [...selectedTags, tagId]
    }
    onTagsChange(newSelectedTags)
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (readOnly) return
    if (!newTagName.trim()) return

    try {
      await createTag.mutateAsync({ name: newTagName.trim() })
      setNewTagName('')
      setShowCreateForm(false)
    } catch (error) {
      logger.error('Failed to create tag:', error)
    }
  }


  return (
    <>
      <div className="card flex flex-col shadow-lg h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-bold text-primary">
            标签
          </h3>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowManageModal(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shadow-float bg-muted hover:bg-secondary text-foreground touch-manipulation"
                title="管理标签"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl transition-all shadow-float touch-manipulation ${showCreateForm
                  ? 'bg-error text-error-content rotate-45'
                  : 'bg-gradient-to-br from-primary to-secondary text-primary-content'
                  }`}
                title={showCreateForm ? '取消' : '新建标签'}
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* 创建标签表单 */}
        {!readOnly && showCreateForm && (
          <form onSubmit={handleCreateTag} className="mb-4 sm:mb-5 animate-fade-in flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1 h-10 sm:h-auto text-sm sm:text-base"
                placeholder="输入标签名称..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-sm w-10 h-10 sm:w-auto sm:h-auto touch-manipulation" disabled={createTag.isPending}>
                {createTag.isPending ? '...' : '✓'}
              </button>
            </div>
          </form>
        )}

        {/* 搜索框和排序 */}
        <div className="mb-4 sm:mb-5 space-y-3 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input w-full pl-10 sm:pl-11 h-10 sm:h-auto text-sm sm:text-base"
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 标签控制：排序、布局、清空 */}
          <TagControls
            sortBy={sortBy}
            onSortChange={setSortBy}
            layout={tagLayout}
            onLayoutChange={onTagLayoutChange}
            selectedCount={selectedTags.length}
            onClearSelection={() => onTagsChange([])}
          />
        </div>

        {/* 标签列表 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-1 min-h-0">
          {isTagLoading && (
            <div className="text-center py-8 text-muted-foreground/60 text-sm">
              <svg className="animate-spin h-6 w-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载中...
            </div>
          )}

          {!isTagLoading && filteredTags.length === 0 && (
            <div className="text-center py-12 text-muted-foreground/60">
              <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-sm">
                {searchQuery
                  ? '没有找到匹配的标签'
                  : readOnly
                    ? '发布者尚未公开任何标签'
                    : '暂无标签，点击 + 创建'}
              </p>
            </div>
          )}

          {!isTagLoading && orderedTags.length > 0 && (
            <div
              className={`${tagLayout === 'masonry'
                ? 'flex flex-wrap items-start gap-2 justify-between'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-center'
                }`}
            >
              {orderedTags.map((tag) => (
                <TagItem
                  key={tag.id}
                  tag={tag}
                  isSelected={selectedTags.includes(tag.id)}
                  isRelated={relatedTagIds.has(tag.id)}
                  hasSelection={selectedTags.length > 0}
                  layout={tagLayout}
                  onToggle={() => handleToggleTag(tag.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 标签管理模态框 */}
      {!readOnly && showManageModal && (
        <TagManageModal
          tags={tags}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </>
  )
}

