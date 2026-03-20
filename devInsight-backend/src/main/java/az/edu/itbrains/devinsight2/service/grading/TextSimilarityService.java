package az.edu.itbrains.devinsight2.service.grading;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating text similarity between user answers and correct answers.
 * Uses Levenshtein Distance and Keyword Matching without external dependencies.
 * 
 * Scoring Logic:
 * - 100% for exact or semantically equivalent answers
 * - 70-99% for answers with most key concepts
 * - 40-69% for partial answers
 * - 0-39% for incorrect answers
 */
@Service
@Slf4j
public class TextSimilarityService {

    private static final double LEVENSHTEIN_WEIGHT = 0.3;
    private static final double KEYWORD_WEIGHT = 0.5;
    private static final double SEMANTIC_WEIGHT = 0.2;
    
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
            "do", "does", "did", "will", "would", "could", "should", "may", "might", "can",
            "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
            "what", "which", "who", "when", "where", "why", "how", "of", "with", "as"
    ));

    // Common synonyms for technical terms
    private static final Map<String, Set<String>> SYNONYMS = new HashMap<>();
    static {
        SYNONYMS.put("dependency", Set.of("di", "injection", "ioc", "inversion"));
        SYNONYMS.put("injection", Set.of("di", "dependency", "ioc", "inversion"));
        SYNONYMS.put("pattern", Set.of("design", "principle", "approach", "technique"));
        SYNONYMS.put("loose", Set.of("decoupled", "flexible", "modular"));
        SYNONYMS.put("coupling", Set.of("dependency", "connection", "binding"));
        SYNONYMS.put("class", Set.of("object", "instance", "type"));
        SYNONYMS.put("method", Set.of("function", "procedure", "operation"));
        SYNONYMS.put("interface", Set.of("contract", "abstraction", "api"));
        SYNONYMS.put("database", Set.of("db", "storage", "persistence"));
        SYNONYMS.put("api", Set.of("interface", "endpoint", "service"));
        SYNONYMS.put("rest", Set.of("restful", "http", "web"));
        SYNONYMS.put("component", Set.of("module", "unit", "part"));
    }

    /**
     * Calculate Levenshtein distance between two strings using dynamic programming
     */
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = s1.charAt(i - 1) == s2.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[s1.length()][s2.length()];
    }

    /**
     * Calculate overall similarity score between user answer and correct answer (0-100)
     */
    public double calculateSimilarity(String userAnswer, String correctAnswer) {
        log.info("=== TextSimilarity Calculation ===");
        log.info("User Answer: '{}'", userAnswer);
        log.info("Correct Answer: '{}'", correctAnswer);
        
        if (userAnswer == null || correctAnswer == null) {
            log.warn("Null input detected!");
            return 0.0;
        }

        // Normalize both strings
        String normalizedUser = normalizeText(userAnswer);
        String normalizedCorrect = normalizeText(correctAnswer);
        
        log.info("Normalized User: '{}'", normalizedUser);
        log.info("Normalized Correct: '{}'", normalizedCorrect);

        if (normalizedUser.isEmpty() && normalizedCorrect.isEmpty()) {
            return 100.0;
        }
        
        if (normalizedUser.isEmpty() || normalizedCorrect.isEmpty()) {
            return 0.0;
        }

        // EXACT MATCH - return 100%
        if (normalizedUser.equals(normalizedCorrect)) {
            log.info("EXACT MATCH! Returning 100%");
            return 100.0;
        }

        // Check for semantic equivalence (same meaning, different words)
        double semanticScore = calculateSemanticSimilarity(normalizedUser, normalizedCorrect);
        if (semanticScore >= 95) {
            log.info("SEMANTIC MATCH! Score: {}%", semanticScore);
            return semanticScore;
        }

        // Calculate individual similarities
        double levenshteinScore = calculateLevenshteinSimilarity(normalizedUser, normalizedCorrect);
        double keywordScore = calculateKeywordSimilarity(normalizedUser, normalizedCorrect);
        
        log.info("Levenshtein Score: {}%", String.format("%.2f", levenshteinScore));
        log.info("Keyword Score: {}%", String.format("%.2f", keywordScore));
        log.info("Semantic Score: {}%", String.format("%.2f", semanticScore));

        // Weighted combination
        double combinedScore = (levenshteinScore * LEVENSHTEIN_WEIGHT) +
                (keywordScore * KEYWORD_WEIGHT) +
                (semanticScore * SEMANTIC_WEIGHT);
        
        // Boost score if keywords match well (core concept understood)
        if (keywordScore >= 80) {
            combinedScore = Math.max(combinedScore, keywordScore * 0.95);
            log.info("Boosted score due to high keyword match");
        }
        
        // Ensure minimum 50% if most keywords match
        if (keywordScore >= 70 && combinedScore < 50) {
            combinedScore = 50.0;
        }

        log.info("Final Combined Score: {}%", String.format("%.2f", combinedScore));
        return Math.min(100.0, Math.max(0.0, combinedScore));
    }

    /**
     * Calculate semantic similarity considering synonyms and equivalent phrases
     */
    private double calculateSemanticSimilarity(String user, String correct) {
        Set<String> userWords = new HashSet<>(Arrays.asList(user.split("\\s+")));
        Set<String> correctWords = new HashSet<>(Arrays.asList(correct.split("\\s+")));
        
        // Expand both sets with synonyms
        Set<String> expandedUser = expandWithSynonyms(userWords);
        Set<String> expandedCorrect = expandWithSynonyms(correctWords);
        
        // Calculate overlap with expanded sets
        Set<String> intersection = new HashSet<>(expandedUser);
        intersection.retainAll(expandedCorrect);
        
        Set<String> union = new HashSet<>(expandedUser);
        union.addAll(expandedCorrect);
        
        if (union.isEmpty()) return 0.0;
        
        double similarity = ((double) intersection.size() / union.size()) * 100;
        
        // Bonus for matching core concepts
        Set<String> userKeywords = extractKeywords(user);
        Set<String> correctKeywords = extractKeywords(correct);
        Set<String> keywordIntersection = new HashSet<>(userKeywords);
        keywordIntersection.retainAll(correctKeywords);
        
        if (!correctKeywords.isEmpty()) {
            double keywordCoverage = (double) keywordIntersection.size() / correctKeywords.size();
            if (keywordCoverage >= 0.8) {
                similarity = Math.max(similarity, 90.0); // High keyword coverage = good answer
            }
        }
        
        return similarity;
    }

    /**
     * Expand word set with known synonyms
     */
    private Set<String> expandWithSynonyms(Set<String> words) {
        Set<String> expanded = new HashSet<>(words);
        for (String word : words) {
            if (SYNONYMS.containsKey(word)) {
                expanded.addAll(SYNONYMS.get(word));
            }
            // Also check if word is a synonym of something
            for (Map.Entry<String, Set<String>> entry : SYNONYMS.entrySet()) {
                if (entry.getValue().contains(word)) {
                    expanded.add(entry.getKey());
                    expanded.addAll(entry.getValue());
                }
            }
        }
        return expanded;
    }

    /**
     * Normalize text for comparison: lowercase, trim, remove extra spaces
     */
    private String normalizeText(String text) {
        return text.toLowerCase()
                .trim()
                .replaceAll("\\s+", " ")
                .replaceAll("[^a-z0-9\\s]", ""); // Remove special characters
    }

    /**
     * Calculate Levenshtein distance based similarity (0-100)
     * Measures character-level differences
     */
    private double calculateLevenshteinSimilarity(String user, String correct) {
        int maxLength = Math.max(user.length(), correct.length());
        if (maxLength == 0) return 100.0;

        int distance = levenshteinDistance(user, correct);
        double similarity = 1.0 - ((double) distance / maxLength);

        return Math.max(0.0, similarity * 100);
    }

    /**
     * Calculate keyword-based similarity (0-100)
     * Measures overlap of meaningful words (excluding stop words)
     */
    private double calculateKeywordSimilarity(String user, String correct) {
        Set<String> userKeywords = extractKeywords(user);
        Set<String> correctKeywords = extractKeywords(correct);
        
        log.info("User Keywords: {}", userKeywords);
        log.info("Correct Keywords: {}", correctKeywords);

        if (userKeywords.isEmpty() && correctKeywords.isEmpty()) {
            return 100.0; // Both have no keywords
        }
        
        if (userKeywords.isEmpty() || correctKeywords.isEmpty()) {
            return 0.0;
        }

        // Calculate Jaccard similarity: intersection / union
        Set<String> intersection = new HashSet<>(userKeywords);
        intersection.retainAll(correctKeywords);
        
        log.info("Matching Keywords: {}", intersection);

        Set<String> union = new HashSet<>(userKeywords);
        union.addAll(correctKeywords);

        double jaccardSimilarity = (double) intersection.size() / union.size();
        double jaccardScore = jaccardSimilarity * 100;
        
        log.info("Jaccard: {}/{} = {}%", intersection.size(), union.size(), String.format("%.2f", jaccardScore));

        // Bonus for partial keyword matches (typo tolerance)
        double partialMatchScore = calculatePartialMatches(userKeywords, correctKeywords);
        log.info("Partial Match Score: {}%", String.format("%.2f", partialMatchScore));

        // Combine Jaccard and partial matches
        double finalScore = (jaccardScore * 0.7) + (partialMatchScore * 0.3);
        log.info("Final Keyword Score: {}%", String.format("%.2f", finalScore));
        
        return finalScore;
    }

    /**
     * Extract meaningful keywords, filtering out stop words
     */
    private Set<String> extractKeywords(String text) {
        return Arrays.stream(text.split("\\s+"))
                .filter(word -> !word.isEmpty() && !STOP_WORDS.contains(word))
                .collect(Collectors.toSet());
    }

    /**
     * Calculate partial keyword matches for typo tolerance
     * Uses character similarity to catch common misspellings
     */
    private double calculatePartialMatches(Set<String> userKeywords, Set<String> correctKeywords) {
        double matchScore = 0.0;

        for (String userWord : userKeywords) {
            for (String correctWord : correctKeywords) {
                // Check if words are similar (e.g., "libary" vs "library")
                if (areWordsSimilar(userWord, correctWord)) {
                    matchScore += 1.0;
                }
            }
        }

        if (correctKeywords.isEmpty()) return 0.0;
        return Math.min(100.0, (matchScore / correctKeywords.size()) * 100);
    }

    /**
     * Check if two words are similar (handles typos)
     * Considers words similar if they share most characters
     */
    private boolean areWordsSimilar(String word1, String word2) {
        // Words must be of similar length
        if (Math.abs(word1.length() - word2.length()) > 2) {
            return false;
        }

        // Use Levenshtein distance - allow up to 1 character difference for typo tolerance
        int distance = levenshteinDistance(word1, word2);
        return distance <= 1;
    }

    /**
     * Calculate points earned based on similarity score
     */
    public double calculatePoints(double similarityScore, int maxPoints) {
        if (similarityScore < 0 || maxPoints <= 0) {
            return 0.0;
        }

        // Linear scoring: points = (similarity / 100) * maxPoints
        double points = (similarityScore / 100.0) * maxPoints;

        // Round to 2 decimal places
        return Math.round(points * 100.0) / 100.0;
    }

    /**
     * Get feedback based on similarity score
     */
    public String generateFeedback(double similarityScore) {
        if (similarityScore >= 90) {
            return "Excellent answer! Very close to the correct answer.";
        } else if (similarityScore >= 75) {
            return "Good answer! You captured most of the key points.";
        } else if (similarityScore >= 60) {
            return "Your answer covers some important concepts, but is missing details.";
        } else if (similarityScore >= 40) {
            return "Your answer has some correct elements but lacks important details.";
        } else if (similarityScore >= 20) {
            return "Your answer shows some understanding but is mostly incomplete.";
        } else {
            return "Your answer does not match the expected response. Review the material.";
        }
    }
}
