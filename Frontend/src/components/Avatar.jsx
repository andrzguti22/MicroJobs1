import { API_URL } from "../api/client";

function Avatar({
  name,
  image,
  size = "md",
  className = "",
}) {
  const sizes = {
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  // "image" puede ser una URL completa (Supabase Storage, imágenes
  // nuevas) o una ruta relativa vieja (uploads/..., de antes de la
  // migración a Supabase Storage) -- solo anteponemos API_URL en el
  // segundo caso.
  const avatar = image
    ? image.startsWith("http")
      ? image
      : `${API_URL}/${image}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name || "Usuario"
      )}&background=random`;

  return (
    <img
      src={avatar}
      alt={name}
      className={`
        ${sizes[size]}
        rounded-full
        object-cover
        shrink-0
        border-2 border-white
        shadow-md
        ${className}
      `}
    />
  );
}

export default Avatar;