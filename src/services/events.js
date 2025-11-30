import { api } from "./api";

export const EventsService = {
  list() {
    return api.get("/events");
  },
  create(data) {
    return api.post("/events", data);
  },
  update(id, data) {
    return api.put(`/events/${id}`, data);
  },
  delete(id) {
    return api.delete(`/events/${id}`);
  },
};
