<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Litepicker from "@/components/Base/Litepicker";
import { ref, reactive, computed, onMounted } from "vue";
import { handleResponse } from "@/network/api/responseHandler.js";
import router from "@/router";
import { useRoute } from "vue-router";
// import TomSelect from "../../../components/Base/TomSelect";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import toast from "@/stores/utility/toast";
import pan from "@/stores/pan";
import ErrorHandler from "@/utils/validation";
import { useAuthStore } from "@/stores/auth.js";
import TomSelect from "@/components/Base/TomSelect"; 
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId; 

const form = reactive(new ErrorHandler());
const isloading = ref(false);

const route = useRoute();
const entryId = route.params.id || route.params.uuid;

const { t } = useI18n();

// Basic Info
const createFormData = ref({
  entry_date: new Date().toISOString().slice(0, 10),
  contactable_id: '',
  contactable_type: '', //supplier or customer
  notes: '',
  amount: '',
  lines: [
    { account_id: '', debit: '0', credit: '0', description: '' },
    { account_id: '', debit: '0', credit: '0', description: '' },
  ],
});

// Account dropdown
const accountOptions = ref([]); 

const addLine = () => {
    createFormData.value.lines.push({ account_id: '', debit: 0, credit: 0, description: '' });
};
const removeLine = (idx) => {
  if (createFormData.value.lines.length > 2) createFormData.value.lines.splice(idx, 1);
};

const totalDebit = computed(() => createFormData.value.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0));
const totalCredit = computed(() => createFormData.value.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0));

const fetchEntry = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/journal-entries/${entryId}?user_id=${USER_ID}`);
    const entry = response.data.data;
    
    // Update form data with existing entry
    createFormData.value = {
      entry_date: entry.entry_date,
      contactable_id: entry.contactable_id || '',
      contactable_type: entry.contactable_type || '',
      notes: entry.notes || '',
      amount: entry.amount || '',
      lines: entry.lines.map(line => ({
        account_id: String(line.account_id),
        debit: line.debit || '0',
        credit: line.credit || '0',
        description: line.description || '',
        id: line.id || ''
      }))
    };
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    toast().fry(pan.error('Failed to fetch journal entry'));
  } finally {
    isloading.value = false;
  }
};

const submitUpdate = async () => {
  try {
    isloading.value = true;
    const payload = {
      ...createFormData.value,
      amount: totalDebit.value, // or totalCredit.value, both are same here
      user_id: USER_ID,
    };
    const response = await httpClient.put(
      `${import.meta.env.VITE_ACCOUNTING_API}/journal-entries/${entryId}?user_id=${USER_ID}`,
      payload
    );
    
    router.push("/account/journal-entries");
    toast().fry(pan.success('Journal entry updated successfully'));
  } catch (error) {
    console.error('Error updating journal entry:', error);
    form.setErrors(error.response.data.errors);
    toast().fry(pan.error('Failed to update journal entry'));
  } finally {
    isloading.value = false;
  }
};

const fetchAccounts = async () => {
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/dropdown?user_id=${USER_ID}`);
    if (response.data) {
      accountOptions.value = response.data.data.map(account => ({
        value: String(account.id),
        label: account.name,
        disabled: account.disabled
      }));
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    toast().fry(pan.error('Failed to fetch accounts'));
  } finally {
    isloading.value = false;
  }
};

const supplierList = ref(); 
const customerList = ref();

