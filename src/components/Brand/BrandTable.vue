<template>
  <vue3-datatable ref="datatable" :columns="cols"
  :rows="data"
          :loading="isloading"
          :totalRows="totalRows"
          :isServerMode="true"
          :pageSize="params.limit"
          :sortable="true"
          :sort="params.sort"
          :sortDirection="params.sort_direction"
          :search="params.search"
          @change="changeServer"  >
    <template #is_active="data">
      <div class="flex w-[80px]" id="fix"><label class="switch" @click="$emit('toggleActive', data.value)"> <input
          type="checkbox" :checked="data.value.is_active"> <span class="slider round"></span> </label></div>
    </template>
    <template #actions="data">
      <div class="flex gap-2.5">
        <a href="#" v-if="ability.can('delete', 'brand')" class="bg-red-100 p-2 rounded-md"
                                   @click="$emit('deleteUser', data.value.id)">
        <Lucide icon="Trash2" class="w-4 h-4 text-[#cf2c47]"/>
      </a> <a href="#" v-if="ability.can('edit', 'brand')" class="bg-blue-100 p-2 rounded-md cursor-pointer" @click="$emit('editUser', data.value)">
        <Lucide icon="PencilLine" class="w-4 h-4 text-blue-500"/>
      </a></div>
    </template>
  </vue3-datatable>
   
</template>

<script setup lang="ts">
import {ref} from "vue";
import Lucide from "../../components/Base/Lucide";
import Vue3Datatable from '@bhplugin/vue3-datatable';
import '@bhplugin/vue3-datatable/dist/style.css'
import {useAbility} from "@casl/vue";
import {useI18n} from "vue-i18n";

const rows = ref([]);
const {t} = useI18n();

const cols = ref([
  {field: 'name', title: t('brand.name')}, // Ensure this matches your data keys
  {field: 'product_count', title: t('brand.linkedProducts')},
  {field: 'is_active', title: t('brand.status'), sort: false},
  {field: 'actions', title: t('brand.actions'), sort: false},
]);
const ability = useAbility();

const props = defineProps({
  isloading: Boolean,
  totalRows: Number,
  params: Object,
  changeServer: Function,
  data: {
    type: Array,
    required: true,
  },
});
 
</script>

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

input:checked + .slider {
  background-color: #F96F01;
}

input:focus + .slider {
  box-shadow: 0 0 1px #F96F01;
}

input:checked + .slider:before {
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