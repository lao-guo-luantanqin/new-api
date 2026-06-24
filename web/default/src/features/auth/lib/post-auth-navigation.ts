/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { redirect } from '@tanstack/react-router'
import {
  isCanvasRedirectUrl,
  isExternalRedirect,
} from '@/features/canvas/lib/post-auth-redirect'
import { DEFAULT_CANVAS_BASE_URL } from '@/features/canvas/lib/canvas-config'
import {
  parseInternalRedirectPath,
  resolveAuthRedirectTarget,
} from './redirect-path'

/** 已登录用户跳转到登录前目标页（用于 route beforeLoad）。 */
export function throwAuthenticatedRedirect(redirectTo?: string): never {
  const target = resolveAuthRedirectTarget(redirectTo) || '/dashboard'

  if (isCanvasRedirectUrl(target, DEFAULT_CANVAS_BASE_URL)) {
    throw redirect({ to: '/canvas/open', search: { redirect: target } })
  }

  if (isExternalRedirect(target)) {
    throw redirect({ href: target })
  }

  const { to, search } = parseInternalRedirectPath(target)
  throw redirect({ to, search })
}
