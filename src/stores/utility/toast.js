import { defineStore } from 'pinia'
export const toast = defineStore({
    id: 'toast',
    state: () => ({
        types: [
            "success",
            "danger",
            "warning",
            "info"
        ],
        logs: [],
    }),
    getters: {
        _logs(state) {
            return state.logs;
        },
        current(state) {
            
            return state.logs[state.logs.length - 1];   
        }
    },
    actions: {
        fry(toast) {
            this.logs.push(toast);
        },
    }
})
export default toast;