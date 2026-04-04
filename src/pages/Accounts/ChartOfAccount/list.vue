<script setup>
import { ref, onMounted } from 'vue';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import Lucide from "../../../components/Base/Lucide";
import Button from "../../../components/Base/Button";
import { RouterLink } from "vue-router";
import httpClient from '@/network/api/httpClient';
import { FormInput } from "../../../components/Base/Form";
import { Dialog } from "../../../components/Base/Headless";
import LoadingIcon from "../../../components/Base/LoadingIcon";
import Toastify from "toastify-js";
import Notification from "../../../components/Base/Notification";
import { useAbility } from "@casl/vue";
import { useAuthStore } from "@/stores/auth.js"; 
const authStore = useAuthStore();
  const USER_ID = authStore.getUserId;
const expandedKeys = ref({});
const ability = useAbility();
// Add cache for storing tab data
const tabDataCache = ref(new Map());

// Remove hardcoded tabs and create dynamic tabs
const tabs = ref([
	{ label: 'All Accounts', id: null },
	{ label: 'Archived', id: 'archived' }
]);
const activeTab = ref(tabs.value[0]);
const loading = ref(false);
 

const accounts = ref([]);

// Add delete modal state
const deleteConfirmationModal = ref(false);
const accountToDelete = ref(null);
const isDeleting = ref(false);

// Add restore modal state
const restoreConfirmationModal = ref(false);
const accountToRestore = ref(null);
const isRestoring = ref(false);

// Function to transform API data to TreeTable format
function transformData(data) {
	if (!Array.isArray(data)) {
		return [];
	}
	return data.map((item, index) => ({
		key: item.id,
		data: {
			name: ` ${item.name}`,
			type: item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : '',
			balance: item.balance ?? 0,
			is_system: item.is_system,
			code: item.code || '', // Ensure code is included
			is_deleted: item.is_deleted,
		},
		children: item.children ? transformData(item.children) : []
	}));
}

// Function to update tabs based on accounts
function updateTabs(accountsData) {
	// Create tabs from the top-level accounts
	tabs.value = [
		{ label: 'All Accounts', id: null },
		...accountsData.map(account => ({
			label: account.name.trim(),
			id: account.id
		}))
	];
	// Set default active tab
	activeTab.value = tabs.value[0];
}

async function fetchAccounts(tab) {
	// Check if data exists in cache
	const cacheKey = tab?.id || 'all';
	if (tabDataCache.value.has(cacheKey)) {
		accounts.value = tabDataCache.value.get(cacheKey);
		return;
	}

	loading.value = true;
	let url = `${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts?user_id=${USER_ID}`;

	if (tab?.id === 'archived') {
		url += '&is_deleted=true';
	} else if (tab?.id) {
		url += `&account_id=${tab.id}`;
	}

	try {
		const res = await httpClient.get(url);
		const body = res.data;
		const raw = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
		const transformedData = transformData(raw);
		accounts.value = transformedData;

		// Store in cache
		tabDataCache.value.set(cacheKey, transformedData);

		// Update tabs only on initial load (when fetching all accounts)
		if (!tab?.id) {
			const dynamicTabs = raw.map(account => ({
				label: account.name.trim(),
				id: account.id
			}));
			// Keep the Archived tab while updating other tabs
			tabs.value = [
				{ label: 'All Accounts', id: null },
				...dynamicTabs,
				{ label: 'Archived', id: 'archived' }
			];
		}
	} catch (e) {
		accounts.value = [];
		tabs.value = [
			{ label: 'All Accounts', id: null },
			{ label: 'Archived', id: 'archived' }
		];
		console.error('Error fetching accounts:', e);
	}
	loading.value = false;
}

function handleTabClick(tab) {
	activeTab.value = tab;
	fetchAccounts(tab);
}

// Function to clear cache if needed (e.g., when data needs to be refreshed)
function clearCache() {
	tabDataCache.value.clear();
}

