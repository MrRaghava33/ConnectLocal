package com.connectlocal.service;

import com.connectlocal.dto.UserResponse;
import com.connectlocal.entity.User;
import com.connectlocal.exception.ResourceNotFoundException;
import com.connectlocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserResponse userResponse) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userResponse.getFullName() != null && !userResponse.getFullName().isBlank()) {
            user.setFullName(userResponse.getFullName());
        }
        if (userResponse.getPhone() != null && !userResponse.getPhone().isBlank()) {
            user.setPhone(userResponse.getPhone());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
