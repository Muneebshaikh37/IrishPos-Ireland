<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <button variant="primary"  @click="goBack" size="sm" class="shadow-md mr-4 h-8 w-9">
          <Lucide icon="ChevronLeft" class="w-5 h-5 inline-block" /> </button>
        <h1 class="text-lg font-medium">Sale Invoice</h1>
      </div>
      <div class="flex items-center">
        <AddWithdraw/>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-6">
      <!-- Left Section: Product Search and Customer Addition -->
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
              v-if="products.filter(p => !p.is_service || p.is_service === false).length > 0"
              :products="products"
              @remove-product="removeProductFromInvoice"
          />
          <ServiceList
              ref="serviceListRef"
              v-if="services.length > 0"
              :services="services"
              :workers="workers"
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
        :isEditInvoice="true"
        :services="services"
        :invoiceId="props.invoiceId"
        @close="closeDialog"
        @confirm="handlePayment"
        @holdInvoice="handleHoldInvoice"
        @addQuotation="handleAddQuotation"
        @select-customer="handleSelectCustomer"
    />
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from "vue";
import {
  calculateSubtotal,
  calculateSubtotalTaxInclusive,
  calculateDiscountAmount,
  calculateTax,
  calculateAdditionalDiscount,
  calculateTotal,
} from "@/helpers/calculationHelper.js";
import ProductSearch from "@/components/pos/EditInvoices/ProductSearch.vue";
import ProductList from "@/components/pos/EditInvoices/ProductList.vue";
import ServiceList from "@/components/pos/ServiceList.vue";
import Calculations from "@/components/pos/EditInvoices/Calculations.vue";
import PaymentDialog from "@/components/pos/Modals/PaymentDialog.vue";
import toast from "@/stores/utility/toast";
import pan from "../../../stores/pan"
import httpClient from '@/network/api/httpClient';
import Lucide from "@/components/Base/Lucide";
import {handleResponse, handleError} from "@/network/api/responseHandler.js";
import AddWithdraw from "@/components/pos/EditInvoices/AddWithdraw.vue";
import AddCustomer from "@/components/pos/EditInvoices/AddCustomer.vue";
import Button from "@/components/Base/Button";
import {random} from "lodash";
import {useRouter} from "vue-router";
import {STATUS_HOLD,STATUS_PAID} from "@/config/constants.js";
import { useProductStore } from '@/stores/productStore';
import { useWorkerStore } from '@/stores/workerStore';
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const VAT = authStore.getUserVat;
const vatValue = authStore.getVatValue;

