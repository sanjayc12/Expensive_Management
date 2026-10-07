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
@RequestMapping("/manager/expenses")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final ExpenseService expenseService;

    public ManagerController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ExpenseRequest>> getPendingExpenses() {

        return ResponseEntity.ok(
                expenseService.getPendingExpenses()
        );
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ExpenseRequest> acceptExpense(
            @PathVariable Long id,
            Authentication authentication) {

        User manager = (User) authentication.getPrincipal();

        ExpenseRequest expense =
                expenseService.acceptExpense(id, manager);

        return ResponseEntity.ok(expense);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ExpenseRequest> rejectExpense(
            @PathVariable Long id,
            @RequestParam String comment,
            Authentication authentication) {

        User manager = (User) authentication.getPrincipal();

        ExpenseRequest expense =
                expenseService.rejectExpense(
                        id,
                        manager,
                        comment
                );

        return ResponseEntity.ok(expense);
    }
}