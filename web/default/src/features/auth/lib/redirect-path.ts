/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/

/** 将当前路由位置序列化为登录 redirect 参数（仅 pathname + search + hash）。 */
export function toAuthRedirectParam(location: {
  pathname: string
  searchStr?: string
  search?: string
  hash?: string
}): string {
  const search = location.searchStr ?? location.search ?? ''
  const hash = location.hash ?? ''
  return `${location.pathname}${search}${hash}`
}

/**
 * 解析登录后的 redirect 目标。
 * 同域完整 URL 会降级为站内路径，避免 TanStack Router 将 href 当作 route id。
 */
export function resolveAuthRedirectTarget(redirect?: string): string | undefined {
  if (!redirect?.trim()) {
    return undefined
  }

  const trimmed = redirect.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed)
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return `${url.pathname}${url.search}${url.hash}`
      }
      return trimmed
    } catch {
      return undefined
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function parseInternalRedirectPath(path: string): {
  to: string
  search?: Record<string, string>
} {
  try {
    const url = new URL(path, 'http://localhost')
    const search: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      search[key] = value
    })
    return {
      to: url.pathname,
      search: Object.keys(search).length > 0 ? search : undefined,
    }
  } catch {
    return { to: path }
  }
}
