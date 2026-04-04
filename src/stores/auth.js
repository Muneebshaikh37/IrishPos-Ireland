import {defineStore} from 'pinia';
import {handleResponse, handleError} from "@/network/api/responseHandler.js";
import { Ability } from '@casl/ability';
import httpClient from "@/network/api/httpClient.js";
import { getVat } from "@/utils/vat";
import { setCurrencyCode } from "@/utils/currency";
import router from "@/router";
import authService from "@/network/modules/auth.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        errorMessage: '',
        errors: '',
        ability: new Ability([]),
        user_id: localStorage.getItem('user_id') || null, // Reactive user_id
        VAT: localStorage.getItem('VAT') || 15, // Default VAT
        impersonationActive: false,
    }),

    actions: {
        async login(credentials) {
            try {
                const response = await authService.login(credentials);
                const result = handleResponse(response);
                if (result.success) {
                    const payload = result.data || {};
                    const apiUser = payload.user || {};

                    const token = payload.token;

                    const id = payload.id ?? apiUser.id;
                    const user_id = payload.user_id ?? apiUser.user_id;
                    const name = payload.name ?? apiUser.name;
                    const email = payload.email ?? apiUser.email;
                    const phone = payload.phone ?? apiUser.phone;
                    const permissions = payload.permissions ?? apiUser.permissions;
                    const vat_number = payload.vat_number ?? apiUser.vat_number;
                    const address = payload.address ?? apiUser.address;
                    const store_name = payload.store_name ?? apiUser.store_name;

                    const roleFromTop = payload.role;
                    const rolesFromTop = payload.roles;
                    const roleFromUser = apiUser.role;
                    const rolesFromUser = apiUser.roles;

                    const effectiveRole =
                        roleFromTop ||
                        (Array.isArray(rolesFromTop) ? rolesFromTop[0] : undefined) ||
                        roleFromUser ||
                        (Array.isArray(rolesFromUser) ? rolesFromUser[0] : undefined) ||
                        'User';

                    const allRoles = (Array.isArray(rolesFromTop) && rolesFromTop.length
                        ? rolesFromTop
                        : (Array.isArray(rolesFromUser) ? rolesFromUser : []));
                    const roles = allRoles;

                    // Save token and user details to state and localStorage
                    this.token = token;
                    this.user = {id, user_id, name, email, phone, vat_number, address, store_name, permissions, role: effectiveRole, roles};
                    this.user_id = user_id; // Set user_id in the store

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(this.user));
                    localStorage.setItem('user_id', user_id);

                    // Update ability from permissions before any redirect (fixes access denied for Super Admin and all roles)
                    if (this.user.permissions && Array.isArray(this.user.permissions) && this.user.permissions.length > 0) {
                        const rules = this.user.permissions.map((perm) => {
                            const permissionName = typeof perm === 'string' ? perm : (perm?.name ?? perm);
                            if (!permissionName || !String(permissionName).includes(':')) return null;
                            const [subject, action] = String(permissionName).split(':');
                            return { action: action.toLowerCase(), subject };
                        }).filter(rule => rule !== null);
                        // Give Admin and Super Admin full access (matches original behavior)
                        if (effectiveRole === 'Super Admin' || effectiveRole === 'Admin') {
                            rules.push({ action: 'manage', subject: 'all' });
                        }
                        this.ability.update(rules);
                    } else {
                        this.ability.update([]);
                    }

                    // Check if user needs to select package (trial users or no active subscription)
                    const trialStatus = payload.trial_status ?? apiUser.trial_status ?? null;
                    const currentSubscription = payload.current_subscription ?? apiUser.current_subscription ?? null;
                    const isSuperAdmin = effectiveRole === 'Super Admin' || (Array.isArray(roles) && roles.includes('Super Admin'));
                    const isSubUser = user_id !== id; // Check if sub-user (has different user_id than id)

                    // Save subscription status to localStorage for guard checks
                    if (trialStatus) {
                        localStorage.setItem('trial_status', JSON.stringify(trialStatus));
                    }
                    if (currentSubscription) {
                        localStorage.setItem('current_subscription', JSON.stringify(currentSubscription));
                        // Set subscription_status for guard
                        const subscriptionStatus = {
                            active: currentSubscription.status === 'active',
                            expired: currentSubscription.status === 'expired',
                            trial_expired: trialStatus?.trial_expired || false,
                            has_active_subscription: currentSubscription.status === 'active' || currentSubscription.status === 'trial'
                        };
                        localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
                    } else {
                        // No active subscription
                        const subscriptionStatus = {
                            active: false,
                            expired: true,
                            trial_expired: trialStatus?.trial_expired || false,
                            has_active_subscription: false
                        };
                        localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
                    }

                    // Load VAT + currency before navigation so the first screen (dashboard) formats money correctly
                    this.VAT = await this.fetchVat(user_id);
                    await this.syncCurrencySetting(user_id);

                    // Redirect Super Admin to their dashboard
                    if (isSuperAdmin) {
                        router.push('/superadmin/dashboard');
                        return;
                    }

                    // Redirect to package selection only when trial/subscription has ended AND no active subscription (shop owner, not sub-user)
                    if (!isSubUser) {
                        const trialEnded = trialStatus?.trial_expired === true;
                        const subscriptionEnded = currentSubscription?.status === 'expired';
                        const hasActiveSubscription = currentSubscription?.status === 'active' || currentSubscription?.status === 'trial';
                        // Only redirect if (trial or subscription ended) AND no active subscription
                        if ((trialEnded || subscriptionEnded) && !hasActiveSubscription) {
                            router.push('/package-selection');
                            return;
                        }
                    }

                    router.push('/admin');

                }
            } catch (error) {
                console.log('Error logging in:', error);
                this.errors = error || {};
                // Throw the error for handling in the component
                throw new Error(this.errors);
            }
        },
        async fetchVat(userId) {
            if (!userId) return 15; // Default VAT

            try {
                const vatResponse = await getVat(userId);
                const vatValue = vatResponse !== null && vatResponse !== undefined ? vatResponse : 15;

                this.VAT = vatValue; // Dynamically update VAT
                localStorage.setItem("VAT", vatValue); // Persist VAT
                return vatValue;
            } catch (error) {
                this.VAT = 15; // Default VAT
                return 15;
            }
        },
        async syncCurrencySetting(userId) {
            if (!userId) {
                setCurrencyCode('EUR');
                return 'EUR';
            }
            try {
                const response = await httpClient.get(
                    `${import.meta.env.VITE_PUBLIC_AUTH_API_URL}/settings`,
                    { params: { user_id: userId } }
                );
                const currencyCode = response?.data?.currency_code || response?.data?.data?.currency_code || 'EUR';
                return setCurrencyCode(currencyCode);
            } catch (error) {
                return setCurrencyCode(localStorage.getItem('currency_code') || 'EUR');
            }
        },
        async updateVat() {
            if (!this.user_id) {
                console.error('User ID is required to fetch VAT.');
                return;
            }

            try {
                const vatValue = await getVat(this.user_id);
                this.VAT = vatValue !== null && vatValue !== undefined ? vatValue : 15;

                localStorage.setItem("VAT", this.VAT);
                console.log('VAT updated to:', this.VAT);
            } catch (error) {
                console.error('Error fetching VAT:', error);
                this.VAT = 15; // Reset to default in case of error
                localStorage.setItem("VAT", this.VAT);
            }
        },
        async register(credentials) {
            try {
                const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + '/auth/register', credentials);
                const result = handleResponse(response);
                if (result.success) {
                    // Registration successful - OTP sent to email
                    // Navigate to OTP verification page with email
                    const email = result.data.email;
                    return { success: true, email: email };
                }
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
        async verifyRegistrationOtp(payload) {
            try {
                const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + '/auth/register-verify', payload);
                const result = handleResponse(response);
                if (result.success) {
                    // OTP verified - now login the user with the returned data
                    const {id, user_id, name, token, email, phone, permissions, vat_number, address, store_name, role, roles} = result.data;
                    // Assign token and user to state
                    this.token = token;
                    const effectiveRole = role || (Array.isArray(roles) ? roles[0] : undefined) || 'User';
                    this.user = {id, user_id, name, email, phone, vat_number, address, store_name, permissions, role: effectiveRole, roles: Array.isArray(roles) ? roles : []};
                    this.user_id = user_id; // Set user_id in the store

                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(this.user));
                    localStorage.setItem('user_id', user_id);
                    localStorage.setItem('store_name', store_name);

                    // Update ability before redirect (same as login)
                    if (this.user.permissions && Array.isArray(this.user.permissions) && this.user.permissions.length > 0) {
                        const rules = this.user.permissions.map((perm) => {
                            const permissionName = typeof perm === 'string' ? perm : (perm?.name ?? perm);
                            if (!permissionName || !String(permissionName).includes(':')) return null;
                            const [subject, action] = String(permissionName).split(':');
                            return { action: action.toLowerCase(), subject };
                        }).filter(rule => rule !== null);
                        this.ability.update(rules);
                    } else {
                        this.ability.update([]);
                    }

                    // Store trial status and subscription info (same as login method)
                    const trialStatus = result.data?.trial_status;
                    const currentSubscription = result.data?.current_subscription;

                    if (trialStatus) {
                        localStorage.setItem('trial_status', JSON.stringify(trialStatus));
                    }
                    if (currentSubscription) {
                        localStorage.setItem('current_subscription', JSON.stringify(currentSubscription));
                        // Set subscription_status for guard
                        const subscriptionStatus = {
                            active: currentSubscription.status === 'active',
                            expired: currentSubscription.status === 'expired',
                            trial_expired: trialStatus?.trial_expired || false,
                            has_active_subscription: currentSubscription.status === 'active' || currentSubscription.status === 'trial'
                        };
                        localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
                    } else {
                        // No active subscription
                        const subscriptionStatus = {
                            active: false,
                            expired: true,
                            trial_expired: trialStatus?.trial_expired || false,
                            has_active_subscription: false
                        };
                        localStorage.setItem('subscription_status', JSON.stringify(subscriptionStatus));
                    }

                    this.VAT = await this.fetchVat(user_id);
                    await this.syncCurrencySetting(user_id);
                    router.push('/admin');
                    return result;
                }
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
        async resendRegistrationOtp(email) {
            try {
                const response = await authService.resendRegistrationOtp(email);
                return handleResponse(response);
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
        async forgotPassword(email) {
            try {
                const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + '/auth/forget-password', {email});

                return handleResponse(response);
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
        async verifyOtp(payload) {
            try {
                const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + '/auth/forget-password-verify', payload);
                return handleResponse(response);
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
        async resetPassword(payload) {
            try {
                // const response = await apiService.auth.resetPassword(payload);
                const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + `/auth/change-password?expires=${payload.expires}&signature=${payload.signature}`, payload);
                return handleResponse(response);
            } catch (error) {
                this.errors = error || {};
                throw this.errors;
            }
        },
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
        async logout() {
            // try {
            //     // const response = await apiService.auth.resetPassword(payload);
            //     const response = await httpClient.post(import.meta.env.VITE_PUBLIC_AUTH_API_URL + `/auth/logout`);
            //     return handleResponse(response);
            // } catch (error) {
            //     this.errors = error || {};
            //     throw this.errors;
            // }
            this.token = null;
            this.user = null;
            this.user_id = null;
            this.VAT = 15; // Reset VAT
            this.store_name = null;
            localStorage.clear();
            this.ability.update([]); // Clear abilities


        },
        /**
         * Apply an impersonation token: backs up current context, swaps token, fetches profile and updates ability.
         * Expects backend to return a valid token for the impersonated user.
         * @param {string} impersonationToken
         */
        async applyImpersonationToken(impersonationToken, opts = {}) {
            if (!impersonationToken) return;
            // Backup current context to sessionStorage to persist through reloads during impersonation
            const backup = {
                token: this.token,
                user: this.user,
            };
            sessionStorage.setItem('impersonatorContext', JSON.stringify(backup));

            // Swap token
            this.token = impersonationToken;
            localStorage.setItem('token', impersonationToken);

            // If caller provided impersonated user snapshot, use it directly
            if (opts && (opts.user || opts.userId)) {
                try {
                    const decodeScopesFromToken = (token) => {
                        try {
                            const payload = JSON.parse(atob((token || '').split('.')[1] || ''));
                            const scopes = Array.isArray(payload?.scopes) ? payload.scopes : [];
                            return scopes;
                        } catch (e) {
                            return [];
                        }
                    };
                    const toPermissionObjects = (arr) => {
                        return (arr || []).map((p) => {
                            const name = p?.name || p;
                            return { name };
                        });
                    };
                    const provided = opts.user || {};
                    const {
                        id,
                        user_id,
                        name,
                        email,
                        phone,
                        permissions = [],
                        vat_number,
                        address,
                        store_name
                    } = provided || {};

                    // Normalize permissions: prefer provided, else fall back to token scopes
                    let effectivePermissions = Array.isArray(permissions) ? permissions : [];
                    if (!effectivePermissions || effectivePermissions.length === 0) {
                        const scopes = decodeScopesFromToken(impersonationToken);
                        effectivePermissions = toPermissionObjects(scopes);
                    } else {
                        // Ensure objects with name field for persistence compatibility
                        effectivePermissions = toPermissionObjects(effectivePermissions);
                    }

                    this.user = {
                        id,
                        user_id: user_id || opts.userId || null,
                        name,
                        email,
                        phone,
                        permissions: effectivePermissions,
                        vat_number,
                        address,
                        store_name
                    };
                    this.user_id = this.user.user_id || null;
                    localStorage.setItem('user', JSON.stringify(this.user || {}));
                    if (this.user_id) localStorage.setItem('user_id', this.user_id);

                    if (Array.isArray(effectivePermissions) && effectivePermissions.length > 0) {
                        const rules = effectivePermissions.map((perm) => {
                            // Handle both object format {name: "product:List"} and string format "product:List"
                            const permissionName = typeof perm === 'string' ? perm : (perm.name || perm);
                            if (!permissionName || !permissionName.includes(':')) {
                                console.warn('Invalid permission format:', perm);
                                return null;
                            }
                            const [subject, action] = permissionName.split(':');
                            return { action: (action || '').toLowerCase(), subject };
                        }).filter(rule => rule !== null); // Filter out invalid permissions
                        this.ability.update(rules);
                    } else {
                        this.ability.update([]);
                    }
                    this.impersonationActive = true;
                    return;
                } catch (e) {
                    // fall through to profile fetch if provided snapshot fails
                }
            }

            // Fetch impersonated profile with the new token (requires userId on this API)
            try {
                const profileResponse = await authService.getUserProfile(opts?.userId);
                const profileResult = handleResponse(profileResponse);
                if (profileResult.success) {
                    const data = profileResult.data?.data || profileResult.data;
                    const {
                        id,
                        user_id,
                        name,
                        email,
                        phone,
                        permissions = [],
                        vat_number,
                        address,
                        store_name
                    } = data || {};

                    const decodeScopesFromToken = (token) => {
                        try {
                            const payload = JSON.parse(atob((token || '').split('.')[1] || ''));
                            const scopes = Array.isArray(payload?.scopes) ? payload.scopes : [];
                            return scopes;
                        } catch (e) {
                            return [];
                        }
                    };
                    const toPermissionObjects = (arr) => {
                        return (arr || []).map((p) => {
                            const name = p?.name || p;
                            return { name };
                        });
                    };
                    let effectivePermissions = Array.isArray(permissions) ? permissions : [];
                    if (!effectivePermissions || effectivePermissions.length === 0) {
                        const scopes = decodeScopesFromToken(impersonationToken);
                        effectivePermissions = toPermissionObjects(scopes);
                    } else {
                        effectivePermissions = toPermissionObjects(effectivePermissions);
                    }

                    this.user = { id, user_id, name, email, phone, vat_number, address, store_name, permissions: effectivePermissions };
                    this.user_id = user_id || null;
                    localStorage.setItem('user', JSON.stringify(this.user || {}));
                    if (this.user_id) localStorage.setItem('user_id', this.user_id);

                    if (Array.isArray(effectivePermissions) && effectivePermissions.length > 0) {
                        const rules = effectivePermissions.map((perm) => {
                            // Handle both object format {name: "product:List"} and string format "product:List"
                            const permissionName = typeof perm === 'string' ? perm : (perm.name || perm);
                            if (!permissionName || !permissionName.includes(':')) {
                                console.warn('Invalid permission format:', perm);
                                return null;
                            }
                            const [subject, action] = permissionName.split(':');
                            return { action: (action || '').toLowerCase(), subject };
                        }).filter(rule => rule !== null); // Filter out invalid permissions
                        this.ability.update(rules);
                    } else {
                        this.ability.update([]);
                    }
                    this.impersonationActive = true;
                }
            } catch (e) {
                // On error, revert the token immediately
                const ctx = sessionStorage.getItem('impersonatorContext');
                if (ctx) {
                    const parsed = JSON.parse(ctx);
                    this.token = parsed.token || null;
                    this.user = parsed.user || null;
                    localStorage.setItem('token', this.token || '');
                    localStorage.setItem('user', JSON.stringify(this.user || {}));
                }
                this.impersonationActive = false;
                throw e;
            }
        },
        /**
         * Revert to original super admin context after impersonation.
         */
        endImpersonation() {
            const ctx = sessionStorage.getItem('impersonatorContext');
            if (ctx) {
                const parsed = JSON.parse(ctx);
                this.token = parsed.token || null;
                this.user = parsed.user || null;
                this.user_id = (parsed.user && parsed.user.user_id) ? parsed.user.user_id : null;
                localStorage.setItem('token', this.token || '');
                localStorage.setItem('user', JSON.stringify(this.user || {}));
                if (this.user_id) {
                    localStorage.setItem('user_id', this.user_id);
                } else {
                    localStorage.removeItem('user_id');
                }
                // Rebuild abilities from original user's permissions if available
                const origPerms = (this.user && Array.isArray(this.user.permissions)) ? this.user.permissions : [];
                const rules = origPerms.map((perm) => {
                    const [subject, action] = (perm.name || perm).split(':');
                    return { action: (action || '').toLowerCase(), subject };
                });
                this.ability.update(rules);
            } else {
                // No backup found; clear context
                this.token = null;
                this.user = null;
                this.user_id = null;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('user_id');
                this.ability.update([]);
            }
            sessionStorage.removeItem('impersonatorContext');
            this.impersonationActive = false;
        },
    },

    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user || '',
        getUserName: (state) => state.user?.name || '',
        getUserId(state) {return state.user_id || ''},
        getUserVat: (state) => state.VAT || 15,
        getVatValue: (state) => state.VAT / 100,
        getStoreName(state) {return state.store_name || ''},
        isImpersonating: (state) => !!state.impersonationActive || !!sessionStorage.getItem('impersonatorContext'),
    },
});
