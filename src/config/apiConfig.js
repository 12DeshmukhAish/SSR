
const API_CONFIG = {
  // Base configuration
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://24.101.103.87:8082',
  API_VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  TIMEOUT: parseInt(process.env.REACT_APP_TIMEOUT) || 10000,
  
  // Environment specific settings
  ENVIRONMENT: process.env.REACT_APP_ENV || 'development',
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
  AUTH_REQUIRED: process.env.REACT_APP_AUTH_REQUIRED === 'true',
  
  // API Endpoints based on your Swagger documentation
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNIN: '/api/auth/signin',
      SIGNUP: '/api/auth/signup',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      UPDATE_PASSWORD: '/api/auth/update-password',
      VERIFY: '/api/auth/verify',
      GET_USER_BY_ID: '/api/auth/user', // + /{id}
      IS_VALID_USER: '/api/auth/isValidUser',
      GET_ALL_USERS: '/api/auth/all'
    },

    // Master Materials Rate Controller
    MASTER_MATERIALS_RATE: {
      UPDATE_MATERIALS: '/updateMaterials',
      SAVE: '/save',
      GET_BY_MATERIAL_ID: '/getByMaterialId',
      GET_BY_ID: '/getById',
      GET_ALL: '/getAll',
      DELETE_BY_ID: '/deleteById'
    },

    // Transaction Work Order Controller
    TXN_WORKORDER: {
      BASE: '/api/workorders',
      GET_BY_ID: '/api/workorders', // + /{id}
      UPDATE: '/api/workorders', // + /{id}
      DELETE: '/api/workorders', // + /{id}
      GET_ALL: '/api/workorders',
      CREATE: '/api/workorders',
      GET_BY_USER: '/api/workorders/ByUser' // + /{userId}
    },

    // Transaction Work Order Revise Controller
    TXN_WORKORDER_REVISE: {
      BASE: '/api/workorder-revisions',
      GET_BY_ID: '/api/workorder-revisions', // + /{id}
      UPDATE: '/api/workorder-revisions', // + /{id}
      DELETE: '/api/workorder-revisions', // + /{id}
      GET_ALL: '/api/workorder-revisions',
      CREATE: '/api/workorder-revisions',
      GET_BY_WORKORDER_ID: '/api/workorder-revisions/ByWorkorderId' // + /{workOrderId}
    },

    // Master Building Floor Adjustments Controller
    MASTER_BUILDING_FLOOR_ADJUSTMENTS: {
      BASE: '/api/v1/building-floor-adjustments',
      GET_BY_ID: '/api/v1/building-floor-adjustments', // + /{id}
      UPDATE: '/api/v1/building-floor-adjustments', // + /{id}
      DELETE: '/api/v1/building-floor-adjustments', // + /{id}
      GET_ALL: '/api/v1/building-floor-adjustments',
      CREATE: '/api/v1/building-floor-adjustments',
      GET_BY_SSR_ID: '/api/v1/building-floor-adjustments/BySsrId' // + /{fkSsrId}
    },

    // User Subscription Controller
    USER_SUBSCRIPTION: {
      BASE: '/api/user-subscriptions',
      GET_BY_ID: '/api/user-subscriptions', // + /{id}
      UPDATE: '/api/user-subscriptions', // + /{id}
      DELETE: '/api/user-subscriptions', // + /{id}
      GET_ALL: '/api/user-subscriptions',
      CREATE: '/api/user-subscriptions',
      SEARCH_BY_USR_ID: '/api/user-subscriptions/searchByUsrId',
      SEARCH_BY_USR_ID_SUB_ID: '/api/user-subscriptions/searchByUsrIdSubId'
    },

    // User Referral Controller
    USER_REFERRAL: {
      UPDATE: '/api/user-referrals/update', // + /{id}
      SAVE: '/api/user-referrals/save',
      GET_BY_ID: '/api/user-referrals/getById', // + /{id}
      GET_ALL: '/api/user-referrals/getAll',
      DELETE: '/api/user-referrals/delete' // + /{id}
    },

    // User Payment Controller
    USER_PAYMENT: {
      UPDATE: '/api/user-payments/update', // + /{transactionId}
      SAVE: '/api/user-payments/save',
      SEARCH_BY_USR_ID_DT_STATUS: '/api/user-payments/searchByUsrIdDtStatus/',
      GET_BY_TRAN_ID: '/api/user-payments/getByTranId',
      GET_ALL: '/api/user-payments/getAll',
      DELETE: '/api/user-payments/delete' // + /{transactionId}
    },

    // User Total Credits Controller
    USER_TOTAL_CREDITS: {
      BASE: '/api/user-credit-points',
      GET_BY_ID: '/api/user-credit-points', // + /{id}
      UPDATE: '/api/user-credit-points', // + /{id}
      DELETE: '/api/user-credit-points', // + /{id}
      GET_ALL: '/api/user-credit-points',
      CREATE: '/api/user-credit-points'
    },

    // Transaction Lead Controller
    TXN_LEAD: {
      BASE: '/api/txn-leads',
      GET_BY_ID: '/api/txn-leads', // + /{id}
      UPDATE: '/api/txn-leads', // + /{id}
      DELETE: '/api/txn-leads', // + /{id}
      GET_ALL: '/api/txn-leads',
      CREATE: '/api/txn-leads'
    },

    // Transaction Items Controller (Your main focus)
    TXN_ITEMS: {
      BASE: '/api/txn-items',
      GET_BY_ID: '/api/txn-items', // + /{id}
      UPDATE: '/api/txn-items', // + /{id}
      DELETE: '/api/txn-items', // + /{id}
      GET_ALL: '/api/txn-items',
      CREATE: '/api/txn-items',
      GET_BY_SUBWORK: '/api/txn-items/BySubwork' // + /{subworkId}
    },

    // Transaction Item MTS Controller
    TXN_ITEM_MTS: {
      BASE: '/api/txn-items-mts',
      GET_BY_ID: '/api/txn-items-mts', // + /{id}
      UPDATE: '/api/txn-items-mts', // + /{id}
      DELETE: '/api/txn-items-mts', // + /{id}
      GET_ALL: '/api/txn-items-mts',
      CREATE: '/api/txn-items-mts',
      GET_BY_ITEM_ID: '/api/txn-items-mts/ByItemId' // + /{itemId}
    },

    // Transaction Item Properties Controller
    TXN_ITEM_PROPERTIES: {
      BASE: '/api/txn-item-properties',
      GET_BY_ID: '/api/txn-item-properties', // + /{id}
      UPDATE: '/api/txn-item-properties', // + /{id}
      DELETE: '/api/txn-item-properties', // + /{id}
      GET_ALL: '/api/txn-item-properties',
      CREATE: '/api/txn-item-properties',
      FROM_CONSUMPTION: '/api/txn-item-properties/fromConsumption'
    },

    // Transaction Subwork Controller
    TXN_SUBWORK: {
      BASE: '/api/subwork',
      GET_BY_ID: '/api/subwork', // + /{id}
      UPDATE: '/api/subwork', // + /{id}
      DELETE: '/api/subwork', // + /{id}
      GET_ALL: '/api/subwork',
      CREATE: '/api/subwork',
      GET_BY_REVISE_WORKORDER: '/api/subwork' // + /{reviseId}/{workorderId}
    },

    // Master SSR Controller
    MASTER_SSR: {
      BASE: '/api/ssr',
      GET_BY_ID: '/api/ssr', // + /{id}
      UPDATE: '/api/ssr', // + /{id}
      DELETE: '/api/ssr', // + /{id}
      GET_ALL: '/api/ssr',
      CREATE: '/api/ssr'
    },

    // Transaction Recap Controller
    TXN_RECAP: {
      BASE: '/api/recap',
      GET_BY_ID: '/api/recap', // + /{id}
      UPDATE: '/api/recap', // + /{id}
      DELETE: '/api/recap', // + /{id}
      GET_ALL: '/api/recap',
      CREATE: '/api/recap'
    },

    // Transaction PDF Generated Controller
    TXN_PDF_GENERATED: {
      BASE: '/api/pdf-generated',
      GET_BY_ID: '/api/pdf-generated', // + /{id}
      UPDATE: '/api/pdf-generated', // + /{id}
      DELETE: '/api/pdf-generated', // + /{id}
      GET_ALL: '/api/pdf-generated',
      CREATE: '/api/pdf-generated'
    },

    // Master Materials Controller
    MASTER_MATERIALS: {
      BASE: '/api/materials',
      GET_BY_ID: '/api/materials', // + /{id}
      UPDATE: '/api/materials', // + /{id}
      DELETE: '/api/materials', // + /{id}
      GET_ALL: '/api/materials',
      CREATE: '/api/materials'
    },

    // Transaction Material Testing Controller
    TXN_MATERIAL_TESTING: {
      BASE: '/api/material-testing',
      GET_BY_ID: '/api/material-testing', // + /{id}
      UPDATE: '/api/material-testing', // + /{id}
      DELETE: '/api/material-testing', // + /{id}
      GET_ALL: '/api/material-testing',
      CREATE: '/api/material-testing',
      GET_BY_SSR_ID: '/api/material-testing/BySsrId' // + /{fkSsrId}
    },

    // Transaction Material Testing Detail Controller
    TXN_MATERIAL_TESTING_DETAIL: {
      BASE: '/api/material-testing-details',
      GET_BY_ID: '/api/material-testing-details', // + /{id}
      UPDATE: '/api/material-testing-details', // + /{id}
      DELETE: '/api/material-testing-details', // + /{id}
      GET_ALL: '/api/material-testing-details',
      CREATE: '/api/material-testing-details'
    },

    // Master C1 Lead Controller
    MASTER_C1_LEAD: {
      BASE: '/api/masterc1lead',
      GET_BY_LEAD_ID: '/api/masterc1lead', // + /{leadId}
      UPDATE: '/api/masterc1lead', // + /{leadId}
      DELETE: '/api/masterc1lead', // + /{leadId}
      GET_ALL: '/api/masterc1lead',
      CREATE: '/api/masterc1lead',
      GET_BY_SSR_ID: '/api/masterc1lead' // + /{ssrId}
    },

    // Master State Controller
    MASTER_STATE: {
      BASE: '/api/master/state',
      GET_BY_STATE_TIN: '/api/master/state', // + /{stateTin}
      UPDATE: '/api/master/state', // + /{stateTin}
      DELETE: '/api/master/state', // + /{stateTin}
      GET_ALL: '/api/master/state',
      CREATE: '/api/master/state'
    },

    // Master Detailed Items Controller
    MASTER_DETAILED_ITEMS: {
      BASE: '/api/master/detailedItems',
      GET_BY_ID: '/api/master/detailedItems', // + /{detailedItemId}
      UPDATE: '/api/master/detailedItems', // + /{detailedItemId}
      DELETE: '/api/master/detailedItems', // + /{detailedItemId}
      GET_ALL: '/api/master/detailedItems',
      CREATE: '/api/master/detailedItems',
      GET_BY_SSR_ID: '/api/master/detailedItems/BySsrId', // + /{fkSsrId}
      GET_BY_CHAPTER: '/api/master/detailedItems/ByChapter' // + /{chapterId}
    },

    // Master Consumption Material and Road Controller
    MASTER_CONSUMPTION_MATERIAL_ROAD: {
      UPDATE: '/api/master/consumptionMaterialAndRoad/update',
      SAVE: '/api/master/consumptionMaterialAndRoad/save',
      GET_ALL: '/api/master/consumptionMaterialAndRoad',
      GET_DETAILED_ITEM_ID: '/api/master/consumptionMaterialAndRoad/getDetailedItemId',
      GET_BY_ID: '/api/master/consumptionMaterialAndRoad/getById',
      DELETE_BY_ID: '/api/master/consumptionMaterialAndRoad/deleteById'
    },

    // Master Construction Testing Material Controller
    MASTER_CONSTRUCTION_TESTING_MATERIAL: {
      BASE: '/api/master/constructionTestingMaterial',
      GET_BY_ID: '/api/master/constructionTestingMaterial', // + /{id}
      UPDATE: '/api/master/constructionTestingMaterial', // + /{id}
      DELETE: '/api/master/constructionTestingMaterial', // + /{id}
      GET_ALL: '/api/master/constructionTestingMaterial',
      CREATE: '/api/master/constructionTestingMaterial'
    },

    // Master Subscription Controller
    MASTER_SUBSCRIPTION: {
      BASE: '/api/master-subscriptions',
      GET_BY_ID: '/api/master-subscriptions', // + /{id}
      UPDATE: '/api/master-subscriptions', // + /{id}
      DELETE: '/api/master-subscriptions', // + /{id}
      GET_ALL: '/api/master-subscriptions',
      CREATE: '/api/master-subscriptions'
    },

    // Master Chapters Controller
    MASTER_CHAPTERS: {
      BASE: '/api/chapters',
      GET_BY_ID: '/api/chapters', // + /{id}
      UPDATE: '/api/chapters', // + /{id}
      DELETE: '/api/chapters', // + /{id}
      GET_ALL: '/api/chapters',
      CREATE: '/api/chapters',
      GET_BY_SSR_ID: '/api/chapters/BySsrId' // + /{fkSsrId}
    },

    // Payment and Webhook Controllers
    PAYMENT: {
      CREATE: '/api/payments/create'
    },

    WEBHOOK: {
      RAZORPAY: '/api/webhooks/razorpay'
    },

    // File Controllers
    FILE: {
      UPLOAD: '/api/file/upload',
      DOWNLOAD: '/api/file/download' // + /{fileName}
    }
  },
  
  // Request Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export default API_CONFIG;