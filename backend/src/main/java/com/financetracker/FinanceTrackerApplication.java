package com.financetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main entry point for AI-Powered Finance Tracker application.
 *
 * This application provides intelligent personal finance management with:
 * - AI-powered transaction classification using Claude API
 * - Secure JWT-based authentication
 * - Real-time financial insights and analytics
 * - RESTful API for frontend integration
 *
 * @author Your Name
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableJpaAuditing
public class FinanceTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceTrackerApplication.class, args);
        System.out.println("""

            ╔══════════════════════════════════════════════════════════╗
            ║   AI-Powered Finance Tracker - Backend Started          ║
            ║   Port: 8080                                             ║
            ║   Swagger UI: http://localhost:8080/swagger-ui.html      ║
            ║   API Docs: http://localhost:8080/v3/api-docs           ║
            ╚══════════════════════════════════════════════════════════╝
            """);
    }
}
