<template>
  <div>
    <div class="grid grid-cols-3 gap-6">
      <div class="col-span-2">
        <div class="intro-y box p-4 rounded-lg">
          <ProductSearch
              ref="productSearchRef"
              :added-product-ids="addedProductIds"
              :added-service-ids="addedServiceIds"
              @add-product="addProductToInvoice"
              @reAddProductToSearch="handleAddProduct"
          />
          <ProductList
              v-if="products.length > 0"
              :products="products"
              @remove-product="removeProductFromInvoice"
          />
          <ServiceList
              ref="serviceListRef"

              v-if="services.length > 0"
              :services="services"
              @remove-service="removeServiceFromInvoice"
          />
        </div> 
      </div>

      <!-- Right Section: Calculations -->
      <Calculations
          :subtotal="totalSubtotal"
          :discountAmount="discountAmount+additionalDiscountAmount"
          :tax="tax"
          :additionalDiscountPercent="{ value: additionalDiscountPercent }"
          :additionalDiscountFixed="{ value: additionalDiscountFixed }"
          :total="totalAfterDiscount"
          :hasProducts="products.length > 0 || services.length > 0"
          @update:additionalDiscountPercent="updateAdditionalDiscountPercent"
          @update:additionalDiscountFixed="updateAdditionalDiscountFixed"
          @payNow="openPaymentDialog"
      />
    </div>

    <PaymentDialog
        :open="isDialogVisible"
        :isLoading="isLoading"
        :totalSale="totalAfterDiscount"
        @close="closeDialog"
        @confirm="handlePayment"
        @holdInvoice="handleHoldInvoice"
        @select-customer="handleSelectCustomer"
    />

    <!-- Invoice View Dialog -->
    <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
      <Dialog.Panel class="md:w-[700px]">
        <InvoiceSkeleton v-if="isInvoiceLoading"/>
        <!-- Invoice Content -->
        <div class="p-8 invoice-container" v-else>
          <!-- Hold Invoice - Same style as Quotation -->
          <template v-if="isDataInvoice?.status === 'hold'">
            <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
              <div class="flex justify-center mb-3">
                <img src="@/assets/images/jaldi.png" alt="Jaldi Logo" class="h-12" />
              </div>
                
              <h4 class="text-sm font-medium mb-2">{{ $t('invoices.date') }}: <span>{{ isDataInvoice.date }}</span></h4>
              <h4 class="text-sm font-medium">{{ $t('invoices.customer') }}: <span v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span> <span v-else>{{ $t('invoices.na') }}</span></h4>
              <h1 class="text-md font-medium mb-2">{{ $t('invoices.receiptNumber') }}: {{ isDataInvoice.invoice_number }}</h1>
              
              <span class="absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
                <Lucide icon="Printer" class="w-5 h-5 text-white" />
              </span>
            </div>

            <!-- Items Table -->
            <div class="py-4 border-dashed border-b border-gray-500 items-list">
              <table class="w-full text-sm text-left rtl:text-right dark:">
                <thead>
                <tr>
                  <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 font-medium">{{ $t('invoices.qty') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.disc') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.price') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
                  <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.vat') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 font-medium rounded-tr-lg">{{ $t('invoices.total') }} <p class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="list in isDataInvoice.items" :key="list.id">
                  <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
                  <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
                  <td class="py-3 px-2 text-xs">{{ decimalFormat(list.discount) }}</td>
                  <td class="py-3 px-2 text-xs">{{ decimalFormat(getUnitPrice(list)) }}</td>
                  <td class="py-3 px-2 text-xs">{{ decimalFormat(list.vat_amount) }}</td>
                  <td class="py-3 px-2 text-xs">{{ decimalFormat(list.total) }}</td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- Total and Grand Total -->
            <div class="py-4 border-dashed border-b border-gray-500">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatIncl') }})</h4>
                <h4>{{ totalVatIncl }}</h4>
              </div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
                <h4>{{ decimalFormat(isDataInvoice.invoice_discount) }}</h4>
              </div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
                <h4>{{ grandTotal }}</h4>
              </div>
            </div>
          </template>
          <!-- Regular Invoice - Original style -->
          <template v-else>
            <div class="text-center border-dashed border-b border-gray-500 pb-4 relative">
              <h1 class="text-base font-medium text-gray-600 mb-1">{{ $t('invoices.saleInvoice') }}</h1>
              <h2 class="text-base font-medium text-gray-600 mb-1">{{ $t('invoices.invoiceNumber') }}: <span
                  class="text-gray-400">{{ isDataInvoice.invoice_number }}</span>
              </h2>
              <h2 class="text-base font-medium text-gray-600 mb-1"> {{ USER.store_name }}
              </h2>
              <h3 class="text-base font-medium text-gray-600 ">{{ USER.address }}</h3>
              <span class=" absolute top-3 right-3 p-1.5 cursor-pointer bg-[#324054] rounded-md" @click="printInvoice">
                <Lucide icon="Printer" class="w-5 h-5 text-white"/>
              </span>
            </div>
            <div class="py-6 border-dashed border-b border-gray-500">
              <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('invoices.date') }}: <span
                  class="text-gray-400">{{ isDataInvoice.date }}</span></h4>
              <h4 class="text-sm font-medium text-gray-600 mb-2">{{ $t('invoices.sellerVatNumber') }}: <span
                  class="text-gray-400">{{ USER.vat_number }}</span></h4>
              <h4 class="text-sm font-medium text-gray-600">{{ $t('invoices.customer') }}: <span class="text-gray-400"
                                                                      v-if="isDataInvoice && isDataInvoice.customer_name">{{ isDataInvoice.customer_name }}</span>
                <span class="text-gray-400" v-else>{{ $t('invoices.na') }}</span></h4>
            </div>
            <div class="py-4 border-dashed border-b border-gray-500">
              <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead>
                <tr class="">
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tl-lg">{{ $t('invoices.productName') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('invoices.unit') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium">{{ $t('invoices.qty') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.disc') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.price') }} <p
                      class="text-[10px] -mt-1">({{ $t('invoices.vatExcl') }})</p></th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.vat') }}</th>
                  <th scope="col" class="px-2 text-xs py-3 text-gray-700 font-medium rounded-tr-lg">{{ $t('invoices.total') }} <p
                      class="text-[10px] -mt-1">({{ $t('invoices.vatIncl') }})</p></th>
                </tr>
                </thead>
                <tbody>
                <tr class=" " v-for="list in isDataInvoice.items">
                  <td class="py-3 px-2 text-xs">{{ list.product_name_en }}</td>
                  <td class="py-3 px-2 text-xs">{{ list.type }}</td>
                  <td class="py-3 px-2 text-xs">{{ list.quantity }}</td>
                  <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.discount) }}</td>
                  <td class="py-3 px-2 text-xs">{{ decimalFormat(list.unit_price) }}</td>
                  <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.vat_amount) }}</td>
                  <td class="py-3 px-2 text-xs"> {{ decimalFormat(list.total) }}</td>
                </tr>


                </tbody>
              </table>
            </div>
            <div class="py-4 border-dashed border-b border-gray-500">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.total') }} ({{ $t('invoices.vatExcl') }})</h4>
                <h4 class="text-gray-600">{{ totalExcl }}</h4>
              </div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.vatAmount') }}</h4>
                <h4 class="text-gray-600">{{ vatSum }}</h4>
              </div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.additionalDiscount') }}</h4>
                <h4 class="text-gray-600">{{ isDataInvoice.invoice_discount }}</h4>
              </div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-gray-800 font-medium">{{ $t('invoices.grandTotal') }}</h4>
                <h4 class="text-gray-600">{{ grandTotal }}</h4>
              </div>
            </div>
            <div class="py-4" v-if="isDataInvoice?.qr_code">
              <h4 class="text-gray-600 font-medium text-center mb-4 mt-2">{{ $t('invoices.scanToGetInfo') }}</h4>
              <div class="flex items-center justify-center">
                <img
                    :src="isDataInvoice.qr_code"
                    class="w-28 border border-[#d9d9d9] p-2"
                    alt="Invoice Barcode"
                />
              </div>
            </div>
          </template>
        </div>
      </Dialog.Panel>
    </Dialog>
  </div>
