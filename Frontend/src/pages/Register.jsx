import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

function Register() {
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // 🧠 VALIDACIONES
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (form.name.length < 3) {
      newErrors.name = "Mínimo 3 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Correo inválido";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!form.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "Debe tener mínimo 6 caracteres, una mayúscula y un número";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email.toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.detail });
        return;
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: form.name,
          email,
        }),
      );

      alert("Usuario creado correctamente 🚀");

      navigate("/create-profile");
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col dark:bg-slate-900">
      <Navbar />
      <PageWrapper>
        <div className="flex flex-1 pt-28">
          {/* IZQUIERDA */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src="/Register.png" alt="register" className="w-[350px] rounded-lg" />
          </div>

          {/* DERECHA */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow w-[350px] dark:bg-slate-800">
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Crear Cuenta</h2>

              <p className="text-gray-500 mb-6">Regístrate para empezar</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* NOMBRE */}
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="p-3 border rounded-lg dark:bg-slate-700"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">{errors.name}</span>
              )}

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="p-3 border rounded-lg dark:bg-slate-700"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}

              {/* PASSWORD */}
              <input
                type="password"
                placeholder="Contraseña"
                value={form.password}
                onFocus={() => setShowHint(true)}
                onBlur={() => setShowHint(false)}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="p-3 border rounded-lg dark:bg-slate-700"
              />
              {showHint && (
                <span className="text-gray-500 text-sm">
                  Debe tener mínimo 6 caracteres, una mayúscula y un número
                </span>
              )}
              {errors.password && (
                <span className="text-red-500 text-sm">{errors.password}</span>
              )}

                <button className="bg-primary text-white py-3 rounded-lg mt-2 hover:scale-105 hover:shadow-lg transition duration-300">
                  Registrarse
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-4">
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-primary font-semibold">
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Register;
