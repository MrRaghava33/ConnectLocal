package com.connectlocal.dto;

import com.connectlocal.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned after a successful login, containing the JWT and basic user info.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private Long userId;
    private String fullName;
    private String email;
    private User.Role role;
}
