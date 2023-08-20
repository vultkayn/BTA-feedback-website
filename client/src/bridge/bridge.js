import axios from 'axios';


const apiClient = axios.create({
    headers: {
      "Content-Type": "application/json"
    },
    baseURL: "http://127.0.0.1:8888/",
    withCredentials: true
  })


export default apiClient;