import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLayoutProposalsField.css";
import { supabase } from "../../supabaseClient";
import Loading from "../Loading/Loading";
const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const formatDateTime = (iso) => {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hh}:${mm}`;
};
const AdminLayoutProposalsField = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from("layout_proposals")
        .select("id, room_id, status, created_at, rooms(name, floor)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      setError("Не удалось загрузить предложения.");
      console.error("Ошибка загрузки предложений:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals({ showLoading: true });
    const channel = supabase
      .channel("admin-layout-proposals-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layout_proposals" },
        fetchProposals
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleDelete = async (proposalId) => {
    if (!window.confirm("Удалить это предложение?")) return;
    try {
      const { error } = await supabase
        .from("layout_proposals")
        .delete()
        .eq("id", proposalId);
      if (error) throw error;
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    } catch (err) {
      alert("Не удалось удалить. Попробуйте ещё раз.");
      console.error("Ошибка удаления предложения:", err);
    }
  };
  const processedProposals = proposals.filter(
    (p) => p.status === "accepted" || p.status === "rejected"
  );
  const handleClearProcessed = async () => {
    if (processedProposals.length === 0) return;
    const ok = window.confirm(
      `Вы действительно хотите удалить все обработанные предложения (${processedProposals.length})?`
    );
    if (!ok) return;
    try {
      const ids = processedProposals.map((p) => p.id);
      const { error } = await supabase
        .from("layout_proposals")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setProposals((prev) =>
        prev.filter((p) => p.status !== "accepted" && p.status !== "rejected")
      );
    } catch (err) {
      alert("Не удалось очистить. Попробуйте ещё раз.");
      console.error("Ошибка очистки предложений:", err);
    }
  };

  if (loading) return <Loading text="Загрузка предложений..." />;
  if (error) return <div className="error">Ошибка: {error}</div>;

  if (proposals.length === 0) {
    return (
      <div className="empty-state">
        Предложений на изменение планировки пока нет.
      </div>
    );
  }

  return (
    <>
      {}
      <div className="admin-list-actions">
        <button
          className="btn btn-clear"
          onClick={handleClearProcessed}
          disabled={processedProposals.length === 0}
        >
          Очистить обработанные ({processedProposals.length})
        </button>
      </div>

      <div className="applications-grid">
        {proposals.map((p) => (
          <div className="card" key={p.id}>
            {}
            <button
              type="button"
              className="card-close-btn"
              onClick={() => handleDelete(p.id)}
              title="Удалить предложение"
            >
              ×
            </button>
            <h2 className="card-title">{p.rooms?.name || "Кабинет"}</h2>
            <div className="card-time">
              {p.rooms?.floor} этаж · {formatDateTime(p.created_at)}
            </div>

            {}
            {p.status === "pending" ? (
              <div className="proposal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/admin/layout-proposals/${p.id}`)}
                >
                  Открыть
                </button>
              </div>
            ) : (
              <div className={`proposal-status-badge status-${p.status}`}>
                {p.status === "accepted" ? "Принято" : "Отклонено"}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminLayoutProposalsField;
