<script setup lang="ts">
import httpClient from "@/network/api/httpClient";
import { onMounted, ref, watch } from "vue";
import { handleResponse, handleError } from "@/network/api/responseHandler";
import Lucide from "@/components/Base/Lucide";
import NotFoundIcon from "@/assets/images/notFoundIcon.svg";
import Button from "@/components/Base/Button";
import { useAuthStore } from "@/stores/auth.js";

const props = defineProps({
  start_date: {
    type: String,
    required: true,
  },
  end_date: {
    type: String,
    required: true,
  },
});

const authStore = useAuthStore();
const USER_ID = authStore.getUserId;

const heatmapData = ref<any>(null);
const selectedTab = ref("hour");
const series = ref<any[]>([]);
const isLoading = ref(false);

// Transform API heatmap data into the format required by ApexCharts
const transformData = (data: Record<string, number[]>) => {
  return Object.entries(data).map(([day, values]) => ({
    name: day,
    data: values.map((value, index) => ({
      x: `${index}:00`, // Format the hour label (e.g. "0:00", "1:00", etc.)
      y: value,
    })),
  }));
};

const updateHeatmapData = (data: any) => {
  if (!data?.heatmap) return;
  heatmapData.value = data.heatmap;
  series.value = transformData(data.heatmap);
};

const fetchHeatmapData = async (tab = "hour") => {
  try {
    isLoading.value = true;
    const response = await httpClient.get(
      `${import.meta.env.VITE_PUBLIC_API_URL_POS}/v1/dashboard/sales-chart`,
      {
        params: {
          user_id: USER_ID,
          start_date: props.start_date,
          end_date: props.end_date,
          interval: tab,
        },
      }
    );
    const result = handleResponse(response);
    if (result.success) {
      updateHeatmapData(result.data);
      selectedTab.value = tab;
    }
  } catch (error) {
    handleError(error);
  } finally {
    isLoading.value = false;
  }
};

watch([() => props.start_date, () => props.end_date], () => {
  fetchHeatmapData();
});

onMounted(() => {
  fetchHeatmapData();
});

// ApexCharts heatmap options
const options = ref({
  chart: {
    id: "heatmapChart",
    height: 450,
    type: "heatmap",
    fontFamily: "Public Sans, sans-serif",
    // Disable hover filter to prevent background color change on hover
    states: {
      hover: {
        filter: {
          type: "none"
        }
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  // This color array is ignored in favor of the colorScale for heatmaps
  colors: ["#169B62"],
  title: {
    // text: "Hourly Heatmap Data",
    align: "left",
    style: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#333"
    }
  },
  xaxis: {
    labels: {
      style: {
        fontSize: "12px",
        fontWeight: 400,
        colors: ["#989898"]
      }
    }
    // Optionally add a title here
    // title: { text: "Hour of Day" }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: "13px",
        fontWeight: 400,
        colors: ["#989898"]
      }
    }
    // Optionally add a title here
    // title: { text: "Days of the Week" }
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          // Change the "None" range from fully transparent to a desired default color if needed.
          // { from: -1, to: 0, color: "rgba(249, 111, 1, 0)", name: "None" },
          // { from: 1, to: 10, color: "rgba(249, 111, 1, 0.1)", name: "Very Low" },
          // { from: 11, to: 30, color: "rgba(249, 111, 1, 0.4)", name: "Low" },
          // { from: 31, to: 50, color: "rgba(249, 111, 1, 0.6)", name: "Medium" },
          // { from: 51, to: 70, color: "rgba(249, 111, 1, 0.8)", name: "High" },
          // { from: 71, to: 100, color: "rgba(249, 111, 1, 1)", name: "Very High" }
          // {  color: "rgba(249, 111, 1, 0)", name: "None" },
          {   color: "#fffcf9", name: "Very Low" },
          {    color: "#fff1e4", name: "Low" },
          {   color: "#fee2cc", name: "Medium" },
          {   color: "#fcb780", name: "High" },
          {   color: "#f88324", name: "Very High" },
        ]
      }
    }
  }
});

</script>

<template>
  <div class="p-5 box h-full">
    <div class="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h4 class="text-lg font-semibold text-gray-800">
          {{ $t('dashboard.peakSaleHours') }}
        </h4>
      </div>
      <div class="tabs bg-[#F8F8FF] rounded-lg">
        <button
          v-for="tab in ['hour', 'day', 'month']"
          :key="tab"
          :class="{ 'active-tab': selectedTab === tab }"
          @click="fetchHeatmapData(tab)"
        >
          {{ $t(`dashboard.tabs.${tab}`) }}
        </button>
      </div>
    </div>
    <div v-if="isLoading">
      <div class="animate-pulse bg-slate-200 w-full h-56 rounded-lg"></div>
    </div>
    <div v-else-if="heatmapData && Object.keys(heatmapData).length > 0">
      <apexchart
        id="heatmapChart"
        width="100%"
        height="450"
        type="heatmap"
        :options="options"
        :series="series"
      />
    </div>
    <div v-else>
      <img :src="NotFoundIcon" class="w-[160px] mx-auto" />
      <h3 class="text-xl font-semibold text-gray-400 pt-5 text-center">
        {{ $t('dashboard.noDataAvailable') }}
      </h3>
      <p class="text-base text-gray-400 font-normal pb-4 text-center">
        {{ $t('dashboard.noDataDescription') }}
      </p>
      <div class="flex justify-center">
        <Button
          variant="outline-secondary"
          class="flex items-center hov-end hover:text-gray-700 justify-center mx-auto w-40 py-2"
          @click="fetchHeatmapData()"
        >
          <Lucide
            icon="RefreshCcwIcon"
            class="w-4 h-4 text-gray-700 mr-2"
          />{{ $t('dashboard.refreshNow') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

button {
  margin: 6px 6px;
  padding: 7px 18px;
  cursor: pointer;
  border-radius: 10px !important;
  font-weight: 400;
  font-size: 14px;
  text-transform: capitalize;
}

button.active-tab {
  background-color: #169B62;
  color: #fff;
}

.hov-end:hover {
  color: #738192 !important;
}

button:hover {
  background-color: #169B62;
  color: #fff;
}
</style>
