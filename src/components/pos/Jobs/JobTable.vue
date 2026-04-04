<template>
  <vue3-datatable
    ref="datatable"
    :rows="data"
    :columns="cols"
    :loading="loading"
    :totalRows="total_rows"
    :isServerMode="true"
    :pageSize="params.limit"
    :sortable="true"
    :sort="params.sort"
    :sortDirection="params.sort_direction"
    :search="params.search"
    @change="changeServer"
  >
    <template #assigned_at="slot">
      {{ formatDate(slot.value.assigned_at) }}
    </template>
    <template #status="slot">
      <span :class="['inline-flex items-center px-2 py-1 rounded text-xs font-medium', statusClass(slot.value.status)]">
        {{ slot.value.status || 'N/A' }}
      </span>
    </template>
    <template #actions="data">
      <div class="flex gap-2.5">
        <a
          v-if="ability.can('update', 'jobs')"
          href="#"
          class="bg-blue-100 p-2 rounded-md cursor-pointer"
          @click="$emit('editJob', data.value)"
        >
          <Lucide icon="Eye" class="w-4 h-4 text-blue-500"/>
        </a>
      </div>
    </template>
  </vue3-datatable>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Lucide from "../../../components/Base/Lucide";
import Vue3Datatable from "@bhplugin/vue3-datatable";
import "@bhplugin/vue3-datatable/dist/style.css";
import { useAbility } from "@casl/vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const rows = ref([]);
const cols = ref([
  { field: "service_name_en", title: t("jobs.title") },
  { field: "customer_name", title: t("jobs.customer") },
  { field: "status", title: t("jobs.status"), display: "template" },
  { field: "assigned_at", title: t("jobs.assignedAt"), display: "template" },
  { field: "sale_price", title: t("jobs.salePrice") },
  { field: "actions", title: t("jobs.actions"), sort: false },
]);

defineProps({
  loading: Boolean,
  total_rows: Number,
  params: Object,
  changeServer: Function,
  data: {
    type: Array,
    required: true,
  },
});

const ability = useAbility();

const statusClass = (status: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "pending") return "bg-yellow-100 text-yellow-700";
  if (normalized === "completed") return "bg-green-100 text-green-700";
  if (normalized === "cancelled" || normalized === "canceled") return "bg-red-100 text-red-700";
  if (normalized === "in-progress" || normalized === "started") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
};

const formatDate = (value: string) => {
  if (!value) return "N/A";
  const [date, time] = value.split(" ");
  if (!time) return value;
  const parts = time.split(":");
  if (parts.length >= 2) {
    return `${date} ${parts[0]}:${parts[1]}`;
  }
  return value;
};
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

