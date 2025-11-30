import { api } from "./api";

export const ItemsService = {
  list: async (filters = {}) => {
    try {
      const res = await api.get("/items");
      let data = res.data.data ?? res.data;

      const { search, sort, location, condition } = filters;

      // 🔍 Search
      if (search)
        data = data.filter(
          (item) =>
            item.asset_name.toLowerCase().includes(search.toLowerCase()) ||
            item.asset_code.toLowerCase().includes(search.toLowerCase())
        );

      // 📍 Filter location
      if (location)
        data = data.filter(
          (item) => String(item.location_id) === String(location)
        );

      // ⚙️ Filter condition
      if (condition)
        data = data.filter(
          (item) => String(item.condition_id) === String(condition)
        );

      // 🔽 Sorting
      if (sort === "name_asc")
        data.sort((a, b) => a.asset_name.localeCompare(b.asset_name));
      if (sort === "name_desc")
        data.sort((a, b) => b.asset_name.localeCompare(a.asset_name));
      if (sort === "newest") data.sort((a, b) => b.id - a.id);
      if (sort === "oldest") data.sort((a, b) => a.id - b.id);

      return data;
    } catch (err) {
      return [];
    }
  },

  get(id) {
    return api.get(`/items/${id}`);
  },
  create(data) {
    return api.post("/items", data);
  },
  update(id, data) {
    return api.put(`/items/${id}`, data);
  },
  delete(id) {
    return api.delete(`/items/${id}`);
  },
};
