import { api } from "./api";

export const PositionsService = {
  list() {
    return api.get("/positions");
  },
  create(data) {
    return api.post("/positions", data);
  },
  update(id, data) {
    return api.put(`/positions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/positions/${id}`);
  },
};
