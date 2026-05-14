<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{ $t('bookings.title') }}</h2>

  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8">
    <!-- Toolbar -->
    <div class="col-span-12 flex flex-wrap items-center gap-3 intro-y">
      <div class="relative w-64 text-slate-500">
        <FormInput
          v-model="search"
          type="text"
          class="w-64 pr-10 !box"
          :placeholder="$t('bookings.searchPlaceholder')"
          @input="onSearchInput"
        />
        <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
      </div>

      <div class="flex items-center gap-2">
        <FormInput
          v-model="dateFilter"
          type="date"
          class="!box"
          @change="fetchBookings(true)"
        />
        <Button
          v-if="dateFilter"
          variant="outline-secondary"
          size="sm"
          @click="clearDate"
        >
          {{ $t('bookings.clearFilter') }}
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="col-span-12 overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg">
        <thead class="bg-gray-100">
          <tr class="border-b">
            <th class="px-3 py-3 font-medium">{{ $t('bookings.reference') }}</th>
            <th class="px-3 py-3 font-medium">{{ $t('bookings.date') }}</th>
            <th class="px-3 py-3 font-medium">{{ $t('bookings.time') }}</th>
            <th class="px-3 py-3 font-medium">{{ $t('bookings.customer') }}</th>
            <th class="px-3 py-3 font-medium">{{ $t('bookings.phone') }}</th>
            <th class="px-3 py-3 font-medium">{{ $t('bookings.service') }}</th>
            <th class="px-3 py-3 font-medium text-right">{{ $t('bookings.price') }}</th>
            <th class="px-3 py-3 font-medium text-right">{{ $t('bookings.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="py-10 text-center text-gray-400">
              <LoadingIcon icon="three-dots" class="w-8 h-8 inline-block" />
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="8" class="py-10 text-center text-gray-400">
              {{ $t('bookings.noBookings') }}
            </td>
          </tr>
          <tr
            v-for="b in rows"
            :key="b.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-3 py-3 font-mono text-xs text-gray-500">{{ b.booking_reference }}</td>
            <td class="px-3 py-3">{{ b.scheduled_date }}</td>
            <td class="px-3 py-3">{{ b.scheduled_time }}</td>
            <td class="px-3 py-3">{{ b.customer_name }}</td>
            <td class="px-3 py-3 text-gray-500">{{ b.customer_phone }}</td>
            <td class="px-3 py-3">{{ b.service?.name ?? '—' }}</td>
            <td class="px-3 py-3 text-right">
              {{ b.service?.sale_price ? Number(b.service.sale_price).toFixed(2) : '—' }}
            </td>
            <td class="px-3 py-3">
              <div class="flex justify-end gap-2">
                <button
                  class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-medium"
                  :title="$t('bookings.convertToInvoice')"
                  @click="convertToInvoice(b)"
                >
                  <Lucide icon="ReceiptText" class="w-4 h-4 inline-block -mt-0.5 mr-1" />
                  {{ $t('bookings.convertToInvoice') }}
                </button>
                <button
                  v-if="ability.can('update', 'booking')"
                  class="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md"
                  :title="$t('bookings.edit')"
                  @click="openEdit(b)"
                >
                  <Lucide icon="Pencil" class="w-4 h-4" />
                </button>
                <button
                  v-if="ability.can('delete', 'booking')"
                  class="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md"
                  :title="$t('bookings.delete')"
                  @click="openDelete(b)"
                >
                  <Lucide icon="Trash2" class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="flex justify-end items-center gap-2 mt-4">
        <Button variant="outline-secondary" size="sm" :disabled="page <= 1" @click="goToPage(page - 1)">
          ‹
        </Button>
        <span class="text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
        <Button variant="outline-secondary" size="sm" :disabled="page >= totalPages" @click="goToPage(page + 1)">
          ›
        </Button>
      </div>
    </div>
  </div>

  <!-- Edit Dialog -->
  <Dialog :open="editOpen" @close="closeEdit">
    <Dialog.Panel>
      <div class="p-5">
        <h3 class="text-lg font-medium">{{ $t('bookings.editBooking') }}</h3>
        <div class="mt-6 grid grid-cols-2 gap-4">
          <div>
            <FormLabel>{{ $t('bookings.date') }}</FormLabel>
            <FormInput v-model="editForm.scheduled_date" type="date" />
          </div>
          <div>
            <FormLabel>{{ $t('bookings.time') }}</FormLabel>
            <FormInput v-model="editForm.scheduled_time" type="time" />
          </div>
          <div class="col-span-2">
            <FormLabel>{{ $t('bookings.customer') }}</FormLabel>
            <FormInput v-model="editForm.customer_name" type="text" />
          </div>
          <div class="col-span-2">
            <FormLabel>{{ $t('bookings.notes') }}</FormLabel>
            <FormInput v-model="editForm.notes" type="text" />
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-2">
          <Button variant="outline-secondary" @click="closeEdit" :disabled="saving">
            {{ $t('bookings.cancel') }}
          </Button>
          <Button variant="primary" @click="saveEdit" :disabled="saving">
            <LoadingIcon v-if="saving" icon="three-dots" class="w-5 h-5 text-white" />
            <span v-else>{{ $t('bookings.save') }}</span>
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <!-- Delete Confirm -->
  <Dialog :open="deleteOpen" @close="closeDelete">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
        <div class="mt-5 text-lg font-medium">{{ $t('bookings.deleteConfirmTitle') }}</div>
        <div class="mt-2 text-slate-500 text-sm">{{ $t('bookings.deleteConfirmBody') }}</div>
      </div>
      <div class="px-5 pb-6 flex justify-center gap-2">
        <Button variant="outline-secondary" @click="closeDelete" :disabled="deleting">
          {{ $t('bookings.cancel') }}
        </Button>
        <Button variant="danger" @click="confirmDelete" :disabled="deleting">
          <LoadingIcon v-if="deleting" icon="three-dots" class="w-5 h-5 text-white" />
          <span v-else>{{ $t('bookings.delete') }}</span>
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAbility } from "@casl/vue";
import { Dialog } from "@/components/Base/Headless";
import { FormInput, FormLabel } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon";
import bookingsApi from "@/network/modules/bookings.js";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import { useAuthStore } from "@/stores/auth";
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";

const router = useRouter();
const ability = useAbility();
const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const rows = ref([]);
const loading = ref(true);
const search = ref("");
const dateFilter = ref("");
const page = ref(1);
const totalPages = ref(1);
const perPage = 15;

let searchDebounce = null;
function onSearchInput() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => fetchBookings(true), 300);
}

