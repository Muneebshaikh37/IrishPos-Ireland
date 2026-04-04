<script setup lang="ts">
import _ from "lodash";
import axios from "axios";
import { ref, reactive, onMounted } from "vue";
import Button from "../../components/Base/Button";
import { FormInput, FormSwitch, } from "../../components/Base/Form";
import { Dialog } from "../../components/Base/Headless";
import Lucide from "../../components/Base/Lucide";
import { RouterLink, useRoute } from "vue-router";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import apiService from '../../network/api/apiService';
import { handleResponse, handleError } from "../../network/api/responseHandler.js";
import Toastify from "toastify-js";
import Notification from "../../components/Base/Notification";
import httpClient from '@/network/api/httpClient';
import {useAbility} from "@casl/vue";
import {useAuthStore} from "@/stores/auth";
import RegisterSkeleton from "@/components/globel/Skeleton/RegisterSkeleton.vue";
import {useI18n} from "vue-i18n";



const authStore = useAuthStore();
const USER_ID = authStore.getUserId;
const isRegisterOpen = ref(false);
const openedRegisterId = ref(null);
const registers = ref([]);

const loading: any = ref(true);
const total_rows = ref(0);
const params = reactive({
  current_page: 1,
  pagesize: 10,
  search: '',
  column_filters: [],
  sort_column: 'id',
  sort_direction: 'asc',
});
const rows: any = ref(null);
const {t} = useI18n();
const cols: any = ref([
  { field: 'register_name', title: t('pos-registers.registerName')  },
  { field: 'date', title: t('pos-registers.date')  },
  { field: 'opening_balance', title: t('pos-registers.openingBalance') },
  { field: 'closing_balance', title: t('pos-registers.closingBalance') },
  { field: 'status', title: t('pos-registers.status') },
  { field: 'actions', title: t('pos-registers.actions'), sort: false },
]) || [];


const datatable: any = ref(null);
let timer: any;
const filterUsers = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!params.search) {
      getRegisters(); // If search is empty, reload all registers
      return;
    }

    const searchTerm = params.search.toLowerCase();

    const filteredData = registers.value.filter((register) => {
      return (
        register.name?.toLowerCase().includes(searchTerm)
      );
    });

    // Paginate the filtered results
    const paginatedResult = paginate(filteredData, params);

    // Update rows for the table
    rows.value = paginatedResult.data.map(item => ({
      ...item,
      register_name: item.name,
      date: item.opened_at,
      opening_balance: item.opening_balance,
      status: item.status
    }));

    total_rows.value = paginatedResult.meta.total;
  }, 300); // Adding debounce to optimize performance
};
const paginate = (rows: any[], params: any) => {
  // Ensure rows is an array
  if (!Array.isArray(rows)) {
    console.error("Rows is not a valid array.");
    return {
      data: [],
      meta: {
        current_page: params.current_page || 1,
        per_page: params.pagesize || 10,
        first_page: 1,
        last_page: 1,
        total_pages: 1,
        total: 0,
      },
    };
  }
  const total = rows.length;
  const current_page = Math.max(1, params.current_page); // Ensure current_page is at least 1
  const pagesize = Math.max(1, params.pagesize); // Ensure pagesize is at least 1
  // Calculate offset and limit
  const offset = (current_page - 1) * pagesize;
  const limit = offset + pagesize;
  // Slice rows for the current page
  const paginatedRows = rows.slice(offset, limit);
  // Calculate total pages
  const total_pages = Math.ceil(total / pagesize);

  return {
    data: paginatedRows,
    meta: {
      current_page,
      per_page: pagesize,
      first_page: 1,
      last_page: total_pages,
      total_pages,
      total,
    },
  };
};

