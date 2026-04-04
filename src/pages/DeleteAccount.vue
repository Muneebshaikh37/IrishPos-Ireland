<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import {useAuthStore} from "@/stores/auth.js";

const router = useRouter();
const showModal = ref(false);
const isLoading = ref(false);
const authStore = useAuthStore();
import { handleResponse, handleError } from "@/network/api/responseHandler.js";

const handleDeactivateAccount = () => {
  showModal.value = true;
};

const confirmDeactivate = async () => {
  try {
    isLoading.value = true;
    const response =
      await axios.post(`${import.meta.env.VITE_PUBLIC_AUTH_API_URL}/user-toggle/${authStore.getUserId}`,
      {
        status: 0,
        _method: 'PATCH'
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = handleResponse(response);
		if (result.success) {
      // Clear local storage
       authStore.logout();
      router.push('/login');
    }
  } catch (error) {
    console.error('Deactivation error:', error);

  } finally {
    isLoading.value = false;
    showModal.value = false;
  }
};

const cancelDeactivate = () => {
  showModal.value = false;
};
</script>

<template>
  <div class="deactivate-account-container">
    <div class="deactivate-account-content">
      <div class="header">
        <span class="warning-icon">⚠️</span>
        <h1>Deactivate Your Account</h1>
      </div>

      <ul class="consequences-list">
        <li>You will be logged out immediately</li>
        <li>Your account access will be disabled</li>
        <li>You won't be able to use the POS system with this login</li>
      </ul>

      <p class="support-note">
        Note: You can contact our support team if you wish to reactivate your account in the future.
      </p>

      <button
        @click="handleDeactivateAccount"
        class="deactivate-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Processing...' : 'Deactivate My Account' }}
      </button>

      <p class="reversible-note">
        This action is reversible. Reach out to support to reactivate.
      </p>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Confirm Account Deactivation</h2>
        <p>Are you sure you want to deactivate your account?</p>
        <div class="modal-buttons">
          <button
            @click="cancelDeactivate"
            class="cancel-button"
            :disabled="isLoading"
          >
            Cancel
          </button>
          <button
            @click="confirmDeactivate"
            class="confirm-deactivate-button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Processing...' : 'Yes, Deactivate My Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deactivate-account-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
}

.deactivate-account-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.warning-icon {
  font-size: 1.5rem;
}

h1 {
  color: #f4811e;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.consequences-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.consequences-list li {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  position: relative;
}

.consequences-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #666;
}

.support-note {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.deactivate-button {
  background-color: #f4811e;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s;
  margin-bottom: 1rem;
}

.deactivate-button:hover:not(:disabled) {
  background-color: #e67616;
}

.deactivate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.reversible-note {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.confirm-deactivate-button {
  background-color: #f4811e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.confirm-deactivate-button:hover:not(:disabled) {
  background-color: #e67616;
}

.confirm-deactivate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
