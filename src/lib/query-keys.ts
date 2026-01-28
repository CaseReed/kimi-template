/**
 * Query Keys Factory
 *
 * Centralized query key management for TanStack Query.
 * Follows the factory pattern for type-safe, consistent key generation.
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

// ============================================================================
// Dashboard Query Keys
// ============================================================================

export const dashboardKeys = {
  /**
   * Base key for all dashboard queries
   */
  all: ["dashboard"] as const,

  /**
   * Dashboard statistics
   * @example queryKeys.dashboard.stats
   * @returns ['dashboard', 'stats']
   */
  stats: () => [...dashboardKeys.all, "stats"] as const,

  /**
   * Dashboard revenue data
   * @example queryKeys.dashboard.revenue
   * @returns ['dashboard', 'revenue']
   */
  revenue: () => [...dashboardKeys.all, "revenue"] as const,

  /**
   * Dashboard categories data
   * @example queryKeys.dashboard.categories
   * @returns ['dashboard', 'categories']
   */
  categories: () => [...dashboardKeys.all, "categories"] as const,

  /**
   * Dashboard transactions with pagination
   * @param page - Page number (0-indexed or 1-indexed based on your API)
   * @example queryKeys.dashboard.transactions(1)
   * @returns ['dashboard', 'transactions', 1]
   */
  transactions: (page: number) =>
    [...dashboardKeys.all, "transactions", page] as const,

  /**
   * Dashboard transactions list (all pages)
   * @example queryKeys.dashboard.transactionsAll
   * @returns ['dashboard', 'transactions']
   */
  transactionsAll: () => [...dashboardKeys.all, "transactions"] as const,

  /**
   * Dashboard user activity
   * @example queryKeys.dashboard.activity
   * @returns ['dashboard', 'activity']
   */
  activity: () => [...dashboardKeys.all, "activity"] as const,

  /**
   * Dashboard notifications
   * @example queryKeys.dashboard.notifications
   * @returns ['dashboard', 'notifications']
   */
  notifications: () => [...dashboardKeys.all, "notifications"] as const,

  /**
   * Dashboard settings/preferences
   * @example queryKeys.dashboard.settings
   * @returns ['dashboard', 'settings']
   */
  settings: () => [...dashboardKeys.all, "settings"] as const,

  /**
   * Dashboard analytics data
   * @example queryKeys.dashboard.analytics
   * @returns ['dashboard', 'analytics']
   */
  analytics: () => [...dashboardKeys.all, "analytics"] as const,

  /**
   * Dashboard reports
   * @param reportId - Optional specific report ID
   * @example queryKeys.dashboard.reports()
   * @example queryKeys.dashboard.reports('monthly-2024')
   * @returns ['dashboard', 'reports'] or ['dashboard', 'reports', 'monthly-2024']
   */
  reports: (reportId?: string) =>
    reportId
      ? ([...dashboardKeys.all, "reports", reportId] as const)
      : ([...dashboardKeys.all, "reports"] as const),
};

// ============================================================================
// User Query Keys
// ============================================================================

export const userKeys = {
  /**
   * Base key for all user queries
   */
  all: ["users"] as const,

  /**
   * Current authenticated user
   * @example queryKeys.user.me
   * @returns ['users', 'me']
   */
  me: () => [...userKeys.all, "me"] as const,

  /**
   * User lists
   * @example queryKeys.user.lists()
   * @returns ['users', 'list']
   */
  lists: () => [...userKeys.all, "list"] as const,

  /**
   * User list with filters
   * @param filters - Filter parameters
   * @example queryKeys.user.list({ page: 1, search: 'john' })
   * @returns ['users', 'list', { page: 1, search: 'john' }]
   */
  list: (filters: Record<string, unknown>) =>
    [...userKeys.lists(), filters] as const,

  /**
   * User details
   * @example queryKeys.user.details()
   * @returns ['users', 'detail']
   */
  details: () => [...userKeys.all, "detail"] as const,

  /**
   * Specific user detail
   * @param id - User ID
   * @example queryKeys.user.detail('123')
   * @returns ['users', 'detail', '123']
   */
  detail: (id: string) => [...userKeys.details(), id] as const,

  /**
   * User roles
   * @example queryKeys.user.roles()
   * @returns ['users', 'roles']
   */
  roles: () => [...userKeys.all, "roles"] as const,

  /**
   * User permissions
   * @param userId - User ID
   * @example queryKeys.user.permissions('123')
   * @returns ['users', '123', 'permissions']
   */
  permissions: (userId: string) =>
    [...userKeys.all, userId, "permissions"] as const,

  /**
   * User sessions
   * @example queryKeys.user.sessions()
   * @returns ['users', 'sessions']
   */
  sessions: () => [...userKeys.all, "sessions"] as const,

  /**
   * User preferences
   * @example queryKeys.user.preferences()
   * @returns ['users', 'preferences']
   */
  preferences: () => [...userKeys.all, "preferences"] as const,
};

// ============================================================================
// Auth Query Keys
// ============================================================================

export const authKeys = {
  /**
   * Base key for all auth queries
   */
  all: ["auth"] as const,

  /**
   * Current authentication session
   * @example queryKeys.auth.session
   * @returns ['auth', 'session']
   */
  session: () => [...authKeys.all, "session"] as const,

  /**
   * Authentication providers
   * @example queryKeys.auth.providers
   * @returns ['auth', 'providers']
   */
  providers: () => [...authKeys.all, "providers"] as const,

  /**
   * CSRF token
   * @example queryKeys.auth.csrf
   * @returns ['auth', 'csrf']
   */
  csrf: () => [...authKeys.all, "csrf"] as const,

  /**
   * Two-factor authentication status
   * @example queryKeys.auth.twoFactor
   * @returns ['auth', '2fa']
   */
  twoFactor: () => [...authKeys.all, "2fa"] as const,
};

