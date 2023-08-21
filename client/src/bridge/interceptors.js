import axios from "./bridge"

export default function setupInterceptors(navigate, resetIdentityCookie) {

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
          return navigate("/account/logout", { replace: true });
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
