package az.edu.itbrains.devinsight2.model.company;

import az.edu.itbrains.devinsight2.model.interview.Interview;
import az.edu.itbrains.devinsight2.model.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String domain; // e.g., "devinsight.com"

    @Column(columnDefinition = "TEXT")
    private String description;

    private String industry;
    private String website;
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    private CompanySize size;

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private List<User> employees = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Interview> interviews = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
