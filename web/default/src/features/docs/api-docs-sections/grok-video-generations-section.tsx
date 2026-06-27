/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
*/
import { Link } from '@tanstack/react-router'
import { CodeBlock } from '../components/code-block'
import { DocsSection } from '../components/docs-section'
import { DocsTable } from '../components/docs-table'
import type { ApiDocsContext } from './context'
import { pricingNote } from './context'

export function GrokVideoGenerationsSection(props: ApiDocsContext) {
  const { base, siteOrigin } = props

  return (
    <DocsSection
      id='api-grok-video-generations'
      title='Grok 视频生成（异步）'
      description='面向 API 用户：创建视频生成任务、查询任务状态并获取最终视频地址。视频生成为异步任务，创建后返回 task_id，需轮询至 SUCCESS 后从 result_url 取片。'
    >
      <div className='border-amber-500/30 bg-amber-500/5 mb-6 space-y-2 rounded-xl border p-4 text-sm'>
        <p>
          ⚠️ <strong>接入中转站时</strong>：测试连通性请勿在管理台直接点「测试」按钮。请把你的站点请求地址 + 令牌 +
          本文档（Base URL 换成你的、模型名换成模型广场展示名）交给 AI 做真实请求验证，有问题让 AI 协助调整。
        </p>
        <p>
          ⚠️ <strong>个人直接调用时</strong>：把本文档及令牌交给 AI 接入工作流并进行测试。
        </p>
      </div>

      <p className='text-muted-foreground text-sm'>{pricingNote()}</p>

      <h3 className='text-lg font-semibold'>1. 基础信息</h3>
      <DocsTable
        headers={['项', '说明']}
        rows={[
          ['Base URL', `${siteOrigin}/v1`],
          ['鉴权', 'Authorization: Bearer sk-你的令牌'],
          ['请求格式', 'Content-Type: application/json'],
          ['响应格式', 'JSON'],
        ]}
      />
      <DocsTable
        headers={['操作', '方法', '路径']}
        rows={[
          ['模型列表', 'GET', '/v1/models'],
          ['创建视频任务', 'POST', '/v1/video/generations'],
          ['查询视频任务', 'GET', '/v1/video/generations/{task_id}'],
        ]}
      />
      <p className='text-muted-foreground text-sm'>
        模型名与{' '}
        <Link to='/pricing' className='text-primary font-medium hover:underline'>
          模型广场
        </Link>{' '}
        展示名一致；下文默认模型为 <code className='text-sm'>grok-video</code>。
      </p>

      <h3 className='mt-8 text-lg font-semibold'>2. 获取 API Key</h3>
      <p>
        在控制台创建或复制 API 令牌，调用时放入请求头{' '}
        <code className='text-sm'>Authorization: Bearer sk-xxx</code>。不要把 Key 写入前端公开代码或仓库，建议由后端代为调用。
      </p>

      <h3 className='mt-8 text-lg font-semibold'>3. 查询可用模型</h3>
      <CodeBlock
        title='GET /v1/models'
        code={`curl -X GET "${base}/models" \\
  -H "Authorization: Bearer sk-xxx"`}
      />
      <p className='mb-4'>当前开放的视频模型（以 GET /v1/models 返回为准）：</p>
      <DocsTable
        headers={['模型', '说明', '文生', '单图', '多图', '时长上限']}
        rows={[
          [
            'grok-video',
            '通用默认',
            '✓ 最长 15s',
            '✓ 最长 15s',
            '✓ 最长 10s',
            '多图 seconds&gt;10 自动按 10s',
          ],
          ['grok-video-1.5', '单图生视频预览', '✗', '✓ 最长 15s', '✗', '须且仅能 1 张参考图'],
        ]}
      />
      <p className='text-muted-foreground text-sm'>
        建议通过 /v1/models 动态读取，不要写死单个模型 ID。
      </p>

      <h3 className='mt-8 text-lg font-semibold'>4. 创建视频任务</h3>
      <p className='mb-4'>
        接口：<code className='text-sm'>POST /v1/video/generations</code>
      </p>
      <DocsTable
        headers={['字段', '类型', '必填', '说明']}
        rows={[
          ['model', 'string', '是', '模型 ID，如 grok-video'],
          ['prompt', 'string', '是', '视频提示词'],
          ['seconds', 'integer', '否', '视频秒数，默认建议 4'],
          ['aspect_ratio', 'string', '否', '画幅比例，默认 16:9'],
          ['resolution', 'string', '否', '480p 或 720p，建议 720p'],
          ['image_urls', 'string[]', '否', '参考图 URL 或 base64 data URL 列表（推荐）'],
          ['input_reference', 'object / string', '否', '单参考图，可传 { "image_url": "..." }'],
          ['reference_images', 'string[]', '否', '多参考图字段'],
        ]}
      />
      <p className='text-muted-foreground text-sm'>
        推荐统一使用 <code className='text-sm'>image_urls</code>；服务端会按模型与图片数量自动转换。勿同时传{' '}
        <code className='text-sm'>input_reference</code> 与 <code className='text-sm'>reference_images</code>。
      </p>

      <h3 className='mt-8 text-lg font-semibold'>5. 参数建议</h3>
      <DocsTable
        headers={['参数', '建议值 / 规则']}
        rows={[
          ['seconds', '4 / 6 / 8 / 10 / 12 / 15'],
          ['grok-video 文生 / 单图', '最长 15 秒'],
          ['grok-video 多参考图', '最长 10 秒；请求 &gt;10 秒时自动按 10 秒处理；推荐 4 / 6 / 8 / 10'],
          ['grok-video-1.5', '仅单图生视频，最长 15 秒，不支持纯文生'],
          ['grok-video aspect_ratio', '1:1、16:9、9:16、4:3、3:4、3:2、2:3'],
          ['grok-video-1.5 aspect_ratio', '16:9、9:16'],
          ['resolution', '720p、480p'],
        ]}
      />
      <p className='mt-4 font-medium'>图片要求</p>
      <ul className='list-disc space-y-2 pl-5'>
        <li>推荐公网 HTTPS 直链；支持完整 data URL（如 data:image/png;base64,...），勿传裸 base64</li>
        <li>URL 不应依赖登录、Cookie、防盗链或临时跳转</li>
        <li>图片无法被抓取时任务会 FAILURE，fail_reason 会说明原因</li>
        <li>
          <strong>grok-video</strong> 最多 7 张参考图
        </li>
      </ul>

      <h3 className='mt-8 text-lg font-semibold'>6. 请求示例</h3>
      <CodeBlock
        title='6.1 文生视频'
        code={`curl -X POST "${base}/video/generations" \\
  -H "Authorization: Bearer sk-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "grok-video",
    "prompt": "A cinematic shot of a red sports car driving through rainy neon streets at night",
    "seconds": 6,
    "aspect_ratio": "16:9",
    "resolution": "720p"
  }'`}
      />
      <CodeBlock
        title='6.2 单参考图生视频（image_urls）'
        code={`curl -X POST "${base}/video/generations" \\
  -H "Authorization: Bearer sk-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "grok-video",
    "prompt": "Animate the product with a slow rotating camera, soft studio light, premium commercial style",
    "seconds": 6,
    "aspect_ratio": "9:16",
    "resolution": "720p",
    "image_urls": ["https://example.com/product.png"]
  }'`}
      />
      <CodeBlock
        title='6.2 单参考图（input_reference）'
        code={`{
  "model": "grok-video",
  "prompt": "Animate the product with a slow rotating camera",
  "seconds": 6,
  "aspect_ratio": "9:16",
  "resolution": "720p",
  "input_reference": {
    "image_url": "https://example.com/product.png"
  }
}`}
      />
      <CodeBlock
        title='6.3 多参考图生视频'
        code={`curl -X POST "${base}/video/generations" \\
  -H "Authorization: Bearer sk-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "grok-video",
    "prompt": "Create a smooth product showcase video using these references, luxury lighting, clean background",
    "seconds": 10,
    "aspect_ratio": "16:9",
    "resolution": "720p",
    "image_urls": [
      "https://example.com/ref-1.png",
      "https://example.com/ref-2.png"
    ]
  }'`}
      />
      <CodeBlock
        title='6.4 grok-video-1.5 单图生视频'
        code={`curl -X POST "${base}/video/generations" \\
  -H "Authorization: Bearer sk-xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "grok-video-1.5",
    "prompt": "Use the reference image as the main subject and create a smooth cinematic motion",
    "seconds": 4,
    "aspect_ratio": "16:9",
    "resolution": "480p",
    "image_urls": ["https://example.com/reference.png"]
  }'`}
      />

      <h3 className='mt-8 text-lg font-semibold'>7. 创建响应</h3>
      <p className='text-muted-foreground mb-4 text-sm'>
        关键字段为 <code className='text-sm'>id</code> 或 <code className='text-sm'>task_id</code>，客户端应保存{' '}
        <code className='text-sm'>task_id = response.task_id || response.id</code>。
      </p>
      <CodeBlock
        code={`{
  "id": "task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "task_id": "task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "object": "video",
  "model": "grok-video",
  "status": "queued",
  "progress": 0,
  "created_at": 1780000000
}`}
      />

      <h3 className='mt-8 text-lg font-semibold'>8. 查询任务状态</h3>
      <CodeBlock
        title='轮询请求'
        code={`curl -X GET "${base}/video/generations/task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Authorization: Bearer sk-xxx"`}
      />
      <CodeBlock
        title='处理中'
        code={`{
  "code": "success",
  "message": "",
  "data": {
    "task_id": "task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "IN_PROGRESS",
    "progress": "30%",
    "result_url": "",
    "fail_reason": ""
  }
}`}
      />
      <CodeBlock
        title='成功'
        code={`{
  "code": "success",
  "message": "",
  "data": {
    "task_id": "task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "SUCCESS",
    "progress": "100%",
    "result_url": "https://example.com/generated-video.mp4",
    "fail_reason": ""
  }
}`}
      />
      <CodeBlock
        title='失败'
        code={`{
  "code": "success",
  "message": "",
  "data": {
    "task_id": "task_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "FAILURE",
    "progress": "100%",
    "result_url": "",
    "fail_reason": "Image URL could not be fetched: Fetching image failed with HTTP status 400 Bad Request."
  }
}`}
      />

      <h3 className='mt-6 text-lg font-semibold'>判断规则</h3>
      <DocsTable
        headers={['条件', '含义']}
        rows={[
          ['data.status == "SUCCESS" 且 result_url 非空', '生成成功，立即下载'],
          ['data.status == "FAILURE"', '生成失败，读取 fail_reason'],
          ['SUBMITTED / QUEUED / IN_PROGRESS / NOT_START', '任务仍在处理中，继续轮询'],
        ]}
      />
      <p className='text-muted-foreground text-sm'>
        progress: &quot;100%&quot; 只表示流程已结束，是否成功须看 data.status。
      </p>

      <h3 className='mt-6 text-lg font-semibold'>轮询策略</h3>
      <DocsTable
        headers={['项', '建议值']}
        rows={[
          ['轮询间隔', '每 5 秒一次'],
          ['最大轮询时长', '5 分钟'],
          ['最大轮询次数', '60 次'],
          ['成功取值', 'data.result_url'],
        ]}
      />
      <p className='text-muted-foreground mt-2 text-sm'>
        ⚠️ result_url 为临时直链，有效期约 1 小时，生成成功后请立即下载；建议在业务代码中加入自动下载逻辑。
      </p>
      <CodeBlock
        title='下载示例'
        code={`# 生成成功后立即下载（推荐）
curl -L -o "grok_video_$(date +%s).mp4" "$result_url"`}
      />

      <h3 className='mt-8 text-lg font-semibold'>9. JavaScript 示例</h3>
      <CodeBlock
        code={`const BASE_URL = '${siteOrigin}'
const API_KEY = process.env.API_KEY

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function validateVideoRequest({ model, imageUrls }) {
  if (model === 'grok-video-1.5' && imageUrls.length !== 1) {
    throw new Error('grok-video-1.5 only supports exactly one reference image.')
  }
  if (model === 'grok-video' && imageUrls.length > 7) {
    throw new Error('grok-video supports at most 7 reference images.')
  }
}

async function createVideo({
  model = 'grok-video',
  prompt,
  seconds = 4,
  aspectRatio = '16:9',
  resolution = '720p',
  imageUrls = [],
}) {
  validateVideoRequest({ model, imageUrls })

  const body = { model, prompt, seconds, aspect_ratio: aspectRatio, resolution }
  if (imageUrls.length > 0) {
    body.image_urls = imageUrls
    if (imageUrls.length >= 2 && Number(body.seconds) > 10) {
      body.seconds = 10
    }
  }

  const createResponse = await fetch(\`\${BASE_URL}/v1/video/generations\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const created = await createResponse.json()
  if (!createResponse.ok) {
    throw new Error(\`Video request failed: \${JSON.stringify(created)}\`)
  }

  const taskId = created.task_id || created.id
  if (!taskId) {
    throw new Error(\`No task_id returned: \${JSON.stringify(created)}\`)
  }

  for (let i = 0; i < 60; i += 1) {
    await sleep(5000)

    const pollResponse = await fetch(\`\${BASE_URL}/v1/video/generations/\${taskId}\`, {
      headers: { Authorization: \`Bearer \${API_KEY}\` },
    })

    const result = await pollResponse.json()
    if (!pollResponse.ok) {
      throw new Error(\`Video poll failed: \${JSON.stringify(result)}\`)
    }

    const task = result.data
    if (task?.status === 'SUCCESS' && task.result_url) {
      return { task_id: task.task_id, video_url: task.result_url, raw_response: result }
    }
    if (task?.status === 'FAILURE') {
      throw new Error(\`Video generation failed: \${task.fail_reason || JSON.stringify(result)}\`)
    }
  }

  throw new Error(\`Video generation timeout: \${taskId}\`)
}`}
      />

      <h3 className='mt-8 text-lg font-semibold'>10. 常见错误</h3>
      <DocsTable
        headers={['现象', '原因', '处理']}
        rows={[
          ['401', 'Key 缺失或错误', '检查 Authorization: Bearer sk-xxx'],
          ['403', '权限、额度或分组限制', '检查余额、令牌权限与可用模型'],
          ['400 prompt is required', 'prompt 为空', '提交前校验提示词'],
          ['400 model field is required', 'model 为空', '使用模型列表中的模型 ID'],
          [
            '400 only supports exactly one reference image',
            'grok-video-1.5 参考图数量不对',
            '该模型只传 1 张参考图',
          ],
          ['图片抓取失败', 'URL 无法被服务端访问', '换 HTTPS 直链或 data URL，勿用本地或需登录地址'],
          ['FAILURE + fail_reason', '生成失败或参数不支持', '展示 fail_reason 给用户'],
          ['轮询超时', '任务耗时较长', '保留 task_id 稍后重查'],
        ]}
      />

      <h3 className='mt-8 text-lg font-semibold'>11. 接入注意事项</h3>
      <ul className='list-disc space-y-2 pl-5'>
        <li>通过 /v1/models 动态读取模型，默认推荐 grok-video</li>
        <li>grok-video-1.5 仅用于单参考图生视频，不支持纯文生、不支持多图</li>
        <li>grok-video 文生 / 单图最长 15 秒；多参考图最长 10 秒且最多 7 张</li>
        <li>多参考图 seconds &gt; 10 会自动按 10 秒处理</li>
        <li>最终视频 URL 在查询接口 data.result_url；临时直链约 1 小时有效</li>
        <li>失败时 progress 可能为 100%，以 data.status 判断成功或失败</li>
        <li>失败任务通常不计费，具体以模型广场计费说明为准</li>
      </ul>

      <p className='text-muted-foreground mt-6 text-sm'>
        同系列 Grok 图像与 Chat 流式视频见{' '}
        <a href='#api-grok-image-video' className='text-primary font-medium hover:underline'>
          Grok 图像 &amp; 视频
        </a>
        ；Grok CLI 专线（POST /v1/videos）见{' '}
        <a href='#api-grok-cli-video' className='text-primary font-medium hover:underline'>
          Grok CLI 视频专线
        </a>
        。
      </p>
    </DocsSection>
  )
}
