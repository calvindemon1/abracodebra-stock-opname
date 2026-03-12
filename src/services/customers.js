import { api } from "./api";

export const CustomersService = {
  list() {
    return api.get("/customers");
  },
  create(data) {
    return api.post("/customers", data);
  },
  update(id, data) {
    return api.put(`/customers/${id}`, data);
  },
  delete(id) {
    return api.delete(`/customers/${id}`);
  },
};
