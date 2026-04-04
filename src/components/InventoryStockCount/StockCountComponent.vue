<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12">
        <div class="intro-y box p-4 rounded-lg">
           
          <StockCountSearch
              :added-product-ids="addedProductIds"
              @add-product="addProductToInvoice"
              :createStockCountForm="props.createStockCountForm"
              :form= "props.form"
          />
          <StockCountList
              v-if="products.length > 0"
              :products="products"
              :createStockCountForm="props.createStockCountForm"
              @remove-product="removeProductFromInvoice"
          />
        </div>
      </div>

    </div>
    <div class="col-span-12 text-right mt-4">
      <Button variant="primary" @click="SaveDraftStock" class="mr-2 mt-2 shadow-md"   >
        {{ $t('stock-count.saveDraft') }}
      </Button> 
      <Button variant="primary" @click="CreateStock" class="mr-2 mt-2 shadow-md"   >
         {{ $t('stock-count.createNewButton') }}
      </Button> 
		</div>

  </div>
</template> 

<script setup>
import { ref, reactive, computed } from "vue";
import axios from "axios";
import StockCountSearch from "@/components/InventoryStockCount/StockCountSearch.vue";
import StockCountList from "@/components/InventoryStockCount/StockCountList.vue";
import Calculations from "@/components/InventoryStockCount/Calculations.vue"; 
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
import toast from "@/stores/utility/toast"
import pan from "@/stores/pan"   
import { useRouter } from 'vue-router';

const router = useRouter();
// Props
const props = defineProps({
 
  createStockCountForm:{
    type: Object,
    required: true,
  },
  form:{
    type: Object,
    required: true,
  }
});
 
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

// Handlers
function addProductToInvoice(product) {
  if (addedProductIds.value.has(product.id)) {
    alert("This product is already in the invoice.");
    return;
  }
  products.value.push({
    ...product,
    expected: 1,
    counted: 0,
    difference: 0,
    cost: 2, 
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
 

const CreateStock = async ()=> { 
  try { 
    props.createStockCountForm.isloading = true;
  const payload = { 
      count_name: props.createStockCountForm.count_name,
      count_date: props.createStockCountForm.count_date,
      notes: props.createStockCountForm.notes,  
      products: products.value.map((product) => ({ 
        product_id: product.id,
        expected: product.initial_quantity, 
        counted: product.counted,
        difference: Number(product.initial_quantity - product.counted),
        cost: product.cost_price, 
      })),
    };
    console.log("count stock payload", payload)
    // const response = await axios.post(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices`, payload)
     const response = await apiService.stockCount.create(payload);  
    const result = handleResponse(response);
    
     if (result.success) { 
       console.log("count stockresponse.status",result)
       toast().fry(pan.StockCount.success("Stock Count Created Successfully"));
       props.createStockCountForm.isloading = false; 
       router.push("/inventory/stock-count")
      } else { 
     }
  } catch (error) {
    console.log("error.response.data.errors", error)
    props.form.setErrors(error);
    toast().fry(pan.StockCount.error(error.message)) 
    props.form.setErrors(error.errors);
   
  } finally {
    props.createStockCountForm.isloading = false;
  }
}

const SaveDraftStock = async ()=> { 
  try { 
    props.createStockCountForm.isloading = true;
  const payload = { 
      count_name: props.createStockCountForm.count_name,
      count_date: props.createStockCountForm.count_date,
      notes: props.createStockCountForm.notes, 
      is_draft: 1,  
      products: products.value.map((product) => ({ 
        product_id: product.id,
        expected: product.initial_quantity, 
        counted: product.counted,
        difference: Number(product.initial_quantity - product.counted),
        cost: product.cost_price, 
      })),
    };
    console.log("count stock payload", payload)
    // const response = await axios.post(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices`, payload)
     const response = await apiService.stockCount.create(payload);  
    const result = handleResponse(response);
    
     if (result.success) { 
       console.log("count stockresponse.status",result)
       props.createStockCountForm.isloading = false; 
       router.push("/inventory/stock-count")
      } else { 
     }
  } catch (error) {
    console.log("error.response.data.errors", error)
   
    toast().fry(pan.StockCount.error(error.message)) 
    props.form.setErrors(error.errors);
  } finally {
    props.createStockCountForm.isloading = false;
  }
}

// async function handlePayment(paidAmount) {
//   isLoading.value = true;
//   try {
//     const payload = {
//       register_id: props.registerId,
//       customer_id: "f47ac10b-58cc-4372-a567-0e02b2c4d479",
//       status: "active",
//       payment_type: "Cash",
//       invoice_discount: additionalDiscountAmount.value,
//       total_amount: subtotal.value,
//       total_discount: discountAmount.value + additionalDiscountAmount.value,
//       vat_amount: tax.value,
//       grand_total: total.value,
//       items: products.value.map((product) => ({
//         product_id: product.id,
//         product_name: product.name,
//         quantity: product.quantity,
//         unit_price: product.cost_price,
//         discount: (product.cost_price * product.quantity * product.discount) / 100,
//         vat_amount: product.vat,
//         total: product.totalPrice,
//       })),
//     };
//     const response = await ApiService.register.invoices(payload);
//     const result = handleResponse(response);
//     if (result.success) {
//       alert(`Invoice created successfully. Invoice ID: ${result.data.id}`);
//       resetComponentState();
//     } else {
//       alert(result.message);
//     }
//   } catch (error) {
//     alert(handleError(error).message);
//   } finally {
//     isLoading.value = false;
//   }
// }

function resetComponentState() {
  products.value = [];
  additionalDiscountPercent.value = 0;
  additionalDiscountFixed.value = 0;
  discountMode.value = "percent";
  addedProductIds.value.clear();
  closeDialog();
}
</script>
