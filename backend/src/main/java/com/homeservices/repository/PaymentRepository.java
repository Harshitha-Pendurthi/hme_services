package com.homeservices.repository;

import com.homeservices.model.Payment;
import com.homeservices.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBooking(Booking booking);
    List<Payment> findByPaymentStatus(Payment.PaymentStatus paymentStatus);
    Payment findByTransactionId(String transactionId);
}
