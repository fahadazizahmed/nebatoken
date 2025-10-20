import axios from "axios";
// Initialize with default Accept header
const axiosInstance = axios.create({
  headers: {
    Accept: "application/json",
  }
});




const invoke = ({
  method,
  baseURL,
  route,
  data,
  headers = {},
}) => {
  console.log("heaa", method,
    baseURL,
    route,
    data,)
  // Clean URL to prevent double slashes
  const url = `${baseURL.replace(/\/$/, '')}/${route.replace(/^\//, '')}`;
  return axiosInstance({
    method,
    url,
    data,
    headers: {
      ...headers, // Custom headers override defaults
    },
  });
};

export default invoke