</template>
 
<script setup>
import {computed, ref, onMounted} from "vue";
import ProductSearch from "@/components/pos/ProductSearch.vue";
import ProductList from "@/components/pos/ProductList.vue";
import ServiceList from "@/components/pos/ServiceList.vue";
import Calculations from "@/components/pos/Calculations.vue";
import PaymentDialog from "@/components/pos/Modals/PaymentDialog.vue";
import toast from "@/stores/utility/toast";
import pan from "../../stores/pan"
import httpClient from '@/network/api/httpClient';
import {STATUS_HOLD, STATUS_PAID} from "@/config/constants";
import { useProductStore } from '@/stores/productStore';
import { useWorkerStore } from '@/stores/workerStore';
import {useAuthStore} from "@/stores/auth.js";
import {Dialog} from "@/components/Base/Headless";
import InvoiceSkeleton from "@/components/globel/Skeleton/InvoiceSkeleton.vue";
import Lucide from "@/components/Base/Lucide";
import {decimalFormat} from "@/helpers/commonHelper";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;

import {
  calculateAdditionalDiscount,
  calculateDiscountAmount,
  calculateSubtotal,
  calculateSubtotalTaxInclusive,
  calculateTax,
  calculateTotal,
} from "@/helpers/calculationHelper.js";
import {handleError, handleResponse} from "@/network/api/responseHandler.js";
import { normalizeInvoiceDetailFromApi } from "@/helpers/posInvoiceHelper.js";
import {roundToTwoDecimals} from "@/helpers/commonHelper.js";

