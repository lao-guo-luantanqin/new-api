package service

import (
	"encoding/json"
	"strings"

	"github.com/QuantumNous/new-api/dto"
	"github.com/gin-gonic/gin"
)

const (
	ContentPolicyMessageZH = "您的提示词或参考素材触发了上游内容审查，请修改后重新提交。"
	ContentPolicyMessageEN = "Your prompt or reference material was rejected by upstream content moderation. Please revise it and submit again."
)

func PreferChineseClient(c *gin.Context) bool {
	if c == nil {
		return false
	}
	if strings.EqualFold(strings.TrimSpace(c.GetHeader("X-Cangyuan-Client")), "infinite-canvas") {
		return true
	}
	lang := strings.ToLower(strings.TrimSpace(c.GetHeader("Accept-Language")))
	return strings.HasPrefix(lang, "zh")
}

func ContentPolicyMessage(c *gin.Context) string {
	if PreferChineseClient(c) {
		return ContentPolicyMessageZH
	}
	return ContentPolicyMessageEN
}

func IsContentPolicyViolation(text string) bool {
	text = strings.TrimSpace(text)
	if text == "" {
		return false
	}
	lower := strings.ToLower(text)

	patterns := []string{
		"content moderation",
		"content policy",
		"content_policy",
		"content_policy_violation",
		"appear to be unsafe",
		"unsafe content",
		"policy violation",
		"sensitive_words",
		"sensitive words detected",
		"sexualization",
		"sexualized",
		"erotic focus",
		"erotic",
		"exposed cleavage",
		"prompt_blocked",
		"generated video rejected by content moderation",
		"the generated images appear to be unsafe",
		"unexpected end of json input",
		"图片内容不合规",
		"内容政策",
		"裸露",
		"色情",
		"情色",
		"暴力内容",
		"防护限制",
	}

	for _, pattern := range patterns {
		if strings.Contains(lower, pattern) {
			return true
		}
	}

	if strings.Contains(text, "非常抱歉") {
		return strings.Contains(text, "内容政策") ||
			strings.Contains(text, "裸露") ||
			strings.Contains(text, "色情") ||
			strings.Contains(text, "情色") ||
			strings.Contains(text, "暴力") ||
			strings.Contains(text, "防护限制")
	}

	return false
}

func stripLogArtifacts(text string) string {
	text = strings.TrimSpace(text)
	if idx := strings.Index(text, "... [truncated"); idx != -1 {
		text = strings.TrimSpace(text[:idx])
	}
	if idx := strings.Index(text, "[truncated"); idx != -1 {
		text = strings.TrimSpace(text[:idx])
	}
	return text
}

func NormalizeClientErrorMessage(c *gin.Context, raw string) string {
	raw = stripLogArtifacts(raw)
	if raw == "" {
		return raw
	}
	if IsContentPolicyViolation(raw) {
		return ContentPolicyMessage(c)
	}
	return raw
}

func NormalizeTaskErrorMessage(c *gin.Context, taskErr *dto.TaskError) {
	if taskErr == nil || taskErr.Message == "" {
		return
	}
	taskErr.Message = NormalizeClientErrorMessage(c, taskErr.Message)
}

func NormalizeOpenAIImageJobError(c *gin.Context, job *dto.OpenAIImageJob) {
	if job == nil || job.Error == nil || job.Error.Message == "" {
		return
	}
	job.Error.Message = NormalizeClientErrorMessage(c, job.Error.Message)
}

func NormalizeOpenAIVideoResponse(c *gin.Context, data []byte) []byte {
	var payload map[string]any
	if err := json.Unmarshal(data, &payload); err != nil {
		return data
	}
	if errObj, ok := payload["error"].(map[string]any); ok {
		if msg, ok := errObj["message"].(string); ok && msg != "" {
			errObj["message"] = NormalizeClientErrorMessage(c, msg)
		}
	}
	if reason, ok := payload["fail_reason"].(string); ok && reason != "" {
		payload["fail_reason"] = NormalizeClientErrorMessage(c, reason)
	}
	out, err := json.Marshal(payload)
	if err != nil {
		return data
	}
	return out
}