const fetchSupplier = async() =>{
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/supplier-list?user_id=${USER_ID}&is_active=true`);
    const result = handleResponse(response);

    if (result.success) {
      isloading.value = false;
      supplierList.value = result.data.data;
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.supplier.error(error.message));
    isloading.value = false;
  }
}
const fetchCustomer = async() =>{
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_CRM}/customers?user_id=${USER_ID}&status=true`);
    const result = handleResponse(response);
   
    
      isloading.value = false;
      customerList.value = result.data[0].data;
    
  } catch (error) {
    handleError(error);
    toast().fry(pan.supplier.error(error.message));
    isloading.value = false;
  }
}
onMounted(() => { 
  fetchSupplier();
  fetchCustomer();
  fetchAccounts();
  fetchEntry();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/account/journal-entries">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('account.EditJournalEntry') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <!-- Basic Info -->
        <div class="grid grid-cols-12 gap-6 mb-6">
          <div class="col-span-12 md:col-span-4">
            <FormLabel>{{ $t('account.date') }}  </FormLabel>
            <div class="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500" :class="{ 'mr-2': locale === 'ar', '': locale !== 'ar' }">
                <Lucide icon="Calendar" class="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3" />
            <Litepicker v-model="createFormData.entry_date" :options="{ autoApply: true, singleMode: true, format: 'YYYY-MM-DD' }" class="w-full pl-10" />
            </div>
          </div>
          <div class="col-span-12 md:col-span-8">
            <FormLabel>{{ $t('account.notes') }}</FormLabel>
            <FormTextarea v-model="createFormData.notes" :placeholder="$t('account.notesPlaceholder')" rows="1" maxlength="255" />
          </div>
          <div class="col-span-4">
            <FormLabel>{{ $t('account.supplier') }}  </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="createFormData.contactable_id" :options="{
                            placeholder: $t('account.searchSupplier'),
                        }" disabled class="w-full" :class="{'border-red-500': form.invalid('supplier_id')}" @change="createFormData.contactable_type = 'supplier'">
                <option></option>
                <template v-for="list in supplierList">
                  <option :value="list.id">{{ list.supplier_name }}</option>
                </template>
              </TomSelect>
            </div>
            <template v-if="form.invalid('supplier_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_id') }}</div>
            </template>
          </div>
          <div class="col-span-4">
            <FormLabel>{{ $t('account.customer') }}  </FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="createFormData.contactable_id" disabled :options="{
                            placeholder: $t('account.searchCustomer'),
                        }" class="w-full" :class="{'border-red-500': form.invalid('customer_id')}" @change="createFormData.contactable_type = 'customer'">
                <option></option>
                <template v-for="list in customerList">
                  <option :value="list.id">{{ list.name }}</option>
                </template>
              </TomSelect>
            </div>
            <template v-if="form.invalid('customer_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('customer_id') }}</div>
            </template>
          </div>
        </div>
        <!-- Journal Lines -->
        <div>
          <FormLabel>{{ $t('account.journalEntries') }}</FormLabel>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2">{{ $t('account.account') }}</th>
                  <th class="p-2">{{ $t('account.debit') }}</th>
                  <th class="p-2">{{ $t('account.credit') }}</th>
                  <th class="p-2">{{ $t('account.description') }}</th>
                  <th class="p-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, idx) in createFormData.lines" :key="idx">
                  <td class="p-2 min-w-[200px]">
                   
                    <TomSelect disabled v-model="line.account_id" :options="{ placeholder: $t('account.selectAccount') }" class="w-full min-w-[200px]">
                      <template v-for="option in accountOptions" :key="option.value">
                        <option :value="option.value" :disabled="option.disabled">{{ option.label }}</option>
                      </template>
                    </TomSelect>
                  </td>
                  <td class="p-2 min-w-[120px]">
                    <FormInput v-model="line.debit" disabled type="number" min="0" step="0.01" :placeholder="$t('account.amountPlaceholder')" />
                  </td>
                  <td class="p-2 min-w-[120px]">
                    <FormInput v-model="line.credit" disabled type="number" min="0" step="0.01" :placeholder="$t('account.amountPlaceholder')" />
                  </td>
                  <td class="p-2 min-w-[220px]">
                    <FormInput v-model="line.description" type="text" :placeholder="$t('account.descriptionPlaceholder')" />
                  </td>
                  <!-- <td class="p-2">
                    <Button v-if="createFormData.lines.length > 2" variant="danger" size="sm" @click="removeLine(idx)">
                      <Lucide icon="Trash2" class="w-4 h-4" />
                    </Button>
                    <Button v-else variant="secondary" size="sm" disabled>
                      <Lucide icon="Trash2" class="w-4 h-4" />
                    </Button>
                  </td> -->
                </tr>
                <!-- <tr>
                  <td colspan="5" class="text-right p-2">
                    <Button variant="primary" size="sm" @click="addLine">
                      <Lucide icon="Plus" class="w-4 h-4" /> {{ $t('account.add') }}
                    </Button>
                  </td>
                </tr> -->
              </tbody>
              <tfoot>
                <tr class="bg-gray-100 font-semibold">
                  <td class="p-2 text-right">{{ $t('account.total') }}</td>
                  <td class="p-2">{{ totalDebit.toFixed(2) }}</td>
                  <td class="p-2">{{ totalCredit.toFixed(2) }}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="mt-6">
          <Button variant="primary" class="mr-2 shadow-md" @click="submitUpdate" :disabled="isloading">
            <template v-if="isloading">
              {{ $t('account.updating') }}
            </template>
            <template v-else>
              {{ $t('account.Update') }}
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isloading" class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'" :loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>
