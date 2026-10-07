package com.Expensive.management.controller;

import com.Expensive.management.entity.ExpenseRequest;
import com.Expensive.management.entity.User;
import com.Expensive.management.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ExpenseRequest> createExpense(
            @RequestParam Double amount,
            @RequestParam String description,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        ExpenseRequest expense =
                expenseService.createExpense(
                        amount,
                        description,
                        user
                );

        return ResponseEntity.ok(expense);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my")
    public ResponseEntity<List<ExpenseRequest>> getMyExpenses(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                expenseService.getMyExpenses(user)
        );
    }
}