const VAT = authStore.getUserVat;
const vatValue = authStore.getVatValue;
// Props
const props = defineProps({
  registerId: {
    type: String,
    required: true,
  },
});


// State
const products = ref([]);
const services = ref([]);
const additionalDiscountPercent = ref(0);
const additionalDiscountFixed = ref(0);
const discountMode = ref("percent"); // "percent" or "fixed"
const addedProductIds = ref(new Set());
const addedServiceIds = ref(new Set());
const serviceListRef = ref(null);

// Calculations
const subtotal = computed(() => {
  if (!products.value || products.value.length === 0) {
    return 0;
  }
  return products.value.reduce((total, product) => {
    const price = product.sale_price || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;
    const discountAmount = (price * quantity) * (discount / 100);
    const discountedInclusive = (price * quantity) - discountAmount;
    const vatAmount = calculateVatForProductItem(product); // already considers quantity
    const discountedExclusive = discountedInclusive - vatAmount;
    return total + discountedExclusive;
  }, 0);
});

const servicesSubtotal = computed(() => {
  if (!services.value || services.value.length === 0) {
    return 0;
  }
  return services.value.reduce((total, service) => {
    const price = service.sale_price || 0;
    const discount = service.discount || 0;
    const discountAmount = price * (discount / 100);
    const discountedInclusive = price - discountAmount;
    const vatAmount = calculateVatForServiceItem(service);
    const discountedExclusive = discountedInclusive - vatAmount;
    return total + discountedExclusive;
  }, 0);
});

const totalSubtotal = computed(() => {
  return subtotal.value + servicesSubtotal.value;
});

const subtotalTaxInclusive = computed(() => {
  if (!products.value || products.value.length === 0) {
    return 0;
  }
  return calculateSubtotalTaxInclusive(products.value);
});

