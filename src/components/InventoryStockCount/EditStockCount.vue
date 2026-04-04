<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Section: Product Search and Customer Addition -->
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
      <Button variant="primary" @click="handlePayment" class="mr-2 mt-2 shadow-md"   >
        {{ $t('stock-count.updateNewButton') }}
      </Button> 
		</div> 
    <!-- {{ products }} -->
      
  </div>
</template> 

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
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
import { useRouter, useRoute } from 'vue-router'; 

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
  },
  isloading: {
    type: Boolean,
    required: true,
  }, 
});
 
// State
const products = ref([]);
const additionalDiscountPercent = ref(0);
const additionalDiscountFixed = ref(0);
const discountMode = ref("percent"); // "percent" or "fixed"
const addedProductIds = ref(new Set());
const isloading = ref(true)
const emit = defineEmits(['update-loading']);

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
const route = useRoute()
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
  console.log("productproduct", product)
  products.value.push({
    ...product,
    expected: product?.expected || 0,
    counted: product?.counted || 0,
    difference: product?.difference || 0,
    cost: product?.cost || 2, 
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
 
const allStockFetch = async () => {
	try {
		emit('update-loading', true);
		const response = await apiService.stockCount.show(route.params.uuid);
		const result = handleResponse(response); 
		if (result.success) { 
      props.createStockCountForm.count_date = result.data.data.count_date
      props.createStockCountForm.count_name = result.data.data.count_name
      props.createStockCountForm.notes = result.data.data.notes
      props.createStockCountForm.id = result.data.data.id  
      const transformedItems = result.data.data.products.map((item) =>
      { 
        console.log("item", item)
        const product = {
          // props.createStockCountForm.count_date
          id: item.id,
          name_en: item.product?.name_en,
          cost: item.cost,
          counted: item.counted,
          difference: item.difference,
          expected: item.expected,  
          initial_quantity: item.expected,
          product:item.product,
          product_id: item.product_id
        };
        return product;
      });

      transformedItems.forEach((product) => {
        addProductToInvoice(product);
      });  
      emit('update-loading', false); 
		}  
	} catch (error) {
		const result = handleError(error);
    emit('update-loading', false);
		console.error("Error fetching stock details:", result);
    toast().fry(pan.StockCount.error(result.message)) 
	} finally {
		isloading.value = false;
		console.log("Loading state set to false");
	}
};
 
const handlePayment = async ()=> { 
  try { 
    props.createStockCountForm.isloading = true;
  const payload = { 
      _method: "PUT",
      count_name: props.createStockCountForm.count_name,
      count_date: props.createStockCountForm.count_date,
      notes: props.createStockCountForm.notes, 
      is_draft: 0,  
      products: products.value.map((product) => ({ 
        id: product.id,
        product_id: product.product.id,
        expected: product.initial_quantity, 
        counted: product.counted,
        difference: Number(product.initial_quantity - product.counted),
        cost: product.cost_price, 
      })),
    };
    console.log("count stock payload", payload)
    // const response = await axios.post(`${import.meta.env.VITE_PUBLIC_SUPPLIER_API_URL}/invoices`, payload)
     const response = await apiService.stockCount.edit( route.params.uuid, payload);  
    const result = handleResponse(response);
    
     if (result.success) { 
       console.log("count stockresponse.status",result)
       props.createStockCountForm.isloading = false; 
       router.push("/inventory/stock-count")
      } else { 
     }
  } catch (error) {
    console.log("error.response.data.errors", error)
    props.form.setErrors(error.errors);
    toast().fry(pan.StockCount.error(error.message)) 
   
  } finally {
    props.createStockCountForm.isloading = false;
  }
}

const SaveDraftStock = async ()=> { 
  try { 
    props.createStockCountForm.isloading = true;
    console.log("SaveDraftStock try",products.value)
  const payload = { 
      count_name: props.createStockCountForm.count_name,
      count_date: props.createStockCountForm.count_date,
      notes: props.createStockCountForm.notes, 
      is_draft: 1,  
      products: products.value.map((product) => ({   
        product_id: product.product_id,
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
       router.push("/inventory/stock-count")
       props.createStockCountForm.isloading = false; 
      } else { 
     }
  } catch (error) {
    console.log("error.response.data.errors", error)
    props.form.setErrors(error.errors);
    toast().fry(pan.StockCount.error(error.message)) 
   
  } finally {
    props.createStockCountForm.isloading = false;
  }
}


onMounted(()=>{
  allStockFetch()
})

function resetComponentState() {
  products.value = [];
  additionalDiscountPercent.value = 0;
  additionalDiscountFixed.value = 0;
  discountMode.value = "percent";
  addedProductIds.value.clear();
  closeDialog();
}
</script>
