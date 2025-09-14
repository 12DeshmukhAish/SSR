// config.js
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://24.101.103.87:8082/api'
};

export const API_BASE_URL = config.API_BASE_URL;
export default config;