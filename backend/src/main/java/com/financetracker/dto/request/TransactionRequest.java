package com.financetracker.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating/updating transactions.
 */
@Data
public class TransactionRequest {

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 15, fraction = 2, message = "Invalid amount format")
    private BigDecimal amount;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    // Optional: Can be provided by user or let AI classify
    private String type; // INCOME or EXPENSE

    private Long categoryId;

    private String subcategory;

    private String notes;

    private Boolean isRecurring = false;

    // Flag to skip AI classification (for manual entry)
    private Boolean skipAIClassification = false;
}
