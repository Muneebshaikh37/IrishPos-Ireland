<template>
  <div class="flex items-center mt-8 pt-14 intro-y box p-8">
    <div class="min-h-screen px-5">
      <h2 class="text-lg font-semibold mb-4">{{ registerDetails.name }}</h2>
      <div class="max-w-4xl mx-auto rounded-lg">
        <div class="bg-[#fff2e8] px-10 pt-10 pb-5 rounded-md">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- Closing Balance Field -->
            <div>
              <label for="closingBalance" class="block text-gray-700 font-medium mb-2">
                {{$t('pos-registers.closingBalance')}} <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-primary/10 rounded-lg">
                <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#F96F01] font-semibold bg-white">SR</span>
                <FormInput
                    type="number"
                    id="closingBalance"
                    v-model.number="closingBalance"
                    class="w-full px-4 py-2 border rounded-lg bg-white"
                />
              </div>
            </div>

            <!-- Expected Amount Field -->
            <div>
              <label for="expectedAmount" class="block text-gray-700 font-medium mb-2">
                {{$t('pos-registers.expectedAmount')}} <span class="text-red-500">*</span>
              </label>
              <div class="relative bg-primary/10 rounded-lg">
                <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#F96F01] font-semibold bg-white">SR</span>
                <FormInput
                    type="number"
                    id="expectedAmount"
                    v-model.number="registerDetails.totals.expected_cash"
                    class="w-full px-4 py-2 border rounded-lg bg-white"
                    disabled
                />
              </div>
            </div>

            <!-- Close Register Button -->
            <div class="col-span-2 flex justify-center mt-4">
              <Button variant="primary"
                      class="bg-primary w-[250px] hover:bg-primary/90 text-white font-semibold px-4 py-3 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="closeRegister">
                <template v-if="isLoading">
                  <LoadingIcon icon="three-dots" class="w-8 h-6 text-white"/>
                </template>
                <template v-else>
                  {{$t('pos-registers.closeRegister')}}
                </template>
              </Button>
            </div>
          </div>
        </div>

        <!-- Denominations Table -->
        <div class="mt-8 border border-gray-200 rounded-lg">
          <table class="w-full text-left border border-gray-200 rounded-lg overflow-hidden mb-6">
            <thead>
            <tr class="bg-gray-100 border-b">
              <th class="py-3 px-4 text-gray-700 font-medium">{{$t('pos-registers.notes')}}</th>
              <th class="py-3 px-4 text-gray-700 font-medium">{{$t('pos-registers.count')}}</th>
              <th class="py-3 px-4 text-gray-700 font-medium">{{$t('pos-registers.coins')}}</th>
              <th class="py-3 px-4 text-gray-700 font-medium">{{$t('pos-registers.count')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(note, index) in Math.max(notes.length, coins.length)" :key="'denomination-' + index" class="">
              <td class="py-3 px-4">{{ notes[index]?.value ?? '' }} SR</td>
              <td class="py-3 px-4">
                <FormInput
                    v-if="index < notes.length"
                    type="number"
                    v-model.number="notes[index].count"
                    min="0"
                    class="w-full px-4 py-2 border rounded-lg"
                    @input="updateClosingBalance"
                />
              </td>
              <td class="py-3 px-4">{{ coins[index]?.value ?? '' }}</td>
              <td class="py-3 px-4">
                <FormInput
                    v-if="index < coins.length"
                    type="number"
                    v-model.number="coins[index].count"
                    min="0"
                    class="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    @input="updateClosingBalance"
                />
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from "vue";
import { useRouter } from "vue-router"
import { useFormUtils } from "@/pages/Pos/__helpers/formUtils.js";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import httpClient from "@/network/api/httpClient";
import { handleResponse, handleError } from "@/network/api/responseHandler.js";
import LoadingIcon from "@/components/Base/LoadingIcon";




const props = defineProps({
  registerDetails: {
    type: Object,
    required: true,
  },
});

const { totals } = toRefs(props.registerDetails);
const router = useRouter();
const closingBalance = ref(null);
const errors = ref({});

const {
  notes,
  coins,
  updateClosingBalance // Use this instead of updateOpeningAmount
} = useFormUtils();

const totalNotes = ref(0);
const totalCoins = ref(0);

// Ensure notes and coins are initialized as arrays
notes.value = Array.isArray(notes.value) ? notes.value : [];
coins.value = Array.isArray(coins.value) ? coins.value : [];

// Watch the closing balance and update when currency table changes
watch([notes, coins], () => {
  totalNotes.value = Array.isArray(notes.value) ? notes.value.reduce((total, note) => total + (note.value * note.count), 0) : 0;
  totalCoins.value = Array.isArray(coins.value) ? coins.value.reduce((total, coin) => total + (coin.value * coin.count), 0) : 0;
  closingBalance.value = totalNotes.value + totalCoins.value;
}, { deep: true });


const isLoading = ref(false)
const closeRegister = async () => {

  isLoading.value = true
  try {
    const payload = {
      closing_balance: closingBalance.value,
      register_id: props.registerDetails.id,
    };
    const response = await httpClient.post(`${import.meta.env.VITE_PUBLIC_API_URL_POS}/registers/${props.registerDetails.id}/close`, payload);
    const result = handleResponse(response);
    if (result.success) {
      router.push({ path: "/pos/register" });
    } else {
      console.error(result.message);
      alert(result.message);
    }
  } catch (error) {
    const result = handleError(error);
    if (result.status === 422) {
      errors.value = result.errors;
    } else {
      alert(result.message);
    }
  }finally {
    isLoading.value = false;
  }
};
</script>