// ============================================================================
// Settings Query Keys
// ============================================================================

export const settingsKeys = {
  /**
   * Base key for all settings queries
   */
  all: ["settings"] as const,

  /**
   * All application settings
   * @example queryKeys.settings.all
   * @returns ['settings']
   */
  settings: () => settingsKeys.all,

  /**
   * General settings
   * @example queryKeys.settings.general
   * @returns ['settings', 'general']
   */
  general: () => [...settingsKeys.all, "general"] as const,

  /**
   * Notification settings
   * @example queryKeys.settings.notifications
   * @returns ['settings', 'notifications']
   */
  notifications: () => [...settingsKeys.all, "notifications"] as const,

  /**
   * Security settings
   * @example queryKeys.settings.security
   * @returns ['settings', 'security']
   */
  security: () => [...settingsKeys.all, "security"] as const,

  /**
   * Appearance settings
   * @example queryKeys.settings.appearance
   * @returns ['settings', 'appearance']
   */
  appearance: () => [...settingsKeys.all, "appearance"] as const,

  /**
   * API settings/keys
   * @example queryKeys.settings.api
   * @returns ['settings', 'api']
   */
  api: () => [...settingsKeys.all, "api"] as const,
};

// ============================================================================
// Combined Query Keys Export
// ============================================================================

/**
 * Centralized query keys factory
 *
 * Usage examples:
 *
 * ```typescript
 * // In a component
 * const { data } = useQuery({
 *   queryKey: queryKeys.dashboard.stats(),
 *   queryFn: fetchStats,
 * });
 *
 * // Invalidating queries
 * queryClient.invalidateQueries({
 *   queryKey: queryKeys.dashboard.all,
 * });
 *
 * // Prefetching
 * queryClient.prefetchQuery({
 *   queryKey: queryKeys.user.detail(userId),
 *   queryFn: () => fetchUser(userId),
 * });
 * ```
 */
export const queryKeys = {
  dashboard: dashboardKeys,
  user: userKeys,
  auth: authKeys,
  settings: settingsKeys,
};

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type for dashboard query keys
 */
export type DashboardQueryKey =
  | typeof dashboardKeys.all
  | ReturnType<typeof dashboardKeys.stats>
  | ReturnType<typeof dashboardKeys.revenue>
  | ReturnType<typeof dashboardKeys.categories>
  | ReturnType<typeof dashboardKeys.transactions>
  | ReturnType<typeof dashboardKeys.transactionsAll>
  | ReturnType<typeof dashboardKeys.activity>
  | ReturnType<typeof dashboardKeys.notifications>
  | ReturnType<typeof dashboardKeys.settings>
  | ReturnType<typeof dashboardKeys.analytics>
  | ReturnType<typeof dashboardKeys.reports>;

/**
 * Type for user query keys
 */
export type UserQueryKey =
  | typeof userKeys.all
  | ReturnType<typeof userKeys.me>
  | ReturnType<typeof userKeys.lists>
  | ReturnType<typeof userKeys.list>
  | ReturnType<typeof userKeys.details>
  | ReturnType<typeof userKeys.detail>
  | ReturnType<typeof userKeys.roles>
  | ReturnType<typeof userKeys.permissions>
  | ReturnType<typeof userKeys.sessions>
  | ReturnType<typeof userKeys.preferences>;

/**
 * Type for auth query keys
 */
export type AuthQueryKey =
  | typeof authKeys.all
  | ReturnType<typeof authKeys.session>
  | ReturnType<typeof authKeys.providers>
  | ReturnType<typeof authKeys.csrf>
  | ReturnType<typeof authKeys.twoFactor>;

/**
 * Type for settings query keys
 */
export type SettingsQueryKey =
  | typeof settingsKeys.all
  | ReturnType<typeof settingsKeys.general>
  | ReturnType<typeof settingsKeys.notifications>
  | ReturnType<typeof settingsKeys.security>
  | ReturnType<typeof settingsKeys.appearance>
  | ReturnType<typeof settingsKeys.api>;

/**
 * Union type of all query keys
 */
export type QueryKey =
  | DashboardQueryKey
  | UserQueryKey
  | AuthQueryKey
  | SettingsQueryKey;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a query key matches a prefix
 * @param key - The query key to check
 * @param prefix - The prefix to match
 * @returns True if the key starts with the prefix
 */
export function matchesKeyPrefix(
  key: readonly unknown[],
  prefix: readonly unknown[]
): boolean {
  if (prefix.length > key.length) return false;
  return prefix.every((value, index) => key[index] === value);
}

/**
 * Get the string representation of a query key
 * @param key - The query key
 * @returns String representation
 */
export function keyToString(key: readonly unknown[]): string {
  return key
    .map((k) => (typeof k === "object" ? JSON.stringify(k) : String(k)))
    .join("/");
}

/**
 * Create a query key matcher function
 * @param prefix - The prefix to match
 * @returns Matcher function
 */
export function createKeyMatcher(prefix: readonly unknown[]) {
  return (key: readonly unknown[]) => matchesKeyPrefix(key, prefix);
}

// ============================================================================
// Default Export
// ============================================================================

export default queryKeys;
