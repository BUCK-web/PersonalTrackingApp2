import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://personaltrackingapp2-production.up.railway.app",
  withCredentials : true,
});

export default axiosInstance;
