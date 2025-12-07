import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env, RouteParams, SQLParam } from '../../lib/types'
import { success, badRequest, notFound, internalError } from '../../lib/response'
import { requireAuth, AuthContext } from '../../middleware/auth'

interface UserPreferences {
  user_id: string
  theme: 'light' | 'dark' | 'system'
  page_size: number
  view_mode: 'list' | 'card' | 'minimal' | 'title'
  density: 'compact' | 'normal' | 'comfortable'
  tag_layout?: 'grid' | 'masonry'
  sort_by?: 'created' | 'updated' | 'pinned' | 'popular'
  search_auto_clear_seconds?: number
  tag_selection_auto_clear_seconds?: number
  enable_search_auto_clear?: number
  enable_tag_selection_auto_clear?: number
  default_bookmark_icon?: string
  snapshot_retention_count?: number
  snapshot_auto_create?: number
  snapshot_auto_dedupe?: number
  snapshot_auto_cleanup_days?: number
  updated_at: string
}

interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  page_size?: number
  view_mode?: 'list' | 'card' | 'minimal' | 'title'
  density?: 'compact' | 'normal' | 'comfortable'
  tag_layout?: 'grid' | 'masonry'
  sort_by?: 'created' | 'updated' | 'pinned' | 'popular'
  search_auto_clear_seconds?: number
  tag_selection_auto_clear_seconds?: number
  enable_search_auto_clear?: boolean
  enable_tag_selection_auto_clear?: boolean
  default_bookmark_icon?: string
  snapshot_retention_count?: number
  snapshot_auto_create?: boolean
  snapshot_auto_dedupe?: boolean
  snapshot_auto_cleanup_days?: number
}

async function hasTagLayoutColumn(db: D1Database): Promise<boolean> {
  try {
    await db.prepare('SELECT tag_layout FROM user_preferences LIMIT 1').first()
    return true
  } catch (error) {
    if (error instanceof Error && /no such column: tag_layout/i.test(error.message)) {
      return false
    }
    throw error
  }
}

async function hasSortByColumn(db: D1Database): Promise<boolean> {
  try {
    await db.prepare('SELECT sort_by FROM user_preferences LIMIT 1').first()
    return true
  } catch (error) {
    if (error instanceof Error && /no such column: sort_by/i.test(error.message)) {
      return false
    }
    throw error
  }
}

// 某些旧数据库可能还没有自动清空相关字段，做一次能力探测，避免 500
async function hasAutomationColumns(db: D1Database): Promise<boolean> {
  try {
    // 这些字段在同一个迁移中加入，只检测一个列即可代表这一批字段是否存在
    await db
      .prepare('SELECT search_auto_clear_seconds FROM user_preferences LIMIT 1')
      .first()
    return true
  } catch (error) {
    if (
      error instanceof Error &&
      /no such column: search_auto_clear_seconds/i.test(error.message)
    ) {
      return false
    }
    throw error
  }
}

// GET /api/v1/preferences - 获取用户偏好
export const onRequestGet: PagesFunction<Env, RouteParams, AuthContext>[] = [
  requireAuth,
  async (context) => {
    try {
      const userId = context.data.user_id

      const preferences = await context.env.DB.prepare(
        'SELECT * FROM user_preferences WHERE user_id = ?'
      )
        .bind(userId)
        .first<UserPreferences>()

      if (!preferences) {
        return notFound('未找到偏好设置')
      }


      if (!preferences) {
        return notFound('未找到偏好设置')
      }

      return success({
        preferences: {
          theme: preferences.theme,
          page_size: preferences.page_size,
          view_mode: preferences.view_mode,
          density: preferences.density,
          tag_layout: preferences.tag_layout ?? 'grid',
          sort_by: preferences.sort_by ?? 'popular',
          search_auto_clear_seconds: preferences.search_auto_clear_seconds ?? 15,
          tag_selection_auto_clear_seconds: preferences.tag_selection_auto_clear_seconds ?? 30,
          enable_search_auto_clear: preferences.enable_search_auto_clear === 1,
          enable_tag_selection_auto_clear: preferences.enable_tag_selection_auto_clear === 1,
          default_bookmark_icon: preferences.default_bookmark_icon ?? 'bookmark',
          snapshot_retention_count: preferences.snapshot_retention_count ?? 5,
          snapshot_auto_create: preferences.snapshot_auto_create === 1,
          snapshot_auto_dedupe: preferences.snapshot_auto_dedupe === 1,
          snapshot_auto_cleanup_days: preferences.snapshot_auto_cleanup_days ?? 0,
          updated_at: preferences.updated_at,
        },
      })
    } catch (error) {
      console.error('Get preferences error:', error)
      return internalError('获取偏好设置失败')
    }
  },
]

