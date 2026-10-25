import { useApi } from "../../../hook/useApi";


// public
export const getHero = () => useApi.request("/hero");

// admin
export const getAdminHero = () => useApi.request("/admin/hero");
export const saveSlide = (id, body) =>
  useApi.request(`/admin/hero/slides/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const saveBand = (body) =>
  useApi.request("/admin/hero/band", {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const uploadHeroImage = (file, kind) => {
  const fd = new FormData();
  fd.append("image", file);
  return useApi.request(`/admin/hero/upload?kind=${kind}`, {
    method: "POST",
    body: fd,
  });
};
