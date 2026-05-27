package com.hirectrack.dto;

import java.util.List;

public record StudentProfileDto(
    String name,
    String email,
    String branch,
    double cgpa,
    List<String> skills,
    String careerGoal,
    boolean placed
) {}
