package com.homeservices.controller;

import com.homeservices.dto.BookingRequest;
import com.homeservices.model.Booking;
import com.homeservices.model.Service;
import com.homeservices.model.User;
import com.homeservices.repository.BookingRepository;
import com.homeservices.repository.ServiceRepository;
import com.homeservices.repository.UserRepository;
import com.homeservices.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getUserBookings(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByUsername(userPrincipal.getUsername()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Booking> bookings;
        if (user.getRole() == User.Role.CUSTOMER) {
            bookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(user);
        } else if (user.getRole() == User.Role.PROVIDER) {
            bookings = bookingRepository.findByProviderOrderByBookingDateTime(user);
        } else {
            bookings = bookingRepository.findAll();
        }

        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(booking -> ResponseEntity.ok().body(booking))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User customer = userRepository.findByUsername(userPrincipal.getUsername()).orElse(null);
        
        if (customer == null) {
            return ResponseEntity.badRequest().body("Customer not found");
        }

        Service service = serviceRepository.findById(bookingRequest.getServiceId()).orElse(null);
        if (service == null) {
            return ResponseEntity.badRequest().body("Service not found");
        }

        Booking booking = new Booking(
                customer,
                service,
                service.getProvider(),
                bookingRequest.getBookingDate(),
                bookingRequest.getBookingTime(),
                service.getPrice()
        );
        booking.setSpecialInstructions(bookingRequest.getSpecialInstructions());

        Booking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(savedBooking);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestParam Booking.BookingStatus status) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setStatus(status);
                    return ResponseEntity.ok(bookingRepository.save(booking));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
