import { api } from "./api";

export const TypesService = {
  list() {
    return api.get("/type-pc");
  },
  create(data) {
    return api.post("/type-pc", data);
  },
  update(id, data) {
    return api.put(`/type-pc/${id}`, data);
  },
  delete(id) {
    return api.delete(`/type-pc/${id}`);
  },
};
