import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: `${baseURL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const getBearerToken = () => {
  const token = localStorage.getItem("kuduUserToken");
  return `Bearer ${token}`;
};

apiClient.interceptors.request.use(
  function (config) {
    const token = getBearerToken();
    if (token) {
      config.headers["Authorization"] = token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      // localStorage.clear();
      // return (window.location.href = "/login");
    }
    return Promise.reject(error);
  },
);

export default apiClient;
export { apiClient };
