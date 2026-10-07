package com.Expensive.management.service;

import com.Expensive.management.entity.ExpenseRequest;
import com.Expensive.management.entity.User;
import com.Expensive.management.enums.ExpenseStatus;
import com.Expensive.management.repository.ExpenseRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRequestRepository expenseRequestRepository;

    public ExpenseService(ExpenseRequestRepository expenseRequestRepository) {
        this.expenseRequestRepository = expenseRequestRepository;
    }

    public ExpenseRequest createExpense(
            Double amount,
            String description,
            User user) {

        ExpenseRequest expense = new ExpenseRequest();

        expense.setAmount(amount);
        expense.setDescription(description);
        expense.setStatus(ExpenseStatus.PENDING);
        expense.setUser(user);
        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());

        return expenseRequestRepository.save(expense);
    }

    public List<ExpenseRequest> getMyExpenses(User user) {

        return expenseRequestRepository.findAll()
                .stream()
                .filter(expense ->
                        expense.getUser().getId().equals(user.getId()))
                .toList();
    }
    public List<ExpenseRequest> getPendingExpenses() {

        return expenseRequestRepository
                .findByStatus(ExpenseStatus.PENDING);
    }
    public ExpenseRequest acceptExpense(Long id, User manager) {

        ExpenseRequest expense = expenseRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new RuntimeException("Expense already processed");
        }

        expense.setStatus(ExpenseStatus.ACCEPTED);
        expense.setManager(manager);
        expense.setUpdatedAt(LocalDateTime.now());

        return expenseRequestRepository.save(expense);
    }
    public ExpenseRequest rejectExpense(
            Long id,
            User manager,
            String comment) {

        ExpenseRequest expense = expenseRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        if (expense.getStatus() != ExpenseStatus.PENDING) {
            throw new RuntimeException("Expense already processed");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setManager(manager);
        expense.setManagerComment(comment);
        expense.setUpdatedAt(LocalDateTime.now());

        return expenseRequestRepository.save(expense);
    }
}