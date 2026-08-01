package com.connectlocal.service;

import com.connectlocal.dto.ServiceDTO;
import com.connectlocal.entity.Service;
import com.connectlocal.entity.User;
import com.connectlocal.exception.ResourceNotFoundException;
import com.connectlocal.repository.ServiceRepository;
import com.connectlocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

// NOTE: the entity in this domain is named "Service", which collides with
// org.springframework.stereotype.Service. We therefore reference the Spring
// annotation with its fully-qualified name below instead of importing it.
@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @Override
    public ServiceDTO createService(ServiceDTO serviceDTO, Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + providerId));

        Service service = Service.builder()
                .title(serviceDTO.getTitle())
                .description(serviceDTO.getDescription())
                .category(serviceDTO.getCategory())
                .price(serviceDTO.getPrice())
                .location(serviceDTO.getLocation())
                .availability(serviceDTO.getAvailability())
                .imageUrl(serviceDTO.getImageUrl())
                .provider(provider)
                .build();

        Service savedService = serviceRepository.save(service);
        return toDTO(savedService);
    }

    @Override
    public List<ServiceDTO> getAllServices() {
        return serviceRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceDTO getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return toDTO(service);
    }

    @Override
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        service.setTitle(serviceDTO.getTitle());
        service.setDescription(serviceDTO.getDescription());
        service.setCategory(serviceDTO.getCategory());
        service.setPrice(serviceDTO.getPrice());
        service.setLocation(serviceDTO.getLocation());
        service.setAvailability(serviceDTO.getAvailability());
        service.setImageUrl(serviceDTO.getImageUrl());

        Service updatedService = serviceRepository.save(service);
        return toDTO(updatedService);
    }

    @Override
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
    }

    @Override
    public List<ServiceDTO> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderId(providerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceDTO> searchServices(String keyword) {
        return serviceRepository
                .findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrLocationContainingIgnoreCase(
                        keyword, keyword, keyword)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ServiceDTO toDTO(Service service) {
        return ServiceDTO.builder()
                .id(service.getId())
                .title(service.getTitle())
                .description(service.getDescription())
                .category(service.getCategory())
                .price(service.getPrice())
                .location(service.getLocation())
                .availability(service.getAvailability())
                .imageUrl(service.getImageUrl())
                .providerId(service.getProvider().getId())
                .providerName(service.getProvider().getFullName())
                .build();
    }
}
