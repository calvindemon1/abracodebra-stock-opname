import { api } from "./api";

export const LocationsService = {
  list() {
    return api.get("/locations");
  },
  create(data) {
    return api.post("/locations", data);
  },
  update(id, data) {
    return api.put(`/locations/${id}`, data);
  },
  delete(id) {
    return api.delete(`/locations/${id}`);
  },
};
