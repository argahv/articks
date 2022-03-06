import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on server

    // http://SERVICENAME.NAMESPACE.svc.cluster.local
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We must be in browser
    return axios.create({
      baseURL: "/",
    });
  }
};
