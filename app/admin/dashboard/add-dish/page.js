"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useApi } from "@/hook/useApi";
import { PenLine, SkipBack, SkipForward, Trash } from "lucide-react";

const CATEGORIES = [
  { en: "Starters", fi: "Alkuruoat" },
  { en: "Vegetarian Main Courses", fi: "Kasvispääruoat" },
  { en: "Sizzling", fi: "Sizzlerit" },
  { en: "Lamb Main Courses", fi: "Lammaspääruoat" },
  { en: "Beef Main Courses", fi: "Nautapääruoat" },
  { en: "Chicken Main Courses", fi: "Kanapääruoat" },
  { en: "Seafood", fi: "Merenelävät" },
  { en: "Rice", fi: "Riisit" },
  { en: "Naan Breads", fi: "Naan-leivät" },
  { en: "Desserts", fi: "Jälkiruoat" },
  { en: "Tea", fi: "Tee" },
  { en: "Drinks", fi: "Juomat" },
];

const ITEMS_PER_PAGE = 7;

export default function AddDishAndManagePage() {
  const { request } = useApi();

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form States
  const [editingId, setEditingId] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    categoryEn: CATEGORIES[0].en,
    categoryFi: CATEGORIES[0].fi,
    nameFi: "",
    nameEn: "",
    preparationFi: "",
    preparationEn: "",
    storyFi: "",
    storyEn: "",
    price: "",
  });

  // Table Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const res = await request({ method: "GET", url: "/menu/regular" });
      setItems(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.nameEn?.toLowerCase().includes(query) ||
        item.nameFi?.toLowerCase().includes(query) ||
        item.categoryEn?.toLowerCase().includes(query) ||
        item.categoryFi?.toLowerCase().includes(query) ||
        item.preparationEn?.toLowerCase().includes(query) ||
        item.preparationFi?.toLowerCase().includes(query) ||
        item.storyEn?.toLowerCase().includes(query) ||
        item.storyFi?.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleCategoryChange = (e) => {
    const selectedEn = e.target.value;
    const selectedCategory = CATEGORIES.find((cat) => cat.en === selectedEn);
    setFormData((prev) => ({
      ...prev,
      categoryEn: selectedCategory?.en || selectedEn,
      categoryFi: selectedCategory?.fi || selectedEn,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setExistingImageUrl("");
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      categoryEn: CATEGORIES[0].en,
      categoryFi: CATEGORIES[0].fi,
      nameFi: "",
      nameEn: "",
      preparationFi: "",
      preparationEn: "",
      storyFi: "",
      storyEn: "",
      price: "",
    });
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({
      categoryEn: item.categoryEn || CATEGORIES[0].en,
      categoryFi: item.categoryFi || CATEGORIES[0].fi,
      nameFi: item.nameFi || "",
      nameEn: item.nameEn || "",
      preparationFi: item.preparationFi || "",
      preparationEn: item.preparationEn || "",
      storyFi: item.storyFi || "",
      storyEn: item.storyEn || "",
      price:
        item.price !== undefined && item.price !== null
          ? item.price.toString()
          : "",
    });
    setExistingImageUrl(item.imageUrl || "");
    setImageFile(null);
    setImagePreview(null);
    setMessage({ text: "", type: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, nameEn) => {
    if (!window.confirm(`Are you sure you want to delete "${nameEn}"?`)) return;

    try {
      await request({ method: "DELETE", url: `/menu/regular/${id}` });
      setMessage({
        text: `"${nameEn}" deleted successfully.`,
        type: "success",
      });
      fetchItems();
    } catch (err) {
      console.error("Delete Error:", err);
      setMessage({ text: "Failed to delete dish.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      let uploadedUrl = existingImageUrl;

      // 1. Upload new image if chosen
      if (imageFile) {
        const imagePayload = new FormData();
        imagePayload.append("image", imageFile);

        const uploadRes = await request({
          method: "POST",
          url: "/upload",
          data: imagePayload,
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = uploadRes.url;
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl: uploadedUrl,
      };

      // 2. Add or Edit Record
      if (editingId) {
        await request({
          method: "PUT",
          url: `/menu/regular/${editingId}`,
          data: payload,
        });
        setMessage({ text: "Dish updated successfully!", type: "success" });
      } else {
        await request({
          method: "POST",
          url: "/menu/regular",
          data: payload,
        });
        setMessage({ text: "Dish added successfully!", type: "success" });
      }

      resetForm();
      fetchItems();
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.error || "Operation failed. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 px-3 sm:px-4 lg:px-0 py-4">
      {/* ----------------- BILINGUAL FORM SECTION ----------------- */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl shadow-xs p-4 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {editingId ? "Edit Dish" : "Add New Dish"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure dishes with bilingual metadata, culinary stories, and
              descriptions.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors self-start sm:self-auto shrink-0"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {message.text && (
          <div
            className={`p-3.5 sm:p-4 rounded-xl text-sm font-medium mb-6 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Category / Kategoria
            </label>
            <select
              value={formData.categoryEn}
              onChange={handleCategoryChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.en} value={cat.en}>
                  {cat.en} — {cat.fi}
                </option>
              ))}
            </select>
          </div>

          {/* Bilingual Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Finnish Name (Nimi Suomeksi)
              </label>
              <input
                type="text"
                required
                placeholder="esim. Voi Kana"
                value={formData.nameFi}
                onChange={(e) =>
                  setFormData({ ...formData, nameFi: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                English Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Butter Chicken"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Bilingual Preparation / Major Ingredients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Preparation / Ingredients (Suomeksi)
              </label>
              <textarea
                rows={3}
                required
                placeholder="esim. Tandoori-kanaa, kermaista tomaatti-voikastiketta..."
                value={formData.preparationFi}
                onChange={(e) =>
                  setFormData({ ...formData, preparationFi: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Preparation / Ingredients (English)
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Tandoori-grilled chicken in creamy tomato butter sauce..."
                value={formData.preparationEn}
                onChange={(e) =>
                  setFormData({ ...formData, preparationEn: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Bilingual Culinary Story (Optional / Internal Background) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800">
                Dish Story & Heritage (Optional)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Internal / Background
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Annostarina (Suomeksi)
                </label>
                <textarea
                  rows={4}
                  placeholder="Kerro annoksen alkuperästä, perinteisistä mausteista tai reseptin historiasta..."
                  value={formData.storyFi}
                  onChange={(e) =>
                    setFormData({ ...formData, storyFi: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Dish Story (English)
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the regional roots, traditional clay-pot techniques, or royal origins..."
                  value={formData.storyEn}
                  onChange={(e) =>
                    setFormData({ ...formData, storyEn: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Price (€ EUR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 text-sm font-semibold">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="16.90"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Image Upload Zone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Dish Image
            </label>

            {imagePreview || existingImageUrl ? (
              <div className="border-2 border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center gap-3">
                <Image
                  src={imagePreview || existingImageUrl}
                  alt="Dish preview"
                  width={128}
                  height={128}
                  unoptimized
                  className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl shadow-xs border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setExistingImageUrl("");
                  }}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Change / Remove Image
                </button>
              </div>
            ) : (
              <label
                htmlFor="dish-image-input"
                className="block border-2 border-dashed border-slate-300 hover:border-amber-500/60 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    Upload an image or{" "}
                    <span className="text-amber-700 font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
                <input
                  id="dish-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-xs hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? editingId
                  ? "Saving Changes..."
                  : "Publishing Dish..."
                : editingId
                  ? "Update Dish"
                  : "Save & Add Dish"}
            </button>
          </div>
        </form>
      </div>

      {/* ----------------- DATA TABLE / LIST SECTION ----------------- */}
      <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl shadow-xs p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Registered Dishes Inventory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredItems.length} dishes registered across Finnish & English
              menus
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, category, story..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* ---- Desktop / tablet: table (md and up) ---- */}
        <div className="hidden md:block overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-3">Dish (EN / FI)</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Preparation & Story</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loadingItems ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading dishes...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No dishes found matching your query.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.nameEn || "Dish image"}
                            width={44}
                            height={44}
                            unoptimized
                            className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold shrink-0">
                            N/A
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {item.nameEn}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.nameFi}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-md whitespace-nowrap">
                          {item.categoryEn}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.categoryFi}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs text-xs text-slate-600">
                      <p className="truncate font-medium text-slate-700">
                        {item.preparationEn}
                      </p>
                      <p className="truncate text-slate-400 mt-0.5">
                        {item.preparationFi}
                      </p>
                      {(item.storyEn || item.storyFi) && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          Story Added
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      €{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nameEn)}
                        className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ---- Mobile: stacked cards (below md) ---- */}
        <div className="md:hidden mt-4 space-y-3">
          {loadingItems ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border border-slate-200 rounded-xl p-3.5 flex gap-3"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No dishes found matching your query.
            </p>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-3.5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.nameEn || "Dish image"}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-semibold shrink-0">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 leading-tight truncate">
                          {item.nameEn}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {item.nameFi}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 text-sm shrink-0">
                        €{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                    <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50 rounded-md">
                      {item.categoryEn}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 pl-1">
                  <p className="line-clamp-2 font-medium text-slate-700">
                    {item.preparationEn}
                  </p>
                  {(item.storyEn || item.storyFi) && (
                    <span className="inline-block mt-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                      Story Added
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <PenLine size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.nameEn)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4 gap-3">
          <p className="text-xs text-slate-500">
            Page{" "}
            <span className="font-semibold text-slate-800">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack size={16} />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
