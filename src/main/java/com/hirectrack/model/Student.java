package com.hirectrack.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Assuming User entity will be added
    // @OneToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "user_id", nullable = false)
    // private User user;

    private String branch;
    private double cgpa;

    // Storing as JSONB for PostgreSQL; use @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> skills; // e.g. ["Java", "Python", "React"]

    private String careerGoal;
    private boolean placed = false;

    @OneToMany(mappedBy = "student")
    private List<Application> applications;
}
