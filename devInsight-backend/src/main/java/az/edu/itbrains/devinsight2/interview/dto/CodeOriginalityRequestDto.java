package az.edu.itbrains.devinsight2.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeOriginalityRequestDto {
    private Long candidateId;
    private Long interviewId;
    private String code;
    private String language;          // JAVA, PYTHON, JAVASCRIPT, etc.
    private String questionTitle;
    private String questionDescription;
    private Integer timeTakenSeconds;
    private List<CodeSnapshot> codeSnapshots;  // periodic snapshots of code writing process
    private Integer keystrokeCount;
    private Integer pasteEventCount;
    private Boolean hadCompilationErrors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeSnapshot {
        private Integer secondMark;
        private String code;
        private Integer linesOfCode;
    }
}
