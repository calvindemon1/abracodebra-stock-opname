import { api } from "./api";

export const ConditionsService = {
  list() {
    return api.get("/conditions");
  },
  create(data) {
    return api.post("/conditions", data);
  },
  update(id, data) {
    return api.put(`/conditions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/conditions/${id}`);
  },
};