const discountAmount = computed(() => {
  if ((!products.value || products.value.length === 0) && (!services.value || services.value.length === 0)) {
    return 0;
  }
  const productDiscounts = products.value.reduce((total, product) => {
    const price = product.sale_price || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;
    return total + ((price * quantity * discount) / 100);
  }, 0);
  const serviceDiscounts = services.value.reduce((sum, service) => {
    const price = service.sale_price || 0;
    const discount = service.discount || 0;
    return sum + (price * (discount / 100));
  }, 0);
  return productDiscounts + serviceDiscounts;
});

const tax = computed(() => {
  const productVat = (products.value && products.value.length > 0)
    ? calculateTax(products.value)
    : 0;
  const serviceVat = (services.value && services.value.length > 0)
    ? services.value.reduce((sum, s) => sum + calculateVatForServiceItem(s), 0)
    : 0;
  return productVat + serviceVat;
});

const totalAfterDiscount = computed(() => {
  let discountedSubtotal = totalSubtotal.value;

  // Apply percentage discount if available
  if (additionalDiscountPercent.value) {
    const percentageDiscount = (additionalDiscountPercent.value / 100) * discountedSubtotal;
    discountedSubtotal -= percentageDiscount;
  }

  // Apply fixed discount if available
  if (additionalDiscountFixed.value) {
    discountedSubtotal -= additionalDiscountFixed.value;
  }

  // Ensure the total is not negative
  const totalWithTax = Math.max(0, discountedSubtotal + tax.value);

  // Round the result to two decimal places
  return roundToTwoDecimals(totalWithTax);
});

const additionalDiscountAmount = computed(() => {
  if (discountMode.value === "percent") {
    return calculateAdditionalDiscount(
        "percent",
        additionalDiscountPercent.value,
        0, // Ignore fixed discount
        totalSubtotal.value
    );
  } else if (discountMode.value === "fixed") {
    return calculateAdditionalDiscount(
        "fixed",
        0, // Ignore percentage discount
        additionalDiscountFixed.value,
        totalSubtotal.value
    );
  }
  return 0;
});

const total = computed(
    () =>
        calculateTotal(
            subtotalTaxInclusive.value,
            discountAmount.value,
            tax.value,
            additionalDiscountAmount.value
        )
);


// Dialog visibility
const isDialogVisible = ref(false);
const isLoading = ref(false);

// Invoice popup state
const isInvoicePrint = ref(false);
const isInvoiceLoading = ref(false);
const isDataInvoice = ref(null);

function addProductToInvoice({ product, packing }) {

  if (!product) {
    console.error("Product is undefined or null.");
    return;
  }

  // Check if it's a service
  if (product.is_service === 1 || product.is_service === true) {
    addServiceToInvoice(product);
    return;
  }

  if (!addedProductIds.value) {
    console.error("addedProductIds is undefined or not initialized.");
    return;
  }

  const { id, name_en, vat, initial_quantity, sale_price } = product;
  const productIdentifier = `${id}`;

  const existingProduct = products.value.find(p => p.id === product.id);

  const salePrice = sale_price || 0; // Use product sale_price directly

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    products.value.push({
      id,
      name_en,
      initial_quantity,
      vat,
      quantity: 1,
      sale_price: salePrice,
      discount: 0,
      totalPrice: salePrice,
      is_service: false,
    });
    addedProductIds.value.add(productIdentifier);
  }
}

function addServiceToInvoice(product) {
  if (!product) {
    console.error("Service is undefined or null.");
    return;
  }

  if (!addedServiceIds.value) {
    console.error("addedServiceIds is undefined or not initialized.");
    return;
  }

  const { id, name_en, sale_price } = product;
  const serviceIdentifier = `${id}`;

  const existingService = services.value.find(s => s.id === product.id);

  const salePrice = sale_price || 0;

  if (existingService) {
    // Services don't have quantity - just update price if needed
    existingService.sale_price = salePrice;
  } else {
    services.value.push({
      id,
      name_en,
      sale_price: salePrice,
      discount: 0,
      totalPrice: salePrice,
      is_service: true,
      assigned_worker: [],
    });
    addedServiceIds.value.add(serviceIdentifier);
  }
}


