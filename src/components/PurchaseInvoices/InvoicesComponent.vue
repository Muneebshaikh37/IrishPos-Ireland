<template>
  <div>
    <div class="grid grid-cols-12 gap-6"> 
      <div class="col-span-12">
        <div class="intro-y box p-4 rounded-lg">
           
          <ProductSearch
              :added-product-ids="addedProductIds"
              @add-product="addProductToInvoice"
              :SupplierFields="props.SupplierFields"
              :form= "props.form"
          />
          <ProductList
              v-if="products.length > 0"
              :products="products"
              :form= "props.form"
              :SupplierFields="props.SupplierFields"
              @remove-product="removeProductFromInvoice"
          />
        </div>
      </div> 

      <!-- Right Section: Calculations -->
      <Calculations
          :subtotal="subtotal"
          :discountAmount="discountAmount"
          :SupplierFields="props.SupplierFields"
          :form= "props.form"
          :tax="tax"
          :additionalDiscountPercent="{ value: additionalDiscountPercent }"
          :additionalDiscountFixed="{ value: additionalDiscountFixed }"
          :total="total"
          @update:additionalDiscountPercent="updateAdditionalDiscountPercent"
          @update:additionalDiscountFixed="updateAdditionalDiscountFixed"
          @payNow="openPaymentDialog"
      />
    </div>
    <div class="col-span-12 text-right">
						<Button variant="primary" @click="handlePayment" class="mr-2 mt-2 shadow-md"   >
							{{$t('purchase-invoices.createPurchase')}}
						</Button> 
					</div> 
  </div>

  <!-- Purchase Invoice View Modal -->
  <InvoiceModel 
    :isListInvoice="isListInvoice" 
    @closeViewInvoice="closeInvoiceView"
    :isOpenViewInvoice="isOpenViewInvoice" 
  />
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import httpClient from "@/network/api/httpClient";
import ProductSearch from "@/components/PurchaseInvoices/ProductSearch.vue";
import ProductList from "@/components/PurchaseInvoices/ProductList.vue";
import Calculations from "@/components/PurchaseInvoices/Calculations.vue"; 
import Button from "@/components/Base/Button";
import {
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTax,
  calculateAdditionalDiscount,
  calculateTotal,
  calculatePercentFromFixed,
  calculateFixedFromPercent,
} from "@/helpers/invoiceCulationHelper.js";
import ErrorHandler from "@/utils/validation";
import apiService from "@/network/api/apiService.js";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import InvoiceModel from "@/components/Models/PurchaseInvoiceModel/index.vue";
 
import { useRouter } from 'vue-router';
import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const vatValue = authStore.getVatValue;

const router = useRouter();
// Props
const props = defineProps({
 
  SupplierFields:{
    type: Object,
    required: true,
  },
  form:{
    type: Object,
    required: true,
  }
});
// console.log("isProductList invoice", props)
// State
const products = ref([]);
const additionalDiscountPercent = ref(0);
const additionalDiscountFixed = ref(0);
const discountMode = ref("percent"); // "percent" or "fixed"
const addedProductIds = ref(new Set());
const isloading = ref(true)


// Calculations
const subtotal = computed(() => calculateSubtotal(products.value));
const discountAmount = computed(() => calculateDiscountAmount(products.value));
// console.log(discountAmount)
const tax = computed(() => calculateTax(products.value));
const additionalDiscountAmount = computed(() =>
    calculateAdditionalDiscount(
        discountMode.value,
        additionalDiscountPercent.value,
        additionalDiscountFixed.value,
        subtotal.value
    )
);
const total = computed(() =>
    calculateTotal(
      products.value
    )
);
// console.log("total", total)

// Dialog visibility
const isDialogVisible = ref(false);
const isLoading = ref(false);
const form = reactive(new ErrorHandler());

// Invoice view modal state
const isOpenViewInvoice = ref(false);
const isListInvoice = ref(null); 

