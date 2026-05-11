import { useEffect, useState } from "react";
import "./AdminApplicationField.css";
import { supabase } from "../../supabaseClient";
import Loading from "../Loading/Loading";
import ApplicationSchemeModal from "../ApplicationSchemeModal/ApplicationSchemeModal";
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
const translateProblem = (problem) => {
  switch (problem) {
    case "keyboard": return "Клавиатура";
    case "mouse": return "Мышка";
    case "monitor": return "Монитор";
    case "system": return "Системный блок";
    case "speaker": return "Колонка";
    case "table": return "Стол";
    default: return problem;
  }
};
const translateElementType = (type) => {
  switch (type) {
    case "Table": return "Стол";
    case "PC": return "Компьютер";
    case "Screen": return "Экран";
    case "Speaker": return "Колонка";
    default: return type;
  }
};
const STATUS_LABELS = {
  new: "Новая",
  in_progress: "В работе",
  done: "Закрыта",
};

const AdminApplicationField = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState(new Set());
  const [selectedApp, setSelectedApp] = useState(null);

  const toggleCollapsed = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const fetchApplications = async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          room_id,
          created_at,
          status,
          author_name,
          rooms ( id, name, floor ),
          application_problems ( id, element_id, element_type, problem, comment )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      setError("Не удалось загрузить заявки.");
      console.error("Ошибка загрузки заявок:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications({ showLoading: true });
    const channel = supabase
      .channel("admin-applications-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        fetchApplications
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "application_problems" },
        fetchApplications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);
      if (error) throw error;
    } catch (err) {
      alert("Не удалось изменить статус. Попробуйте ещё раз.");
      console.error("Ошибка смены статуса:", err);
    }
  };
  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Удалить эту заявку?")) return;
    try {
      await supabase
        .from("application_problems")
        .delete()
        .eq("application_id", applicationId);
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", applicationId);
      if (error) throw error;
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      alert("Не удалось удалить заявку. Попробуйте ещё раз.");
      console.error("Ошибка удаления заявки:", err);
    }
  };
  const doneApplications = applications.filter((a) => a.status === "done");
  const handleClearDone = async () => {
    if (doneApplications.length === 0) return;
    const ok = window.confirm(
      `Вы действительно хотите удалить все закрытые заявки (${doneApplications.length})?`
    );
    if (!ok) return;
    try {
      const ids = doneApplications.map((a) => a.id);
      await supabase
        .from("application_problems")
        .delete()
        .in("application_id", ids);
      const { error } = await supabase
        .from("applications")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setApplications((prev) => prev.filter((a) => a.status !== "done"));
    } catch (err) {
      alert("Не удалось очистить. Попробуйте ещё раз.");
      console.error("Ошибка очистки заявок:", err);
    }
  };

  if (loading) return <Loading text="Загрузка заявок..." />;
  if (error) return <div className="error">Ошибка: {error}</div>;

  if (applications.length === 0) {
    return <div className="empty-state">Заявок пока нет.</div>;
  }

  return (
    <>
      {}
      <div className="admin-list-actions">
        <button
          className="btn btn-clear"
          onClick={handleClearDone}
          disabled={doneApplications.length === 0}
        >
          Очистить закрытые ({doneApplications.length})
        </button>
      </div>

      <div className="applications-grid">
        {applications.map((app) => {
          const roomTitle = app.rooms
            ? `${app.rooms.name}, ${app.rooms.floor} этаж`
            : "Кабинет удалён";
          const problems = app.application_problems || [];

          return (
            <div className="card card-app" key={app.id}>
              {}
              <button
                type="button"
                className="card-close-btn"
                onClick={() => handleDeleteApplication(app.id)}
                title="Удалить заявку"
              >
                ×
              </button>
              <h2 className="card-title">{roomTitle}</h2>
              <div className="card-time">{formatDateTime(app.created_at)}</div>

              {}
              <button
                type="button"
                className="problems-toggle"
                onClick={() => toggleCollapsed(app.id)}
              >
                <span>Поломки ({problems.length})</span>
                <span className="problems-toggle-chevron">
                  {collapsedIds.has(app.id) ? "▼" : "▲"}
                </span>
              </button>

              <div className="problems-list-area">
                {!collapsedIds.has(app.id) && (
                  problems.length === 0 ? (
                    <div className="problems-empty"><i>Нет проблем</i></div>
                  ) : (
                    <ul className="problem-list-admin">
                      {problems.map((p) => {
                        const elementLabel = translateElementType(p.element_type);
                        const problemLabel = translateProblem(p.problem);
                        const label =
                          elementLabel === problemLabel
                            ? elementLabel
                            : `${elementLabel} — ${problemLabel}`;
                        return (
                          <li key={p.id}>
                            <strong>{label}</strong>
                            {p.comment && <> — {p.comment}</>}
                          </li>
                        );
                      })}
                    </ul>
                  )
                )}
              </div>

              {}
              <button
                type="button"
                className="btn-scheme"
                onClick={() => setSelectedApp(app)}
                disabled={problems.length === 0}
              >
                Открыть схему
              </button>

              {}
              <div className="card-status">
                <label className="card-status-label">Статус:</label>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className={`card-status-select status-${app.status}`}
                >
                  <option value="new">{STATUS_LABELS.new}</option>
                  <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                  <option value="done">{STATUS_LABELS.done}</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {}
      {selectedApp && (
        <ApplicationSchemeModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </>
  );
};

export default AdminApplicationField;
