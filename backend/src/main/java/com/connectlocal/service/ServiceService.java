package com.connectlocal.service;

import com.connectlocal.dto.ServiceDTO;

import java.util.List;

public interface ServiceService {

    ServiceDTO createService(ServiceDTO serviceDTO, Long providerId);

    List<ServiceDTO> getAllServices();

    ServiceDTO getServiceById(Long id);

    ServiceDTO updateService(Long id, ServiceDTO serviceDTO);

    void deleteService(Long id);

    List<ServiceDTO> getServicesByProvider(Long providerId);

    List<ServiceDTO> searchServices(String keyword);
}
