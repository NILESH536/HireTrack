package com.hirectrack.service;

import io.micrometer.core.annotation.Timed;
import io.micrometer.core.annotation.Counted;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;
import com.hirectrack.model.Student;

@Service
public class ChatService {
    @Timed(value = "chatbot.call", description = "Time taken to call Claude API")
    @Counted(value = "chatbot.sessions", description = "Number of chatbot interactions")
    public String getCareerAdvice(Student student, String userMessage) {
        // Build context, call Claude API
        return "Not implemented yet";
    }

    // @Async
    // @Timed(value = "resume.parse", description = "Resume parsing time")
    // public CompletableFuture<ResumeAnalysisDto> parseResume(MultipartFile file) { 
    //     return CompletableFuture.completedFuture(null);
    // }
}
