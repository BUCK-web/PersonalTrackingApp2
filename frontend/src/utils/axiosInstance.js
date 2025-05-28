import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://personaltrackingapp2-production.up.railway.app",
  withCredentials : true,
});

export default axiosInstance;
