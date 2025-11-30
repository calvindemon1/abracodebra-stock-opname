import { api } from "./api";

export const ItemsPCService = {
  list() {
    return api.get("/item-pc");
  },
  get(id) {
    return api.get(`/item-pc/${id}`);
  },
  create(data) {
    return api.post("/item-pc", data);
  },
  update(id, data) {
    return api.put(`/item-pc/${id}`, data);
  },
  delete(id) {
    return api.delete(`/item-pc/${id}`);
  },
};
