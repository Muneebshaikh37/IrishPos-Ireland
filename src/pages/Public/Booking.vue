<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import publicBookingApi from '@/network/modules/publicBooking';

// ─── State ────────────────────────────────────────────────────────────────────
const step = ref(1); // 1=Shop  2=Service  3=DateTime  4=Details  5=Confirmed

// Step 1 — Shop
const shops = ref([]);
const shopSearch = ref('');
const selectedShop = ref(null);
const shopsLoading = ref(false);

// Step 2 — Service
const services = ref([]);
const selectedService = ref(null);
const servicesLoading = ref(false);

// Step 3 — Date & Time
const selectedDate = ref('');
const selectedTime = ref('');
const slots = ref([]);
const slotsLoading = ref(false);

// Step 4 — Customer details
const form = ref({
  customer_name: '',
  customer_phone: '',
  customer_country_code: '+353',
  notes: '',
});
const submitting = ref(false);
const submitError = ref('');

// Step 5 — Confirmation
const confirmation = ref(null);

// ─── Computed ─────────────────────────────────────────────────────────────────
const today = computed(() => new Date().toISOString().split('T')[0]);

const filteredShops = computed(() => {
  if (!shopSearch.value.trim()) return shops.value;
  const q = shopSearch.value.toLowerCase();
  return shops.value.filter(
    (s) => s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
  );
});

const stepLabels = ['Shop', 'Service', 'Date & Time', 'Your Details'];

// ─── Data fetchers ────────────────────────────────────────────────────────────
async function fetchShops() {
  shopsLoading.value = true;
  try {
    const res = await publicBookingApi.getShops();
    shops.value = res.data?.data ?? [];
  } catch {
    shops.value = [];
  } finally {
    shopsLoading.value = false;
  }
}

async function fetchServices(shopId) {
  servicesLoading.value = true;
  services.value = [];
  selectedService.value = null;
  try {
    const res = await publicBookingApi.getServices(shopId);
    services.value = res.data?.data ?? [];
  } catch {
    services.value = [];
  } finally {
    servicesLoading.value = false;
  }
}

async function fetchSlots() {
  if (!selectedShop.value || !selectedDate.value) return;
  slotsLoading.value = true;
  slots.value = [];
  selectedTime.value = '';
  try {
    const res = await publicBookingApi.getSlots(
      selectedShop.value.id,
      selectedDate.value,
      selectedService.value?.id ?? null
    );
    slots.value = res.data?.data ?? [];
  } catch {
    slots.value = [];
  } finally {
    slotsLoading.value = false;
  }
}

// Re-fetch slots whenever date changes
watch(selectedDate, () => { if (step.value === 3) fetchSlots(); });

// ─── Navigation ───────────────────────────────────────────────────────────────
function selectShop(shop) {
  selectedShop.value = shop;
  fetchServices(shop.id);
  step.value = 2;
}

function selectService(service) {
  selectedService.value = service;
  step.value = 3;
  if (selectedDate.value) fetchSlots();
}

function goToStep(n) {
  // Only allow going back
  if (n < step.value) step.value = n;
}

function goBack() {
  if (step.value > 1) step.value--;
}