const invoiceItems = ref([]);

function handleAddProduct(newProduct) {
  const exists = invoiceItems.value.some(
      (item) => item.productId === newProduct.productId
  );

  if (!exists) {
    invoiceItems.value.push(newProduct);
  } else {
    // Optionally update the quantity of the existing item
    const existingItem = invoiceItems.value.find(
        (item) => item.productId === newProduct.productId
    );
    existingItem.quantity += 1; // Increment quantity or handle logic as needed
  }
}

const emit = defineEmits(["reAddProductToSearch"]); // Define the event

function removeProductFromInvoice(index) {
  const removedProduct = products.value[index];

  if (removedProduct) {
    const {id} = removedProduct;
    const productIdentifier = `${id}`;

    // Remove using the product identifier
    if (addedProductIds.value.has(productIdentifier)) {
      addedProductIds.value.delete(productIdentifier);
      products.value.splice(index, 1);  // Remove the product from the list
      emit("reAddProductToSearch", removedProduct);  // Re-add to the product search
    } else {
      console.error("Product not found in the addedProductIds set.");
    }
  }
}

function removeServiceFromInvoice(index) {
  const removedService = services.value[index];

  if (removedService) {
    const {id} = removedService;
    const serviceIdentifier = `${id}`;

    // Remove using the service identifier
    if (addedServiceIds.value.has(serviceIdentifier)) {
      addedServiceIds.value.delete(serviceIdentifier);
      services.value.splice(index, 1);  // Remove the service from the list
    } else {
      console.error("Service not found in the addedServiceIds set.");
    }
  }
}

function updateAdditionalDiscountPercent(value) {
  if (value < 0 || value > 100) {
    alert("Discount percentage must be between 0 and 100.");
    return;
  }

  discountMode.value = "percent"; // Set the mode to percentage
  additionalDiscountPercent.value = value;
  additionalDiscountFixed.value = 0; // Reset fixed discount to 0
}

function updateAdditionalDiscountFixed(value) {
  if (value < 0) {
    alert("Fixed discount cannot be negative.");
    return;
  }

  discountMode.value = "fixed"; // Set the mode to fixed
  additionalDiscountFixed.value = value;
  additionalDiscountPercent.value = 0; // Reset percentage discount to 0
}



function openPaymentDialog() {
  // Validate that all services have assigned workers
  if (services.value.length > 0) {
    // More robust check: ensure assigned_worker is not empty, null, or undefined
    // Support both array and string formats for backward compatibility
    const servicesWithoutWorker = services.value.filter(service => {
      const workerId = service.assigned_worker;
      if (Array.isArray(workerId)) {
        return workerId.length === 0;
      }
      // Check if workerId is empty, null, undefined, or falsy
      return !workerId || workerId === '' || workerId === null || workerId === undefined;
    });
    
    if (servicesWithoutWorker.length > 0) {
      // Trigger validation styling
      if (serviceListRef.value) {
        serviceListRef.value.triggerValidation();
      }
      
     		toast().fry(pan.supplier.error("Please assign a worker to all services before proceeding"));

      return; // Don't open the dialog
    }
  }
  
  // Reset validation if all valid
  if (serviceListRef.value) {
    serviceListRef.value.resetValidation();
  }
  
  isDialogVisible.value = true;
}
function closeDialog() {
  isDialogVisible.value = false;
}


// const paymentType = ref("Cash");
const selectedCustomerId = ref(null); // Store the selected customer_id

const handleSelectCustomer = (customerId) => {
  selectedCustomerId.value = customerId; // Update the selected customer ID
};

