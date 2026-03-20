package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.CodeExecutionRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.CodeExecutionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class CodeExecutionService {

    private static final Map<String, LanguageConfig> LANGUAGES = new HashMap<>();
    private static final Set<String> BLOCKED_PATTERNS = Set.of(
            "Runtime.exec", "ProcessBuilder", "System.exit",
            "java.io.File", "java.net.", "java.lang.reflect",
            "os.system", "subprocess", "os.popen", "__import__",
            "eval(", "exec(", "child_process", "require('fs')",
            "require('net')", "require('http')", "dangerouslySetInnerHTML",
            "System.IO", "System.Net", "System.Diagnostics.Process"
    );

    static {
        LANGUAGES.put("JAVA", new LanguageConfig("java", "Main.java", "javac Main.java", "java Main", ".java"));
        LANGUAGES.put("PYTHON", new LanguageConfig("python", "main.py", null, "python main.py", ".py"));
        LANGUAGES.put("JAVASCRIPT", new LanguageConfig("javascript", "main.js", null, "node main.js", ".js"));
        LANGUAGES.put("TYPESCRIPT", new LanguageConfig("typescript", "main.ts", "npx tsc main.ts", "node main.js", ".ts"));
        LANGUAGES.put("CPP", new LanguageConfig("cpp", "main.cpp", "g++ -o main main.cpp", "./main", ".cpp"));
        LANGUAGES.put("CSHARP", new LanguageConfig("csharp", "Program.cs", "dotnet build", "dotnet run", ".cs"));
        LANGUAGES.put("GO", new LanguageConfig("go", "main.go", "go build -o main main.go", "./main", ".go"));
        LANGUAGES.put("RUST", new LanguageConfig("rust", "main.rs", "rustc main.rs -o main", "./main", ".rs"));
        LANGUAGES.put("KOTLIN", new LanguageConfig("kotlin", "Main.kt", "kotlinc Main.kt -include-runtime -d main.jar", "java -jar main.jar", ".kt"));
        LANGUAGES.put("RUBY", new LanguageConfig("ruby", "main.rb", null, "ruby main.rb", ".rb"));
        LANGUAGES.put("PHP", new LanguageConfig("php", "main.php", null, "php main.php", ".php"));
        LANGUAGES.put("SWIFT", new LanguageConfig("swift", "main.swift", "swiftc main.swift -o main", "./main", ".swift"));
        LANGUAGES.put("SCALA", new LanguageConfig("scala", "Main.scala", "scalac Main.scala", "scala Main", ".scala"));
        LANGUAGES.put("R", new LanguageConfig("r", "main.R", null, "Rscript main.R", ".R"));
    }

    public CodeExecutionResponseDto executeCode(CodeExecutionRequestDto request) {
        String executionId = UUID.randomUUID().toString();
        log.info("🚀 Code execution [{}] - Language: {}, Interview: {}",
                executionId, request.getLanguage(), request.getInterviewId());

        // Security scan first
        CodeExecutionResponseDto.SecurityScanResult securityScan = scanCodeSecurity(request.getSourceCode(), request.getLanguage());
        if (!securityScan.getSafe()) {
            log.warn("⛔ Code execution blocked [{}] - Security violation detected", executionId);
            return CodeExecutionResponseDto.builder()
                    .executionId(executionId)
                    .language(request.getLanguage())
                    .status("SECURITY_BLOCKED")
                    .stderr("Code contains blocked operations: " + String.join(", ", securityScan.getBlockedOperations()))
                    .exitCode(-1)
                    .executionTimeMs(0L)
                    .memoryUsedKb(0L)
                    .securityScan(securityScan)
                    .build();
        }

        // Mock execution engine (sandbox would connect here)
        return executeSandboxed(executionId, request, securityScan);
    }

    public CodeExecutionResponseDto runTestCases(CodeExecutionRequestDto request) {
        String executionId = UUID.randomUUID().toString();
        log.info("🧪 Running test cases [{}] - {} tests", executionId,
                request.getTestCases() != null ? request.getTestCases().size() : 0);

        CodeExecutionResponseDto.SecurityScanResult securityScan = scanCodeSecurity(request.getSourceCode(), request.getLanguage());
        if (!securityScan.getSafe()) {
            return CodeExecutionResponseDto.builder()
                    .executionId(executionId)
                    .language(request.getLanguage())
                    .status("SECURITY_BLOCKED")
                    .securityScan(securityScan)
                    .build();
        }

        return executeWithTestCases(executionId, request, securityScan);
    }

    public List<String> getSupportedLanguages() {
        return new ArrayList<>(LANGUAGES.keySet());
    }

    private CodeExecutionResponseDto executeSandboxed(String executionId, CodeExecutionRequestDto request,
                                                       CodeExecutionResponseDto.SecurityScanResult securityScan) {
        LanguageConfig config = LANGUAGES.getOrDefault(request.getLanguage().toUpperCase(), LANGUAGES.get("PYTHON"));
        long startTime = System.currentTimeMillis();

        try {
            // Analyze code quality
            CodeExecutionResponseDto.CodeQualityMetrics codeQuality = analyzeCodeQuality(request.getSourceCode(), request.getLanguage());

            // Simulate execution results based on language and code analysis
            String stdout = simulateExecution(request.getSourceCode(), config);
            long executionTime = System.currentTimeMillis() - startTime + (long)(Math.random() * 200 + 50);

            return CodeExecutionResponseDto.builder()
                    .executionId(executionId)
                    .language(request.getLanguage())
                    .status("SUCCESS")
                    .stdout(stdout)
                    .stderr("")
                    .exitCode(0)
                    .executionTimeMs(executionTime)
                    .memoryUsedKb((long)(Math.random() * 50000 + 5000))
                    .codeQuality(codeQuality)
                    .securityScan(securityScan)
                    .build();

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("Code execution failed [{}]: {}", executionId, e.getMessage());

            return CodeExecutionResponseDto.builder()
                    .executionId(executionId)
                    .language(request.getLanguage())
                    .status("RUNTIME_ERROR")
                    .stdout("")
                    .stderr(e.getMessage())
                    .exitCode(1)
                    .executionTimeMs(executionTime)
                    .memoryUsedKb(0L)
                    .securityScan(securityScan)
                    .build();
        }
    }

    private CodeExecutionResponseDto executeWithTestCases(String executionId, CodeExecutionRequestDto request,
                                                            CodeExecutionResponseDto.SecurityScanResult securityScan) {
        List<CodeExecutionResponseDto.TestCaseResult> testResults = new ArrayList<>();
        int passed = 0;
        int failed = 0;

        if (request.getTestCases() != null && request.getExpectedOutputs() != null) {
            for (int i = 0; i < request.getTestCases().size(); i++) {
                String input = request.getTestCases().get(i);
                String expected = i < request.getExpectedOutputs().size() ? request.getExpectedOutputs().get(i) : "";

                // Simulate test execution
                long testStart = System.currentTimeMillis();
                String actual = simulateTestCase(request.getSourceCode(), input, request.getLanguage());
                long testTime = System.currentTimeMillis() - testStart + (long)(Math.random() * 100 + 10);
                boolean pass = actual.trim().equals(expected.trim());

                if (pass) passed++;
                else failed++;

                testResults.add(CodeExecutionResponseDto.TestCaseResult.builder()
                        .testNumber(i + 1)
                        .input(input)
                        .expectedOutput(expected)
                        .actualOutput(actual)
                        .passed(pass)
                        .executionTimeMs(testTime)
                        .errorMessage(pass ? null : "Output mismatch")
                        .build());
            }
        }

        CodeExecutionResponseDto.CodeQualityMetrics codeQuality = analyzeCodeQuality(request.getSourceCode(), request.getLanguage());

        return CodeExecutionResponseDto.builder()
                .executionId(executionId)
                .language(request.getLanguage())
                .status(failed == 0 ? "ALL_TESTS_PASSED" : "SOME_TESTS_FAILED")
                .exitCode(failed == 0 ? 0 : 1)
                .executionTimeMs(testResults.stream().mapToLong(t -> t.getExecutionTimeMs()).sum())
                .memoryUsedKb((long)(Math.random() * 50000 + 5000))
                .totalTests(testResults.size())
                .passedTests(passed)
                .failedTests(failed)
                .testResults(testResults)
                .codeQuality(codeQuality)
                .securityScan(securityScan)
                .build();
    }

    private CodeExecutionResponseDto.SecurityScanResult scanCodeSecurity(String code, String language) {
        List<String> blocked = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (String pattern : BLOCKED_PATTERNS) {
            if (code.contains(pattern)) {
                blocked.add(pattern);
            }
        }

        // Check for common attack patterns
        if (Pattern.compile("while\\s*\\(\\s*true\\s*\\)").matcher(code).find() ||
                Pattern.compile("for\\s*\\(\\s*;\\s*;\\s*\\)").matcher(code).find()) {
            warnings.add("Potential infinite loop detected");
        }

        if (code.contains("Thread.sleep") || code.contains("time.sleep") || code.contains("setTimeout")) {
            warnings.add("Sleep/delay operations detected - may affect execution time");
        }

        if (code.length() > 50000) {
            warnings.add("Code exceeds recommended size limit (50KB)");
        }

        String riskLevel = blocked.isEmpty()
                ? (warnings.isEmpty() ? "SAFE" : "LOW")
                : (blocked.size() > 2 ? "CRITICAL" : "HIGH");

        return CodeExecutionResponseDto.SecurityScanResult.builder()
                .safe(blocked.isEmpty())
                .blockedOperations(blocked)
                .warnings(warnings)
                .riskLevel(riskLevel)
                .build();
    }

    private CodeExecutionResponseDto.CodeQualityMetrics analyzeCodeQuality(String code, String language) {
        String[] lines = code.split("\n");
        int totalLines = lines.length;
        int blankLines = 0;
        int commentLines = 0;
        int maxNesting = 0;
        int currentNesting = 0;
        int functionCount = 0;
        List<String> codeSmells = new ArrayList<>();
        Map<String, String> suggestions = new LinkedHashMap<>();

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) blankLines++;
            else if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("/*") || trimmed.startsWith("*")) commentLines++;

            // Nesting depth
            currentNesting += (int) trimmed.chars().filter(c -> c == '{').count();
            currentNesting -= (int) trimmed.chars().filter(c -> c == '}').count();
            if (currentNesting > maxNesting) maxNesting = currentNesting;

            // Functions
            if (trimmed.matches(".*(def |function |fun |func |fn |void |public |private |static ).*\\(.*")) {
                functionCount++;
            }
        }

        // Detect code smells
        if (maxNesting > 4) {
            codeSmells.add("Deep nesting (depth: " + maxNesting + ") - consider extracting methods");
            suggestions.put("nesting", "Refactor deeply nested code into separate functions");
        }
        if (totalLines > 100 && commentLines == 0) {
            codeSmells.add("No comments in a long file");
            suggestions.put("documentation", "Add comments explaining complex logic");
        }
        if (functionCount == 0 && totalLines > 30) {
            codeSmells.add("Monolithic code without function decomposition");
            suggestions.put("structure", "Break code into smaller, reusable functions");
        }
        if (totalLines > 200) {
            codeSmells.add("Large code block - consider splitting");
            suggestions.put("size", "Keep files under 200 lines for readability");
        }

        double commentRatio = totalLines > 0 ? (double) commentLines / totalLines : 0;
        double complexity = Math.min(100, maxNesting * 15 + (functionCount == 0 ? 20 : 0) + Math.max(0, totalLines - 100) * 0.1);
        double maintainability = Math.max(0, 100 - complexity * 0.5 - codeSmells.size() * 10 + commentRatio * 30);

        return CodeExecutionResponseDto.CodeQualityMetrics.builder()
                .complexityCyclomaticScore(Math.round(complexity * 10.0) / 10.0)
                .linesOfCode(totalLines - blankLines - commentLines)
                .blankLines(blankLines)
                .commentLines(commentLines)
                .commentRatio(Math.round(commentRatio * 1000.0) / 1000.0)
                .nestingDepth(maxNesting)
                .functionCount(functionCount)
                .maintainabilityIndex(Math.round(maintainability * 10.0) / 10.0)
                .codeSmells(codeSmells)
                .suggestions(suggestions)
                .build();
    }

    private String simulateExecution(String code, LanguageConfig config) {
        // Smart output simulation based on code structure
        if (code.contains("System.out.println") || code.contains("print(") || code.contains("console.log") ||
                code.contains("fmt.Println") || code.contains("println!") || code.contains("puts")) {

            Pattern pattern = Pattern.compile("(?:println|print|log|Println|println!)\\s*\\(?\\s*\"([^\"]+)\"");
            Matcher matcher = pattern.matcher(code);
            StringBuilder output = new StringBuilder();
            while (matcher.find()) {
                output.append(matcher.group(1)).append("\n");
            }
            if (!output.isEmpty()) return output.toString().trim();
        }

        return "Program executed successfully.\nExecution completed in " + config.name + " runtime.";
    }

    private String simulateTestCase(String code, String input, String language) {
        // Basic simulation: try to detect output logic from code
        try {
            // If code contains simple mathematical operations, try to evaluate
            if (input.matches("\\d+")) {
                int n = Integer.parseInt(input.trim());
                if (code.contains("factorial") || code.contains("fact")) {
                    long result = 1;
                    for (int i = 2; i <= n; i++) result *= i;
                    return String.valueOf(result);
                }
                if (code.contains("fibonacci") || code.contains("fib")) {
                    if (n <= 1) return String.valueOf(n);
                    long a = 0, b = 1;
                    for (int i = 2; i <= n; i++) { long t = a + b; a = b; b = t; }
                    return String.valueOf(b);
                }
            }
        } catch (NumberFormatException ignored) {}

        return "Output for input: " + input;
    }

    private record LanguageConfig(String name, String filename, String compileCmd, String runCmd, String extension) {}
}
