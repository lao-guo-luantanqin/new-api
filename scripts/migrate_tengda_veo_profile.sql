-- Tengda Geeknow Veo 3.1: profile + model bindings + metadata.
-- Safe to re-run.

INSERT INTO model_ui_param_profiles (
    capability, profile_id, api_mode, requires_reference_media,
    poll, poll_status, reference_limits, params, option_rules, hints,
    created_time, updated_time
)
VALUES (
    'video',
    'video-tpl-async-ratio-duration-ref1-veo',
    'videos-json-async',
    FALSE,
    '{}',
    NULL,
    '{"images":5,"videos":0,"audios":0}',
    '{"resolution":{"enabled":false},"ratio":{"enabled":true,"options":[{"value":"16:9","label":"横屏"},{"value":"9:16","label":"竖屏"}]},"duration":{"enabled":true,"min":1,"max":30,"hint":"单位为秒；文档常见值为 8、10，具体以当前模型/账户为准。"},"generateAudio":{"enabled":false},"watermark":{"enabled":false},"seed":{"enabled":false},"widthHeight":{"enabled":false},"frameInputs":{"enabled":false}}',
    '[]',
    '[{"text":"Geeknow Veo 3.1：文生视频或参考图；画幅 1280×720 / 720×1280；duration 为整数秒（文档示例 8/10）；input_reference 可传 URL/base64，多张时效果取决于模型。"}]',
    EXTRACT(EPOCH FROM NOW())::BIGINT,
    EXTRACT(EPOCH FROM NOW())::BIGINT
)
ON CONFLICT (capability, profile_id) DO UPDATE SET
    api_mode = EXCLUDED.api_mode,
    reference_limits = EXCLUDED.reference_limits,
    params = EXCLUDED.params,
    hints = EXCLUDED.hints,
    updated_time = EXCLUDED.updated_time;

UPDATE models SET
    description = '腾达 Geeknow Veo 3.1 标准质量。文生/图生，1280×720 或 720×1280，duration 整数秒。',
    api_doc = '{"dispatch_mode":"async","intro":"Geeknow Veo 3.1：POST /v1/videos 提交任务，GET /v1/videos/{task_id} 轮询。size 常见 1280x720 / 720x1280；duration 为整数秒（文档示例 8/10）；input_reference 可传单张或多张。","endpoints":[{"method":"POST","path":"{{base}}/videos","description":"创建视频任务（application/json）。"},{"method":"GET","path":"{{base}}/videos/{task_id}","description":"查询任务状态。"}],"basic_request_json":{"model":"{{model}}","prompt":"在广场中央跳舞，镜头缓慢推进，电影感光照","size":"1280x720","duration":10},"request_json":{"model":"{{model}}","prompt":"融合参考图风格，人物在场景中自然走动","size":"1280x720","duration":10,"input_reference":["https://example.com/ref-a.png","https://example.com/ref-b.png"]},"params":[{"name":"model","description":"必填：tengda-veo_3_1 或 tengda-veo_3_1-fast。"},{"name":"prompt","description":"必填，视频描述。"},{"name":"size","description":"1280x720（横屏）或 720x1280（竖屏）。"},{"name":"duration","description":"整数秒；文档示例 8/10，具体以模型/账户为准。"},{"name":"input_reference","description":"可选，参考图 URL / base64 / data URI，可单张或多张数组。"}],"create_response_json":{"id":"video_abc123","status":"queued","progress":0},"query_response_json":{"id":"video_abc123","status":"completed","video_url":"https://example.com/video.mp4"}}',
    updated_time = EXTRACT(EPOCH FROM NOW())::BIGINT
WHERE model_name = 'tengda-veo_3_1' AND deleted_at IS NULL;

UPDATE models SET
    description = '腾达 Geeknow Veo 3.1 Fast。更快生成，参数同标准版。',
    api_doc = '{"dispatch_mode":"async","intro":"Geeknow Veo 3.1 Fast：POST /v1/videos 提交任务，GET /v1/videos/{task_id} 轮询。size 常见 1280x720 / 720x1280；duration 为整数秒（文档示例 8/10）；input_reference 可传单张或多张。","endpoints":[{"method":"POST","path":"{{base}}/videos","description":"创建视频任务（application/json）。"},{"method":"GET","path":"{{base}}/videos/{task_id}","description":"查询任务状态。"}],"basic_request_json":{"model":"{{model}}","prompt":"一辆红色跑车穿过雨夜街道，路面反射霓虹灯光","size":"1280x720","duration":8},"request_json":{"model":"{{model}}","prompt":"融合参考图风格，人物在场景中自然走动","size":"1280x720","duration":10,"input_reference":["https://example.com/ref-a.png","https://example.com/ref-b.png"]},"params":[{"name":"model","description":"必填：tengda-veo_3_1-fast。"},{"name":"prompt","description":"必填，视频描述。"},{"name":"size","description":"1280x720（横屏）或 720x1280（竖屏）。"},{"name":"duration","description":"整数秒；文档示例 8/10，具体以模型/账户为准。"},{"name":"input_reference","description":"可选，参考图 URL / base64 / data URI，可单张或多张数组。"}],"create_response_json":{"id":"video_abc123","status":"queued","progress":0},"query_response_json":{"id":"video_abc123","status":"completed","video_url":"https://example.com/video.mp4"}}',
    updated_time = EXTRACT(EPOCH FROM NOW())::BIGINT
WHERE model_name = 'tengda-veo_3_1-fast' AND deleted_at IS NULL;
