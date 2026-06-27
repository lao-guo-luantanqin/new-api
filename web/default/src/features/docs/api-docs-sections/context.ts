/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { DEFAULT_API_BASE_URL } from '@/features/canvas/lib/canvas-config'

export type ApiDocsContext = {
  siteOrigin: string
  base: string
}

export function createApiDocsContext(siteOrigin: string): ApiDocsContext {
  const origin = siteOrigin.trim() || DEFAULT_API_BASE_URL
  return {
    siteOrigin: origin,
    base: `${origin}/v1`,
  }
}

export function pricingNote() {
  return '具体单价与计费方式（按次 / 按秒）以模型广场为准；失败任务通常不计费。'
}
