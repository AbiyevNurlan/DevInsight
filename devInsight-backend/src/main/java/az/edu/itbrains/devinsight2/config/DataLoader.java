package az.edu.itbrains.devinsight2.config;

import az.edu.itbrains.devinsight2.model.company.Company;
import az.edu.itbrains.devinsight2.model.company.CompanySize;
import az.edu.itbrains.devinsight2.model.core.AccountStatus;
import az.edu.itbrains.devinsight2.model.gamification.Badge;
import az.edu.itbrains.devinsight2.model.gamification.BadgeCategory;
import az.edu.itbrains.devinsight2.model.gamification.BadgeRarity;
import az.edu.itbrains.devinsight2.model.user.User;
import az.edu.itbrains.devinsight2.model.user.UserRole;
import az.edu.itbrains.devinsight2.repository.company.CompanyRepository;
import az.edu.itbrains.devinsight2.repository.gamification.BadgeRepository;
import az.edu.itbrains.devinsight2.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads initial data when application starts
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(String... args) {
        log.info("🚀 Initializing application data...");
        
        initializeBadges();
        initializeTestUsers();
        
        log.info("✅ Application data initialized successfully!");
    }
    
    private void initializeBadges() {
        if (badgeRepository.count() > 0) {
            log.info("Badges already exist, skipping...");
            return;
        }
        
        log.info("Creating default badges...");
        
        // Achievement badges
        createBadge("FIRST_INTERVIEW", "First Steps", "Completed your first interview", 
            "🎯", 100, BadgeCategory.ACHIEVEMENT, BadgeRarity.COMMON);
        
        createBadge("FIVE_INTERVIEWS", "Getting Started", "Completed 5 interviews", 
            "⭐", 200, BadgeCategory.ACHIEVEMENT, BadgeRarity.COMMON);
        
        createBadge("TEN_INTERVIEWS", "Interview Pro", "Completed 10 interviews", 
            "🌟", 300, BadgeCategory.ACHIEVEMENT, BadgeRarity.RARE);
        
        createBadge("TWENTY_FIVE_INTERVIEWS", "Interview Master", "Completed 25 interviews", 
            "💫", 500, BadgeCategory.ACHIEVEMENT, BadgeRarity.EPIC);
        
        // Quality badges
        createBadge("PERFECT_SCORE", "Perfectionist", "Achieved a perfect score", 
            "💯", 300, BadgeCategory.QUALITY, BadgeRarity.RARE);
        
        createBadge("HIGH_ACHIEVER", "High Achiever", "Achieved 90%+ score 5 times", 
            "🏆", 400, BadgeCategory.QUALITY, BadgeRarity.EPIC);
        
        // Streak badges
        createBadge("WEEK_STREAK", "Week Warrior", "7-day activity streak", 
            "🔥", 150, BadgeCategory.STREAK, BadgeRarity.COMMON);
        
        createBadge("MONTH_STREAK", "Dedication", "30-day activity streak", 
            "💪", 500, BadgeCategory.STREAK, BadgeRarity.EPIC);
        
        // Speed badges
        createBadge("SPEED_DEMON", "Speed Demon", "Completed interview in record time", 
            "⚡", 200, BadgeCategory.SPEED, BadgeRarity.RARE);
        
        createBadge("QUICK_THINKER", "Quick Thinker", "Average response time under 2 minutes", 
            "🚀", 250, BadgeCategory.SPEED, BadgeRarity.RARE);
        
        // Level badges
        createBadge("LEVEL_5", "Rising Star", "Reached level 5", 
            "⬆️", 100, BadgeCategory.ACHIEVEMENT, BadgeRarity.COMMON);
        
        createBadge("LEVEL_10", "Expert", "Reached level 10", 
            "👑", 300, BadgeCategory.ACHIEVEMENT, BadgeRarity.EPIC);
        
        // Special badges
        createBadge("EARLY_ADOPTER", "Early Adopter", "One of the first users", 
            "🌱", 500, BadgeCategory.SPECIAL, BadgeRarity.LEGENDARY);
        
        log.info("Created {} badges", badgeRepository.count());
    }
    
    private void createBadge(String code, String name, String description, 
                             String iconUrl, int points, BadgeCategory category, BadgeRarity rarity) {
        if (badgeRepository.findByCode(code).isEmpty()) {
            Badge badge = Badge.builder()
                .code(code)
                .name(name)
                .description(description)
                .iconUrl(iconUrl)
                .pointsValue(points)
                .category(category)
                .rarity(rarity)
                .isActive(true)
                .build();
            badgeRepository.save(badge);
        }
    }
    
    private void initializeTestUsers() {
        // Create ADMIN user if not exists
        if (userRepository.findByEmail("admin@devinsight.com").isEmpty()) {
            User adminUser = User.builder()
                .email("admin@devinsight.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(UserRole.ADMIN)
                .status(AccountStatus.ACTIVE)
                .build();
            userRepository.save(adminUser);
            log.info("✅ Created ADMIN user: admin@devinsight.com / admin123");
        } else {
            log.info("Admin user already exists: admin@devinsight.com");
        }
        
        // Create test company if not exists
        Company testCompany = companyRepository.findByName("DevInsight Demo Company")
            .orElseGet(() -> {
                Company company = Company.builder()
                    .name("DevInsight Demo Company")
                    .industry("Technology")
                    .size(CompanySize.MEDIUM)
                    .description("Demo company for testing")
                    .website("https://devinsight.demo")
                    .build();
                return companyRepository.save(company);
            });
        
        // Create HR user if not exists
        if (userRepository.findByEmail("hr@devinsight.com").isEmpty()) {
            User hrUser = User.builder()
                .email("hr@devinsight.com")
                .password(passwordEncoder.encode("hr123"))
                .fullName("HR Manager")
                .role(UserRole.HR)
                .status(AccountStatus.ACTIVE)
                .company(testCompany)
                .build();
            userRepository.save(hrUser);
            log.info("Created test HR user: hr@devinsight.com / hr123");
        }
        
        // Create Candidate users if not exists
        createCandidateIfNotExists("candidate@devinsight.com", "Test Candidate", "candidate123");
        createCandidateIfNotExists("john.doe@test.com", "John Doe", "test123");
        createCandidateIfNotExists("jane.smith@test.com", "Jane Smith", "test123");
        createCandidateIfNotExists("ali.ahmadov@test.com", "Ali Ahmadov", "test123");
        createCandidateIfNotExists("leyla.hasanova@test.com", "Leyla Hasanova", "test123");
        
        log.info("Test users initialized");
    }
    
    private void createCandidateIfNotExists(String email, String fullName, String password) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User candidate = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(UserRole.CANDIDATE)
                .status(AccountStatus.ACTIVE)
                .build();
            userRepository.save(candidate);
            log.info("✅ Created CANDIDATE user: {} / {}", email, password);
        }
    }
}
