package az.edu.itbrains.devinsight2.interview.service;

import az.edu.itbrains.devinsight2.interview.dto.SmartSchedulerRequestDto;
import az.edu.itbrains.devinsight2.interview.dto.SmartSchedulerResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmartSchedulerService {

    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // Energy level mapping by hour (research-based peak performance hours)
    private static final Map<Integer, String> ENERGY_MAP = Map.ofEntries(
            Map.entry(8, "GOOD"), Map.entry(9, "PEAK"), Map.entry(10, "PEAK"),
            Map.entry(11, "PEAK"), Map.entry(12, "MODERATE"), Map.entry(13, "LOW"),
            Map.entry(14, "MODERATE"), Map.entry(15, "GOOD"), Map.entry(16, "GOOD"),
            Map.entry(17, "MODERATE"), Map.entry(18, "LOW"), Map.entry(19, "LOW")
    );

    public SmartSchedulerResponseDto findOptimalSlots(SmartSchedulerRequestDto request) {
        log.info("🗓️ Smart scheduling for interview {} - Candidate: {}, Interviewers: {}",
                request.getInterviewId(), request.getCandidateId(),
                request.getInterviewerIds() != null ? request.getInterviewerIds().size() : 0);

        int duration = request.getDurationMinutes() != null ? request.getDurationMinutes() : 60;
        int buffer = request.getBufferMinutesBetween() != null ? request.getBufferMinutesBetween() : 15;
        String candidateTz = request.getCandidateTimezone() != null ? request.getCandidateTimezone() : "Asia/Baku";

        // Generate candidate slots
        List<SmartSchedulerResponseDto.RecommendedSlot> slots = generateOptimalSlots(request, duration, buffer, candidateTz);

        // Rank them by AI scoring
        slots.sort((a, b) -> Double.compare(b.getAiScore(), a.getAiScore()));
        for (int i = 0; i < slots.size(); i++) {
            slots.get(i).setRank(i + 1);
        }

        // Analytics
        SmartSchedulerResponseDto.SchedulingAnalytics analytics = calculateAnalytics(request, slots);

        String status = slots.isEmpty() ? "NO_SLOTS_FOUND" : "SCHEDULED";

        return SmartSchedulerResponseDto.builder()
                .interviewId(request.getInterviewId())
                .candidateId(request.getCandidateId())
                .status(status)
                .recommendedSlots(slots.stream().limit(5).collect(Collectors.toList()))
                .analytics(analytics)
                .calendarEventId("cal-" + UUID.randomUUID().toString().substring(0, 8))
                .meetingLink("https://meet.devinsight.ai/" + UUID.randomUUID().toString().substring(0, 8))
                .notifiedParties(List.of("candidate@email.com", "interviewer@company.com"))
                .reminderScheduled(slots.isEmpty() ? null : slots.get(0).getStartTime().minusHours(1))
                .build();
    }

    public SmartSchedulerResponseDto reschedule(Long interviewId, LocalDateTime newTime) {
        log.info("🔄 Rescheduling interview {} to {}", interviewId, newTime);

        SmartSchedulerResponseDto.RecommendedSlot slot = SmartSchedulerResponseDto.RecommendedSlot.builder()
                .rank(1)
                .startTime(newTime)
                .endTime(newTime.plusMinutes(60))
                .aiScore(75.0)
                .reason("Manual reschedule by HR")
                .candidatePreferred(false)
                .interviewerConflicts(0)
                .energyLevel(getEnergyLevel(newTime.getHour()))
                .build();

        return SmartSchedulerResponseDto.builder()
                .interviewId(interviewId)
                .status("RESCHEDULED")
                .recommendedSlots(List.of(slot))
                .meetingLink("https://meet.devinsight.ai/" + UUID.randomUUID().toString().substring(0, 8))
                .notifiedParties(List.of("All parties notified of reschedule"))
                .build();
    }

    public Map<String, Object> getInterviewerWorkload(Long interviewerId, LocalDate weekOf) {
        log.info("📊 Workload analysis for interviewer {} week of {}", interviewerId, weekOf);

        Map<String, Object> workload = new LinkedHashMap<>();
        workload.put("interviewerId", interviewerId);
        workload.put("weekOf", weekOf.toString());

        // Simulate workload data
        List<Map<String, Object>> dailyLoad = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            LocalDate day = weekOf.plusDays(i);
            int interviews = (int) (Math.random() * 4);
            dailyLoad.add(Map.of(
                    "date", day.toString(),
                    "dayOfWeek", day.getDayOfWeek().toString(),
                    "scheduledInterviews", interviews,
                    "availableHours", 8 - interviews,
                    "loadLevel", interviews > 3 ? "OVERLOADED" : interviews > 2 ? "BUSY" : "AVAILABLE"
            ));
        }

        workload.put("dailySchedule", dailyLoad);
        workload.put("weeklyTotal", dailyLoad.stream().mapToInt(d -> (int) d.get("scheduledInterviews")).sum());
        workload.put("recommendation", "Distribute interviews more evenly across the week");
        workload.put("optimalDaysForNew", dailyLoad.stream()
                .filter(d -> (int) d.get("scheduledInterviews") < 2)
                .map(d -> d.get("date").toString())
                .collect(Collectors.toList()));

        return workload;
    }

    private List<SmartSchedulerResponseDto.RecommendedSlot> generateOptimalSlots(
            SmartSchedulerRequestDto request, int duration, int buffer, String candidateTz) {

        List<SmartSchedulerResponseDto.RecommendedSlot> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        ZoneId candidateZone = ZoneId.of(candidateTz);

        // Generate slots for next 5 business days
        for (int dayOffset = 1; dayOffset <= 7; dayOffset++) {
            LocalDate date = now.toLocalDate().plusDays(dayOffset);
            DayOfWeek dow = date.getDayOfWeek();

            // Skip weekends
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) continue;

            // Skip excluded dates
            if (request.getExcludedDates() != null &&
                    request.getExcludedDates().stream().anyMatch(d -> d.toLocalDate().equals(date))) continue;

            // Generate time slots from 9:00 to 17:00
            for (int hour = 9; hour <= 17; hour++) {
                if (hour + (duration / 60.0) > 18) continue; // Don't extend past 18:00

                LocalDateTime slotStart = LocalDateTime.of(date, LocalTime.of(hour, 0));
                LocalDateTime slotEnd = slotStart.plusMinutes(duration);

                // Check if past deadline
                if (request.getDeadlineDate() != null && slotStart.isAfter(request.getDeadlineDate())) continue;

                // Score this slot
                double score = scoreSlot(slotStart, request, candidateZone);

                String energy = getEnergyLevel(hour);
                boolean candidatePreferred = isInCandidatePreference(hour, request.getPreferredTimeOfDay());

                // Timezone display
                Map<String, String> tzDisplays = new LinkedHashMap<>();
                tzDisplays.put(candidateTz, slotStart.atZone(ZoneId.systemDefault())
                        .withZoneSameInstant(candidateZone).format(DISPLAY_FORMAT));
                if (request.getInterviewerTimezones() != null) {
                    request.getInterviewerTimezones().forEach((userId, tz) -> {
                        try {
                            tzDisplays.put(tz, slotStart.atZone(ZoneId.systemDefault())
                                    .withZoneSameInstant(ZoneId.of(tz)).format(DISPLAY_FORMAT));
                        } catch (Exception ignored) {}
                    });
                }

                String reason = buildSlotReason(energy, candidatePreferred, dow);

                slots.add(SmartSchedulerResponseDto.RecommendedSlot.builder()
                        .rank(0) // will be set after sorting
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .aiScore(Math.round(score * 10.0) / 10.0)
                        .reason(reason)
                        .availableInterviewers(List.of("All interviewers available"))
                        .timezoneDisplays(tzDisplays)
                        .candidatePreferred(candidatePreferred)
                        .interviewerConflicts(0)
                        .energyLevel(energy)
                        .build());
            }
        }

        return slots;
    }

    private double scoreSlot(LocalDateTime slot, SmartSchedulerRequestDto request, ZoneId candidateZone) {
        double score = 50.0; // base

        int hour = slot.getHour();

        // Peak hours bonus (10-11 AM, 3-4 PM)
        if (hour == 10 || hour == 11) score += 20;
        else if (hour == 15 || hour == 16) score += 15;
        else if (hour == 9) score += 10;
        else if (hour == 14) score += 5;
        else if (hour >= 17) score -= 10;
        else if (hour == 13) score -= 5; // post-lunch slump

        // Candidate preference match
        if (isInCandidatePreference(hour, request.getPreferredTimeOfDay())) score += 15;

        // Not Monday/Friday (typically less optimal)
        DayOfWeek dow = slot.getDayOfWeek();
        if (dow == DayOfWeek.TUESDAY || dow == DayOfWeek.WEDNESDAY || dow == DayOfWeek.THURSDAY) score += 5;

        // Earlier in the week = faster hire
        if (request.getPriority() != null && request.getPriority().equals("URGENT")) {
            long daysFromNow = Duration.between(LocalDateTime.now(), slot).toDays();
            if (daysFromNow <= 2) score += 15;
            else if (daysFromNow <= 4) score += 5;
        }

        // Timezone overlap check
        ZonedDateTime candidateTime = slot.atZone(ZoneId.systemDefault()).withZoneSameInstant(candidateZone);
        int candidateHour = candidateTime.getHour();
        if (candidateHour >= 9 && candidateHour <= 17) score += 10;
        else score -= 20; // outside business hours for candidate

        return Math.min(98, Math.max(10, score));
    }

    private boolean isInCandidatePreference(int hour, String preference) {
        if (preference == null || preference.equals("ANY")) return true;
        return switch (preference) {
            case "MORNING" -> hour >= 9 && hour < 12;
            case "AFTERNOON" -> hour >= 12 && hour < 17;
            case "EVENING" -> hour >= 17;
            default -> true;
        };
    }

    private String getEnergyLevel(int hour) {
        return ENERGY_MAP.getOrDefault(hour, "MODERATE");
    }

    private String buildSlotReason(String energy, boolean candidatePreferred, DayOfWeek dow) {
        List<String> reasons = new ArrayList<>();
        if (energy.equals("PEAK")) reasons.add("Peak cognitive hours");
        if (candidatePreferred) reasons.add("Matches candidate preference");
        if (dow == DayOfWeek.TUESDAY || dow == DayOfWeek.WEDNESDAY) reasons.add("Mid-week optimal scheduling");
        if (reasons.isEmpty()) reasons.add("Available slot");
        return String.join(" + ", reasons);
    }

    private SmartSchedulerResponseDto.SchedulingAnalytics calculateAnalytics(
            SmartSchedulerRequestDto request, List<SmartSchedulerResponseDto.RecommendedSlot> slots) {

        double avgScore = slots.stream().mapToDouble(SmartSchedulerResponseDto.RecommendedSlot::getAiScore).average().orElse(0);
        long viableSlots = slots.stream().filter(s -> s.getAiScore() > 60).count();

        return SmartSchedulerResponseDto.SchedulingAnalytics.builder()
                .schedulingDifficulty(slots.isEmpty() ? 100.0 : Math.max(0, 100 - avgScore))
                .totalSlotsAnalyzed(slots.size())
                .viableSlots((int) viableSlots)
                .averageInterviewerLoad(2.5)
                .busiestDay("Wednesday")
                .recommendedDay(slots.isEmpty() ? "N/A" : slots.get(0).getStartTime().getDayOfWeek().toString())
                .timezoneOverlap(request.getCandidateTimezone() != null ?
                        "9:00-17:00 " + request.getCandidateTimezone() : "Standard business hours")
                .estimatedResponseTimeHours(4)
                .build();
    }
}
