/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { getPricing } from '../api'
import { groupPricingModelsByDisplayName } from '../lib/model-display-name'
import type { PricingModel } from '../types'
import { ModelDocDialog } from './model-doc-dialog'

type ModelDocPickerProps = {
  siteOrigin: string
  /** 仅展示带视频或图像 UI 配置的模型 */
  capability?: 'video' | 'image' | 'all'
  className?: string
}

export function ModelDocPicker(props: ModelDocPickerProps) {
  const { t } = useTranslation()
  const [docModel, setDocModel] = useState<PricingModel | null>(null)
  const capability = props.capability ?? 'all'

  const pricingQuery = useQuery({
    queryKey: ['pricing', 'model-doc-picker'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const models = useMemo(() => {
    const raw = pricingQuery.data?.data ?? []
    const grouped = groupPricingModelsByDisplayName(raw)
    return grouped.filter((model) => {
      if (capability === 'video') return Boolean(model.video_ui_params)
      if (capability === 'image') return Boolean(model.image_ui_params)
      return Boolean(model.video_ui_params || model.image_ui_params)
    })
  }, [pricingQuery.data?.data, capability])

  if (pricingQuery.isLoading) {
    return (
      <p className='text-muted-foreground text-sm'>{t('Loading pricing data...')}</p>
    )
  }

  if (models.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>
        {t('modelDoc.pickerEmpty')}
      </p>
    )
  }

  return (
    <div className={props.className}>
      <p className='text-muted-foreground mb-3 text-sm leading-relaxed'>
        {t('modelDoc.pickerHint')}
      </p>
      <div className='flex flex-wrap gap-2'>
        {models.map((model) => (
          <button
            key={model.model_name}
            type='button'
            onClick={() => setDocModel(model)}
            className='border-input bg-background hover:bg-muted/60 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors'
          >
            <FileText className='size-3.5 opacity-70' />
            {model.display_name || model.model_name}
          </button>
        ))}
      </div>

      <ModelDocDialog
        model={docModel}
        siteOrigin={props.siteOrigin}
        open={Boolean(docModel)}
        onOpenChange={(open) => {
          if (!open) setDocModel(null)
        }}
      />
    </div>
  )
}
