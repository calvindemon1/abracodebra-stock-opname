import { api } from "./api";

export const PermissionsService = {
  list() {
    return api.get("/permissions");
  },
  create(data) {
    return api.post("/permissions", data);
  },
  update(id, data) {
    return api.put(`/permissions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/permissions/${id}`);
  },
};
