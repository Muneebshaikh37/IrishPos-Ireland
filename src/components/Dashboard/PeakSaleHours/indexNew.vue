<script setup lang="ts">
import { ref, onMounted } from 'vue';

// API Response
const apiResponse = {
  "heatmap": {
    "Sunday": [5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Monday": [0, 0, 0, 0, 0, 0, 0, 0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 55, 50, 45, 40, 35],
    "Tuesday": [0, 0, 0, 0, 0, 0, 0, 0, 12, 18, 22, 28, 32, 38, 42, 48, 52, 58, 62, 58, 52, 48, 42, 38],
    "Wednesday": [0, 0, 0, 0, 0, 0, 0, 0, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 44, 40, 36, 32, 28],
    "Thursday": [0, 0, 0, 0, 0, 0, 0, 0, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 60, 55, 50, 45, 40],
    "Friday": [0, 0, 0, 0, 0, 0, 0, 0, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 65, 60, 55, 50, 45],
    "Saturday": [10, 8, 6, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
};

// Function to transform API data into chart format
const transformData = (data: Record<string, number[]>) => {
  return Object.entries(data).map(([day, values]) => ({
    name: day,
    data: values.map((value, index) => ({
      x: `${index}:00`, // Hourly format
      y: value
    }))
  }));
};

// Reactive heatmap series
const series = ref([]);

// Load and process API data on mount
onMounted(() => {
  series.value = transformData(apiResponse.heatmap);
});

// Heatmap chart options
const options = ref({
  chart: {
    height: 450,
    type: 'heatmap',
    fontFamily: 'Public Sans, sans-serif',
  },
  dataLabels: {
    enabled: false
  },
  colors: ["#169B62"],
  title: {
    text: 'Hourly Heatmap Data',
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
    },
  },
  xaxis: {
    labels: {
      style: {
        fontSize: '12px',
        fontWeight: 400,
        colors: ["#989898"]
      }
    },
    title: {
      text: "Hour of Day"
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: ["#989898"]
      }
    },
    title: {
      text: "Days of the Week"
    }
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 10, color: "#00A100", name: "Very Low" },
          { from: 11, to: 30, color: "#7FFF00", name: "Low" },
          { from: 31, to: 50, color: "#FFD700", name: "Medium" },
          { from: 51, to: 70, color: "#FF4500", name: "High" },
          { from: 71, to: 100, color: "#FF0000", name: "Very High" },
        ],
      },
    },
  },
});
</script>

<template>
  <apexchart width="100%" height="450" type="heatmap" :options="options" :series="series" />
</template>
