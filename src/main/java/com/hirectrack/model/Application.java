package com.hirectrack.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    // Assuming Drive entity will be added
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "drive_id")
    // private Drive drive;

    private LocalDateTime appliedAt = LocalDateTime.now();

    // Use separate columns or a JSONB object? We'll use individual Boolean columns as before,
    // but also provide a JSONB column for RoundStatus history if needed.
    // For simplicity, we keep Boolean, but you could extend to use RoundStatus.
    private Boolean cvScreening;
    private Boolean aptitudeTest;
    private Boolean technicalRound1;
    private Boolean technicalRound2;
    private Boolean hrRound;

    @Enumerated(EnumType.STRING)
    private FinalResult finalResult = FinalResult.IN_PROGRESS;

    public enum FinalResult { IN_PROGRESS, SELECTED, REJECTED, ON_HOLD }
}
