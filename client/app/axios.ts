import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // ✅ This is correct - sends cookies cross-origin
  timeout: 10000,
});



apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const serverMessage = error.response?.data?.message || "Something went wrong";
    return Promise.reject(error);
  }
);

export default apiClient;