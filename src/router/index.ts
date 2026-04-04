import { createRouter, createWebHistory  } from "vue-router";
import Layout from "../themes";
import Dashboard  from "../pages/Dashboard.vue";
import Home from "../pages/Home/index.vue"
import Register from "../pages/auth/Register.vue";
import Login from "../pages/auth/Login.vue";
import ForgetPassword from "../pages/auth/ForgetPassword.vue";
import CreateNewPassword from "../pages/auth/CreateNewPassword.vue";
import Otp from "../pages/auth/Otp.vue";
import VerifyRegistrationOtp from "../pages/auth/VerifyRegistrationOtp.vue";
import DeleteAccount from "../pages/DeleteAccount.vue";

import Barcode from "../pages/Barcode/Barcode.vue"
import Pos from "../pages/Pos/index.vue"
import OpenRegister from "../pages/Pos/create.vue"
import Invoices from "../pages/Invoices/index.vue"
import ReturnInvoices from "../pages/ReturnInvoices/index.vue"

import RegisterInvoice from "../pages/Pos/RegisterInvoice.vue"


import Customer from "../pages/Pos/Customers/index.vue"
import Jobs from "../pages/Pos/Jobs/index.vue"
import Quotations from "../pages/Pos/Quotations/index.vue"
import ListSupplier from '../pages/Purchasing/Supplier/list.vue';

import CreateSupplier from '../pages/Purchasing/Supplier/create.vue'
import EditSupplier from '../pages/Purchasing/Supplier/edit.vue'
import ListPurchaseInvoices from '../pages/Purchasing/Invoice/list.vue'

import CreatePurchaseInvoice from '../pages/Purchasing/Invoice/create.vue'
import ListPurchaseReturnInvoices from '../pages/Purchasing/ReturnInvoice/list.vue'

import CreatePurchaseReturnInvoice from '../pages/Purchasing/ReturnInvoice/create.vue'
import TaxManagement from '../components/Settings/TaxManagement/TaxManagementForm.vue'
import Setting from '../pages/setting/Index.vue'

import { combineGuards } from "./guards/combineGuards";
import { useAuthGuard } from "./guards/authGuard";
import { useRoleGuard } from "./guards/roleGuard";
import { useSubscriptionGuard } from "./guards/subscriptionGuard";
import ReturnInvoice from "@/pages/Pos/Invoices/ReturnInvoice.vue";
import CloseRegister from "@/pages/Pos/CloseRegister.vue";
import EditInvoice from "@/pages/Pos/Invoices/EditInvoice.vue";
import UsersTab from "@/components/Settings/Users/UsersTab.vue";
import RenewSubscription from "@/components/Settings/RenewSubscription/RenewSubscription.vue";

import InventoryReport from "../pages/Reporting/InventoryReport.vue";
import InventoryReportLevel from "../pages/Reporting/InventoryReport/InventoryReportLevel.vue";
import ProductStockValue from "../pages/Reporting/InventoryReport/ProductStockValue.vue";
import ProductDeadItems from "../pages/Reporting/InventoryReport/ProductDeadItems.vue";
import TopSellingProductLevel from "../pages/Reporting/InventoryReport/TopSellingProductLevel.vue";
import StockCountReport from "../pages/Reporting/InventoryReport/StockCountReport.vue";
import StockAdjustmentReport from "../pages/Reporting/InventoryReport/StockAdjustmentReport.vue";

import PurchaseSummaryReport from "../pages/Reporting/PurchasingReport/PurchaseSummaryReport.vue";
import SupplierWisePurchaseReport from "../pages/Reporting/PurchasingReport/SupplierWisePurchaseReport.vue";
import ReturnToSupplierReport from "../pages/Reporting/PurchasingReport/ReturnToSupplierReport.vue";
import SupplierWisePayment from "../pages/Reporting/PurchasingReport/SupplierWisePayment.vue";

import TaxReport from "../pages/Reporting/TaxReporting/TaxReporting.vue";

import CompanyProfile from "@/components/Settings/CompanyProfile/index.vue";
import GeneralSettings from "@/components/Settings/GeneralSettings/index.vue";
import SaleTarget from "@/components/Settings/SaleTarget/index.vue";
import {useAuthStore} from "@/stores/auth";


