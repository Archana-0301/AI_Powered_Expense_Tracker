package com.financetracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financetracker.dto.response.AIClassificationResponse;
import com.financetracker.exception.AIServiceException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Transaction classification service using Claude API.
 * Categorizes transactions with confidence scoring and fallback classification.
 */
@Service
@Slf4j
public class AIClassificationService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.claude.api-key}")
    private String apiKey;

    @Value("${app.ai.claude.model}")
    private String model;

    @Value("${app.ai.claude.max-tokens}")
    private int maxTokens;

    @Value("${app.ai.claude.temperature}")
    private double temperature;

    public AIClassificationService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper,
                                    @Value("${app.ai.claude.api-url}") String apiUrl) {
        this.webClient = webClientBuilder
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    /**
     * Classifies a transaction using Claude AI with caching.
     */
    @Cacheable(value = "aiClassificationCache", key = "#description.toLowerCase()")
    public AIClassificationResponse classifyTransaction(String description, BigDecimal amount) {
        try {
            log.info("Classifying transaction: '{}' with amount: {}", description, amount);

            String prompt = buildClassificationPrompt(description, amount);
            String aiResponse = callClaudeAPI(prompt);
            AIClassificationResponse classification = parseAIResponse(aiResponse);

            log.info("AI Classification: type={}, category={}, confidence={}",
                    classification.getType(), classification.getCategory(), classification.getConfidence());

            return classification;

        } catch (Exception e) {
            log.error("AI classification failed, falling back to rule-based: {}", e.getMessage());
            return fallbackClassification(description, amount);
        }
    }

    private String buildClassificationPrompt(String description, BigDecimal amount) {
        return String.format("""
                You are a financial transaction classifier. Analyze the transaction and return ONLY a JSON object.

                Examples:
                - "coffee at starbucks" → {"type": "EXPENSE", "category": "Food & Dining", "subcategory": "coffee", "confidence": 0.95}
                - "monthly salary" → {"type": "INCOME", "category": "Salary", "subcategory": "regular", "confidence": 0.98}
                - "bought dress" → {"type": "EXPENSE", "category": "Shopping", "subcategory": "clothing", "confidence": 0.92}
                - "freelance payment web design" → {"type": "INCOME", "category": "Freelance", "subcategory": "design", "confidence": 0.90}
                - "uber to office" → {"type": "EXPENSE", "category": "Transportation", "subcategory": "ride-share", "confidence": 0.94}
                - "movie tickets" → {"type": "EXPENSE", "category": "Entertainment", "subcategory": "cinema", "confidence": 0.96}

                Transaction to classify:
                Description: "%s"
                Amount: %s

                Available categories:
                EXPENSE: Food & Dining, Shopping, Transportation, Entertainment, Healthcare, Education, Bills & Utilities, Travel, Personal Care, Gifts & Donations, Other Expense
                INCOME: Salary, Freelance, Investment, Rental Income, Business, Bonus, Other Income

                Rules:
                1. type must be "INCOME" or "EXPENSE"
                2. category must match one from the list above
                3. subcategory should be a specific descriptor (lowercase, max 3 words)
                4. confidence must be between 0.0 and 1.0

                Return ONLY the JSON object, no explanation:
                """, description, amount);
    }

    private String callClaudeAPI(String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);
        requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
        ));

        try {
            String response = webClient.post()
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();

            // Extract content from Claude's response
            JsonNode jsonResponse = objectMapper.readTree(response);
            JsonNode contentArray = jsonResponse.get("content");

            if (contentArray != null && contentArray.isArray() && contentArray.size() > 0) {
                return contentArray.get(0).get("text").asText();
            }

            throw new AIServiceException("Invalid response structure from Claude API");

        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            throw new AIServiceException("Failed to communicate with AI service", e);
        }
    }

    private AIClassificationResponse parseAIResponse(String aiResponse) {
        try {
            // Extract JSON from response (sometimes Claude adds explanation)
            String jsonStr = aiResponse.trim();
            if (jsonStr.contains("{")) {
                jsonStr = jsonStr.substring(jsonStr.indexOf("{"), jsonStr.lastIndexOf("}") + 1);
            }

            JsonNode json = objectMapper.readTree(jsonStr);

            AIClassificationResponse response = new AIClassificationResponse();
            response.setType(json.get("type").asText());
            response.setCategory(json.get("category").asText());
            response.setSubcategory(json.has("subcategory") ? json.get("subcategory").asText() : null);
            response.setConfidence(BigDecimal.valueOf(json.get("confidence").asDouble()));

            // Validate confidence range
            if (response.getConfidence().compareTo(BigDecimal.ZERO) < 0 ||
                response.getConfidence().compareTo(BigDecimal.ONE) > 0) {
                response.setConfidence(BigDecimal.valueOf(0.75)); // Default confidence
            }

            return response;

        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            throw new AIServiceException("Failed to parse AI classification response", e);
        }
    }

    private AIClassificationResponse fallbackClassification(String description, BigDecimal amount) {
        String lowerDesc = description.toLowerCase();

        AIClassificationResponse response = new AIClassificationResponse();
        response.setConfidence(BigDecimal.valueOf(0.60)); // Lower confidence for rule-based

        // Income keywords
        if (lowerDesc.contains("salary") || lowerDesc.contains("paycheck") || lowerDesc.contains("wage")) {
            response.setType("INCOME");
            response.setCategory("Salary");
            response.setSubcategory("regular");
        } else if (lowerDesc.contains("freelance") || lowerDesc.contains("gig") || lowerDesc.contains("contract")) {
            response.setType("INCOME");
            response.setCategory("Freelance");
            response.setSubcategory("project");
        } else if (lowerDesc.contains("investment") || lowerDesc.contains("dividend") || lowerDesc.contains("stock")) {
            response.setType("INCOME");
            response.setCategory("Investment");
            response.setSubcategory("returns");
        } else if (lowerDesc.contains("bonus") || lowerDesc.contains("incentive")) {
            response.setType("INCOME");
            response.setCategory("Bonus");
            response.setSubcategory("performance");
        }
        // Expense keywords
        else if (lowerDesc.contains("food") || lowerDesc.contains("restaurant") || lowerDesc.contains("coffee") ||
                 lowerDesc.contains("lunch") || lowerDesc.contains("dinner") || lowerDesc.contains("breakfast")) {
            response.setType("EXPENSE");
            response.setCategory("Food & Dining");
            response.setSubcategory("meals");
        } else if (lowerDesc.contains("uber") || lowerDesc.contains("taxi") || lowerDesc.contains("fuel") ||
                   lowerDesc.contains("gas") || lowerDesc.contains("transport")) {
            response.setType("EXPENSE");
            response.setCategory("Transportation");
            response.setSubcategory("travel");
        } else if (lowerDesc.contains("shopping") || lowerDesc.contains("clothes") || lowerDesc.contains("dress") ||
                   lowerDesc.contains("shoes") || lowerDesc.contains("amazon")) {
            response.setType("EXPENSE");
            response.setCategory("Shopping");
            response.setSubcategory("general");
        } else if (lowerDesc.contains("movie") || lowerDesc.contains("entertainment") || lowerDesc.contains("concert")) {
            response.setType("EXPENSE");
            response.setCategory("Entertainment");
            response.setSubcategory("leisure");
        } else if (lowerDesc.contains("rent") || lowerDesc.contains("electricity") || lowerDesc.contains("water") ||
                   lowerDesc.contains("internet") || lowerDesc.contains("bill")) {
            response.setType("EXPENSE");
            response.setCategory("Bills & Utilities");
            response.setSubcategory("recurring");
        } else {
            // Default based on amount heuristic
            response.setType("EXPENSE");
            response.setCategory("Other Expense");
            response.setSubcategory("uncategorized");
            response.setConfidence(BigDecimal.valueOf(0.40));
        }

        log.info("Fallback classification: type={}, category={}", response.getType(), response.getCategory());
        return response;
    }

    public String generateSpendingInsights(Map<String, BigDecimal> categoryTotals,
                                          BigDecimal totalExpense,
                                          BigDecimal totalIncome) {
        try {
            String prompt = String.format("""
                    Analyze this monthly financial data and provide 2-3 brief insights (max 150 words):

                    Total Income: $%s
                    Total Expenses: $%s
                    Savings: $%s

                    Category Breakdown:
                    %s

                    Provide actionable insights focusing on:
                    1. Spending patterns (which category is highest)
                    2. Savings potential
                    3. One specific recommendation

                    Be concise and practical. No generic advice.
                    """,
                    totalIncome, totalExpense, totalIncome.subtract(totalExpense),
                    formatCategoryBreakdown(categoryTotals));

            return callClaudeAPI(prompt);

        } catch (Exception e) {
            log.error("Failed to generate insights: {}", e.getMessage());
            return "Insights temporarily unavailable. Your spending data is being tracked successfully.";
        }
    }

    private String formatCategoryBreakdown(Map<String, BigDecimal> categoryTotals) {
        StringBuilder sb = new StringBuilder();
        categoryTotals.forEach((category, amount) ->
            sb.append(String.format("- %s: $%s\n", category, amount))
        );
        return sb.toString();
    }

    private String generateCacheKey(String description) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(description.toLowerCase().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return description.toLowerCase().replaceAll("\\s+", "_");
        }
    }
}
