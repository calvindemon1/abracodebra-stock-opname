import { api } from "./api";

export const QuestionsService = {
  list() {
    return api.get("/questions");
  },
  create(data) {
    return api.post("/questions", data);
  },
  update(id, data) {
    return api.put(`/questions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/questions/${id}`);
  },
};