// PATCH /api/v1/preferences - 更新用户偏好
export const onRequestPatch: PagesFunction<Env, RouteParams, AuthContext>[] = [
  requireAuth,
  async (context) => {
    try {
      const userId = context.data.user_id
      const body = await context.request.json() as UpdatePreferencesRequest
      const tagLayoutSupported = await hasTagLayoutColumn(context.env.DB)
      const sortBySupported = await hasSortByColumn(context.env.DB)
      const automationSupported = await hasAutomationColumns(context.env.DB)

      // 验证输入
      if (body.theme && !['light', 'dark', 'system'].includes(body.theme)) {
        return badRequest('主题值不合法')
      }

      if (body.page_size && (body.page_size < 10 || body.page_size > 100)) {
        return badRequest('每页条数必须在 10 到 100 之间')
      }

      if (body.view_mode && !['list', 'card', 'minimal', 'title'].includes(body.view_mode)) {
        return badRequest('视图模式不合法')
      }

      if (body.density && !['compact', 'normal', 'comfortable'].includes(body.density)) {
        return badRequest('密度设置不合法')
      }

      if (body.tag_layout && !['grid', 'masonry'].includes(body.tag_layout)) {
        return badRequest('标签布局不合法')
      }

      if (body.sort_by && !['created', 'updated', 'pinned', 'popular'].includes(body.sort_by)) {
        return badRequest('排序方式不合法')
      }

      if (body.search_auto_clear_seconds !== undefined && (body.search_auto_clear_seconds < 5 || body.search_auto_clear_seconds > 120)) {
        return badRequest('搜索自动清空时间必须在 5 到 120 秒之间')
      }

      if (body.tag_selection_auto_clear_seconds !== undefined && (body.tag_selection_auto_clear_seconds < 10 || body.tag_selection_auto_clear_seconds > 300)) {
        return badRequest('标签选择自动清空时间必须在 10 到 300 秒之间')
      }

      // 默认书签图标：前端当前只提供 orbital-spinner，但为了兼容旧数据，仍然允许历史值
      if (
        body.default_bookmark_icon &&
        !['gradient-glow', 'pulse-breath', 'orbital-spinner', 'bookmark'].includes(
          body.default_bookmark_icon,
        )
      ) {
        return badRequest('默认书签图标不合法')
      }

      if (body.snapshot_retention_count !== undefined && (body.snapshot_retention_count < -1 || body.snapshot_retention_count > 100)) {
        return badRequest('快照保留数量必须在 -1 到 100 之间（-1 表示不限）')
      }

      if (body.snapshot_auto_cleanup_days !== undefined && (body.snapshot_auto_cleanup_days < 0 || body.snapshot_auto_cleanup_days > 365)) {
        return badRequest('快照自动清理天数必须在 0 到 365 之间')
      }

      // 确保当前用户在 user_preferences 表中有一条记录；
      // 如果不存在，则插入一条使用表定义默认值的记录，避免 UPDATE 影响 0 行。
      await context.env.DB.prepare(
        `INSERT INTO user_preferences (user_id)
         VALUES (?)
         ON CONFLICT(user_id) DO NOTHING`
      )
        .bind(userId)
        .run()

      // 构建更新语句
      const updates: string[] = []
      const values: SQLParam[] = []

      if (body.theme !== undefined) {
        updates.push('theme = ?')
        values.push(body.theme)
      }

      if (body.page_size !== undefined) {
        updates.push('page_size = ?')
        values.push(body.page_size)
      }

      if (body.view_mode !== undefined) {
        updates.push('view_mode = ?')
        values.push(body.view_mode)
      }

      if (body.density !== undefined) {
        updates.push('density = ?')
        values.push(body.density)
      }

      if (body.tag_layout !== undefined && tagLayoutSupported) {
        updates.push('tag_layout = ?')
        values.push(body.tag_layout)
      }

      if (body.sort_by !== undefined && sortBySupported) {
        updates.push('sort_by = ?')
        values.push(body.sort_by)
      }

      if (automationSupported) {
        if (body.search_auto_clear_seconds !== undefined) {
          updates.push('search_auto_clear_seconds = ?')
          values.push(body.search_auto_clear_seconds)
        }

        if (body.tag_selection_auto_clear_seconds !== undefined) {
          updates.push('tag_selection_auto_clear_seconds = ?')
          values.push(body.tag_selection_auto_clear_seconds)
        }

        if (body.enable_search_auto_clear !== undefined) {
          updates.push('enable_search_auto_clear = ?')
          values.push(body.enable_search_auto_clear ? 1 : 0)
        }

        if (body.enable_tag_selection_auto_clear !== undefined) {
          updates.push('enable_tag_selection_auto_clear = ?')
          values.push(body.enable_tag_selection_auto_clear ? 1 : 0)
        }
      }

      if (automationSupported) {
        if (body.default_bookmark_icon !== undefined) {
          updates.push('default_bookmark_icon = ?')
          values.push(body.default_bookmark_icon)
        }

        if (body.snapshot_retention_count !== undefined) {
          updates.push('snapshot_retention_count = ?')
          values.push(body.snapshot_retention_count)
        }

        if (body.snapshot_auto_create !== undefined) {
          updates.push('snapshot_auto_create = ?')
          values.push(body.snapshot_auto_create ? 1 : 0)
        }

        if (body.snapshot_auto_dedupe !== undefined) {
          updates.push('snapshot_auto_dedupe = ?')
          values.push(body.snapshot_auto_dedupe ? 1 : 0)
        }

        if (body.snapshot_auto_cleanup_days !== undefined) {
          updates.push('snapshot_auto_cleanup_days = ?')
          values.push(body.snapshot_auto_cleanup_days)
        }
      }

      if (updates.length === 0) {
        if ((body.tag_layout !== undefined && !tagLayoutSupported) ||
            (body.sort_by !== undefined && !sortBySupported)) {
          const preferences = await context.env.DB.prepare(
            'SELECT * FROM user_preferences WHERE user_id = ?'
          )
            .bind(userId)
            .first<UserPreferences>()

          if (!preferences) {
            return internalError('加载偏好设置失败')
          }

          return success({
            preferences: {
              theme: preferences.theme,
              page_size: preferences.page_size,
              view_mode: preferences.view_mode,
              density: preferences.density,
              tag_layout: preferences.tag_layout ?? 'grid',
              sort_by: preferences.sort_by ?? 'popular',
              search_auto_clear_seconds: preferences.search_auto_clear_seconds ?? 15,
              tag_selection_auto_clear_seconds: preferences.tag_selection_auto_clear_seconds ?? 30,
              enable_search_auto_clear: preferences.enable_search_auto_clear === 1,
              enable_tag_selection_auto_clear: preferences.enable_tag_selection_auto_clear === 1,
              default_bookmark_icon: preferences.default_bookmark_icon ?? 'bookmark',
              snapshot_retention_count: preferences.snapshot_retention_count ?? 5,
              snapshot_auto_create: preferences.snapshot_auto_create === 1,
              snapshot_auto_dedupe: preferences.snapshot_auto_dedupe === 1,
              snapshot_auto_cleanup_days: preferences.snapshot_auto_cleanup_days ?? 0,
              updated_at: preferences.updated_at,
            },
          })
        }

        return badRequest('没有可更新的字段')
      }

      const now = new Date().toISOString()
      updates.push('updated_at = ?')
      values.push(now)
      values.push(userId)

      await context.env.DB.prepare(
        `UPDATE user_preferences
         SET ${updates.join(', ')}
         WHERE user_id = ?`
      )
        .bind(...values)
        .run()

      // 获取更新后的偏好
      const preferences = await context.env.DB.prepare(
        'SELECT * FROM user_preferences WHERE user_id = ?'
      )
        .bind(userId)
        .first<UserPreferences>()

      if (!preferences) {
        return internalError('加载偏好设置失败')
      }

      return success({
        preferences: {
          theme: preferences.theme,
          page_size: preferences.page_size,
          view_mode: preferences.view_mode,
          density: preferences.density,
          tag_layout: preferences.tag_layout ?? 'grid',
          sort_by: preferences.sort_by ?? 'popular',
          search_auto_clear_seconds: preferences.search_auto_clear_seconds ?? 15,
          tag_selection_auto_clear_seconds: preferences.tag_selection_auto_clear_seconds ?? 30,
          enable_search_auto_clear: preferences.enable_search_auto_clear === 1,
          enable_tag_selection_auto_clear: preferences.enable_tag_selection_auto_clear === 1,
          default_bookmark_icon: preferences.default_bookmark_icon ?? 'bookmark',
          snapshot_retention_count: preferences.snapshot_retention_count ?? 5,
          snapshot_auto_create: preferences.snapshot_auto_create === 1,
          snapshot_auto_dedupe: preferences.snapshot_auto_dedupe === 1,
          snapshot_auto_cleanup_days: preferences.snapshot_auto_cleanup_days ?? 0,
          updated_at: preferences.updated_at,
        },
      })
    } catch (error) {
      console.error('Update preferences error:', error)

      // 在无法直接查看 Cloudflare Functions 日志的情况下，
      // 临时把错误信息附加到响应中，方便前端 Network 面板中排查问题。
      const baseMessage = '更新偏好设置失败'
      let details = ''

      if (error instanceof Error) {
        details = error.message
      } else if (typeof error === 'string') {
        details = error
      }

      const message = details
        ? `${baseMessage}: ${details}`
        : baseMessage

      return internalError(message)
    }
  },
]
