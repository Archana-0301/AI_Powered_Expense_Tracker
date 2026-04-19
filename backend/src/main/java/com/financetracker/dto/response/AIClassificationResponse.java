package com.financetracker.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for AI classification results.
 * Contains classification metadata with confidence scoring.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIClassificationResponse {
    private String type; // INCOME or EXPENSE
    private String category; // e.g., "Food & Dining", "Salary"
    private String subcategory; // e.g., "coffee", "regular"
    private BigDecimal confidence; // 0.0 to 1.0
}