function clearDate() {
  dateFilter.value = "";
  fetchBookings(true);
}

async function fetchBookings(reset = false) {
  if (reset) page.value = 1;
  loading.value = true;
  try {
    const params = {
      limit: perPage,
      page: page.value,
    };
    if (search.value) params.search = search.value;
    if (dateFilter.value) params.date = dateFilter.value;

    const res = await bookingsApi.list(USER_ID, params);
    const result = handleResponse(res);
    rows.value = result.data?.data ?? [];
    totalPages.value = result.data?.meta?.last_page ?? 1;
  } catch (err) {
    handleError(err);
  } finally {
    loading.value = false;
  }
}

function goToPage(p) {
  page.value = p;
  fetchBookings();
}

// ── Edit ───────────────────────────────────────────────────────────────────
const editOpen = ref(false);
const saving = ref(false);
const editing = ref(null);
const editForm = reactive({
  scheduled_date: "",
  scheduled_time: "",
  customer_name: "",
  notes: "",
});

function openEdit(b) {
  editing.value = b;
  editForm.scheduled_date = b.scheduled_date ?? "";
  editForm.scheduled_time = (b.scheduled_time ?? "").slice(0, 5);
  editForm.customer_name = b.customer_name ?? "";
  editForm.notes = b.notes ?? "";
  editOpen.value = true;
}
function closeEdit() {
  editOpen.value = false;
  editing.value = null;
}
async function saveEdit() {
  if (!editing.value) return;
  saving.value = true;
  try {
    const res = await bookingsApi.update(editing.value.id, USER_ID, {
      scheduled_date: editForm.scheduled_date || null,
      scheduled_time: editForm.scheduled_time || null,
      customer_name: editForm.customer_name || null,
      notes: editForm.notes || null,
    });
    const result = handleResponse(res);
    if (result.success) {
      toast().fry(pan.profile.success("bookings.updatedToast"));
      closeEdit();
      fetchBookings();
    }
  } catch (err) {
    handleError(err);
  } finally {
    saving.value = false;
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteOpen = ref(false);
const deleting = ref(false);
const toDelete = ref(null);

function openDelete(b) {
  toDelete.value = b;
  deleteOpen.value = true;
}
function closeDelete() {
  deleteOpen.value = false;
  toDelete.value = null;
}
async function confirmDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await bookingsApi.destroy(toDelete.value.id, USER_ID);
    toast().fry(pan.profile.success("bookings.deletedToast"));
    closeDelete();
    fetchBookings();
  } catch (err) {
    handleError(err);
  } finally {
    deleting.value = false;
  }
}

// ── Convert to Invoice ─────────────────────────────────────────────────────
async function convertToInvoice(b) {
  try {
    const res = await bookingsApi.convertPayload(b.id, USER_ID);
    const payload = handleResponse(res).data?.data ?? {};

    // Seed the same sessionStorage key the Jobs "Check In" flow uses so the
    // Selling page pre-fills service + customer and links to the existing task.
    sessionStorage.setItem(
      "pos_checkin",
      JSON.stringify({
        customer_id:   payload.customer?.id ?? null,
        customer_name: payload.customer?.name ?? "",
        service_id:    payload.service?.id ?? null,
        service_name:  payload.service?.name_en ?? "",
        sale_price:    payload.service?.sale_price ?? 0,
        task_id:       payload.task_id ?? null,
      }),
    );

    // Find the currently open register and go there; otherwise nudge the user
    // to open one (matches the Jobs check-in flow).
    const baseUrl = import.meta.env.VITE_PUBLIC_API_URL_POS;
    const registersRes = await httpClient.get(`${baseUrl}/registers?user_id=${USER_ID}`);
    const registers = registersRes.data?.data ?? [];
    const openRegister = registers.find((r) => r.status === "open");
    if (openRegister?.id) {
      router.push({ name: "RegisterInvoice", params: { registerId: openRegister.id } });
      return;
    }
    toast().fry(pan.profile.error("bookings.noOpenRegisterToast"));
    router.push({ name: "Register" });
  } catch (err) {
    handleError(err);
  }
}

onMounted(() => fetchBookings());
</script>
