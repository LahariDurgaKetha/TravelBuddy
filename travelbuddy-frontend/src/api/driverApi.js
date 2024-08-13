// driverApi.js
import axios from "axios";

export const createDriver = async (driverData) => {
  return await axios.post("http://localhost:3000/api/drivers", driverData);
};

export const getDrivers = async (query) => {
  return await axios.get("http://localhost:3000/api/drivers", {
    params: query,
  });
};