// Add delete functions
const openDeleteModal = (accountId) => {
	accountToDelete.value = accountId;
	deleteConfirmationModal.value = true;
};

const closeDeleteModal = () => {
	deleteConfirmationModal.value = false;
	accountToDelete.value = null;
};

const confirmDelete = async () => {
	if (!accountToDelete.value) return;

	try {
		isDeleting.value = true;
		const response = await httpClient.delete(`${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/${accountToDelete.value}?user_id=${USER_ID}`);
		console.log("adfdafad", response);
		tabDataCache.value.clear();
		fetchAccounts(null);

		closeDeleteModal();

		// Refresh the accounts list


	} catch (error) {
		console.error("Error deleting account:", error);
		// Show error notification

	} finally {
		deleteConfirmationModal.value = false;
		isDeleting.value = false;
	}
};

// Add restore functions
const openRestoreModal = (accountId) => {
	accountToRestore.value = accountId;
	restoreConfirmationModal.value = true;
};

const closeRestoreModal = () => {
	restoreConfirmationModal.value = false;
	accountToRestore.value = null;
};

const confirmRestore = async () => {
	if (!accountToRestore.value) return;

	try {
		isRestoring.value = true;
		await httpClient.post(`${import.meta.env.VITE_ACCOUNTING_API}/chart-of-accounts/${accountToRestore.value}/restore?user_id=${USER_ID}`);
		tabDataCache.value.clear();
		// Switch to All Accounts tab
		activeTab.value = tabs.value[0]; // tabs.value[0] is the "All Accounts" tab
		fetchAccounts(activeTab.value);
		closeRestoreModal();
		
		// Show success notification
		Toastify({
			node: document.getElementById("success-notification-content"),
			duration: 3000,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
		}).showToast();
	} catch (error) {
		console.error("Error restoring account:", error);
		// Show error notification
		Toastify({
			node: document.getElementById("error-notification-content"),
			duration: 3000,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
		}).showToast();
	} finally {
		isRestoring.value = false;
	}
};

onMounted(() => {
	fetchAccounts(null);
});
</script>


