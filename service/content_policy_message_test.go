package service

import "testing"

func TestIsContentPolicyViolation(t *testing.T) {
	cases := []struct {
		text string
		want bool
	}{
		{"Generated video rejected by content moderation.", true},
		{"The generated images appear to be unsafe. Try modifying the prompts or the seeds.", true},
		{"非常抱歉，该提示可能违反了关于裸露、色情或情色内容的防护限制。", true},
		{"status_code=400, I can't create an image with that level of explicit sexualization or erotic focus.", true},
		{"parse image json: unexpected end of JSON input", true},
		{"unexpected end of JSON input", true},
		{"upstream returned unrecognized message", false},
		{"No available channel for model gpt-image-2", false},
		{"download image failed: connection refused", false},
	}

	for _, tc := range cases {
		if got := IsContentPolicyViolation(tc.text); got != tc.want {
			t.Fatalf("IsContentPolicyViolation(%q) = %v, want %v", tc.text, got, tc.want)
		}
	}
}

func TestStripLogArtifacts(t *testing.T) {
	raw := "The generated images appear to be unsafe... [truncated, original_length=1200, limit=512]"
	if got := stripLogArtifacts(raw); got != "The generated images appear to be unsafe" {
		t.Fatalf("stripLogArtifacts() = %q", got)
	}
}

func TestNormalizeClientErrorMessageContentPolicy(t *testing.T) {
	raw := "Generated video rejected by content moderation."
	if got := NormalizeClientErrorMessage(nil, raw); got != ContentPolicyMessageEN {
		t.Fatalf("NormalizeClientErrorMessage(nil) = %q", got)
	}
}
