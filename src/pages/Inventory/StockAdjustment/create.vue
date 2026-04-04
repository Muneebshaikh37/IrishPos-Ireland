<script setup>
import {
  FormInput,
  FormLabel,
  FormTextarea,
} from "@/components/Base/Form";
import {RouterLink} from "vue-router";
import {ref, onMounted, reactive, nextTick} from "vue";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import TomSelect from "@/components/Base/TomSelect";
import apiService from '../../../network/api/apiService';
import toast from "../../../stores/utility/toast"
import pan from "../../../stores/pan"
import httpClient from "@/network/api/httpClient.js";
import ClipLoader from 'vue-spinner/src/ClipLoader.vue'
import ErrorHandler from "@/utils/validation";
import SearchProduct from "@/components/Inventory/Adjustments/SearchProduct.vue";
import router from "../../../router";
import {handleResponse, handleError} from "../../../network/api/responseHandler.js";

import {useAuthStore} from "@/stores/auth.js";

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const USER = authStore.getUser;
const ROLE = (USER && (USER.role || (Array.isArray(USER.roles) ? USER.roles[0] : ''))) || '';
const CreateAdjustments = reactive({
  adjustment_name: "",
  notes: "",
  supplier_id: "",
  isloading: false,
});

//State
const isProductList = ref()
const products = ref([]);
const reasonsList = ref([]); // Holds the list of adjustment reasons
const addedProductIds = ref(new Set());
const fetchproductinventory = async () => {
  try {
    const response = await apiService.purchaseInvoice.allList();
    const result = handleResponse(response);

    if (result.success) {
      isProductList.value = result.data.data
    }
  } catch (error) {
    console.log("result.data.data", error)
    toast().fry(pan.supplier.error(error.message))
  }
}  
const locale = ref('en'); // Default locale
onMounted(() => {
  fetchproductinventory()
  getReasonsList();
  locale.value = localStorage.getItem('locale') || 'en';
})

function constructPayload()
{

  const payload = {
    count_name: CreateAdjustments.adjustment_name,
    notes: CreateAdjustments.notes || "",
    products: products.value.map((product) => ({
      product_id: product.id,
      remove_quantity: product.remove_qty || 0,
      available_quantity: product.initial_quantity,
      updated_quantity: product.updated_quantity,
      stock_adjustment_reason_id: product.stock_adjustment_reason_id || null,
    })),
  };

  return payload;
}

const form = reactive(new ErrorHandler());
async function handleSave()
{
  CreateAdjustments.isloading = true;
  const payload = constructPayload();  
  console.log(payload);
  if (!payload) return;
  try {
    const response = await httpClient.post(`stock-adjustments?user_id=${USER_ID}${ROLE ? `&role=${encodeURIComponent(ROLE)}` : ''}`, payload);
    const result = handleResponse(response);
    if(result.success)
    {
      toast().fry(pan.category.success("Stock Adjustment Created Successfully"));
      CreateAdjustments.isloading = false;
      // Small delay to ensure toast is visible before redirect
      setTimeout(() => {
        router.push('/inventory/stock-adjustment').catch(() => {
          // Fallback: try using window.location if router.push fails
          window.location.href = '/inventory/stock-adjustment';
        });
      }, 500);
    }
  } catch (error) {
    form.setErrors(error.errors);
  } finally {
    CreateAdjustments.isloading = false;
  }
}

async function getReasonsList() {
  try {
    const response = await httpClient.get(`stock-adjustment-reason?user_id=${USER_ID}`);
    const result = handleResponse(response);
    if (result.success) {
      reasonsList.value = result.data.data; // Assuming API returns 'data' array
    }
  } catch (error) {
    console.error("Error fetching reasons list:", error);
  }
}

// Handlers
function addProductToInvoice(product) {
  if (addedProductIds.value.has(product.id)) {
    alert("This product is already in the invoice.");
    return;
  }
  products.value.push({
    ...product,
    updated_quantity: product.initial_quantity,
    initial_quantity: product.initial_quantity,
    totalPrice: product.cost_price,
    stock_adjustment_reason_id:'',
  });
  addedProductIds.value.add(product.id);
}
console.log(products.value); // Log the products to check the reason


function removeProductFromInvoice(index) {
  const removedProduct = products.value[index];
  if (removedProduct?.id) addedProductIds.value.delete(removedProduct.id);
  products.value.splice(index, 1);
}

const validateRemoveQty = (product) => {
  if (product.remove_qty > product.initial_quantity) {
    product.remove_qty = product.initial_quantity;
  } else if (product.remove_qty < 0 || product.remove_qty === null) {
    product.remove_qty = 0;
  }
  // Dynamically calculate updated quantity
  product.updated_quantity = product.initial_quantity - product.remove_qty;
};

</script>


