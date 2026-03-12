import { api } from "./api";

export const DivisionsService = {
  list() {
    return api.get("/divisions");
  },
  create(data) {
    return api.post("/divisions", data);
  },
  update(id, data) {
    return api.put(`/divisions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/divisions/${id}`);
  },
};
