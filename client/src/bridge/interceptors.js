import axios from "./bridge"
import cookie from "react-cookies";

export default function setupInterceptors(navigate) {

    const requestInterceptor = axios.interceptors.request.use((config) => {
      if (typeof config.data === FormData) {
        let object = {};
        config.data.forEach((value, key) => (object[key] = value));
        config.data = JSON.stringify(object);
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (res) => {
        return res;
      },
      (err) => {
        console.error ("responseInterceptor got error", err)
        if (err.response.status === 401 || err.response.status === 403) {
          cookie.remove("identity");
          return navigate("/account/login", { replace: true });
        }
        console.error("rejecting response ", err);
        return Promise.reject(err);
      }
    );

    return () => {
      console.error("Ejecting intercepts");
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };

}
