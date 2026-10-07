package com.Expensive.management.entity;

import com.Expensive.management.enums.ExpenseStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "expense_request")
public class ExpenseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Double amount;

    @NotNull
    private String description;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    // Many expense requests can belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Many expense requests can be handled by one manager
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    private String managerComment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}