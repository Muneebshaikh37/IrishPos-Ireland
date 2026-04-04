<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink :to="`/pos/register/${registerID}?tab=invoices`">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5" />
      </Button>
    </RouterLink>
    <h2 class="mr-auto text-lg font-medium">{{ $t('return-invoices.returnInvoice') }}</h2>
  </div>
  <div class="intro-y box p-4 mt-6">
    <!-- return-invoice-page -->
    <div class=" ">
      <div class="grid grid-cols-12 gap-3 ">
        <div class="col-span-5 mb-4 md:mb-0">
          <div class="bg-[#F1F5F9] box p-4">
            <div class="grid grid-cols-12 gap-6" v-if="invoiceData">
              <div class="col-span-12">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.receiptNumber') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.receiptNumber }}</h3>
              </div>
              <div class="col-span-6">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.date') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.date }}</h3>
              </div>
              <div class="col-span-6">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.paymentMethod') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.paymentMethod }}</h3>
              </div>
              <div class="col-span-12">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.registerName') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.registerName }}</h3>
              </div>
              <div class="col-span-6">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.userName') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.userName }}</h3>
              </div>
              <div class="col-span-6">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.time') }}</h5>
                <h3 class="text-sm font-medium">{{ invoiceData.time }}</h3>
              </div>
              <div class="col-span-6">
                <h5 class="text-base font-medium text-gray-600">{{ $t('return-invoices.notes') }}</h5>
                <h3 class="text-sm font-normal text-gray-500">{{ invoiceData.notes }}</h3>
              </div>
            </div>
          </div>


          <div v-if="selectedProducts.length" class="border-l border-r border-t border-gray-200 rounded-md mt-4">
            <table class="min-w-full bg-white">
              <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.productName') }}</th>
                <th class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.returnedQuantity') }}</th>
                <th class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.totalSar') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="product in selectedProducts" :key="product.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="py-2 px-4 text-xs">{{ product.productName }}</td>
                <td class="py-2 px-4">
                  <p>{{ product.returnedQuantity }}</p>
                </td>
                <td class="py-2 px-4">{{ product.total.toFixed(2) }}</td>
              </tr>
              </tbody>
              <tfoot>
              <tr class="bg-[#F8F4F3] ">
                <td class="py-2 px-4 font-medium text-gray-500">{{ $t('return-invoices.total') }}</td>
                <td class="py-2 px-4">{{ totalReturnedQuantity }}</td>
                <td class="py-2 px-4">{{ totalAmount.toFixed(2) }}</td>
              </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="col-span-7 ">
          <div class="border-l border-r border-t border-gray-200 rounded-md">
            <table class="min-w-full bg-white ">
              <thead>
              <tr class="bg-gray-100">
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm"></th>
                <th scope="col" class="px-2 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.productName') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.type') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.purchasedQuantity') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.returnedQuantity') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.vatSar') }}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium text-left text-sm">{{ $t('return-invoices.totalSar') }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="product in data" :key="product.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="py-2 px-4">
                  <FormCheck class="mt-2">
                    <FormCheck.Input
                        id="checkbox-switch-1"
                        type="checkbox"
                        :disabled="product.checkboxDisabled"
                        v-model="selectedProducts"
                        :value="product"
                        @change="handleSelect(product, $event.target.checked)" />
                  </FormCheck>
                </td>
                <td class="py-2 px-2 text-xs">{{ product.productName }} x {{product.pieces}}</td>
                <td class="py-2 px-2 text-xs">{{ product.type === "Single" ? $t('return-invoices.piece') : product.type }}</td>
                <td class="py-2 px-4">{{product.checkboxDisabled ? $t('return-invoices.returned') : product.purchasedQuantity }}</td>
                <td class="py-2 px-4">
                  <FormInput
                      v-if="product.is_service !== 1"
                      type="number"
                      v-model="product.returnedQuantity"
                      min="0"
                      :max="product.purchasedQuantity"
                      step="1"
                      @input="validateQuantity(product)"
                      class="border p-1 rounded-md"
                      :disabled="product.checkboxDisabled"
                  />
                  <span v-else class="text-xs text-slate-500">{{ $t('return-invoices.notApplicable') }}</span>
                </td>
                <td class="py-2 px-4">{{ product.vat_amount ? Number(product.vat_amount).toFixed(3) : '0.000' }}</td>
                <td class="py-2 px-4">{{ product.unitPrice }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="actions flex justify-end mt-4">
        <Button @click="returnItems" variant="outline-secondary" type="button" :disabled="!totalReturnedQuantity" class="py-2 px-4 rounded-lg mr-2">
          <template v-if="return_loading">
            <LoadingIcon icon="three-dots" class="w-5 h-5 text-white" />
          </template>
          <template v-else>
            {{ $t('return-invoices.returnItems', { count: totalReturnedQuantity }) }}
          </template>
        </Button>
<!--        <Button @click="printReceipt" variant="primary" class="py-2 px-4 rounded-lg hover:bg-gray-700">Print Receipt</Button>-->
      </div>
    </div>
  </div>

  <Dialog :open="isSuccessDialogOpen" @close="closeSuccessDialog">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="CheckCircle" class="w-16 h-16 mx-auto mt-3 text-success" />
        <div class="mt-5 text-2xl font-semibold">{{ $t('return-invoices.returnSuccessful') }}</div>
        <div class="mt-2 text-slate-500">
          {{ successMessage || $t('return-invoices.itemsReturnedSuccessfully') }}
        </div>
      </div>
      <div class="px-5 pb-8 text-center">
        <Button variant="primary" type="button" class="w-32" @click="closeSuccessDialog">
          {{ $t('return-invoices.continue') }}
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import httpClient from "@/network/api/httpClient";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { handleResponse } from "@/network/api/responseHandler.js";
import { FormCheck, FormInput } from "@/components/Base/Form";
import Button from "../../../components/Base/Button";
import Lucide from "../../../components/Base/Lucide";
import LoadingIcon from "@/components/Base/LoadingIcon/LoadingIcon.vue";
import router from "@/router";
import {useAuthStore} from "@/stores/auth.js";
import { Dialog } from "@/components/Base/Headless";
import { useI18n } from "vue-i18n";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const { t } = useI18n();
const props = defineProps({
  invoiceId: {
    type: String,
    required: true,
  }
});


const selectedProducts = ref([]);
const invoiceData = ref(null);
const data = ref([]);
const loading = ref(false);
const return_loading = ref(false);
let registerID = ref('');
const InvoiceId = useRoute().params.invoiceId;
const allItemsReturned = ref(false);
const totalInvoiceDiscount = ref(0);
const isSuccessDialogOpen = ref(false);
const successMessage = ref("");


const fetchInvoice = async () => {
  loading.value = true;
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/invoices/${props.invoiceId}`);
    const result = handleResponse(response);
    const invoice = result.data.data;


    totalInvoiceDiscount.value = parseFloat(invoice.total_discount) || 0;


    invoiceData.value = {
      id: invoice.id,
      receiptNumber: invoice.invoice_number,
      date: invoice.date,
      paymentMethod: invoice.payment_type,
      registerName: invoice.register_name,
      userName: 'Super Admin',
      time: invoice.date.split(' ')[1],
      notes: '-',
    };

    registerID.value = invoice.register_id;

    // Filter out services as they cannot be returned
    const nonServiceItems = invoice.items.filter(item => {
      const isService = item.type === 'service' || item.is_service === 1 || item.is_service === true;
      return !isService;
    });

    // Split the invoice-level total_discount equally across all non-service products
    const numberOfProducts = nonServiceItems.length || 1;
    const invoiceDiscountPerProduct = totalInvoiceDiscount.value / numberOfProducts;

    data.value = nonServiceItems.map(item => {
      const totalEntry = invoice.total.find(entry => entry[item.id] !== undefined);
      const existingQuantity = totalEntry ? totalEntry[item.id] : 0;
      const perUnitVat = parseFloat(item.vat_amount) / item.quantity;

      // Combine per-item discount from the invoice line with the equally-shared invoice discount
      const productDiscount = parseFloat(item.discount) || 0;
      const combinedLineDiscount = invoiceDiscountPerProduct + productDiscount;
      const perUnitDiscount = combinedLineDiscount / item.quantity;

      return {
        id: item.id,
        product_id: item.product_id,
        productName: item.product_name_en,
        purchasedQuantity: item.quantity - existingQuantity,
        returnedQuantity: 0,
        salePrice: item.unit_price,
        vat_amount: perUnitVat,
        unitPrice: item.total,
        total: 0,
        pieces: item.pieces || 1,
        type: item.type,
        is_service: 0,
        disabled: item.quantity - existingQuantity === 0,
        checkboxDisabled: item.quantity - existingQuantity === 0,
        perUnitDiscount: perUnitDiscount,
        invoiceDiscountShare: invoiceDiscountPerProduct,
        productDiscount: productDiscount,
      };
    });

  } catch (error) {
    console.error("Error fetching invoice data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInvoice);

watch(data, (newData) => {
  newData.forEach((product) => {
    if (product.returnedQuantity > product.purchasedQuantity) {
      product.returnedQuantity = product.purchasedQuantity;
    } else if (product.returnedQuantity < 0) {
      product.returnedQuantity = 0;
    }

    // Disable product if quantity is 0
    product.disabled = product.purchasedQuantity === 0;
  });

  // Filter out products that cannot be selected
  selectedProducts.value = newData.filter(product => product.returnedQuantity > 0);
}, { deep: true });

const totalReturnedQuantity = computed(() => {
  return selectedProducts.value.reduce((sum, product) => sum + product.returnedQuantity, 0);
});

const totalAmount = computed(() => {
  return selectedProducts.value.reduce((sum, product) => {
    const unitPrice = parseFloat(product.unitPrice) / product.purchasedQuantity;
    const subtotal = product.returnedQuantity * unitPrice;
    const returnedDiscount = product.perUnitDiscount * product.returnedQuantity;
    return sum + (subtotal - returnedDiscount);
  }, 0);
});

// Add vat_amount computed property
const vat_amount = computed(() => {
  return selectedProducts.value.reduce(
    (sum, product) => sum + (product.vat_amount * product.returnedQuantity),
    0
  );
});

watch(selectedProducts, (newSelectedProducts) => {
  newSelectedProducts.forEach(product => {
    // Calculate unit price by dividing total by purchased quantity
    const unitPrice = parseFloat(product.unitPrice) / product.purchasedQuantity;
    // Calculate total based on returned quantity and unit price
    const subtotal = product.returnedQuantity * unitPrice;
    // Subtract the proportional discount
    const returnedDiscount = product.perUnitDiscount * product.returnedQuantity;
    product.total = subtotal - returnedDiscount;
  });
}, { deep: true });

const returnItems = async () => {
  // Filter only products with returnedQuantity > 0
  const productsToReturn = selectedProducts.value.filter(product => product.returnedQuantity > 0);

  if (productsToReturn.length === 0) {
    return;
  }

  return_loading.value = true;

  // Calculate totals BEFORE mutating purchasedQuantity (so unit price = line total / original qty)
  const calculatedTotalAmount = productsToReturn.reduce((sum, product) => {
    // Calculate unit price safely
    const unitPrice = product.purchasedQuantity > 0
      ? parseFloat(product.unitPrice) / product.purchasedQuantity
      : parseFloat(product.salePrice) || 0;
    const subtotal = product.returnedQuantity * unitPrice;
    const returnedDiscount = (product.perUnitDiscount || 0) * product.returnedQuantity;
    return sum + (subtotal - returnedDiscount);
  }, 0);

  const calculatedVatAmount = productsToReturn.reduce(
    (sum, product) => sum + ((product.vat_amount || 0) * product.returnedQuantity),
    0
  );

  // Check if any item is a service
  const hasService = productsToReturn.some(product => product.type === 'service' || product.is_service === 1 || product.is_service === true);

  const payload = {
    invoice_id: props.invoiceId,
    user_id: USER_ID,
    type: 'Return',
    total_amount: Number(calculatedTotalAmount.toFixed(2)),
    grand_total: Number(calculatedTotalAmount.toFixed(2)),
    payment_type: invoiceData.value?.paymentMethod || 'cash',
    vat_amount: Number(calculatedVatAmount.toFixed(2)),
    is_service: hasService ? 1 : 0,
    items: productsToReturn.map((product) => ({
      invoice_item_id: product.id,
      quantity: product.returnedQuantity,
      return_quantity: product.returnedQuantity,
      unit_price: Number((parseFloat(product.salePrice) || 0).toFixed(2)),
      vat_amount: Number(((product.vat_amount || 0) * product.returnedQuantity).toFixed(2)),
      total: Number((product.returnedQuantity * (parseFloat(product.salePrice) || 0)).toFixed(2)),
      is_service: (product.type === 'service' || product.is_service === 1 || product.is_service === true) ? 1 : 0,
    })),
    update_inventory: productsToReturn.map((product) => ({
      product_id: product.product_id,
      total_quantity: -((product.pieces || 1) * product.returnedQuantity),
    })),
  };

  try {
    const response = await httpClient.post(import.meta.env.VITE_PUBLIC_API_URL_POS + `/returns`, payload);
    const result = handleResponse(response);
    if (result.success) {
      // Update remaining quantity only after successful return
      productsToReturn.forEach((product) => {
        const originalProduct = data.value.find((p) => p.id === product.id);
        if (originalProduct && product.returnedQuantity > 0) {
          originalProduct.purchasedQuantity -= product.returnedQuantity;
        }
      });
      successMessage.value = t('return-invoices.itemsReturnedSuccessfully');
      isSuccessDialogOpen.value = true;
    }
  } catch (error) {
    console.error("Error returning items:", error);
  } finally {
    return_loading.value = false;
  }
};

const closeSuccessDialog = () => {
  isSuccessDialogOpen.value = false;
  router.push(`/pos/register/${registerID.value}?tab=invoices`);
};

const handleSelect = (product, checked) => {
  if (product.is_service === 1) {
    product.returnedQuantity = checked ? product.purchasedQuantity : 0;
  }
};

const validateQuantity = (product) => {
  if (product.disabled || product.is_service === 1) {
    product.returnedQuantity = 0;
  } else {
    // Ensure returnedQuantity is within valid range
    product.returnedQuantity = Math.max(0, Math.min(product.purchasedQuantity, Math.floor(product.returnedQuantity)));
  }

  // Update total for this product
  product.total = product.returnedQuantity * parseFloat(product.salePrice);
};

// Add computed property for total discount on returned items
const totalReturnedDiscount = computed(() => {
  return selectedProducts.value.reduce((sum, product) => {
    return sum + (product.perUnitDiscount * product.returnedQuantity);
  }, 0);
});

</script>

<style scoped>
.return-invoice-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  border-radius: 8px;
}

.invoice-details {
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.invoice-details p {
  margin: 5px 0;
}

.summary-section {
  margin-top: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

/* button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
} */

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
