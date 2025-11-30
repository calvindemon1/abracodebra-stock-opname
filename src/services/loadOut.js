import { api } from "./api";

export const LoadOutService = {
  list: async (params = {}) => {
    const res = await api.get("/load-out", { params });
    return res.data;
  },
  get: async (id) => {
    const res = await api.get(`/load-out/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post("/load-out", payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/load-out/${id}`, payload);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/load-out/${id}`);
    return res.data;
  },
};
