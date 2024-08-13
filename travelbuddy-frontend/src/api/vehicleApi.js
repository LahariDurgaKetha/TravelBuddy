// vehicleApi.js
import axios from "axios";

export const createVehicle = async (vehicleData) => {
  return await axios.post("http://localhost:3000/api/vehicles", vehicleData);
};

export const getVehicles = async () => {
  return await axios.get("http://localhost:3000/api/vehicles");
};
