package com.connectlocal.service;

import com.connectlocal.dto.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserResponse userResponse);

    void deleteUser(Long id);
}