// Handlers
function addProductToInvoice(product) {
  // Find if the product already exists in the invoice
  const existingProduct = products.value.find(p => p.id === product.id);

  if (existingProduct) {
    // If the product is already in the invoice, increase its quantity
    existingProduct.quantity += 1; // Increase the product quantity
    // Recalculate total price if needed
    existingProduct.totalPrice = existingProduct.quantity * product.cost_price;
    return;
  }

  // If the product is not already in the invoice, add it as a new entry
  products.value.push({
    ...product,
    quantity: 1,
    discount: 0,
    vat: 0,
    totalPrice: product.cost_price,
  });
  addedProductIds.value.add(product.id);
}


function removeProductFromInvoice(index) {
  const removedProduct = products.value[index];
  if (removedProduct?.id) addedProductIds.value.delete(removedProduct.id);
  products.value.splice(index, 1);
}

function updateAdditionalDiscountPercent(value) {
  additionalDiscountPercent.value = value;
  additionalDiscountFixed.value = calculateFixedFromPercent(value, subtotal.value);
}

function updateAdditionalDiscountFixed(value) {
  additionalDiscountFixed.value = value;
  additionalDiscountPercent.value = calculatePercentFromFixed(value, subtotal.value);
}

function openPaymentDialog() {
  isDialogVisible.value = true;
}

function closeDialog() {
  isDialogVisible.value = false;
}

// Invoice popup functions (similar to POS selling component)
const showInvoicePopup = async (invoiceId) => {
  isOpenViewInvoice.value = true;
  try {
    const response = await httpClient.get(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices/${invoiceId}`);
    const result = handleResponse(response);
    if (result.success) {
      isListInvoice.value = result.data?.data ?? result.data;
    }
  } catch (error) {
    handleError(error);
  }
};

const closeInvoiceView = () => {
  isOpenViewInvoice.value = false;
  isListInvoice.value = null;
  router.push("/purchasing/invoice");
};

const handlePayment = async ()=> { 
  try { 
    // Validate that all products have valid quantities
    const invalidProducts = products.value.filter(p => !p.quantity || p.quantity < 1);
    if (invalidProducts.length > 0) {
      props.form.setErrors({
        'items': ['All products must have a quantity of at least 1.']
      });
      props.SupplierFields.isloading = false;
      return;
    }

    // Validate that all products have valid cost prices
    const invalidPrices = products.value.filter(p => !p.cost_price || p.cost_price <= 0);
    if (invalidPrices.length > 0) {
      props.form.setErrors({
        'items': ['All products must have a valid unit cost.']
      });
      props.SupplierFields.isloading = false;
      return;
    }

    props.SupplierFields.isloading = true;
    
    // Calculate values with fallbacks
    const calculatedSubtotal = subtotal.value || 0;
    const calculatedTax = tax.value || 0;
    const calculatedTotal = total.value || 0;
    
    const payload = {
      supplier_id: props.SupplierFields.supplier_id,
      user_id: USER_ID,
      supplier_invoice_number: props.SupplierFields.supplier_invoice_number || "",
      payment_type: props.SupplierFields.payment_type || "",
      amount_paid: props.SupplierFields.amount_paid || 0,
      // invoice_discount: additionalDiscountAmount.value,
      total_amount: calculatedSubtotal,
      // total_discount: discountAmount.value + additionalDiscountAmount.value,
      vat: calculatedTax,
      grand_total: calculatedTotal,
      items: products.value.map((product) => ({
        product_id: product.id,
        product_name: product.name_en || "",
        initial_quantity: product.initial_quantity || 0,
        quantity: Math.max(1, Math.floor(product.quantity || 1)), // Ensure quantity is at least 1 and is an integer
        unit_price: product.cost_price || 0,
        // discount: (product.cost_price * product.quantity * product.discount) / 100,
        vat: product.vat || 0,
        total: product.totalPrice || 0,
      })),
    };
    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices`, payload)
    const result = handleResponse(response);

    if (result.success) {
      props.SupplierFields.isloading = false;
      router.push("/purchasing/invoice");
    } else {
      props.SupplierFields.isloading = false;
    }
  } catch (error) {
    console.log("error.response.data.errors", error.response.data.errors)
    props.form.setErrors(error.response.data.errors);
   
  } finally {
    props.SupplierFields.isloading = false;
  }
}
 
</script>
