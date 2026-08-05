import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Trash2, X, ImageOff } from "lucide-react";

const API_URL = "http://localhost:8000";

function PortfolioGallery({ userId, editable = false }) {
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/portfolio`);

      if (!response.ok) {
        throw new Error("Error cargando el portafolio");
      }

      const data = await response.json();

      setImages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (images.length >= 12) {
      setError("Ya alcanzaste el máximo de 12 imágenes en tu portafolio.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();

    formData.append("image", file);

    setUploading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/portfolio`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.detail || "No se pudo subir la imagen");
      }

      const newImage = await response.json();

      setImages((prev) => [newImage, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (imageId) => {
    setDeletingId(imageId);

    try {
      const response = await fetch(`${API_URL}/portfolio/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar la imagen");
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));

      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo eliminar la imagen");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-600 mt-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-lg font-semibold dark:text-white">
          🖼️ Portafolio de trabajos
        </h3>

        {editable && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
              onChange={handleUpload}
            />

            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:scale-105 hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:hover:scale-100"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              {uploading ? "Subiendo..." : "Agregar imagen"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-3">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gray-200 dark:bg-slate-600 animate-pulse"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400 dark:text-gray-300">
          <ImageOff size={32} className="mb-2" />
          <p>
            {editable
              ? "Aún no has agregado imágenes de tus trabajos realizados."
              : "Este usuario aún no ha agregado imágenes a su portafolio."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-600 cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={`${API_URL}/${img.image_path}`}
                alt={img.description || "Trabajo realizado"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {editable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img.id);
                  }}
                  disabled={deletingId === img.id}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition duration-200 disabled:opacity-100"
                  title="Eliminar imagen"
                >
                  {deletingId === img.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VISOR / LIGHTBOX */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X size={28} />
              </button>

              <img
                src={`${API_URL}/${selectedImage.image_path}`}
                alt={selectedImage.description || "Trabajo realizado"}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />

              {selectedImage.description && (
                <p className="text-white text-center mt-3">
                  {selectedImage.description}
                </p>
              )}

              {editable && (
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  disabled={deletingId === selectedImage.id}
                  className="mt-4 mx-auto flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deletingId === selectedImage.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Eliminar imagen
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PortfolioGallery;
