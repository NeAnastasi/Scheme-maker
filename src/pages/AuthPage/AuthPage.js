import "./AuthPage.css";
import BasePage from "../BasePage/BasePage.js";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/admin/applications");
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    setMessage("Пожалуйста, заполните все поля");
    return;
  }

  setIsSubmitting(true);
  setMessage("");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    setMessage("Неверный email или пароль");
    console.log(error);
  } else {
    setMessage(`Добро пожаловать, ${data.user.email}!`);
    setFormData({ email: "", password: "" });
    navigate('/admin/applications')
  }
  
  setIsSubmitting(false);
};

  return (
    <BasePage
      mainContent={
        <div className="auth-card">
          <div className="login-card">
            <h2 className="card-title">Авторизация. Администрация.</h2>

            <form className="form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Пароль</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Вход..." : "Войти"}
              </button>
            </form>

            {message && (
              <div
                className={`message ${message.includes("Добро пожаловать") ? "success" : "error"}`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
}

export default AuthPage;
