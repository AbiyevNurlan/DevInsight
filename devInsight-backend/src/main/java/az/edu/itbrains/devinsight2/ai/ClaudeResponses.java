package az.edu.itbrains.devinsight2.ai;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Helpers for reading Anthropic Messages API responses.
 *
 * <p>Current Claude models can return non-text blocks (for example {@code thinking})
 * before the answer, so callers must not assume the text is in {@code content[0]}.
 */
public final class ClaudeResponses {

    private ClaudeResponses() {
    }

    /**
     * Concatenates the text of every {@code text} block in a response's {@code content} array.
     *
     * @param content the {@code content} node of a Messages API response
     * @return the response text, or an empty string when there is none
     *         (for example when the request was refused)
     */
    public static String text(JsonNode content) {
        if (content == null || !content.isArray()) {
            return "";
        }
        StringBuilder text = new StringBuilder();
        for (JsonNode block : content) {
            if ("text".equals(block.path("type").asText())) {
                text.append(block.path("text").asText());
            }
        }
        return text.toString();
    }
}