const getRegisters = async () =>
{
  try {
    loading.value = true;
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/registers?user_id=${USER_ID}`);

    registers.value = response.data.data;
    const result = handleResponse(response);
    let filteredData = result.data.data;
    const paginatedResult = paginate(filteredData, params);


    // Find the open register and track its ID
    const openRegister = filteredData.find(register => register.status === 'open');
    isRegisterOpen.value = !!openRegister;
    openedRegisterId.value = openRegister ? openRegister.id : null;

    rows.value = paginatedResult.data.map(item => ({
      ...item,
      register_name: item.name,
      date: item.opened_at,
      opening_balance: item.opening_balance,
      status: item.status
    }));

    total_rows.value = paginatedResult.meta.total;

  } catch { }

  loading.value = false;
};
const changeServer = (data: any) => {
  params.current_page = data.current_page;
  params.pagesize = data.pagesize;
  params.column_filters = data.column_filters;
  params.search = data.search;
  params.sort_column = data.sort_column;
  params.sort_direction = data.sort_direction;
  if (data.change_type === 'search') {
    filterUsers();
  } else {
    getRegisters();
  }

};
onMounted(() => {
  getRegisters();
});

const toggleActive = async (row: any) => {
  if (!row || !row.id) {
    return;
  }
  try {
    row.is_active = !row.is_active;
    console.log("row", row)
    const response = await apiService.category.activation(row.id);
    const result = handleResponse(response);
    console.log('toggle', result)

    if (result.success) {
      getRegisters();
      const successEl = document
        .querySelector("#success-notification-content")
        ?.cloneNode(true) as HTMLElement;

      if (successEl) {
        successEl.classList.remove("hidden");
        successEl.querySelector(".font-medium")!.textContent = "Category Status";
        successEl.querySelector(".text-slate-500")!.textContent = `${result.message}`;
        Toastify({
          node: successEl,
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
        }).showToast();
      }
    } else {
      row.is_active = !row.is_active;
      console.error("Failed to toggle activation state");
    }
  } catch (error) {
    const result = handleError(error);
    row.is_active = !row.is_active;
  }
};

const deleteConfirmationModal = ref(false);
const isCategoryId = ref(null);
const openDeleteModal = (Uuid: any) => {
  isCategoryId.value = Uuid;
  deleteConfirmationModal.value = true;
};
const closeDeleteModal = () => {
  deleteConfirmationModal.value = false;
  isCategoryId.value = null;
};
const deleteUser = (Uuid: any) => { openDeleteModal(Uuid); };
const confirmDelete = async () => {
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/registers/${isCategoryId.value}`)
    // const response = await apiService.category.delete(isCategoryId.value);
    const result = handleResponse(response);
    console.log('login response', result)
    if (result.success) {
      closeDeleteModal();
      // getRegisters();
    }
  } catch (error) {
    const result = handleError(error);
  }
}

const IsRegisterPrint = ref(false)
const isInvoicePrint = ref(false)
const dataRegister = ref()
const isLoading = ref(true)
const isDataInvoice = ref()

const isOpenRegisterPrint = async (Uuid: any) => {
    IsRegisterPrint.value = true
    isLoading.value = true;
    isDataInvoice.value = null; // Reset data before fetching new data
  try {
    const response = await httpClient.get(import.meta.env.VITE_PUBLIC_API_URL_POS + `/registers/${Uuid}`)
    // const response = await apiService.category.delete(isCategoryId.value);
    const result = handleResponse(response);
    console.log('login response', result)
    if (result.success) {
      dataRegister.value = result.data.data
      closeDeleteModal();
      // getRegisters();
    }
  } catch (error) {
    const result = handleError(error);
  } finally {
    isLoading.value = false; // Ensure loader hides after request
  }
}
const isCloseRegisterPrint = () => { IsRegisterPrint.value = false }

const isOpenInvoicePrint = () => { isInvoicePrint.value = true }
const isCloseInvoicePrint = () => { isInvoicePrint.value = false }

const ability = useAbility();


