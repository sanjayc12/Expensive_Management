package com.Expensive.management.repository;

import com.Expensive.management.entity.ExpenseRequest;
import com.Expensive.management.entity.User;
import com.Expensive.management.enums.ExpenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRequestRepository
        extends JpaRepository<ExpenseRequest, Long> {

    List<ExpenseRequest> findByUser(User user);

    List<ExpenseRequest> findByStatus(ExpenseStatus status);
}