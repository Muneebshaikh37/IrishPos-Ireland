<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { RouterLink } from "vue-router";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "../../../components/Base/TomSelect";
import { ref, onMounted, reactive, defineProps, watch, watchEffect } from "vue";
import { Dialog, Menu } from "@/components/Base/Headless";
import httpClient from "@/network/api/httpClient";
import apiService from '../../../network/api/apiService';
import { handleResponse, handleError } from "../../../network/api/responseHandler.js";
import InvoicesComponent from "@/components/PurchaseInvoices/InvoicesComponent.vue";
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import ErrorHandler from "@/utils/validation";
import PurchaseInvoiceSupplier from "../../../components/Models/PurchaseInvoiceSupplier/index.vue";
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const CreateSupplierFields = ref({
  supplier_id: "",
  payment_type: "",
  supplier_invoice_number: "",
  amount_paid: "",
  isloading: false
})

const isloading = ref(false);
const supplierList = ref([]);
const isProductList = ref([]);
const form = reactive(new ErrorHandler());

const fetchSupplier = async() =>{
  try {
    isloading.value = true;
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/supplier-list`, {
      params: {
        user_id: USER_ID,
        is_active: true,
      },
    });
    const result = handleResponse(response);

    if (result.success) {
      const payload = result.data ?? {};
      supplierList.value =
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload) && payload) ||
        (Array.isArray(payload?.suppliers) && payload.suppliers) ||
        [];
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.supplier.error(error.message));
    supplierList.value = [];
  } finally {
    isloading.value = false;
  }
}

const fetchproductinventory = async() =>{
  try {
    const response = await apiService.purchaseInvoice.allList();
    const result = handleResponse(response);

    if (result.success) {
      isProductList.value =
        (Array.isArray(result?.data?.data) && result.data.data) ||
        (Array.isArray(result?.data) && result.data) ||
        [];
      try {
        localStorage.setItem('purchase_products', JSON.stringify(isProductList.value));
      } catch (e) {
        // Ignore localStorage write errors
      }
    }
  } catch (error) {
    handleError(error);
    toast().fry(pan.supplier.error(error.message));
  }
}

onMounted(() => {
  fetchproductinventory();
  fetchSupplier();
});
</script>

<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/purchasing/invoice">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-semibold">{{ $t('purchase-invoices.createInvoice') }}</h2>
  </div>

  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('purchase-invoices.suppliers') }} <span class="text-danger"> *</span></FormLabel>
            <div class="flex items-center flex-row-reverse">
              <TomSelect v-model="CreateSupplierFields.supplier_id" :options="{
                            placeholder: $t('purchase-invoices.searchSupplier'),
                        }" class="w-full" :class="{'border-red-500': form.invalid('supplier_id')}">
                <option></option>
                <template v-for="list in supplierList">
                  <option :value="list.id">{{ list.supplier_name }}</option>
                </template>
              </TomSelect>
              <PurchaseInvoiceSupplier :SupplierFields="CreateSupplierFields" :supplierList="supplierList"/>
            </div>
            <template v-if="form.invalid('supplier_id')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_id') }}</div>
            </template>
          </div>

          <div class="col-span-6">
            <FormLabel for="supplier_number">{{ $t('purchase-invoices.supplierInvoiceNumber') }}</FormLabel>
            <FormInput v-model="CreateSupplierFields.supplier_invoice_number" id="supplier_number" type="text"
                       :placeholder="$t('purchase-invoices.supplierInvoiceNumber') " />
            <template v-if="form.invalid('supplier_invoice_number')">
              <div class="mt-2 text-xs text-red-600">{{ form.getError('supplier_invoice_number') }}</div>
            </template>
          </div>

          <div class="col-span-12">
            <InvoicesComponent :SupplierFields="CreateSupplierFields" :form="form" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="CreateSupplierFields.isloading"
       class="fixed top-0 w-full h-full left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'"
                 :loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
  </div>
</template>