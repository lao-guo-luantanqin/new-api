-- 硬删非官方 Seedance 元数据
DELETE FROM models WHERE model_name IN ('Seedance-2.0', 'seedance-2.0-VIP', 'seedance-2.0-带参考-固定15s');

-- 更新官方模型描述（720p 无参考 USD/s 参考价）
UPDATE models SET description = 'Doubao Seedance 2.0 官方视频模型。平台按秒计费（720p 无参考底价 $0.1362/s）。官方参考（元/秒，16:9）：480p 无参考 0.462 / 含参考 0.506~1.124；720p 无参考 0.994 / 含参考 1.088~2.420；1080p 无参考 2.478 / 含参考 2.712~6.026。含视频参考、分辨率档位在计费时自动乘算。', updated_time = EXTRACT(EPOCH FROM NOW())::bigint, sync_official = 1
WHERE model_name = 'doubao-seedance-2-0-260128' AND deleted_at IS NULL;

UPDATE models SET description = 'Doubao Seedance 2.0 Fast（不支持 1080p）。按秒计费，720p 无参考 $0.1096/s。官方参考（元/秒）：480p 无参考 0.372 / 含参考 0.428~0.950；720p 无参考 0.800 / 含参考 0.856~1.900。', updated_time = EXTRACT(EPOCH FROM NOW())::bigint, sync_official = 1
WHERE model_name = 'doubao-seedance-2-0-fast-260128' AND deleted_at IS NULL;

UPDATE models SET description = 'Doubao Seedance 2.0 mini。按秒计费，720p 无参考 $0.0680/s。官方参考（元/秒）：480p 无参考 0.232 / 含参考 0.272~0.605；720p 无参考 0.496 / 含参考 0.544~1.210。', updated_time = EXTRACT(EPOCH FROM NOW())::bigint, sync_official = 1
WHERE model_name = 'doubao-seedance-2-0-mini' AND deleted_at IS NULL;

UPDATE models SET description = 'Doubao Seedance 1.5 Pro。按秒计费，720p 无声 $0.0236/s。官方参考：无声 8 元/百万 token，有声 16 元/百万 token；720p 5s 示例无声 0.86 元（0.172 元/秒），有声 1.73 元（0.346 元/秒）。', updated_time = EXTRACT(EPOCH FROM NOW())::bigint, sync_official = 1
WHERE model_name = 'doubao-seedance-1-5-pro-251215' AND deleted_at IS NULL;

UPDATE models SET description = 'Doubao Seedance 1.0 Pro。按秒计费，720p $0.0211/s。官方在线推理 15 元/百万 token。', updated_time = EXTRACT(EPOCH FROM NOW())::bigint, sync_official = 1
WHERE model_name = 'doubao-seedance-1-0-pro-250528' AND deleted_at IS NULL;
