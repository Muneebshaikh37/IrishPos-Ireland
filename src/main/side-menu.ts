import {type Menu} from "@/stores/menu";

const menu: Array<Menu | "divider"> = [
    {
        icon: "Home",
        pageName: "dashboard-overview-1",
        title: "Dashboard",
    },
    {
        icon: "Inbox",
        pageName: "dashboard",
        title: "Inventory",
        subMenu: [
            {
                icon: "Zap",
                pageName: "All Products",
                title: "Products",
            },
            {
                icon: "Zap",
                pageName: "All Product Category",
                title: "Category",
            },
            {
                icon: "Zap",
                pageName: "Attributes",
                title: "Attributes",
            },
            {
                icon: "Zap",
                pageName: "Brands",
                title: "Brands",
            },
            {
                icon: "Zap",
                pageName: "StockAdjustment",
                title: "Stock Adjustment",
            },
            {
                icon: "Zap",
                pageName: "List Stock Count",
                title: "Stock Count",
            },
        ],
    },
    {
        icon: "Tablet",
        pageName: "POS",
        title: "POS",
        subMenu: [
            {
                icon: "Activity",
                pageName: "Register",
                title: "Daily Till",
            },
            {
                icon: "Activity",
                pageName: "Invoices",
                title: "Invoices",
            },
            //         // {
            //         //     icon: "Activity",
            //         //     pageName: "Sales",
            //         //     title: "Daily Sales",
            //         // },
            {
                icon: "Activity",
                pageName: "Customers",
                title: "Customers",
            },
            {
                icon: "Activity",
                pageName: "Jobs",
                title: "Jobs",
            },
            {
                icon: "Activity",
                pageName: "ReturnInvoices",
                title: "Sales Returns",
            },
        ],
    },
    {
        icon: "Inbox",
        pageName: "List supplier",
        title: "Purchasing",
        subMenu: [
            {
                icon: "Activity",
                pageName: "List supplier",
                title: "Supplier",
            },
            {
                icon: "Activity",
                pageName: "List Purchase Invoice",
                title: "Purchase Invoice",
            },
            {
                icon: "Activity",
                pageName: "List Purchase Return Invoice",
                title: "Purchase Return",
            },
        ],
    },
    {
        icon: "Settings",
        pageName: "account",
        title: "Accounting",
    },
    {
        icon: "Inbox",
        pageName: "Chart Of Account",
        title: "COA",
        subMenu: [
            {
                icon: "Activity",
                pageName: "Journal Entries",
                title: "Journal Entries",
            },
            {
                icon: "Activity",
                pageName: "Expenses",
                title: "Expenses",
            },
            {
                icon: "Activity",
                pageName: "General Ledger",
                title: "General Ledger",
            },
        ],
    },

];

export default menu;
