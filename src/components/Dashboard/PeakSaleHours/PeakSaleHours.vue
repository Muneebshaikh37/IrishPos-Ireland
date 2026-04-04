<script setup  lang="ts">



const dummyData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    series: [
        {
            name: "Sales",
            data: [10, 20, 15, 90, 200, 35, 40, 100, 50, 55, 60, 160],
        }
    ]
};

// Use dummy data if no props are provided
const labels =   dummyData.labels;
const series =   dummyData.series;

const  options = { 
    chart: {
        toolbar: {
            show: false
        },
        height: 450,
        type: 'line',
FontFamily: 'Public Sans, sans-serif',
        zoom: {
            enabled: false,
        },
    },
    forecastDataPoints: {
        count: 0
    },
    markers: {
        size: [6],
    },
    stroke: {
        width: 3,
        curve: 'straight',
        toolbar: {
            show: true,
        }
    },
    colors: ['#169B62', '#b2b2b2'],
    fill: {
        type: 'solid',
        opacity: '0.85',
        gradient: {
            shade: 'dark',
            type: "vertical",
            invertColors: 'true',
            shadeIntensity: '0.5',
            opacityFrom: '1.0',
            opacityTo: '1.0',
            stops: [0, 100]
        }
    },
    grid: {
        padding: {
            top: 30,
            bottom: 30,
            left: 30,
            right: 30,
        },
        show: true,
        borderColor: '#f4f4f4',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
            lines: {
                show: false
            }
        },
        yaxis: {
            lines: {
                show: true
            }
        },
        row: {
            colors: undefined,
            opacity: 0.5,
        },
        column: {
            colors: undefined,
            opacity: 0.5,
        },
    },
    legend: {
        show: false,
        showForSingleSeries: true,
        showForNullSeries: true,
        showForZeroSeries: true,
        position: 'bottom',
        horizontalAlign: 'center', 
        floating: false,
FontFamily: 'Public Sans, sans-serif',
        fontSize: '16px',
        colors: ["#000"],
        fontWeight: 400,
        formatter: undefined,
        inverseOrder: false,
        width: undefined,
        height: undefined,
        tooltipHoverFormatter: undefined,
        customLegendItems: [],
        offsetX: 0,
        offsetY: 0,
        itemMargin: {
            horizontal: 0,
            vertical: 0,
          },
        labels: {
            colors: undefined,
            useSeriesColors: false
        },
        markers: {
            width: 12,
            height: 12,
            strokeWidth: 0,
            strokeColor: '#fff',
            fillColors: undefined,
            radius: 12,
            customHTML: undefined,
            onClick: undefined,
            offsetX: 0,
            offsetY: 0
        },
        itemMargin: {
            horizontal: 5,
            vertical: 0
        },
        onItemClick: {
            toggleDataSeries: true
        },
        onItemHover: {
            highlightDataSeries: true
        },
    },
    plotOptions: {
        bar: {
            borderRadius: 6,
            columnWidth: '80%',
            dataLabels: {
                position: 'top',
            },
        }
    },
    dataLabels: {
        enabled: false,
        formatter: function(val) {
            return '$' + val;
        },
        offsetY: 10,
        style: {
            fontSize: '11px',
            colors: ["#169B62"],
        },
        background: {
            borderRadius: '3',
            padding: '5',
            borderWidth: '0',
        },
    },
    tooltip: {
        enabled: true,
        marker: {
            show: false,
          },
        shared: false,
        intersect: false,
        x: {
            show: false,
            formatter: undefined,
        },
        y: {
            formatter: function(value) {
                return '$' + value;
            },
        },
    },
    xaxis: {
        categories: ["10:00", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        style: {
    FontFamily: 'Public Sans, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
        },
        labels: {
            style: {
                colors: ["#989898","#989898","#989898","#989898","#989898","#989898","#989898","#989898","#989898","#989898","#989898","#989898",],
            }
        },
        position: 'bottom',
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        crosshairs: {
            fill: {
                type: 'gradient',
                gradient: {
                    colorFrom: '#D8E3F0',
                    colorTo: '#BED1E6',
                    stops: [0, 100],
                    opacityFrom: 0.4,
                    opacityTo: 0.5,
                }
            }
        },
    },
    yaxis: {
        type: 'numeric',
        tickAmount: 3,
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false,
        },
        labels: {
            show: true,
            style: {
        FontFamily: 'Public Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 400,
                colors: ["#989898"],
            },
            formatter: function(val) {
                return "$" + val;
            }
        }

    },
};
</script>
<template>
    <apexchart width="100%" height="450" type="line" :options="options" :series="series" />
</template>