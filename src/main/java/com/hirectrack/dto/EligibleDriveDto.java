package com.hirectrack.dto;

import java.time.LocalDate;

public record EligibleDriveDto(
    long id,
    String jobRole,
    double salaryLpa,
    String companyName,
    String location,
    String jobType,
    LocalDate deadline,
    double matchScore // AI match %
) {}
