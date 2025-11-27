package com.homeservices.repository;

import com.homeservices.model.Booking;
import com.homeservices.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    List<Booking> findByProvider(User provider);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByBookingDate(LocalDate bookingDate);
    
    @Query("SELECT b FROM Booking b WHERE b.customer = :customer ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerOrderByCreatedAtDesc(@Param("customer") User customer);
    
    @Query("SELECT b FROM Booking b WHERE b.provider = :provider ORDER BY b.bookingDate ASC, b.bookingTime ASC")
    List<Booking> findByProviderOrderByBookingDateTime(@Param("provider") User provider);
    
    @Query("SELECT b FROM Booking b WHERE b.provider = :provider AND b.bookingDate = :date")
    List<Booking> findByProviderAndBookingDate(@Param("provider") User provider, @Param("date") LocalDate date);
}