import ChartOfAccount from "@/pages/Accounts/ChartOfAccount/list.vue";
import CreateChartOfAccount from "@/pages/Accounts/ChartOfAccount/create.vue";
import EditChartOfAccount from "@/pages/Accounts/ChartOfAccount/edit.vue";
import ViewChartOfAccount from "@/pages/Accounts/ChartOfAccount/view.vue";

import JournalEntriesList from "@/pages/Accounts/JournalEntries/list.vue";
import CreateJournalEntry from "@/pages/Accounts/JournalEntries/create.vue";
import ViewJournalEntry from "@/pages/Accounts/JournalEntries/view.vue";
import EditJournalEntry from "@/pages/Accounts/JournalEntries/edit.vue";
import ExpensesList from "@/pages/Accounts/Expenses/list.vue";
import ExpensesCreate from "@/pages/Accounts/Expenses/create.vue";

import GeneralLedgerList from "@/pages/Accounts/GeneralLedger/list.vue";
import GeneralLedgerView from "@/pages/Accounts/GeneralLedger/view.vue";


const routes: any = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    // beforeEnter: combineGuards(() => {
    //   const token = localStorage.getItem("token");
    //   return token ? { path: "/admin" } : undefined; // Redirect logged-in users to /admin
    // }),
  },
  {
    path: "/register",
    name: "AuthRegister",
    component: Register,
    beforeEnter: (to, from, next) => {
      if (to.query.secret === "a8f3c29d4b7e6f01") {
        next();
      } else {
        next({ path: "/login" });
      }
    }
  },
  {
    path: "/forget-password",
    name: "ForgetPassword",
    component: ForgetPassword,
  },
  {
    path: "/enter-otp/:email",
    name: "Otp",
    component: Otp,
  },
  {
    path: "/verify-otp/:email",
    name: "VerifyRegistrationOtp",
    component: VerifyRegistrationOtp,
  },
  {
    path: "/create-new-password/:email/:signature/:expires",
    name: "Create Password",
    component: CreateNewPassword,
  },
  {
    path: "/admin",
    component: Layout,
    beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
    children: [
      {
        path: "/package-selection",
        name: "PackageSelection",
        component: () => import("../pages/PackageSelection/index.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/admin",
        name: "dashboard",
        component: Dashboard,
        beforeEnter: combineGuards(useAuthGuard()),

      },
      {
        // Backward-compatible alias used by theme menu components.
        path: "/dashboard-overview-1",
        name: "dashboard-overview-1",
        component: Dashboard,
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/setting",
        component: Setting,
        name: "Setting",
        children: [
          {
            path: "tax",
            name: "TaxManagement",
            component: TaxManagement,
          },
          {
            path: "tax",
            name: "TaxManagement",
            component: TaxManagement,
          },
          {
            path: "users",
            name: "UserManagement",
            component: UsersTab,
          },
          {
            path: "renew-subscription",
            name: "SubscriptionManagement",
            component: RenewSubscription,
          },
          {
            path: "company-profile",
            name: "CompanyProfile",
            component: CompanyProfile,
          },
          {
            path: "general-settings",
            name: "GeneralSettings",
            component: GeneralSettings,
          },
          {
            path: "sale-target",
            name: "SaleTarget",
            component: SaleTarget,
          },

          {
            path: "/",
            redirect: { name: "TaxManagement" }, // Default redirect to TaxManagement
          },
        ],
      },


      {
        path: "/barcode-scanner",
        name: "BarcodeScanner",
        component: Barcode,
      },

      // {
      //   path: "categories",
      //   name: "categories",
      //   component: () => import("../pages/Categories.vue"),
      //   beforeEnter: combineGuards(useAuthGuard()), // Requires admin role

      // },
      // {
      //   path: "add-product",
      //   name: "add-product",
      //   component: () => import("../pages/AddProduct.vue"),
      //   beforeEnter: combineGuards(useAuthGuard(), useRoleGuard("editor")), // Requires editor role

      // },
      // {
      //   path: "product-list",
      //   name: "product-list",
      //   component: () => import("../pages/ProductList.vue"),
      //   beforeEnter: combineGuards(useAuthGuard()),

      // },

      {
        path: "/superadmin/dashboard",
        name: "SuperAdminDashboard",
        component: () => import("../pages/SuperAdmin/Dashboard.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/shops",
        name: "SuperAdminShops",
        component: () => import("../pages/SuperAdmin/Shops.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/shops/create",
        name: "SuperAdminCreateShop",
        component: () => import("../pages/SuperAdmin/CreateShop.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/shops/:id/edit",
        name: "SuperAdminEditShop",
        component: () => import("../pages/SuperAdmin/EditShop.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/packages",
        name: "SuperAdminPackages",
        component: () => import("../pages/SuperAdmin/Packages/index.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/packages/create",
        name: "SuperAdminCreatePackage",
        component: () => import("../pages/SuperAdmin/Packages/create.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path: "/superadmin/packages/:id/edit",
        name: "SuperAdminEditPackage",
        component: () => import("../pages/SuperAdmin/Packages/edit.vue"),
        beforeEnter: combineGuards(useAuthGuard()),
      },
    ],
  },
  /* Inventory Routes */
  {
    path: "/inventory",
    name: "Inventory",
    component: Layout,
    beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
    children: [
      {
        path: "products",
        name: "All Products",
        component: () => import("../pages/Inventory/Product/list.vue"),
        meta: { action: 'list', subject: 'product' },
      },
      {
        path: "services",
        name: "All Services",
        component: () => import("../pages/Inventory/Services/list.vue"),
        meta: { action: 'list', subject: 'product' },
      },
      {
        path: "products/create",
        name: "CreateProduct",
        component: () => import("../pages/Inventory/Product/create.vue"),
        meta: { action: 'create', subject: 'product' },
      },
      {
        path: "services/create",
        name: "CreateService",
        component: () => import("../pages/Inventory/Services/create.vue"),
        meta: { action: 'create', subject: 'product' },
      },
      {
        path: "products/import",
        name: "ImportProduct",
        component: () => import("../pages/Inventory/Product/import.vue"),
      },
      {
        path: "products/:uuid/edit",
        name: "EditProduct",
        component: () => import("../pages/Inventory/Product/edit.vue"),
        meta: { action: 'update', subject: 'product' },

      },
      {
        path: "services/:uuid/edit",
        name: "EditService",
        component: () => import("../pages/Inventory/Services/edit.vue"),
        meta: { action: 'update', subject: 'product' },

      },
      {
        path: "categories",
        name: "ProductCategories",
        component: () => import("../pages/Inventory/Category/list.vue"),
        meta: { action: 'list', subject: 'category' },

      },
      {
        path: "categories/create",
        name: "CreateProductCategory",
        component: () => import("../pages/Inventory/Category/create.vue"),
        meta: { action: 'create', subject: 'category' },
      },
      {
        path: "categories/:uuid/edit",
        name: "EditProductCategory",
        component: () => import("../pages/Inventory/Category/edit.vue"),
        meta: { action: 'update', subject: 'category' },

      },
      {
        path: "attributes",
        name: "Attributes",
        component: () => import("../pages/Inventory/Attribute/list.vue"),
        meta: { action: 'list', subject: 'category' },

      },
      {
        path: "attributes/create",
        name: "CreateAttribute",
        component: () => import("../pages/Inventory/Attribute/create.vue"),
        meta: { action: 'create', subject: 'category' },
      },
      {
        path: "attributes/:uuid/edit",
        name: "EditAttribute",
        component: () => import("../pages/Inventory/Attribute/edit.vue"),
        meta: { action: 'update', subject: 'category' },

      },
      {
        path: "brands",
        name: "Brands",
        component: () => import("../pages/Inventory/Brand/index.vue"),
        meta: { action: 'list', subject: 'brand' },

      },
      {
        path: "stock-adjustment",
        name: "StockAdjustment",
        component: () => import("../pages/Inventory/StockAdjustment/list.vue"),
        meta: { action: 'list', subject: 'stockAdjustment' },

      },
      {
        path: "stock-adjustment/create",
        name: "CreateStockAdjustment",
        component: () => import("../pages/Inventory/StockAdjustment/create.vue"),
        meta: { action: 'create', subject: 'stockAdjustment' },

      },
      {
        path: "stock-adjustment/import",
        name: "ImportProductadjustment",
        component: () => import("../pages/Inventory/StockAdjustment/import.vue"),
      },
      {
        path: "stock-adjustment/:uuid",
        name: "ViewStockAdjustment",
        component: () => import("../pages/Inventory/StockAdjustment/view.vue"),
        meta: { action: 'update', subject: 'stockAdjustment' },

      },
      {
        path: "stock-count",
        name: "ListStockCount",
        component: () => import("../pages/Inventory/Stock/list.vue"),
        meta: { action: 'list', subject: 'stockCount' },

      },
      {
        path: "stock-count/create",
        name: "CreateStockCount",
        component: () => import("../pages/Inventory/Stock/create.vue"),
        meta: { action: 'create', subject: 'stockCount' },

      },
      {
        path: "stock-count/import",
        name: "ImportProductcount",
        component: () => import("../pages/Inventory/Stock/import.vue"),
      },
      {
        path: "stock-count/:uuid",
        name: "ViewStockCount",
        component: () => import("../pages/Inventory/Stock/view.vue"),
        meta: { action: 'list', subject: 'stockCount' },

      },
      {
        path: "stock-count/:uuid/edit",
        name: "EditStockCount",
        component: () => import("../pages/Inventory/Stock/edit.vue"),
        meta: { action: 'update', subject: 'stockCount' },

      },
      {
        path: "/access-denied",
        name: "Access Denied",

        component: () => import("../pages/PermissionDenied.vue"), // Create an Unauthorized page
      },
    ],
  },
  /* End Inventory Routes */

  /* POS Routes */
  {
    path: "/pos/register",
    name: "Pos",
    component: Layout,
    beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
    children: [
     {
        path:"/pos/register",
        name: "Register",
        component: Pos,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "register"},

      },
      {
        path:"/pos/invoices",
        name: "Invoices",
        component: Invoices,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "invoice"},

      },
      {
        path:"/pos/return-invoices",
        name: "ReturnInvoices",
        component: ReturnInvoices,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "saleReturn"},
      },
      {
        path:"/pos/register/open",
        name: "Register Open",
        component: OpenRegister,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "open", subject: "register"},
      },
      {
        path: "/pos/register/open/:registerId",
        name: "Register Close",
        component: CloseRegister,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "open", subject: "register"},
      },
      {
        path:"/pos/register/:registerId",
        name: "RegisterInvoice",
        component:RegisterInvoice,
        props: true,
        beforeEnter: combineGuards(useAuthGuard()),
      },
      {
        path:"/pos/register/return-invoice/:invoiceId",
        name: "ReturnInvoice",
        component:ReturnInvoice,
        props: true,
        beforeEnter: combineGuards(useAuthGuard(), useRoleGuard("admin,superadmin")),
      },
      {
        path:"/pos/register/edit/:invoiceId",
        name: "EditInvoice",
        component:EditInvoice,
        props: true,
        beforeEnter: combineGuards(useAuthGuard(), useRoleGuard("admin,superadmin")),
      },

      {
        path:"/pos/customers",
        name: "Customers",
        component: Customer,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "customer"},
      },
      {
        path:"/pos/jobs",
        name: "Jobs",
        component: Jobs,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "jobs"},
      },
      {
        path:"/pos/quotation",
        name: "Quotations",
        component: Quotations,
        beforeEnter: combineGuards(useAuthGuard()),
        meta: {action: "list", subject: "invoice"},
      },
    ],
  },
  /* End POS Routes */

    /* Start Supplier Routes */
    {
      path: "/purchasing/supplier",
      name: "Supplier",
      component: Layout,
      beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
      children: [
        {
          path: "/purchasing/supplier",
          name: "List Supplier",
          component: ListSupplier,
          meta: {action: "list", subject: "supplier"},
        },
        {
          path: "/purchasing/supplier/create",
          name: "Create supplier",
          component: CreateSupplier,
          meta: {action: "create", subject: "supplier"},

        },
        {
          path: "/purchasing/supplier/:uuid/edit",
          name: "Edit Supplier",
          component: EditSupplier,
          meta: {action: "update", subject: "supplier"},

        },
        {
          path: "/purchasing/invoice",
          name: "List Purchase Invoice",
          component: ListPurchaseInvoices,
          meta: {action: "list", subject: "purchaseInvoice"},

        },
        {
          path: "/purchasing/invoice/create",
          name: "Create Purchase Invoice",
          component: CreatePurchaseInvoice,
          meta: {action: "create", subject: "purchaseInvoice"},
        },
        {
          path: "/purchasing/invoice/return",
          name: "List Purchase Return Invoice",
          component: ListPurchaseReturnInvoices,
          meta: {action: "list", subject: "purchaseReturn"},
        },
        {
          path: "/purchasing/invoice/return/create",
          name: "Create Purchase Return Invoice",
          component: CreatePurchaseReturnInvoice,
          meta: {action: "create", subject: "purchaseReturn"},
        },
      ],
    },
    /* End Supplier Routes */

    {
      path: "",
      name: "Account",
      component: Layout,
      beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
      children: [
        {
          path: "/account/chart-of-accounts",
          name: "Chart Of Account",
          component: ChartOfAccount,
          meta: {action: "list", subject: "chartOfAccounts"},

        },
        {
          path: "/account/chart-of-accounts/create",
          name: "Create Chart Of Account",
          component: CreateChartOfAccount,
          meta: {action: "create", subject: "chartOfAccounts"},
        },
        {
          path: "/account/chart-of-accounts/:uuid/edit",
          name: "Edit Chart Of Account",
          component: EditChartOfAccount,
          meta: {action: "update", subject: "chartOfAccounts"},
        },
        {
          path: "/account/chart-of-accounts/:uuid/view",
          name: "View Chart Of Account",
          component: ViewChartOfAccount,
          meta: {action: "list", subject: "chartOfAccounts"},
        },
        {
          path: "/account/journal-entries",
          name: "Journal Entries",
          component: JournalEntriesList,
          meta: {action: "list", subject: "journalEntries"},
        },
        {
          path: "/account/journal-entries/create",
          name: "Create Journal Entry",
          component: CreateJournalEntry,
          meta: {action: "create", subject: "journalEntries"},
        },
        {
          path: "/account/journal-entries/:uuid/view",
          name: "View Journal Entry",
          component: ViewJournalEntry,
          meta: {action: "list", subject: "journalEntries"},
        },
        {
          path: "/account/journal-entries/:uuid/edit",
          name: "Edit Journal Entry",
          component: EditJournalEntry,
          meta: {action: "update", subject: "journalEntries"},
        },
        {
          path: "/account/expenses",
          name: "Expenses",
          component: ExpensesList,
          meta: {action: "list", subject: "expenses"},
        },
        {
          path: "/account/expenses/create",
          name: "Create Expense",
          component: ExpensesCreate,
          meta: {action: "create", subject: "expenses"},
        },
        {
          path: "/account/general-ledger",
          name: "General Ledger",
          component: GeneralLedgerList,
          meta: {action: "list", subject: "generalLedger" },
        },
        {
          path: "/account/general-ledger/:uuid/view",
          name: "View General Ledger",
          component: GeneralLedgerView,
          meta: {action: "list", subject: "generalLedger"},
        },
        {
          path: "/access-denied",
          name: "Access Denied",

          component: () => import("../pages/PermissionDenied.vue"), // Create an Unauthorized page
        },

      ],
    },


  /* Reporting Routes */
  {
    path: "/reporting",
    name: "Reporting",
    component: Layout,
    beforeEnter: combineGuards(useAuthGuard(), useSubscriptionGuard()),
    children: [
      {
        path: "",
        name: "ReportingDashboard",
        component: () => import("../pages/Reporting/ReportingDashboard.vue"),
        meta: {action: "list", subject: "reportingInventory"},
      },
      {
        path: "inventory",
        name: "InventoryReport",
        component: InventoryReport,
        meta: {action: "list", subject: "reportingInventory"},
        children : [
          {
            path: "report",
            name: "Inventory Leve Report",
            component: InventoryReportLevel,
          },
          {
            path: "products-stock",
            name: "Products Stock Value",
            component: ProductStockValue,
          },
          {
            path: "products-dead-items",
            name: "Product Dead Items",
            component: ProductDeadItems,
          },
          {
            path: "top-selling-product",
            name: "Top Selling Product Level",
            component: TopSellingProductLevel,
          },
          {
            path: "stock-count-report",
            name: "Stock Count Report",
            component: StockCountReport,
          },
          {
            path: "stock-adjustment-report",
            name: "Stock Adjustment Report",
            component: StockAdjustmentReport,
          },
        ],

      },
      {
        path: "sales",
        name: "SalesReport",
        component: () => import("../pages/Reporting/SalesReport.vue"),
        meta: {action: "list", subject: "reportingSales"},
        children : [
          {
            path: "daily-monthly-sales",
            name: "DailyMonthlySalesReport",
            component: () => import("../pages/Reporting/SalesReport/DailyMonthlySalesReport.vue"),
          },
          {
            path: "customer-purchase-history",
            name: "CustomerPurchaseHistoryReport",
            component: () => import("../pages/Reporting/SalesReport/CustomerPurchaseHistoryReport.vue"),
          },
          {
            path: "sales-performance",
            name: "SalesPerformanceReport",
            component: () => import("../pages/Reporting/SalesReport/SalesPerformanceReport.vue"),
          },
          {
            path: "sales-performance-by-services",
            name: "SalesPerformanceByServicesReport",
            component: () => import("../pages/Reporting/SalesReport/SalesPerformanceByServicesReport.vue"),
          },
          {
            path: "discounts",
            name: "DiscountsReport",
            component: () => import("../pages/Reporting/SalesReport/DiscountsReport.vue"),
          },
          {
            path: "product-profit",
            name: "ProductProfitReport",
            component: () => import("../pages/Reporting/SalesReport/ProductProfitReport.vue"),
          },
        ],
      },
      {
        path: "purchases",
        name: "PurchaseReport",
        component: () => import("../pages/Reporting/PurchaseReport.vue"),
        meta: {action: "list", subject: "reportingPurchasing"},
        children : [
          {
            path: "purchase-summary",
            name: "PurchaseSummaryReport",
            component: PurchaseSummaryReport,
          },
          {
            path: "supplier-wise-purchase",
            name: "Supplier Wise Purchase Report",
            component: SupplierWisePurchaseReport,
          },
          {
            path: "return-supplier",
            name: "Return To Supplier Report",
            component: ReturnToSupplierReport,
          },
          {
            path: "supplier-wise-payment",
            name: "Supplier Wise Payment",
            component: SupplierWisePayment,
          },
        ],
      },

      {
        path: "stock-levels",
        name: "StockLevelsReport",
        component: () => import("../pages/Reporting/InventoryReport/StockLevels.vue"),
        meta: {action: "list", subject: "reportingInventory"},
      },
      {
        path: "worker-performance",
        name: "WorkerPerformanceReport",
        component: () => import("../pages/Reporting/SalesReport/WorkerPerformanceReport.vue"),
        meta: {action: "list", subject: "reportingSales"},
      },
      {
        path: "tax",
        name: "TaxReport",
        component: () => import("../pages/Reporting/TaxReport.vue"),
        meta: {action: "list", subject: "reportingTax"},
        children : [
          {
            path: "tax-report",
            name: "TaxReporting",
            component: TaxReport,
          },
        ]
      },
      {
        path: "trial-balance",
        name: "TrialBalanceReport",
        component: () => import("../pages/Reporting/TrialBalanceReport.vue"),
        meta: {action: "list", subject: "reportingAccounting"},
      },
      {
        path: "balance-sheet",
        name: "BalanceSheetReport",
        component: () => import("../pages/Reporting/BalanceSheetReport.vue"),
        meta: {action: "list", subject: "reportingAccounting"},
      },
      {
        path: "profit-loss",
        name: "ProfitLossReport",
        component: () => import("../pages/Reporting/ProfitLossReport.vue"),
        meta: {action: "list", subject: "reportingAccounting"},
      },
    ],
  },
  /* End Reporting Routes */

  {
    path: "/not-found",
    name: "NotFound",
    component: () => import("../pages/ErrorPage.vue"),
  },
  {
    path: '/:catchAll(.*)',
    component: () => import("../pages/ErrorPage.vue"),
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("../pages/Unauthorized.vue"), // Create an Unauthorized page
  },
  {
    path: '/delete-account',
    name: 'DeleteAccount',
    component: DeleteAccount,
    meta: {
      requiresAuth: true
    },
    beforeEnter: combineGuards(useAuthGuard())
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition)
  {
    return savedPosition || { left: 0, top: 0 };
  },
});
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const { action, subject } = to.meta;

  // Skip permission checks for these routes
  const skipPermissionRoutes = ['/access-denied', '/unauthorized', '/not-found', '/login', '/register'];
  if (skipPermissionRoutes.includes(to.path)) {
    return next();
  }

  // Check permissions if route has meta action and subject defined
  // Accounting routes now also use permission checks
  if (action && subject) {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      return next({ name: 'login' });
    }

    // Check permission
    if (!authStore.ability.can(action, subject)) {
      console.warn(`Permission denied: ${action} on ${subject}`, {
        route: to.path,
        action,
        subject,
        userPermissions: authStore.user?.permissions?.map(p => typeof p === 'string' ? p : p.name),
        abilityRules: authStore.ability.rules,
        hasPermission: authStore.ability.can(action, subject)
      });
      // For debugging - show what permissions user has
      console.log('Available ability rules:', authStore.ability.rules);
      return next({ name: 'Access Denied' });
    }
  }

  next();
});

export default router;
