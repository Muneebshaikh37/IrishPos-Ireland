import {APP} from "@/config/constants.js";

export const pans = {
    authin: {
        success: (payload) => ({
            subject: 'Authentication',
            message: `Hi ${payload}, Welcome to ` + APP + `!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Authentication !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    forgotPassword: {
        success: (payload) => ({
            subject: 'Forgot Password!',
            message: `${payload}`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Forgot Password!',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "XCircle"
        }),

    },
    resetPassword: {
        success: (payload) => ({
            subject: 'Reset Password!',
            message: `${payload}`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Reset Password!',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "XCircle"
        }),

    },
    otp: {
        success: (payload) => ({
            subject: 'Otp!',
            message: `${payload}`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Otp!',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "XCircle"
        }),

    },
    supplier: {
        success: (payload) => ({
            subject: 'Supplier Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    supplier: {
        success: (payload) => ({
            subject: 'Journal Entry Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    customer: {
        success: (payload) => ({
            subject: 'Customer Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    category: {
        success: (payload) => ({
            subject: 'Category Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    salesTarget: {
        success: (payload) => ({
            subject: 'Sales Target Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    brand: {
        success: (payload) => ({
            subject: 'Brand Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    profile: {
        success: (payload) => ({
            subject: 'Profile Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    Permissions: {
        success: (payload) => ({
            subject: 'Permissions',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    general: {
        success: (payload) => ({
            subject: 'General Settings Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    purchase: {
        success: (payload) => ({
            subject: 'Purchase  Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    tax: {
        success: (payload) => ({
            subject: 'Tax Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    StockCount: {
        success: (payload) => ({
            subject: 'Stock Count Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Error !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },

    invoice: {
        success: (payload) => ({
            subject: 'Invoice Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Authentication !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    addWithdraw: {
      success: (payload) => ({
          subject: 'Add Withdraw Status',
          message: `${payload}`,
          type: "success",
          background: "red-600",
          parentBg: "red-100",
          heading: "white",
          options: {
              duration: 3000,
              offset: { x: 10, y: 30 },
          },
          icon: "CheckCircle"
      }),
      error: (payload) => ({
          subject: 'Authentication !',
          message: `${payload}`,
          type: "danger",
          background: "red-600",
          parentBg: "red-100",
          heading: "white",
          options: {
              duration: 3000,
              offset: { x: 10, y: 30 },
          },
          icon: "XCircle"
      }),
  },
    transactions: {
        success: (payload) => ({
            subject: 'transaction Status',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Authentication !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    recordCash: {
        success: (payload) => ({
            subject: 'Record Cash',
            message: `${payload}`,
            type: "success",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "CheckCircle"
        }),
        error: (payload) => ({
            subject: 'Authentication !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    serverErrors: {
        error: (payload) => ({
            subject: 'Authentication !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    sellingWarning: {
        error: (payload) => ({
            subject: 'Invoice !',
            message: `${payload}`,
            type: "danger",
            background: "red-600",
            parentBg: "red-100",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 30 },
            },
            icon: "XCircle"
        }),
    },
    authup: {
        success: (payload) => ({
            subject: 'Authentication',
            message: `Hi ${payload.name || payload.email}, Welcome to NNR!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({

            subject: 'Authentication !',
            message: payload.response.data.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline",
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    authenticated: {
        success: (payload) => ({
            subject: 'Authentication',
            message: `Hi ${payload.name}, Welcome to NNR!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Authentication',
            message: `Looks like you have to login again...`,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline",
        }),
    },
    authout: {
        success: (payload) => ({
            subject: 'Authentication',
            message: "Logged out handled! We will see you soon.",
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-check-circle",
        }),
    },
    check_unique: {
        success: (payload) => ({
            subject: 'Authentication',
            message: `Hi ${payload.name}, Welcome to NNR!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Authentication !',
            message: payload.response.data.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
        internal: (payload) => ({
            subject: 'Authentication',
            message: payload.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline"
        }),
    },
    checkcode: {
        success: (payload) => ({
            subject: 'Authentication',
            message: `Your Code Is Correct!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Authentication',
            message: `Looks like you have to entered wrong code ...`,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline",
        }),
    },
    update: {
        success: (payload) => ({
            subject: 'Profile Updation',
            message: `Your profile updated successfully!`,
            type: "white",
            background: "green-darken-3",
            parentBg: "green-lighten-1",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 80 },
            },
            icon: "mdi-check-circle",
        }),
        error: (payload) => ({
            subject: 'Profile Updation',
            message: payload.data.message,
            type: "white",
            background: "red-darken-1",
            parentBg: "red-lighten-2",
            heading: "white",
            options: {
                duration: 3000,
                offset: { x: 10, y: 10 },
            },
            icon: "mdi-close-circle-outline",
        }),
    },
    // General success and error methods for convenience
    success: (payload) => ({
        subject: 'Success',
        message: `${payload}`,
        type: "success",
        background: "green-darken-3",
        parentBg: "green-lighten-1",
        heading: "white",
        options: {
            duration: 3000,
            offset: { x: 10, y: 30 },
        },
        icon: "CheckCircle"
    }),
    error: (payload) => ({
        subject: 'Error',
        message: `${payload}`,
        type: "danger",
        background: "red-600",
        parentBg: "red-100",
        heading: "white",
        options: {
            duration: 3000,
            offset: { x: 10, y: 30 },
        },
        icon: "XCircle"
    }),

}
export default pans;