</script>
<template>
  <h2 class="mt-10 text-lg font-semibold intro-y">{{$t('pos-registers.dailyRegisters')}}</h2>
  <div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 ">
    <div class="col-span-12 flex justify-between intro-y">
      <div>
        <RouterLink v-if="!loading && isRegisterOpen && openedRegisterId"
                    :to="{ name: 'Register Close', params: { registerId: openedRegisterId }, query: { register: JSON.stringify(openRegister) } }">
          <Button variant="primary" class="mr-2 shadow-md">
            {{$t('pos-registers.continueSelling')}}
          </Button>
        </RouterLink>
        <RouterLink v-else-if="!loading" :to="{ name: 'Register Open' }">
          <Button v-if="ability.can('open', 'register')" variant="primary" class="mr-2 shadow-md">
            {{$t('pos-registers.openRegister')}}
          </Button>
        </RouterLink>
      </div>
      <div class="flex items-center mt-3 sm:ml-auto sm:mt-0">
        <div class="relative w-56 text-slate-500 mr-3">
          <FormInput v-model="params.search" type="text" class="w-56 pr-10 !box" :placeholder="$t('pos-registers.searchPlaceholder')" />
          <Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
      </div>
    </div>

    <div class="col-span-12">
      <vue3-datatable ref="datatable" :rows="rows" :columns="cols" :loading="loading" :totalRows="total_rows"
                      :isServerMode="true" :pageSize="params.pagesize" :sortable="true" :sortColumn="params.sort_column"
                      :sortDirection="params.sort_direction" :search="params.search" @change="changeServer">
        <template #status="data">
          <div class="capitalize">
            {{ data.value.status }}
          </div>
        </template>

        <template #is_active="data">
          <div class="flex w-[80px]" id="fix">
            <label class="switch" @click="toggleActive(data.value)">
              <input type="checkbox" :checked="data.value.is_active">
              <span class="slider round"></span>
            </label>
          </div>
        </template>
        <template #actions="data">
          <div class="flex gap-2.5">
            <a href="#" class="bg-[#96837f33] p-2 rounded-md" @click="isOpenRegisterPrint(data.value.id)">
              <Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </template>
      </vue3-datatable>
    </div>
  </div>

  <Dialog :open="IsRegisterPrint" @close="closeDeleteModal">
    <Dialog.Panel class="md:w-[700px]">
      <RegisterSkeleton v-if="isLoading" />
      <div v-else>
        <div class="border-b border-gray-300 mb-4 pt-4 relative">
          <h4 class="text-lg text-gray-700 font-medium pb-3 px-6 text-center">{{$t('pos-registers.registerName')}}: <span class="text-primary">{{dataRegister.name}}</span></h4>
          <span @click="isCloseRegisterPrint"
                class="flex justify-center items-center absolute top-4 right-4 cursor-pointer border border-gray-500 rounded-full p-0.5">
            <Lucide icon="X" class="w-5 h-5 text-gray-700 " />
          </span>
        </div>
        <div class="grid grid-cols-12 gap-6 mt-5 px-8">
          <div class="col-span-6">
            <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.openingBalance')}}</h5>
            <h3 class="font-medium text-base text-gray-700">{{ dataRegister.opening_balance }}</h3>
          </div>
          <div class="col-span-6">
            <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.closingBalance')}}</h5>
            <div class="flex justify-between mt-2">
              <div>
                <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.cash')}}:</h5>
                <template v-if="dataRegister.closing_balance !== null">
                  <h3 class="font-medium text-base text-gray-700">{{ dataRegister.closing_balance }}</h3>
                </template>
                <template v-else>
                  <h3 class="font-medium text-base text-gray-700">{{$t('pos-registers.na')}}</h3>
                </template>
              </div>
              <div>
                <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.creditCard')}}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{dataRegister.totals.total_credit}}</h3>
              </div>
            </div>
          </div>
          <div class="col-span-6">
          </div>
          <div class="col-span-6">
            <div class="flex justify-between">
              <div>
                <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.expectedCash')}}:</h5>
                <h3 class="font-medium text-base text-gray-700">{{ dataRegister.totals.expected_cash }}</h3>
              </div>
              <div>
                <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.cashVariance')}}:</h5>
                <h3 class="font-medium text-base text-gray-700">
                  {{ dataRegister.status === 'open' ? 0 : Number(dataRegister.closing_balance - dataRegister.totals.expected_cash) }}
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-6 mt-5 mx-8 bg-[#F7F8FA] p-4 rounded-lg">
          <div class="col-span-6">
            <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.totalCashDeposit')}}</h5>
            <h3 class="font-medium text-base text-gray-700">{{ dataRegister.totals.total_cash}}</h3>
          </div>
          <div class="col-span-6">
            <h5 class="font-normal text-xs text-gray-500">{{$t('pos-registers.totalCashWithdrawal')}}</h5>
            <h3 class="font-medium text-base text-gray-700">{{ dataRegister.totals.total_withdrawals}}</h3>
          </div>
        </div>
        <div class="p-8 pt-6">
          <div class="border border-gray-200 rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead>
              <tr class="bg-gray-100 border-b">
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium rounded-tl-lg">{{$t('pos-registers.recordedBy')}}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium">{{$t('pos-registers.recordedAt')}}</th>
                <th scope="col" class="px-4 py-3 text-gray-700 font-medium rounded-tr-lg">{{$t('pos-registers.recordedAmount')}}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="record in dataRegister.cashRecordings"
                  class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                <td class="py-3 px-4"> {{record.recorded_by}}</td>
                <td class="py-3 px-4">{{record.recorded_at}}</td>
                <td class="py-3 px-4">{{record.amount}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Dialog :open="isInvoicePrint" @close="isCloseInvoicePrint">
    <Dialog.Panel class="md:w-[600px] overflow-y-auto h-[600px]">
      <div class="p-8">
        <div class="text-center border-dashed border-b border-gray-500 pb-4">
          <h1 class="text-base font-medium text-gray-600 mb-1">{{$t('pos-registers.saleInvoice')}}</h1>
          <h2 class="text-base font-medium text-gray-600 mb-1">{{$t('pos-registers.invoiceNumber')}}: <span class="text-gray-400">234433</span></h2>
          <h3 class="text-base font-medium text-gray-600">{{$t('pos-registers.emporiumMall')}}</h3>
        </div>
        <div class="py-6 border-dashed border-b border-gray-500">
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{$t('pos-registers.date')}}: <span class="text-gray-400">12/10/2024</span></h4>
          <h4 class="text-sm font-medium text-gray-600 mb-2">{{$t('pos-registers.sellerVatNumber')}}: <span class="text-gray-400">234342453</span></h4>
          <h4 class="text-sm font-medium text-gray-600">{{$t('pos-registers.customer')}}: <span class="text-gray-400">Sabir</span></h4>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead>
            <tr class="">
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium rounded-tl-lg">{{$t('pos-registers.productName')}}</th>
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium">{{$t('pos-registers.qty')}}</th>
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium rounded-tr-lg">{{$t('pos-registers.disc')}}</th>
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium rounded-tr-lg">{{$t('pos-registers.price')}} ({{$t('pos-registers.vatExcl')}})</th>
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium rounded-tr-lg">{{$t('pos-registers.vat')}}</th>
              <th scope="col" class="px-2 text-sm py-3 text-gray-700 font-medium rounded-tr-lg">{{$t('pos-registers.totalPrice')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr class="">
              <td class="py-3 px-2">عصير</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">12 %</td>
              <td class="py-3 px-2">32</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">42</td>
            </tr>
            <tr class="">
              <td class="py-3 px-2">عصير</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">12 %</td>
              <td class="py-3 px-2">32</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">42</td>
            </tr>
            <tr class="">
              <td class="py-3 px-2">عصير</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">12 %</td>
              <td class="py-3 px-2">32</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">42</td>
            </tr>
            <tr class="">
              <td class="py-3 px-2">عصير</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">12 %</td>
              <td class="py-3 px-2">32</td>
              <td class="py-3 px-2">2</td>
              <td class="py-3 px-2">42</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="py-4 border-dashed border-b border-gray-500">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{$t('pos-registers.total')}} ({{$t('pos-registers.vatExcl')}})</h4>
            <h4 class="text-gray-600">2</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{$t('pos-registers.vat')}}</h4>
            <h4 class="text-gray-600">15 %</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{$t('pos-registers.additionalDiscount')}}</h4>
            <h4 class="text-gray-600">42 ريال سعودي</h4>
          </div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-gray-800 font-medium">{{$t('pos-registers.grandTotal')}}</h4>
            <h4 class="text-gray-600">8,00</h4>
          </div>
        </div>
        <div class="py-4">
          <h4 class="text-gray-600 font-medium">{{$t('pos-registers.scanToGetInfo')}}</h4>
          <div class="flex items-center justify-center">
            <!-- <img src="../../../src/assets/images/bar.svg"> -->
          </div>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>

  <Notification id="success-notification-content" class="flex hidden">
    <Lucide icon="CheckCircle" class="text-success" />
    <div class="ml-4 mr-4">
      <div class="font-medium">{{$t('pos-registers.categoryCreatedSuccess')}}</div>
      <div class="mt-1 text-slate-500">
        {{$t('pos-registers.checkCategoryListing')}}
      </div>
    </div>
  </Notification>
</template>
<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 1px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked+.slider {
  background-color: #F96F01;
}

input:focus+.slider {
  box-shadow: 0 0 1px #F96F01;
}

input:checked+.slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
