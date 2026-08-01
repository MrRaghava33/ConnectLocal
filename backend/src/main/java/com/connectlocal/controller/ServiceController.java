package com.connectlocal.controller;

import com.connectlocal.dto.ServiceDTO;
import com.connectlocal.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Service catalogue management. Providers create/update/delete their own services;
 * seekers browse and search the public catalogue.
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @PostMapping
    public ResponseEntity<ServiceDTO> createService(@Valid @RequestBody ServiceDTO serviceDTO,
                                                      @RequestParam Long providerId) {
        ServiceDTO created = serviceService.createService(serviceDTO, providerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices(@RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(serviceService.searchServices(keyword));
        }
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDTO> updateService(@PathVariable Long id, @Valid @RequestBody ServiceDTO serviceDTO) {
        return ResponseEntity.ok(serviceService.updateService(id, serviceDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceDTO>> getServicesByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(serviceService.getServicesByProvider(providerId));
    }
}