function calculateVatForProductItem(product) {
  const price = product.sale_price || 0;
  const quantity = product.quantity || 1;
  const discountAmount = product.discount > 0
    ? price * (product.discount / 100) * quantity
    : 0;
  const discountedPrice = (price * quantity) - discountAmount;
  return product.vat !== 0 ? discountedPrice * (vatValue / (1 + vatValue)) : 0;
}

function calculateVatForServiceItem(service) {
  const price = service.sale_price || 0;
  const discountAmount = service.discount > 0
    ? price * (service.discount / 100)
    : 0;
  const discounted = price - discountAmount; // assumed VAT-inclusive sale price
  // Services are always subject to VAT in KSA
  return discounted * (vatValue / (1 + vatValue));
}

async function handlePayment(paymentMethods) {
  isLoading.value = true;
  try {
    const payload = {
      register_id: props.registerId,
      customer_id: selectedCustomerId.value ?? "",
      user_id: USER_ID,
      pricesAreTaxInclusive: true,
      status: STATUS_PAID,
      type: 'Sale',
      payment_type: paymentMethods,
      invoice_discount: additionalDiscountAmount.value,
      total_amount: totalSubtotal.value,
      total_discount: discountAmount.value + additionalDiscountAmount.value,
      vat_amount: tax.value,
      grand_total: totalAfterDiscount.value,
      is_service: services.value.length > 0 ? 1 : 0, // 1 if ANY item is a service, 0 otherwise (for multipart/form-data)
      items: [
        ...products.value.map((product) => ({
          product_id: product.id,
          product_name: product.name_en,
          quantity: product.quantity,
          quantity_in_pieces: product.quantity,
          initial_quantity: product.initial_quantity,
          unit_price: product.sale_price,
          discount: (product.sale_price * product.quantity * (product.discount || 0)) / 100,
          vat_amount: calculateVatForProductItem(product),
          total: product.totalPrice,
          type: "piece", // Product type
          is_service: 0, // 0 for products (for multipart/form-data)
        })),
        ...services.value.map((service) => ({
          product_id: service.id,
          product_name: service.name_en,
          quantity: 1,
          quantity_in_pieces: 1,
          initial_quantity: 0,
          unit_price: service.sale_price,
          discount: (service.sale_price * (service.discount || 0)) / 100,
          vat_amount: calculateVatForServiceItem(service),
          total: service.totalPrice,
          type: "service", // Service type
          is_service: 1, // 1 for services (for multipart/form-data)
          assigned_to: Array.isArray(service.assigned_worker) 
            ? service.assigned_worker.join(',') 
            : (service.assigned_worker || ""), // Changed from assigned_worker to assigned_to
        })),
      ],
    };
    payload.update_inventory = products.value.map((product) => ({
      product_id: product.id,
      total_quantity: product.quantity,
    }));
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_POS + '/invoices', payload);
    const result = handleResponse(response);
    if (result.success) {
      isDialogVisible.value = false;
      toast().fry(pan.invoice.success("Invoice Created"));
      
      // Get invoice ID from response and show invoice popup
      const invoiceId = result.data?.data?.id || result.data?.id || result.data?.invoice_id;
      if (invoiceId) {
        await showInvoicePopup(invoiceId);
      }
      
      resetComponentState();
    }
  } catch (error) {
    alert(handleError(error).message);
  } finally {
    isLoading.value = false;
  }
}