// Props
const props = defineProps({
  invoiceId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const goBack = () => { router.back(); };
// State

const products = ref([]);
const services = ref([]);
const additionalDiscountPercent = ref( 0);
const additionalDiscountFixed = ref(0);
const discountMode = ref("percent"); // "percent" or "fixed"
const addedProductIds = ref(new Set());
const addedServiceIds = ref(new Set());
const serviceListRef = ref(null);
const workers = ref([]);

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
  const productDiscounts = products.value.reduce((sum, product) => {
    const price = product.sale_price || 0;
    const quantity = product.quantity || 1;
    const discount = product.discount || 0;
    return sum + ((price * quantity) * (discount / 100));
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

  return totalWithTax;
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
            additionalDiscountAmount.value,
            total.value
        )
);


// Dialog visibility
const isDialogVisible = ref(false);
const isLoading = ref(false);


function addProductToInvoice(product)
{
  if (!product) {
    console.error("Product is undefined or null.");
    return;
  }

  // Check if it's a service - check both the product object and the product store
  const productFromStore = productStore.products.find(p => p.id === product.id);
  const isServiceFromStore = productFromStore && (productFromStore.is_service === 1 || productFromStore.is_service === true);
  const isService = product.is_service === 1 ||
                   product.is_service === true ||
                   isServiceFromStore;

  if (isService) {
    addServiceToInvoice(product);
    return;
  }

  if (!addedProductIds.value) {
    console.error("addedProductIds is undefined or not initialized.");
    return;
  }

  const {id, name_en, vat, initial_quantity, sale_price} = product;
  const productIdentifier = `${id}`;

  const existingProduct = products.value.find(p => p.id === product.id);

  const salePrice = sale_price || 0; // Use product sale_price directly

  if (existingProduct) {
    existingProduct.quantity += 1;
    // Update total price when quantity changes
    existingProduct.totalPrice = calculateProductTotalForEdit(existingProduct);
  } else {
    const initialQuantity = product.quantity || 1;
    const initialDiscount = product.discount || 0;
    const totalPrice = calculateProductTotalForEdit({
      sale_price: salePrice,
      quantity: initialQuantity,
      discount: initialDiscount,
      vat: vat
    });

    products.value.push({
      id,
      name_en,
      initial_quantity,
      vat,
      quantity: initialQuantity,
      sale_price: salePrice,
      discount: initialDiscount,
      totalPrice: totalPrice,
      is_service: false, // Explicitly mark as not a service
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

  const { id, name_en, sale_price, discount, totalPrice, assigned_worker, task_status } = product;
  const serviceIdentifier = `${id}`;

  const existingService = services.value.find(s => s.id === product.id);

  const salePrice = sale_price || 0;
  const serviceDiscount = discount !== undefined ? discount : 0;
  const serviceTotalPrice = totalPrice !== undefined ? totalPrice : salePrice;
  const serviceAssignedWorker = assigned_worker !== undefined ? assigned_worker : [];
  const serviceTaskStatus = task_status !== undefined ? task_status : (existingService?.task_status || 'pending');

  if (existingService) {
    // Services don't have quantity - just update price if needed
    existingService.sale_price = salePrice;
    if (discount !== undefined) existingService.discount = serviceDiscount;
    if (totalPrice !== undefined) existingService.totalPrice = serviceTotalPrice;
    if (assigned_worker !== undefined) existingService.assigned_worker = serviceAssignedWorker;
    if (task_status !== undefined) existingService.task_status = serviceTaskStatus;
  } else {
    services.value.push({
      id,
      name_en,
      sale_price: salePrice,
      discount: serviceDiscount,
      totalPrice: serviceTotalPrice,
      is_service: true,
      assigned_worker: serviceAssignedWorker,
      task_status: 'pending', // Default status for new services
    });
    addedServiceIds.value.add(serviceIdentifier);
  }
}

function removeServiceFromInvoice(index) {
  const removedService = services.value[index];

  if (removedService) {
    const { id } = removedService;
    const serviceIdentifier = `${id}`;

    if (addedServiceIds.value.has(serviceIdentifier)) {
      addedServiceIds.value.delete(serviceIdentifier);
      services.value.splice(index, 1);
    } else {
      console.error("Service not found in the addedServiceIds set.");
    }
  }
}

const productStore = useProductStore();
const workerStore = useWorkerStore();

onMounted(() => {
  fetchInvoiceDetails(props.invoiceId);
  productStore.fetchProducts();
  workerStore.fetchWorkers();
});

// Watch for workers from store
watch(() => workerStore.workers, (newWorkers) => {
  workers.value = newWorkers;
}, { immediate: true });
const registerID = ref();
const calculateDiscountPercentage = (quantity, unitPrice, discountAmount) => {
  // Step 1: Calculate Total Sale Price
  const totalSalePrice = quantity * unitPrice;
  // Step 2: Calculate Discount Percentage
  const discountPercentage = (discountAmount / totalSalePrice) * 100;
  return parseFloat(discountPercentage.toFixed(2)); // Return rounded percentage
};


const fetchInvoiceDetails = async (invoiceId) => {
  try {
    // Clear existing data before loading invoice details
    products.value = [];
    services.value = [];
    addedProductIds.value.clear();
    addedServiceIds.value.clear();

    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/invoices/${invoiceId}`);
    const result = handleResponse(response);
    const invoiceDetails = result.data.data;
    if (result.success)
    {
      additionalDiscountFixed.value = invoiceDetails.invoice_discount || 0;
      registerID.value = invoiceDetails.register_id

      invoiceDetails.items.forEach((item) => {
        // Check if item is a service - check multiple possible fields
        // Also check product store to see if the product itself is a service
        const productFromStore = productStore.products.find(p => p.id === item.product_id);
        const isServiceFromStore = productFromStore && (productFromStore.is_service === 1 || productFromStore.is_service === true);

        const isService = item.is_service === 1 ||
                         item.is_service === true ||
                         item.is_service === "1" ||
                         item.type === "service" ||
                         item.type === "Service" ||
                         isServiceFromStore;

        if (isService) {
          // Handle as service
          // Prioritize assigned_workers (array) over assigned_worker (single object)
          let workerIds = [];
          if (item.assigned_workers) {
            // assigned_workers is the primary source - contains all assigned workers
            workerIds = Array.isArray(item.assigned_workers)
              ? item.assigned_workers.map(w => typeof w === 'object' && w.worker_id ? String(w.worker_id) : String(w))
              : [String(item.assigned_workers)];
          } else if (item.assigned_worker) {
            // Fallback to assigned_worker if assigned_workers doesn't exist
            if (typeof item.assigned_worker === 'object' && item.assigned_worker.worker_id) {
              // If it's an object with worker_id, extract the worker_id
              workerIds = [String(item.assigned_worker.worker_id)];
            } else if (Array.isArray(item.assigned_worker)) {
              // If it's already an array
              workerIds = item.assigned_worker.map(w => typeof w === 'object' && w.worker_id ? String(w.worker_id) : String(w));
            } else {
              // If it's a single value, convert to array
              workerIds = [String(item.assigned_worker)];
            }
          } else if (item.assigned_to) {
            // Fallback to assigned_to
            workerIds = Array.isArray(item.assigned_to)
              ? item.assigned_to.map(w => String(w))
              : item.assigned_to.split(',').filter(w => w.trim()).map(w => String(w.trim()));
          }

          // Extract task status from assigned_workers
          let taskStatus = 'pending'; // default status
          if (item.assigned_workers && Array.isArray(item.assigned_workers) && item.assigned_workers.length > 0) {
            // Get statuses from all workers
            const statuses = item.assigned_workers
              .map(w => w.task_status)
              .filter(s => s); // filter out null/undefined

            if (statuses.length > 0) {
              // If all are completed, show completed
              if (statuses.every(s => s === 'completed')) {
                taskStatus = 'completed';
              }
              // If any are in progress, show in progress
              else if (statuses.some(s => s === 'inprogress' || s === 'in_progress')) {
                taskStatus = 'inprogress';
              }
              // If any are cancelled, show cancelled
              else if (statuses.some(s => s === 'cancelled')) {
                taskStatus = 'cancelled';
              }
              // Otherwise show pending
              else {
                taskStatus = 'pending';
              }
            }
          } else if (item.assigned_worker && typeof item.assigned_worker === 'object' && item.assigned_worker.task_status) {
            taskStatus = item.assigned_worker.task_status;
          }

          const service = {
            id: item.product_id,
            name_en: item.product_name_en,
            sale_price: item.unit_price,
            discount: calculateDiscountPercentage(1, item.unit_price, item.discount),
            totalPrice: item.total,
            assigned_worker: workerIds,
            task_status: taskStatus,
          };
          addServiceToInvoice(service);
        } else {
          // Handle as product - ensure it's not a service
          const product = {
            id: item.product_id,
            name_en: item.product_name_en,
            sale_price: item.unit_price,
            vat: item.vat_amount,
            quantity: item.quantity,
            discount: calculateDiscountPercentage(item.quantity, item.unit_price, item.discount),
            initial_quantity: item.initial_quantity,
            is_service: false, // Explicitly mark as not a service
          };
          addProductToInvoice(product);
        }
      });


    }
  } catch (error) {
    {
      console.error("Error fetching invoice details:", error);
    }
  }
}


const invoiceItems = ref([]);

function handleAddProduct(newProduct)
{
  const exists = invoiceItems.value.some(
      (item) => item.id === newProduct.id
  );

  if (!exists) {
    invoiceItems.value.push(newProduct);
  } else {
    // Optionally update the quantity of the existing item
    const existingItem = invoiceItems.value.find(
        (item) => item.id === newProduct.id
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
  isDialogVisible.value = true;
}

function closeDialog() {
  isDialogVisible.value = false;
}


const selectedCustomerId = ref(null); // Store the selected customer_id

const handleSelectCustomer = (customerId) => {
  selectedCustomerId.value = customerId; // Update the selected customer ID

};

const calculateVatForProduct = (unitPrice, quantity, vatPercentage, discount = 0) => {
  // Step 1: Calculate total sale price (Unit Price * Quantity)
  const totalSalePrice = unitPrice * quantity;

  // Step 2: Calculate total discount based on total sale price
  const totalDiscount = totalSalePrice * (discount / 100);

  // Step 3: Calculate total discounted price
  const totalDiscountedPrice = totalSalePrice - totalDiscount;

  // Step 4: Calculate VAT on the total discounted price using the formula: Discounted_Price × (vatValue / (1 + vatValue))
  const vatAmount = totalDiscountedPrice * (vatValue / (1 + vatValue));

  return vatAmount;
};

function calculateVatForProductItem(product) {
  const price = product.sale_price || 0;
  const quantity = product.quantity || 1;
  const discountAmount = product.discount > 0
    ? price * (product.discount / 100) * quantity
    : 0;
  const discountedPrice = (price * quantity) - discountAmount;
  return product.vat !== 0 && product.vat !== "0.00" ? discountedPrice * (vatValue / (1 + vatValue)) : 0;
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

// Helper function to calculate product total for edit invoice
const calculateProductTotalForEdit = (product) => {
  const price = product.sale_price || 0;
  const quantity = product.quantity || 1;
  const discount = product.discount || 0;
  const vatValue = authStore.getVatValue;

  // Calculate discount amount
  const discountAmount = (price * quantity) * (discount / 100);

  // Calculate total after discount
  const totalAfterDiscount = (price * quantity) - discountAmount;

  // Calculate VAT if applicable
  const vat = (product.vat !== 0 && product.vat !== "0.00") ? totalAfterDiscount * vatValue : 0;

  // Total including VAT
  return totalAfterDiscount + vat;
};



async function handlePayment(paymentMethods)
{
  isLoading.value = true;
  try {
    const payload = {
      register_id: registerID.value,
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
      items: [
        ...products.value.map((product) => ({
          product_id: product.id,
          product_name: product.name_en,
          type: 'Single',
          quantity: product.quantity,
          initial_quantity: product.initial_quantity ?? random(60),
          unit_price: product.sale_price,
          discount: (product.sale_price * product.quantity * (product.discount || 0)) / 100,
          vat_amount: calculateVatForProductItem(product),
          total: product.totalPrice,
          is_service: 0,
        })),
        ...services.value.map((service) => ({
          product_id: service.id,
          product_name: service.name_en,
          type: 'Service',
          quantity: 1,
          initial_quantity: 0,
          unit_price: service.sale_price,
          discount: (service.sale_price * (service.discount || 0)) / 100,
          vat_amount: calculateVatForServiceItem(service),
          total: service.totalPrice,
          is_service: 1,
          assigned_to: Array.isArray(service.assigned_worker)
            ? service.assigned_worker.join(',')
            : (service.assigned_worker || ''),
        })),
      ],
    };
    payload.update_inventory = products.value.map((product) => ({
      product_id: product.id,
      total_quantity: product.quantity || 1,
    }));

    // const response = await ApiService.register.invoices(payload);
    const response = await httpClient.post(
        `${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${props.invoiceId}`,
        payload,
        {
          headers: {
            "X-HTTP-Method-Override": "PUT", // Override method to PUT
          },
        }
    );
    const result = handleResponse(response);
    if (result.success)
    {
      isDialogVisible.value = false;
      // alert(`Invoice created successfully. Invoice ID: ${result.data.id}`);
      toast().fry(pan.invoice.success("Invoice Created"));
      resetComponentState();
      goBack();

    } else {
      alert(result.message);
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
      register_id: registerID.value,
      customer_id: selectedCustomerId.value ?? "",
      user_id: USER_ID,
      pricesAreTaxInclusive: true,
      status: STATUS_HOLD,
      type: 'Sale',
      // payment_type: paymentType.value,
      invoice_discount: additionalDiscountAmount.value,
      total_amount: totalSubtotal.value,
      total_discount: discountAmount.value + additionalDiscountAmount.value,
      vat_amount: tax.value,
      grand_total: totalAfterDiscount.value,
      items: [
        ...products.value.map((product) => ({
          product_id: product.id,
          product_name: product.name_en,
          type: 'Single',
          quantity: product.quantity,
          initial_quantity: 10,
          unit_price: product.sale_price,
          discount: (product.sale_price * product.quantity * (product.discount || 0)) / 100,
          vat_amount: calculateVatForProductItem(product),
          total: product.totalPrice,
          is_service: 0,
        })),
        ...services.value.map((service) => ({
          product_id: service.id,
          product_name: service.name_en,
          type: 'Service',
          quantity: 1,
          initial_quantity: 0,
          unit_price: service.sale_price,
          discount: (service.sale_price * (service.discount || 0)) / 100,
          vat_amount: calculateVatForServiceItem(service),
          total: service.totalPrice,
          is_service: 1,
          assigned_to: Array.isArray(service.assigned_worker)
            ? service.assigned_worker.join(',')
            : (service.assigned_worker || ''),
        })),
      ],
    };

    const response = await httpClient.post(
        `${import.meta.env.VITE_PUBLIC_API_URL_POS}/invoices/${props.invoiceId}`,
        payload,
        {
          headers: {
            "X-HTTP-Method-Override": "PUT", // Override method to PUT
          },
        }
    );
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

async function handleAddQuotation(data) {
  isLoading.value = true;
  try {
    const payload = {
      register_id: registerID.value,
      customer_id: data.customerId ?? "",
      user_id: USER_ID,
      pricesAreTaxInclusive: true,
      status: 'draft',
      type: 'quotation',
      invoice_discount: additionalDiscountAmount.value,
      total_amount: totalSubtotal.value,
      total_discount: discountAmount.value + additionalDiscountAmount.value,
      vat_amount: tax.value,
      grand_total: totalAfterDiscount.value,
      items: [
        ...products.value.map((product) => ({
          product_id: product.id,
          product_name: product.name_en,
          type: 'Single',
          quantity: product.quantity,
          initial_quantity: product.initial_quantity ?? 10,
          unit_price: product.sale_price,
          discount: (product.sale_price * product.quantity * (product.discount || 0)) / 100,
          vat_amount: calculateVatForProductItem(product),
          total: product.totalPrice,
          is_service: 0,
        })),
        ...services.value.map((service) => ({
          product_id: service.id,
          product_name: service.name_en,
          type: 'Service',
          quantity: 1,
          initial_quantity: 0,
          unit_price: service.sale_price,
          discount: (service.sale_price * (service.discount || 0)) / 100,
          vat_amount: 0,
          total: service.totalPrice,
          is_service: 1,
          assigned_workers: Array.isArray(service.assigned_worker) ? service.assigned_worker : [],
        })),
      ],
    };
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_POS + '/invoices', payload);
    const result = handleResponse(response);
    if (result.success) {
      isDialogVisible.value = false;
      toast().fry(pan.invoice.success("Quotation Created"));
      resetComponentState();
      goBack();
    }
  } catch (error) {
    const errorResult = handleError(error);
    toast().fry(pan.invoice.error(errorResult.message || "Failed to create quotation"));
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
</script>