function proceedToDetails() {
  if (!selectedDate.value || !selectedTime.value) return;
  step.value = 4;
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submitBooking() {
  submitError.value = '';
  if (!form.value.customer_name.trim() || !form.value.customer_phone.trim()) {
    submitError.value = 'Name and phone number are required.';
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      service_id:             selectedService.value.id,
      scheduled_date:         selectedDate.value,
      scheduled_time:         selectedTime.value,
      customer_name:          form.value.customer_name.trim(),
      customer_phone:         form.value.customer_phone.trim(),
      customer_country_code:  form.value.customer_country_code,
      notes:                  form.value.notes.trim() || null,
    };

    const res = await publicBookingApi.createBooking(selectedShop.value.id, payload);
    confirmation.value = res.data?.data ?? null;
    step.value = 5;
  } catch (err) {
    const msg = err?.response?.data?.message;
    const errors = err?.response?.data?.errors;
    if (errors) {
      submitError.value = Object.values(errors).flat().join(' ');
    } else {
      submitError.value = msg || 'Something went wrong. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
}

function bookAnother() {
  step.value = 1;
  selectedShop.value = null;
  selectedService.value = null;
  selectedDate.value = '';
  selectedTime.value = '';
  slots.value = [];
  form.value = { customer_name: '', customer_phone: '', customer_country_code: '+353', notes: '' };
  confirmation.value = null;
  submitError.value = '';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatPrice(p) {
  if (p == null) return '';
  return '€' + parseFloat(p).toFixed(2);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => fetchShops());
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col">

    <!-- Header bar -->
    <header class="bg-white shadow-sm py-4 px-6 flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900 leading-none">Book an Appointment</h1>
        <p class="text-xs text-gray-500 mt-0.5">Find a shop and schedule your service</p>
      </div>
    </header>

    <!-- Progress steps (steps 1-4 only; step 5 = success) -->
    <div v-if="step < 5" class="bg-white border-b px-6 py-3">
      <div class="max-w-2xl mx-auto flex items-center gap-0">
        <template v-for="(label, idx) in stepLabels" :key="idx">
          <button
            class="flex items-center gap-1.5 text-xs font-medium transition-colors"
            :class="step === idx + 1 ? 'text-emerald-700' : step > idx + 1 ? 'text-emerald-500 cursor-pointer' : 'text-gray-400 cursor-default'"
            @click="goToStep(idx + 1)"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              :class="step > idx + 1
                ? 'bg-emerald-500 text-white'
                : step === idx + 1
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-200 text-gray-500'"
            >
              <template v-if="step > idx + 1">✓</template>
              <template v-else>{{ idx + 1 }}</template>
            </span>
            <span class="hidden sm:inline">{{ label }}</span>
          </button>
          <div v-if="idx < stepLabels.length - 1" class="flex-1 h-px bg-gray-200 mx-2 min-w-[12px]" />
        </template>
      </div>
    </div>

    <!-- Main content -->
    <main class="flex-1 px-4 py-8">
      <div class="max-w-2xl mx-auto">

        <!-- ── STEP 1: Select Shop ── -->
        <div v-if="step === 1">
          <h2 class="text-xl font-bold text-gray-900 mb-1">Choose a Shop</h2>
          <p class="text-sm text-gray-500 mb-5">Select the shop you'd like to visit</p>

          <!-- Search -->
          <div class="relative mb-4">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input
              v-model="shopSearch"
              type="text"
              placeholder="Search by name or address…"
              class="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Loading skeleton -->
          <div v-if="shopsLoading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div class="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>

          <!-- No results -->
          <div v-else-if="filteredShops.length === 0" class="text-center py-16 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <p class="font-medium">No shops found</p>
          </div>

          <!-- Shop cards -->
          <div v-else class="space-y-3">
            <button
              v-for="shop in filteredShops"
              :key="shop.id"
              class="w-full bg-white rounded-xl p-4 border-2 border-transparent hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-start gap-3 group"
              @click="selectShop(shop)"
            >
              <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-200 transition-colors">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 truncate">{{ shop.name }}</p>
                <p v-if="shop.address" class="text-xs text-gray-500 mt-0.5 truncate">📍 {{ shop.address }}</p>
                <p v-if="shop.phone" class="text-xs text-gray-500 mt-0.5">📞 {{ shop.phone }}</p>
              </div>
              <svg class="w-5 h-5 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 mt-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ── STEP 2: Select Service ── -->
        <div v-if="step === 2">
          <div class="flex items-center gap-2 mb-5">
            <button @click="goBack" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-gray-900 leading-none">Select a Service</h2>
              <p class="text-sm text-gray-500 mt-0.5">at <span class="font-medium text-emerald-700">{{ selectedShop?.name }}</span></p>
            </div>
          </div>

          <div v-if="servicesLoading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div class="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          </div>

          <div v-else-if="services.length === 0" class="text-center py-16 text-gray-400">
            <p class="font-medium">No services available for this shop</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              v-for="service in services"
              :key="service.id"
              class="bg-white rounded-xl p-4 border-2 border-transparent hover:border-emerald-500 hover:shadow-md transition-all text-left group"
              @click="selectService(service)"
            >
              <div class="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <p class="font-semibold text-gray-900">{{ service.name }}</p>
              <p v-if="service.price" class="text-sm font-bold text-emerald-600 mt-1">{{ formatPrice(service.price) }}</p>
            </button>
          </div>
        </div>

        <!-- ── STEP 3: Date & Time ── -->
        <div v-if="step === 3">
          <div class="flex items-center gap-2 mb-5">
            <button @click="goBack" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-gray-900 leading-none">Pick a Date & Time</h2>
              <p class="text-sm text-gray-500 mt-0.5">
                <span class="font-medium text-teal-700">{{ selectedService?.name }}</span>
                <span v-if="selectedService?.price"> · {{ formatPrice(selectedService.price) }}</span>
              </p>
            </div>
          </div>

          <!-- Date picker -->
          <div class="bg-white rounded-xl p-4 mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Choose a Date</label>
            <input
              v-model="selectedDate"
              type="date"
              :min="today"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Time slots -->
          <div v-if="selectedDate" class="bg-white rounded-xl p-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Available Times</label>

            <div v-if="slotsLoading" class="flex flex-wrap gap-2">
              <div v-for="i in 10" :key="i" class="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>

            <div v-else-if="slots.length === 0" class="text-sm text-gray-400 py-4 text-center">
              No available slots for this date. Please try another day.
            </div>

            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="slot in slots"
                :key="slot"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                  selectedTime === slot
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
                ]"
                @click="selectedTime = slot"
              >
                {{ formatTime(slot) }}
              </button>
            </div>
          </div>

          <button
            class="mt-5 w-full py-3 rounded-xl font-semibold text-white transition-colors"
            :class="selectedDate && selectedTime ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-300 cursor-not-allowed'"
            :disabled="!selectedDate || !selectedTime"
            @click="proceedToDetails"
          >
            Continue →
          </button>
        </div>

        <!-- ── STEP 4: Customer Details ── -->
        <div v-if="step === 4">
          <div class="flex items-center gap-2 mb-5">
            <button @click="goBack" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-gray-900 leading-none">Your Details</h2>
              <p class="text-sm text-gray-500 mt-0.5">Almost there! Just a few details.</p>
            </div>
          </div>

          <!-- Booking summary banner -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 text-sm">
            <div class="grid grid-cols-2 gap-2 text-gray-700">
              <div><span class="text-xs text-gray-400 block">Shop</span>{{ selectedShop?.name }}</div>
              <div><span class="text-xs text-gray-400 block">Service</span>{{ selectedService?.name }}</div>
              <div><span class="text-xs text-gray-400 block">Date</span>{{ formatDate(selectedDate) }}</div>
              <div><span class="text-xs text-gray-400 block">Time</span>{{ formatTime(selectedTime) }}</div>
            </div>
          </div>

          <!-- Form -->
          <div class="bg-white rounded-xl p-5 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
              <input
                v-model="form.customer_name"
                type="text"
                placeholder="e.g. John Murphy"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Phone Number <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <select
                  v-model="form.customer_country_code"
                  class="border border-gray-300 rounded-lg px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="+353">🇮🇪 +353</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+49">🇩🇪 +49</option>
                </select>
                <input
                  v-model="form.customer_phone"
                  type="tel"
                  placeholder="087 123 4567"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Notes <span class="text-xs text-gray-400 font-normal">(optional)</span></label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Any special requests or additional information…"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <p v-if="submitError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {{ submitError }}
            </p>

            <button
              class="w-full py-3 rounded-xl font-semibold text-white transition-colors flex items-center justify-center gap-2"
              :class="submitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'"
              :disabled="submitting"
              @click="submitBooking"
            >
              <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ submitting ? 'Confirming…' : 'Confirm Booking' }}
            </button>
          </div>
        </div>

        <!-- ── STEP 5: Confirmation ── -->
        <div v-if="step === 5" class="text-center py-8">
          <!-- Success icon -->
          <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
          <p class="text-gray-500 mb-6">We'll see you soon. Here's your booking summary.</p>

          <!-- Reference badge -->
          <div class="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full font-mono font-bold text-sm mb-6">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ confirmation?.booking_reference }}
          </div>

          <!-- Summary card -->
          <div class="bg-white rounded-2xl p-5 text-left shadow-sm max-w-sm mx-auto mb-6">
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Shop</span>
                <span class="font-semibold text-gray-900">{{ confirmation?.shop?.name }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between">
                <span class="text-gray-500">Service</span>
                <span class="font-semibold text-gray-900">{{ confirmation?.service?.name }}</span>
              </div>
              <div v-if="confirmation?.service?.price" class="flex justify-between">
                <span class="text-gray-500">Price</span>
                <span class="font-bold text-emerald-600">{{ formatPrice(confirmation.service.price) }}</span>
              </div>
              <div class="border-t pt-3 flex justify-between">
                <span class="text-gray-500">Date</span>
                <span class="font-semibold text-gray-900">{{ formatDate(confirmation?.scheduled_date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Time</span>
                <span class="font-semibold text-gray-900">{{ formatTime(confirmation?.scheduled_time) }}</span>
              </div>
              <div v-if="confirmation?.shop?.address" class="border-t pt-3 flex justify-between">
                <span class="text-gray-500">Address</span>
                <span class="font-medium text-gray-700 text-right max-w-[60%]">{{ confirmation.shop.address }}</span>
              </div>
              <div v-if="confirmation?.notes" class="border-t pt-3 flex justify-between">
                <span class="text-gray-500">Notes</span>
                <span class="font-medium text-gray-700 text-right max-w-[60%]">{{ confirmation.notes }}</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-400 mb-6">
            Save your reference number <strong>{{ confirmation?.booking_reference }}</strong> for your records.
          </p>

          <button
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            @click="bookAnother"
          >
            Book Another Appointment
          </button>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-4 text-xs text-gray-400">
      Powered by IrishPayments POS
    </footer>
  </div>
</template>
