#!/usr/bin/env python3
"""更新火山 Seedance 官方元数据：删除非官方别名，按秒 model_price + 多档位参考描述。"""

import json
import time
import psycopg2

USD2RMB = 7.3

# 720p/16:9 无参考 元/秒（官方 5s 示例 ÷ 5）
SEEDANCE_USD_PER_SEC = {
    "doubao-seedance-2-0-260128": 0.994 / USD2RMB,
    "doubao-seedance-2-0-fast-260128": 0.800 / USD2RMB,
    "doubao-seedance-2-0-mini": 0.496 / USD2RMB,
    "doubao-seedance-1-5-pro-251215": 0.172 / USD2RMB,
    "doubao-seedance-1-0-pro-250528": 0.154 / USD2RMB,
    "Seedance-2.0": 0.994 / USD2RMB,
    "seedance-2.0-VIP": 0.994 / USD2RMB,
    "seedance-2.0-带参考-固定15s": 0.994 / USD2RMB,
}

DESC_2_0 = (
    "Doubao Seedance 2.0 官方视频模型。平台按秒计费（720p 无参考底价 ${base:.4f}/s）。"
    "官方参考（元/秒，16:9）："
    "480p 无参考 0.462 / 含参考 0.506~1.124；"
    "720p 无参考 0.994 / 含参考 1.088~2.420；"
    "1080p 无参考 2.478 / 含参考 2.712~6.026。"
    "含视频参考、分辨率档位在计费时自动乘算。"
)

DESC_FAST = (
    "Doubao Seedance 2.0 Fast（不支持 1080p）。按秒计费，720p 无参考 ${base:.4f}/s。"
    "官方参考（元/秒）：480p 无参考 0.372 / 含参考 0.428~0.950；"
    "720p 无参考 0.800 / 含参考 0.856~1.900。"
)

DESC_MINI = (
    "Doubao Seedance 2.0 mini。按秒计费，720p 无参考 ${base:.4f}/s。"
    "官方参考（元/秒）：480p 无参考 0.232 / 含参考 0.272~0.605；"
    "720p 无参考 0.496 / 含参考 0.544~1.210。"
)

DESC_15 = (
    "Doubao Seedance 1.5 Pro。按秒计费，720p 无声 ${base:.4f}/s。"
    "官方参考：无声 8 元/百万 token，有声 16 元/百万 token；"
    "720p 5s 示例无声 0.86 元（0.172 元/秒），有声 1.73 元（0.346 元/秒）。"
)

DESC_10 = (
    "Doubao Seedance 1.0 Pro。按秒计费，720p ${base:.4f}/s。"
    "官方在线推理 15 元/百万 token。"
)

OFFICIAL_UPDATES = {
    "doubao-seedance-2-0-260128": DESC_2_0,
    "doubao-seedance-2-0-fast-260128": DESC_FAST,
    "doubao-seedance-2-0-mini": DESC_MINI,
    "doubao-seedance-1-5-pro-251215": DESC_15,
    "doubao-seedance-1-0-pro-250528": DESC_10,
}

DELETE_MODELS = [
    "Seedance-2.0",
    "seedance-2.0-VIP",
    "seedance-2.0-带参考-固定15s",
]


def merge_json_option(cur, key: str, updates: dict, remove_keys: list[str]):
    cur.execute("SELECT value FROM options WHERE key = %s", (key,))
    row = cur.fetchone()
    data = json.loads(row[0]) if row and row[0] else {}
    for k in remove_keys:
        data.pop(k, None)
    data.update(updates)
    cur.execute(
        """
        INSERT INTO options (key, value) VALUES (%s, %s)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        """,
        (key, json.dumps(data, ensure_ascii=False)),
    )


def main():
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        dbname="new-api",
        user="root",
        password="123456",
    )
    conn.autocommit = False
    cur = conn.cursor()
    now = int(time.time())

    # 硬删非官方元数据
    for name in DELETE_MODELS:
        cur.execute(
            "DELETE FROM models WHERE model_name = %s",
            (name,),
        )
        print(f"soft-deleted metadata: {name} ({cur.rowcount} rows)")

    # 更新官方模型描述
    for model, tmpl in OFFICIAL_UPDATES.items():
        desc = tmpl.format(base=SEEDANCE_USD_PER_SEC[model])
        cur.execute(
            """
            UPDATE models SET description = %s, updated_time = %s, sync_official = 1
            WHERE model_name = %s AND deleted_at IS NULL
            """,
            (desc, now, model),
        )

    price_updates = {k: v for k, v in SEEDANCE_USD_PER_SEC.items()}
    ratio_remove = list(DELETE_MODELS) + list(OFFICIAL_UPDATES.keys())

    merge_json_option(cur, "ModelPrice", price_updates, [])
    merge_json_option(cur, "ModelRatio", {}, ratio_remove)

    conn.commit()
    cur.close()
    conn.close()
    print("done: ModelPrice updated, ModelRatio cleaned for seedance models")


if __name__ == "__main__":
    main()
