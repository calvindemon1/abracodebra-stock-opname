import { api } from "./api";

export const RolePermissionsService = {
  list() {
    return api.get("/role-permissions");
  },
  create(data) {
    return api.post("/role-permissions", data);
  },
  update(id, data) {
    return api.put(`/role-permissions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/role-permissions/${id}`);
  },
};
