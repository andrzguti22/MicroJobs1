import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon} from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm px-4 md:px-8 py-4 z-50 ">
      <div className="flex justify-between items-center ">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 dark:bg-slate-900 p-2 rounded-lg shadow cursor-pointer transition-all duration-300 ease-out ">
          <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-lg" />
          <h1 className="font-bold text-lg md:text-xl">
            <span className="text-dark dark:text-white">Micro</span>
            <span className="text-primary">Jobs</span>
          </h1>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:scale-110 transition"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          <Link to="/how-it-works" className="text-gray-700 hover:text-primary dark:text-white transition-all duration-300 hover:scale-105 active:scale-95">
            Cómo Funciona
          </Link>

          <Link to="/login" className="text-gray-700 hover:text-primary dark:text-white transition-all duration-300 hover:scale-105 active:scale-95">
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Registrarse
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA */}

        <div className="flex items-center gap-2 md:hidden ">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:scale-110 transition"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <button
            className="md:hidden text-2xl text-gray-700 dark:text-white hover:scale-110 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {menuOpen && (
        <div className="mt-4 flex flex-col gap-4 md:hidden bg-white dark:bg-slate-800 p-4 rounded-xl shadow">
          <Link to="/how-it-works" className="text-gray-700 dark:text-gray-200" onClick={() => setMenuOpen(false)}>
            Cómo Funciona
          </Link>

          <Link to="/login" className="text-gray-700 dark:text-gray-200 " onClick={() => setMenuOpen(false)}>
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="bg-primary text-white px-4 py-2 rounded-lg text-center hover:scale-105 hover:shadow-lg transition duration-300"
            onClick={() => setMenuOpen(false)}
          >
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
