<template>
  <div>
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Section: Product Search and Customer Addition -->
      <div class="col-span-12">
        <div class="intro-y box p-4 rounded-lg">

          <SearchProduct
              :added-product-ids="addedProductIds"
              @add-product="addProductToInvoice"
              :form= "props.form"
          />
          <AdjustmentTable
              v-if="products.length > 0"
              :products="products"
              :SupplierFields="props.SupplierFields"
              @remove-product="removeProductFromInvoice"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import ErrorHandler from "@/utils/validation";

import { useRouter } from 'vue-router';
import SearchProduct from "@/components/Inventory/Adjustments/SearchProduct.vue";
import AdjustmentTable from "@/components/Inventory/Adjustments/AdjustmentTable.vue";

const router = useRouter();
// Props
const props = defineProps({

  AdjustmentFields:{
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
const addedProductIds = ref(new Set());
const isloading = ref(true)



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
    quantity: 1,
    discount: 0,
    vat: 0,
    packing: "gfs",
    packing_quantity:1,
    totalPrice: product.cost_price,
  });
  addedProductIds.value.add(product.id);
}

function removeProductFromInvoice(index) {
  const removedProduct = products.value[index];
  if (removedProduct?.id) addedProductIds.value.delete(removedProduct.id);
  products.value.splice(index, 1);
}

</script>
