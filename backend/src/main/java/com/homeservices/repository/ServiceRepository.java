package com.homeservices.repository;

import com.homeservices.model.Service;
import com.homeservices.model.ServiceCategory;
import com.homeservices.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByIsAvailableTrue();
    List<Service> findByProvider(User provider);
    List<Service> findByCategory(ServiceCategory category);
    List<Service> findByCategoryAndIsAvailableTrue(ServiceCategory category);
    
    @Query("SELECT s FROM Service s WHERE s.provider = :provider AND s.isAvailable = true")
    List<Service> findAvailableServicesByProvider(@Param("provider") User provider);
    
    @Query("SELECT s FROM Service s WHERE s.category.id = :categoryId AND s.isAvailable = true")
    List<Service> findAvailableServicesByCategoryId(@Param("categoryId") Long categoryId);
}
