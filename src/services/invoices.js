import { api } from "./api";

export const InvoicesService = {
  getAll() {
    return api.get("/invoices/tti");
  },
  getByID(id) {
    return api.get(`/invoices/tti/${id}`);
  },
  create(data) {
    return api.post("/invoices/tti", data);
  },
  update(id, data) {
    return api.put(`/invoices/tti/${id}`, data);
  },
  delete(id) {
    return api.delete(`/invoices/tti/${id}`);
  },

  // ✅ BYPASS api.js KHUSUS EXPORT
  async export() {
    const response = await fetch(
      "https://14grftw2-3212.asse.devtunnels.ms/api/invoices/tti/export", // ⬅️ GANTI BASE URL LU
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // hapus kalau ga pake token
        },
      },
    );

    if (!response.ok) {
      throw new Error("Gagal download file");
    }

    return await response.blob();
  },
};
