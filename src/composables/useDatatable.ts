import { ref, reactive } from "vue";
import httpClient from '@/network/api/httpClient';

export function useDatatable(apiUrl: string, additionalParams = {}) {
    const loading = ref(false);
    const totalRows = ref(0);
    const rows = ref([]);
    const params = reactive({
        page: 1,
        limit: 10,
        search: "",
        sort: "",
        sort_direction: "desc",
        paginate: true,
        column_filters: [],
        ...additionalParams,
    });

    let controller: AbortController | null = null;
    let timer: NodeJS.Timeout | null = null;

    const fetchData = async () => {
        try {
            if (controller) {
                controller.abort();
            }
            controller = new AbortController();
            const signal = controller.signal;
            loading.value = true;

            const response = await httpClient.get(apiUrl, {
                params: params,
                signal,
            });
            const result = response.data;

            rows.value = Array.isArray(result?.data) ? result.data : [];
            totalRows.value = result?.meta?.total ?? result?.total ?? 0;
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            loading.value = false;
        }
    };

    const changeServer = (data: any) => {
        params.page = data.current_page;
        params.limit = data.pagesize;
        params.sort = data.sort_direction === "desc" ? `-${data.sort_column}` : `${data.sort_column}`;
        params.sort_direction = data.sort_direction;
        params.search = data.search;

        if (data.change_type === "search") {
            if (timer) clearTimeout(timer);
            timer = setTimeout(fetchData, 300);
        } else {
            fetchData();
        }
    };

    return { rows, totalRows, loading, params, fetchData, changeServer };
}
