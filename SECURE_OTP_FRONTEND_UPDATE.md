# Frontend Updates for Secure OTP System

## Overview

Frontend has been updated to support the new secure OTP endpoints that use AWS SES with IAM role authentication.

## Changes Made

### 1. Auth Service (`src/network/modules/auth.js`)

Added two new methods:

```javascript
// Secure OTP endpoints using AWS SES with IAM role
requestSecureOtp(email) {
    return authHttpClient.post('/auth/secure/request-otp', { email });
},
verifySecureOtp(email, otp) {
    return authHttpClient.post('/auth/secure/verify-otp', { email, otp });
},
```

### 2. Auth Store (`src/stores/auth.js`)

Added two new actions:

```javascript
// Secure OTP methods using AWS SES with IAM role
async requestSecureOtp(email) {
    try {
        const response = await authService.requestSecureOtp(email);
        return handleResponse(response);
    } catch (error) {
        this.errors = error || {};
        throw this.errors;
    }
},
async verifySecureOtp(email, otp) {
    try {
        const response = await authService.verifySecureOtp(email, otp);
        return handleResponse(response);
    } catch (error) {
        this.errors = error || {};
        throw this.errors;
    }
},
```

## Usage in Components

### Request OTP Example

```vue
<script setup>
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();

const requestOtp = async () => {
  try {
    const response = await authStore.requestSecureOtp('user@example.com');
    if (response.success) {
      console.log('OTP sent successfully');
      console.log('Expires at:', response.data.expires_at);
    }
  } catch (error) {
    console.error('Failed to request OTP:', error);
  }
};
</script>
```

### Verify OTP Example

```vue
<script setup>
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();

const verifyOtp = async () => {
  try {
    const response = await authStore.verifySecureOtp('user@example.com', '123456');
    if (response.success) {
      console.log('OTP verified successfully');
      // Proceed with next step
    }
  } catch (error) {
    console.error('Failed to verify OTP:', error);
  }
};
</script>
```

## API Differences

### Old Endpoints (Still Available)
- `/auth/request-otp` - Uses phone number
- `/auth/verify-otp` - Uses phone number
- `/auth/forget-password-verify` - For password reset
- `/auth/register-verify` - For registration

### New Secure Endpoints
- `/auth/secure/request-otp` - Uses email, AWS SES with IAM role
- `/auth/secure/verify-otp` - Uses email, AWS SES with IAM role

## Migration Guide

### Option 1: Use Both Systems (Recommended for Transition)
- Keep existing phone-based OTP for backward compatibility
- Use new secure email-based OTP for new features
- Gradually migrate users to email-based OTP

### Option 2: Full Migration
1. Update all OTP request components to use `requestSecureOtp(email)`
2. Update all OTP verification components to use `verifySecureOtp(email, otp)`
3. Remove phone-based OTP calls
4. Update user flows to use email instead of phone

## Component Updates Needed

If you want to use the secure OTP in existing components:

### Update `VerifyRegistrationOtp.vue`

```vue
// Change from:
const response = await authStore.verifyRegistrationOtp(form.value);

// To:
const response = await authStore.verifySecureOtp(form.value.email, form.value.otp);
```

### Update `Otp.vue` (Forgot Password)

```vue
// Change from:
const response = await authStore.verifyOtp(form.value);

// To:
const response = await authStore.verifySecureOtp(form.value.email, form.value.otp);
```

## Benefits of Secure OTP

1. **No Credentials in Code**: Uses IAM role (more secure)
2. **Email-Based**: More reliable than SMS
3. **Rate Limited**: Built-in protection against abuse
4. **Hashed Storage**: OTPs stored securely in database
5. **Single-Use**: OTPs can only be used once
6. **Expiry**: 5-minute expiration enforced

## Testing

Test the new endpoints:

```javascript
// In browser console or component
const authStore = useAuthStore();

// Request OTP
await authStore.requestSecureOtp('test@example.com');

// Verify OTP (use the code received via email)
await authStore.verifySecureOtp('test@example.com', '123456');
```

## Notes

- The new endpoints require email instead of phone
- Rate limiting: 3 requests per 15 minutes, 5 verification attempts per 15 minutes
- OTP expires in 5 minutes
- Maximum 5 attempts per OTP


