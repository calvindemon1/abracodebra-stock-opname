import { api } from "./api";

export const LoadInService = {
  // list all
  list: async (params = {}) => {
    const res = await api.get("/load-in", { params });
    return res.data; // asumsi backend: return array atau { data: [...] }
  },

  // get by id (dipakai ketika edit)
  get: async (id) => {
    const res = await api.get(`/load-in/${id}`);
    return res.data;
  },

  // create
  create: async (payload) => {
    const res = await api.post("/load-in", payload);
    return res.data;
  },

  // update (dipakai ketika edit)
  update: async (id, payload) => {
    const res = await api.put(`/load-in/${id}`, payload);
    return res.data;
  },

  // delete (dipakai di list)
  delete: async (id) => {
    const res = await api.delete(`/load-in/${id}`);
    return res.data;
  },
};