<template>
	<h2 class="mt-10 text-xl font-semibold intro-y">{{ $t('account.ChartOfAccounts') }}</h2>
	<div class="grid grid-cols-12 gap-6 mt-5 intro-y box p-8 coa-style">

		<div class="col-span-12 flex justify-between intro-y">
			<div>
				<RouterLink to="/account/chart-of-accounts/create">
					<Button variant="primary" class="mr-2 shadow-md">
						{{ $t('account.NewAccount') }}
					</Button>
				</RouterLink>
			</div>
			<div class="flex items-center mt-3 sm:mt-0" :class="{ 'mr-auto': locale === 'ar', 'ml-auto': locale !== 'ar' }">
				<div class="relative w-56 text-slate-500 " :class="{ 'ml-3': locale === 'ar', 'mr-3': locale !== 'ar' }">
					<FormInput type="text" class="w-56 pr-10 !box" :placeholder="$t('account.Search')" />
					<Lucide icon="Search" class="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
				</div>
			</div>
		</div>

		<div class="col-span-12">
			<div class="flex space-x-6 border-b mb-8 mt-4">
				<div v-for="tab in tabs" :key="tab.label" @click="handleTabClick(tab)" :class="[
					'cursor-pointer pb-2 text-base font-medium',
					activeTab?.label === tab.label ? 'text-primary font-semibold border-b-2 border-primary' : 'text-gray-400 '
				]">
					{{ tab.label === 'All Accounts' ? $t('account.AllAccounts') : 
					   tab.label === 'Archived' ? $t('account.Archived') : tab.label }}
				</div>
			</div>

			<!-- Loading Skeleton -->
			<div v-if="loading" class="animate-pulse">
				<div class="bg-[#f6f7fa] p-4 mb-2 rounded">
					<div class="flex items-center">
						<div class="w-4 h-4 bg-gray-200 rounded mr-4"></div>
						<div class="h-4 bg-gray-200 rounded w-1/4"></div>
						<div class="h-4 bg-gray-200 rounded w-1/6 ml-8"></div>
						<div class="h-4 bg-gray-200 rounded w-1/6 ml-8"></div>
						<div class="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
					</div>
				</div>
				<div v-for="i in 5" :key="i" class="bg-white p-4 mb-2 rounded">
					<div class="flex items-center">
						<div class="w-4 h-4 bg-gray-200 rounded mr-4"></div>
						<div class="h-4 bg-gray-200 rounded w-1/3"></div>
						<div class="h-4 bg-gray-200 rounded w-1/6 ml-8"></div>
						<div class="h-4 bg-gray-200 rounded w-1/6 ml-8"></div>
						<div class="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
					</div>
				</div>
			</div>

			<!-- No Data Message -->
			<div v-else-if="!accounts.length" class="text-center py-8">
				<Lucide icon="Database" class="w-16 h-16 mx-auto text-gray-400" />
				<div class="mt-4 text-xl text-gray-600">{{ $t('account.NoAvailableData') }}</div>
				<div class="mt-2 text-gray-500">{{ $t('account.NoAccountsToDisplay') }}</div>
			</div>

			<!-- TreeTable -->
			<TreeTable v-else :value="accounts" :expandedKeys="expandedKeys" @update:expandedKeys="val => expandedKeys = val"
				:tableStyle="{ minWidth: '60rem' }">
				<Column field="name" :header="$t('account.accountName')" class="p-treetable-header" expander>
					<template #body="slotProps">
						<span>{{ slotProps.node.data.name }} - {{ slotProps.node.data.code }}</span>
					</template>
				</Column>
				<Column field="type" :header="$t('account.AccountType')" class="p-treetable-header">
					<template #body="slotProps">
						<span>{{ slotProps.node.data.type }}</span>
					</template>
				</Column>
				<Column field="balance" :header="$t('account.AccountBalance')" class="p-treetable-header">
					<template #body="slotProps">
						<span :class="{ 'text-red-500': slotProps.node.data.balance < 0 }">
							{{ slotProps.node.data.balance.toFixed(2) }}
						</span>
					</template>
				</Column>
				<Column :header="$t('account.Actions')" class="p-treetable-header">
					<template #body="slotProps">
						<div class="flex gap-2.5">
							<template v-if="!slotProps.node.data.is_system">
								<a href="#" class="bg-red-100 p-2 rounded-md" @click.prevent="openDeleteModal(slotProps.node.key)">
									<Lucide icon="Archive" class="w-4 h-4 text-[#cf2c47]" />
								</a>
							</template>
							 
							<template v-if="slotProps.node.data.is_deleted">
								<a href="#" class="bg-blue-100 p-2 rounded-md cursor-pointer" @click.prevent="openRestoreModal(slotProps.node.key)">
									<Lucide icon="RotateCcw" class="w-4 h-4 text-blue-500"/>
								</a>
							</template>
							<RouterLink :to="`/account/chart-of-accounts/${slotProps.node.key}/edit`"
								class="bg-blue-100 p-2 rounded-md cursor-pointer">
								<Lucide icon="PencilLine" class="w-4 h-4 text-blue-500" />
							</RouterLink>
							<RouterLink :to="`/account/chart-of-accounts/${slotProps.node.key}/view`"
								class="bg-[#96837f33] p-2 rounded-md cursor-pointer">
								<Lucide icon="Eye" class="w-4 h-4 text-gray-600" />
							</RouterLink>
						</div>
					</template>
				</Column>
			</TreeTable>
		</div>
	</div>

	<Dialog :open="deleteConfirmationModal" @close="closeDeleteModal">
		<Dialog.Panel>
			<div class="p-5 text-center">
				<Lucide icon="XCircle" class="w-16 h-16 mx-auto mt-3 text-danger" />
				<div class="mt-5 text-3xl">{{ $t('account.DeleteAccount') }}</div>
				<div class="mt-2 text-slate-500">
					{{ $t('account.DeleteConfirmation') }}
				</div>
				<div class="flex items-start bg-blue-50 border-l-4 border-blue-400 p-4 mt-5 rounded-md text-left">
					<Lucide icon="Info" class="w-5 h-5 text-blue-400 mt-1 mr-3" />
					<div>
						<span class="font-bold">{{ $t('account.Hint') }}:</span>
						<span class="ml-1">{{ $t('account.DeleteHint') }}</span>
					</div>
				</div>
			</div>
			<div class="px-5 pb-8 text-center flex items-center justify-center">
				<Button variant="outline-secondary" type="button" @click="closeDeleteModal" class="w-24 mr-1 h-10">
					{{ $t('account.Cancel') }}
				</Button>
				<Button variant="danger" type="button" class="ml-4 w-24 h-10" @click="confirmDelete">
					<template v-if="isDeleting">
						<LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
					</template>
					<template v-else>
						{{ $t('account.Delete') }}
					</template>
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>

	<Dialog :open="restoreConfirmationModal" @close="closeRestoreModal">
		<Dialog.Panel>
			<div class="p-5 text-center">
				<Lucide icon="RotateCcw" class="w-16 h-16 mx-auto mt-3 text-blue-500" />
				<div class="mt-5 text-3xl">{{ $t('account.RestoreAccount') }}</div>
				<div class="mt-2 text-slate-500">
					{{ $t('account.RestoreConfirmation') }}
				</div>
				<div class="flex items-start bg-blue-50 border-l-4 border-blue-400 p-4 mt-5 rounded-md text-left">
					<Lucide icon="Info" class="w-5 h-5 text-blue-400 mt-1 mr-3" />
					<div>
						<span class="font-bold">{{ $t('account.Hint') }}:</span>
						<span class="ml-1">{{ $t('account.RestoreHint') }}</span>
					</div>
				</div>
			</div>
			<div class="px-5 pb-8 text-center flex items-center justify-center">
				<Button variant="outline-secondary" type="button" @click="closeRestoreModal" class="w-24 mr-1 h-10">
					{{ $t('account.Cancel') }}
				</Button>
				<Button variant="primary" type="button" class="ml-4 w-24 h-10" @click="confirmRestore">
					<template v-if="isRestoring">
						<LoadingIcon icon="three-dots" class="w-8 h-5 text-white" />
					</template>
					<template v-else>
						{{ $t('account.Restore') }}
					</template>
				</Button>
			</div>
		</Dialog.Panel>
	</Dialog>

	<Notification id="success-notification-content" class="flex hidden">
		<Lucide icon="CheckCircle" class="text-success" />
		<div class="ml-4 mr-4">
			<div class="font-medium">{{ $t('account.Success') }}</div>
			<div class="mt-1 text-slate-500">
				{{ $t('account.OperationCompleted') }}
			</div>
		</div>
	</Notification>

	<Notification id="error-notification-content" class="flex hidden">
		<Lucide icon="XCircle" class="text-danger" />
		<div class="ml-4 mr-4">
			<div class="font-medium">{{ $t('account.Error') }}</div>
			<div class="mt-1 text-slate-500">
				{{ $t('account.AnErrorOccurred') }}
			</div>
		</div>
	</Notification>
</template>



<style>
.coa-style th.p-treetable-header-cell {
	border: none !important;
	padding: 18px 14px;
	background: #f6f7fa;
}

.coa-style .p-treetable-header {
	border-bottom: 1px solid #e9e8e8 !important;
	padding: 18px 14px;
}

.coa-style button.p-treetable-node-toggle-button {
	margin-right: 20px;
}
</style>