<template>
  <div class="flex items-center mt-8 intro-y">
    <RouterLink to="/inventory/stock-adjustment">
      <Button variant="primary" size="sm" class="shadow-md mr-4 h-8 w-9">
        <Lucide icon="ChevronLeft" class="w-5 h-5   "/>
      </Button>
    </RouterLink>
    <h2 class=" text-lg font-medium" :class="{ 'ml-auto': locale === 'ar', 'mr-auto': locale !== 'ar' }">{{ $t('stock-adjustment.addStockAdjustment') }}</h2>
  </div>
  <div class="grid grid-cols-12 gap-6 mt-5">
    <div class="col-span-12 intro-y lg:col-span-12">
      <div class="intro-y box p-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-6">
            <FormLabel>{{ $t('stock-adjustment.adjustmentName') }} <span class="text-danger "> *</span></FormLabel>
            <div class="flex items-center flex-row-reverse">
              <FormInput
                  v-model="CreateAdjustments.adjustment_name"
                  id="supplier_number"
                  type="text"
                  :placeholder="$t('stock-adjustment.adjustmentName')"
                  :class="form.invalid('count_name') ? 'border-danger' : ''"
              />
            </div>
            <template v-if="form.invalid('count_name')">
              <div class="mt-2 text-sm text-red-600">{{ form.getError('count_name') }}</div>
            </template>
          </div>
          <div class="col-span-12">
            <FormLabel for="supplier_number">{{ $t('stock-adjustment.notes') }}</FormLabel>
            <FormTextarea v-model="CreateAdjustments.notes"
                          :placeholder="$t('stock-adjustment.notes')"
                          rows="4"
                          :class="{ 'border-danger': form.invalid('notes') }"
            />
            <template v-if="form.invalid('notes')">
              <div class="mt-2 text-sm text-red-600">{{ form.getError('notes') }}</div>
            </template>
          </div>
          <div class="col-span-12">
            <div class="grid grid-cols-12 gap-6">
              <!-- Left Section: Product Search and Customer Addition -->
              <div class="col-span-12">
                <div class="intro-y box p-4 rounded-lg">
                  <SearchProduct
                      :invalid="form.invalid(`products`)"
                      :added-product-ids="addedProductIds"
                      @add-product="addProductToInvoice"
                  />
                  <template v-if="form.invalid(`products`)">
                    <div class="mt-2 text-sm text-red-600">
                      {{ form.getError(`products`) }}
                    </div>
                  </template>

                  <div class="mt-8">
                    <table v-if="products.length > 0" class="w-full align-top text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                      <thead>
                      <tr class="bg-gray-100 border-b">
                        <th scope="col" class="px-6 py-3 text-gray-700 font-medium w-[350px]">{{ $t('stock-adjustment.productName') }}</th>
                        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-adjustment.removeQuantity') }}</th>
                        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-adjustment.availableQuantity') }}</th>
                        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-adjustment.updatedQuantity') }}</th>
                        <th scope="col" class="px-6 py-3 text-gray-700 font-medium">{{ $t('stock-adjustment.adjustmentReason') }}</th>
                        <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{ $t('stock-adjustment.actions') }}</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr
                          v-for="(product, index) in products"
                          :key="product.id || index"
                          class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                      >
                        <!-- Product Name -->
                        <td class="py-3 px-4 align-top">{{ product.name_en }}</td>

                        <!-- Remove Quantity Input -->
                        <td class="py-3 px-4 align-top">
                          <FormInput
                              type="number"
                              v-model.number="product.remove_qty"
                              @input="validateRemoveQty(product)"
                              min="0"
                              :readonly="product.initial_quantity < 1"
                              :max="product.initial_quantity"
                              class="w-[85px] px-4 py-2 border rounded-lg"
                              :class="form.invalid(`products.${index}.remove_quantity`) ? 'border-danger' : ''"
                          />
                          <template v-if="form.invalid(`products.${index}.remove_quantity`)">
                            <div class="mt-0.5 text-[10px] text-red-600">
                              {{ form.getError(`products.${index}.remove_quantity`) }}
                            </div>
                          </template>
                        </td>

                        <!-- Available Quantity -->
                        <td class="py-3 px-4 align-top">
                          <FormInput
                              type="number"
                              readonly
                              v-model.number="product.initial_quantity"
                              class="w-[85px] px-4 py-2 border rounded-lg"
                          />
                        </td>

                        <!-- Updated Quantity -->
                        <td class="py-3 px-4 align-top">
                          <FormInput
                              type="number"
                              readonly
                              v-model.number="product.updated_quantity"
                              class="w-[85px] px-4 py-2 border rounded-lg"
                          />
                        </td>

                        <td class="py-3 px-1 align-top">
                          <div class="">
                            <TomSelect
                                v-model="product.stock_adjustment_reason_id"
                                :options="{placeholder: $t('stock-adjustment.selectReason'),}"
                                class="w-[150px]"
                                :disabled="product.initial_quantity < 1"
                                :class="{'border-red-500': form.invalid(`products.${index}.stock_adjustment_reason_id`)}"

                            >
                              <option></option>
                              <template v-for="reason in reasonsList">
                                <option :value="reason.id">{{ reason.title }}</option>
                              </template>
                            </TomSelect>
                          </div>
                          <template v-if="form.invalid(`products.${index}.stock_adjustment_reason_id`)">
                            <div class="mt-0.5 text-[10px] text-red-600">
                              {{ form.getError(`products.${index}.stock_adjustment_reason_id`) }}
                            </div>
                          </template>
                        </td>

                        <td class="py-3 px-2 align-top">
                          <button @click="removeProductFromInvoice(index)" class="bg-red-100 p-2 rounded-md">
                            <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]"/>
                          </button>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="col-span-12 text-right">
            <Button variant="primary" @click="handleSave" class="mr-2 mt-2 shadow-md">
              {{ $t('stock-adjustment.createStockAdjustment') }}
            </Button>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div v-if="CreateAdjustments.isloading"
       class="fixed top-0 w-full h-full left-0 flex items-center justifty-center bg-black bg-opacity-30 z-[999999]">
    <clip-loader class="absolute flex items-center justify-center w-full h-full top-0" :margin="'0px'"
                 :loading="true" :color="'#fff'" :size="'50px'"></clip-loader>
  </div>

</template>