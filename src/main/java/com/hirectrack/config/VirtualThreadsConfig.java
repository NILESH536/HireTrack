package com.hirectrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executors;

@Configuration
public class VirtualThreadsConfig {
    // Used for @Async methods; Spring Boot 3.3+ auto-configures if property set,
    // but we provide a custom executor to ensure virtual threads are used.
    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1); // virtual threads are cheap
        executor.setMaxPoolSize(Integer.MAX_VALUE);
        executor.setThreadFactory(Thread.ofVirtual().factory());
        executor.setThreadNamePrefix("virtual-");
        return executor;
    }
}
