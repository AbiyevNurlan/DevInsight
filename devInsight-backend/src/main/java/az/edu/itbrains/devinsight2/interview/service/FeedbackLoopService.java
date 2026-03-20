package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.FeedbackDto;
import az.edu.itbrains.devinsight2.interview.dto.ModelPerformanceMetricsDto;
import az.edu.itbrains.devinsight2.interview.entity.FeedbackEntity;
import az.edu.itbrains.devinsight2.interview.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FeedbackLoopService {
    
    private final FeedbackRepository feedbackRepository;
    
    /**
     * Submit outcome feedback
     */
    public FeedbackDto submitFeedback(
            Long candidateId,
            String candidateName,
            String actualOutcome,
            String aiPrediction,
            Double aiConfidence,
            String performanceRating,
            Integer retentionMonths,
            Boolean stillEmployed) {
        
        // Determine if prediction was correct
        Boolean predictionCorrect = isPredictionCorrect(aiPrediction, actualOutcome);
        String predictionAccuracy = calculateAccuracy(aiPrediction, actualOutcome, performanceRating);
        String feedbackCategory = categorizeFeedback(aiPrediction, actualOutcome);
        
        FeedbackEntity entity = FeedbackEntity.builder()
            .candidateId(candidateId)
            .candidateName(candidateName)
            .actualOutcome(actualOutcome)
            .outcomeDate(LocalDateTime.now())
            .performanceRating(performanceRating)
            .retentionMonths(retentionMonths)
            .stillEmployed(stillEmployed)
            .aiPrediction(aiPrediction)
            .aiConfidence(aiConfidence)
            .predictionCorrect(predictionCorrect)
            .predictionAccuracy(predictionAccuracy)
            .feedbackCategory(feedbackCategory)
            .learningPoints(generateLearningPoints(aiPrediction, actualOutcome, predictionCorrect))
            .modelAdjustmentNeeded(suggestAdjustment(aiPrediction, actualOutcome, aiConfidence))
            .createdAt(LocalDateTime.now())
            .build();
        
        FeedbackEntity saved = feedbackRepository.save(entity);
        log.info("Feedback submitted for candidate {}: {} -> {}", candidateId, aiPrediction, actualOutcome);
        
        return convertToDto(saved);
    }
    
    /**
     * Calculate model performance metrics
     */
    public ModelPerformanceMetricsDto calculatePerformanceMetrics() {
        List<FeedbackEntity> allFeedback = feedbackRepository.findAll();
        
        if (allFeedback.isEmpty()) {
            return createEmptyMetrics();
        }
        
        int totalPredictions = allFeedback.size();
        int correctPredictions = (int) allFeedback.stream()
            .filter(f -> Boolean.TRUE.equals(f.getPredictionCorrect()))
            .count();
        
        // Confusion Matrix
        int truePositives = (int) allFeedback.stream()
            .filter(f -> "TRUE_POSITIVE".equals(f.getFeedbackCategory()))
            .count();
        
        int trueNegatives = (int) allFeedback.stream()
            .filter(f -> "TRUE_NEGATIVE".equals(f.getFeedbackCategory()))
            .count();
        
        int falsePositives = (int) allFeedback.stream()
            .filter(f -> "FALSE_POSITIVE".equals(f.getFeedbackCategory()))
            .count();
        
        int falseNegatives = (int) allFeedback.stream()
            .filter(f -> "FALSE_NEGATIVE".equals(f.getFeedbackCategory()))
            .count();
        
        // Calculate metrics
        double accuracy = (correctPredictions * 100.0) / totalPredictions;
        double precision = (truePositives + falsePositives) > 0 ? 
            (truePositives * 100.0) / (truePositives + falsePositives) : 0;
        double recall = (truePositives + falseNegatives) > 0 ?
            (truePositives * 100.0) / (truePositives + falseNegatives) : 0;
        double f1Score = (precision + recall) > 0 ?
            (2 * precision * recall) / (precision + recall) : 0;
        
        // Confidence calibration
        double avgConfidenceCorrect = allFeedback.stream()
            .filter(f -> Boolean.TRUE.equals(f.getPredictionCorrect()))
            .mapToDouble(FeedbackEntity::getAiConfidence)
            .average()
            .orElse(0);
        
        double avgConfidenceIncorrect = allFeedback.stream()
            .filter(f -> Boolean.FALSE.equals(f.getPredictionCorrect()))
            .mapToDouble(FeedbackEntity::getAiConfidence)
            .average()
            .orElse(0);
        
        boolean wellCalibrated = avgConfidenceCorrect > avgConfidenceIncorrect;
        
        // Model status
        String modelStatus = determineModelStatus(accuracy, precision, recall, f1Score);
        String recommendations = generateRecommendations(accuracy, falsePositives, falseNegatives, wellCalibrated);
        
        return ModelPerformanceMetricsDto.builder()
            .totalPredictions(totalPredictions)
            .correctPredictions(correctPredictions)
            .accuracy(accuracy)
            .truePositives(truePositives)
            .trueNegatives(trueNegatives)
            .falsePositives(falsePositives)
            .falseNegatives(falseNegatives)
            .precision(precision)
            .recall(recall)
            .f1Score(f1Score)
            .averageConfidenceWhenCorrect(avgConfidenceCorrect)
            .averageConfidenceWhenIncorrect(avgConfidenceIncorrect)
            .wellCalibrated(wellCalibrated)
            .biasAnalysis("Bias analysis pending")
            .biasDetected(false)
            .modelStatus(modelStatus)
            .recommendations(recommendations)
            .build();
    }
    
    private Boolean isPredictionCorrect(String prediction, String outcome) {
        if (prediction == null || outcome == null) return false;
        
        // Simplistic matching - can be enhanced
        if ((prediction.contains("YES") || prediction.contains("HIRE")) && "HIRED".equals(outcome)) {
            return true;
        }
        if ((prediction.contains("NO") || prediction.contains("REJECT")) && "REJECTED".equals(outcome)) {
            return true;
        }
        return false;
    }
    
    private String calculateAccuracy(String prediction, String outcome, String performance) {
        if (isPredictionCorrect(prediction, outcome)) {
            if ("EXCELLENT".equals(performance) || "GOOD".equals(performance)) {
                return "ACCURATE";
            }
            return "PARTIALLY_ACCURATE";
        }
        return "INACCURATE";
    }
    
    private String categorizeFeedback(String prediction, String outcome) {
        boolean predictedHire = prediction != null && (prediction.contains("YES") || prediction.contains("HIRE"));
        boolean actuallyHired = "HIRED".equals(outcome);
        
        if (predictedHire && actuallyHired) return "TRUE_POSITIVE";
        if (!predictedHire && !actuallyHired) return "TRUE_NEGATIVE";
        if (predictedHire && !actuallyHired) return "FALSE_POSITIVE";
        if (!predictedHire && actuallyHired) return "FALSE_NEGATIVE";
        
        return "UNKNOWN";
    }
    
    private String generateLearningPoints(String prediction, String outcome, Boolean correct) {
        if (Boolean.TRUE.equals(correct)) {
            return "Prediction aligned with outcome. Model performing well.";
        } else {
            return String.format("Mismatch: Predicted %s but outcome was %s. Review decision factors.", 
                prediction, outcome);
        }
    }
    
    private String suggestAdjustment(String prediction, String outcome, Double confidence) {
        if (isPredictionCorrect(prediction, outcome)) {
            return "No adjustment needed";
        }
        
        if (confidence != null && confidence > 80) {
            return "High confidence but incorrect - review feature weights";
        }
        
        return "Model needs fine-tuning for this type of case";
    }
    
    private String determineModelStatus(double accuracy, double precision, double recall, double f1Score) {
        if (accuracy >= 90 && f1Score >= 85) return "EXCELLENT";
        if (accuracy >= 75 && f1Score >= 70) return "GOOD";
        if (accuracy >= 60) return "NEEDS_TUNING";
        return "NEEDS_RETRAINING";
    }
    
    private String generateRecommendations(double accuracy, int falsePositives, int falseNegatives, boolean wellCalibrated) {
        StringBuilder sb = new StringBuilder();
        
        if (accuracy < 75) {
            sb.append("Consider retraining model with more data. ");
        }
        
        if (falsePositives > falseNegatives * 2) {
            sb.append("Too many false positives - increase decision threshold. ");
        } else if (falseNegatives > falsePositives * 2) {
            sb.append("Too many false negatives - decrease decision threshold. ");
        }
        
        if (!wellCalibrated) {
            sb.append("Recalibrate confidence scores. ");
        }
        
        if (sb.length() == 0) {
            return "Model performing well. Continue monitoring.";
        }
        
        return sb.toString().trim();
    }
    
    private ModelPerformanceMetricsDto createEmptyMetrics() {
        return ModelPerformanceMetricsDto.builder()
            .totalPredictions(0)
            .correctPredictions(0)
            .accuracy(0.0)
            .truePositives(0)
            .trueNegatives(0)
            .falsePositives(0)
            .falseNegatives(0)
            .precision(0.0)
            .recall(0.0)
            .f1Score(0.0)
            .averageConfidenceWhenCorrect(0.0)
            .averageConfidenceWhenIncorrect(0.0)
            .wellCalibrated(false)
            .biasAnalysis("Insufficient data")
            .biasDetected(false)
            .modelStatus("INSUFFICIENT_DATA")
            .recommendations("Collect more feedback data")
            .build();
    }
    
    private FeedbackDto convertToDto(FeedbackEntity entity) {
        return FeedbackDto.builder()
            .id(entity.getId())
            .candidateId(entity.getCandidateId())
            .candidateName(entity.getCandidateName())
            .actualOutcome(entity.getActualOutcome())
            .outcomeDate(entity.getOutcomeDate().toString())
            .performanceRating(entity.getPerformanceRating())
            .retentionMonths(entity.getRetentionMonths())
            .stillEmployed(entity.getStillEmployed())
            .aiPrediction(entity.getAiPrediction())
            .aiConfidence(entity.getAiConfidence())
            .predictionCorrect(entity.getPredictionCorrect())
            .predictionAccuracy(entity.getPredictionAccuracy())
            .feedbackCategory(entity.getFeedbackCategory())
            .learningPoints(entity.getLearningPoints())
            .modelAdjustmentNeeded(entity.getModelAdjustmentNeeded())
            .build();
    }
}