async function handleHoldInvoice() {
  isLoading.value = true;
  try {
    const payload = {
      register_id: props.registerId,
      customer_id: selectedCustomerId.value ?? "",
      user_id: USER_ID,
      pricesAreTaxInclusive: true,
      status: STATUS_HOLD,
      type: 'Sale',
      invoice_discount: additionalDiscountAmount.value,
      total_amount: totalSubtotal.value,
      total_discount: discountAmount.value + additionalDiscountAmount.value,
      vat_amount: tax.value,
      grand_total: totalAfterDiscount.value,
      is_service: services.value.length > 0 ? 1 : 0, // 1 if ANY item is a service, 0 otherwise (for multipart/form-data)
      items: [
        ...products.value.map((product) => ({
          product_id: product.id,
          product_name: product.name_en,
          quantity: product.quantity,
          quantity_in_pieces: product.quantity,
          initial_quantity: product.initial_quantity,
          unit_price: product.sale_price,
          discount: (product.sale_price * product.quantity * (product.discount || 0)) / 100,
          vat_amount: calculateVatForProductItem(product),
          total: product.totalPrice,
          type: "piece", // Product type
          is_service: 0, // 0 for products (for multipart/form-data)
        })),
        ...services.value.map((service) => ({
          product_id: service.id,
          product_name: service.name_en,
          quantity: 1,
          quantity_in_pieces: 1,
          initial_quantity: 0,
          unit_price: service.sale_price,
          discount: (service.sale_price * (service.discount || 0)) / 100,
          vat_amount: calculateVatForServiceItem(service),
          total: service.totalPrice,
          type: "service", // Service type
          is_service: 1, // 1 for services (for multipart/form-data)
          assigned_to: Array.isArray(service.assigned_worker) 
            ? service.assigned_worker.join(',') 
            : (service.assigned_worker || ""), // Changed from assigned_worker to assigned_to
        })),
      ],
    };
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_POS + '/invoices', payload);
    const result = handleResponse(response);
    if (result.success) {
      isDialogVisible.value = false;
      toast().fry(pan.invoice.success("Invoice Created"));
      resetComponentState();
    }
  } catch (error) {
    alert(handleError(error).message);
  } finally {
    isLoading.value = false;
  }
}

const productSearchRef = ref(null);

function resetComponentState() {
  products.value = [];
  services.value = [];
  additionalDiscountPercent.value = 0;
  additionalDiscountFixed.value = 0;
  discountMode.value = "percent";
  addedProductIds.value.clear();
  addedServiceIds.value.clear();
  const productSearchRef = ref(null);
  if (productSearchRef.value) {
    productSearchRef.value.resetSearch();
  }
  closeDialog();
}

const productStore = useProductStore();
const workerStore = useWorkerStore();

// Invoice popup functions
const showInvoicePopup = async (invoiceId) => {
  isInvoicePrint.value = true;
  isInvoiceLoading.value = true;
  isDataInvoice.value = null;
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${invoiceId}`, {
      params: { user_id: USER_ID },
    });
    const result = handleResponse(response);
    if (result.success) {
      isDataInvoice.value = normalizeInvoiceDetailFromApi(result.data);
    }
  } catch (error) {
    handleError(error);
  } finally {
    isInvoiceLoading.value = false;
  }
};

const isCloseInvoicePrint = () => {
  isInvoicePrint.value = false;
};

const printInvoice = () => {
  window.print();
};

const getUnitPrice = (list) => {
  const total = parseFloat(list.total || 0);
  const vat = parseFloat(list.vat_amount || 0);
  return total - vat;
};

// Computed totals for invoice popup
const totalExcl = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const sum = items.reduce((acc, it) => {
    const total = parseFloat(it.total || 0);
    const vat = parseFloat(it.vat_amount || 0);
    return acc + (total - vat);
  }, 0);
  return sum.toFixed(2);
});

const vatSum = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const sum = items.reduce((acc, it) => acc + parseFloat(it.vat_amount || 0), 0);
  return sum.toFixed(2);
});

const grandTotal = computed(() => {
  const items = isDataInvoice.value?.items || [];
  const discount = parseFloat(isDataInvoice.value?.invoice_discount || 0);
  const lineTotal = items.reduce((acc, it) => acc + parseFloat(it.total || 0), 0);
  return (lineTotal - discount).toFixed(2);
});

const totalVatIncl = computed(() => {
  const items = isDataInvoice.value?.items || [];
  return items.reduce((acc, it) => acc + parseFloat(it.total || 0), 0).toFixed(2);
});

onMounted(() => {
  productStore.fetchProducts();
  workerStore.fetchWorkers();
});
</script>
