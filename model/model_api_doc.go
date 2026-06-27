package model

import (
	"encoding/json"
	"strings"
)

// ParseApiDocJSON unmarshals models.api_doc text into a map for pricing API responses.
// Supports wxart-style alias keys (doc_request_json, doc_params_json).
func ParseApiDocJSON(raw string) map[string]interface{} {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}
	var doc map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &doc); err != nil {
		return nil
	}
	normalizeApiDocAliases(doc)
	return doc
}

func normalizeApiDocAliases(doc map[string]interface{}) {
	if doc == nil {
		return
	}
	if _, ok := doc["request_json"]; !ok {
		if v, ok := doc["doc_request_json"]; ok {
			doc["request_json"] = v
		}
	}
	if _, ok := doc["params"]; !ok {
		if v, ok := doc["doc_params_json"]; ok {
			doc["params"] = v
		}
	}
}
