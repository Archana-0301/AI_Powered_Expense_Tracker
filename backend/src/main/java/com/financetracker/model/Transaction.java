package com.financetracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction entity for income and expense records.
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_transactions_user_date", columnList = "user_id,transaction_date"),
        @Index(name = "idx_transactions_user_type", columnList = "user_id,type"),
        @Index(name = "idx_transactions_category", columnList = "category_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "ai_classified")
    private Boolean aiClassified = false;

    @Column(name = "ai_confidence", precision = 3, scale = 2)
    private BigDecimal aiConfidence;

    @Column(length = 50)
    private String subcategory;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TransactionType {
        INCOME,
        EXPENSE
    }
}
