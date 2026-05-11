import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRoomRequestsField.css";
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
const AdminRoomRequestsField = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchRequests = async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from("room_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      setError("Не удалось загрузить запросы.");
      console.error("Ошибка загрузки запросов кабинетов:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests({ showLoading: true });
    const channel = supabase
      .channel("admin-room-requests-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_requests" },
        fetchRequests
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleCreateRoom = async (request) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([{ name: request.name, floor: request.floor }])
        .select()
        .single();
      if (error) throw error;

      const { error: updateError } = await supabase
        .from("room_requests")
        .update({ status: "done" })
        .eq("id", request.id);
      if (updateError) throw updateError;

      navigate(`/admin/rooms/${data.id}/scheme`);
    } catch (err) {
      alert("Не удалось создать кабинет. Попробуйте ещё раз.");
      console.error("Ошибка создания кабинета по запросу:", err);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Удалить этот запрос?")) return;
    try {
      const { error } = await supabase
        .from("room_requests")
        .delete()
        .eq("id", requestId);
      if (error) throw error;

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert("Не удалось удалить запрос. Попробуйте ещё раз.");
      console.error("Ошибка удаления запроса:", err);
    }
  };
  const doneRequests = requests.filter((r) => r.status === "done");
  const handleClearDone = async () => {
    if (doneRequests.length === 0) return;
    const ok = window.confirm(
      `Вы действительно хотите удалить все запросы со статусом «Кабинет создан» (${doneRequests.length})?`
    );
    if (!ok) return;
    try {
      const ids = doneRequests.map((r) => r.id);
      const { error } = await supabase
        .from("room_requests")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setRequests((prev) => prev.filter((r) => r.status !== "done"));
    } catch (err) {
      alert("Не удалось очистить. Попробуйте ещё раз.");
      console.error("Ошибка очистки запросов:", err);
    }
  };

  if (loading) return <Loading text="Загрузка запросов..." />;
  if (error) return <div className="error">Ошибка: {error}</div>;

  if (requests.length === 0) {
    return <div className="empty-state">Запросов на новые кабинеты пока нет.</div>;
  }

  return (
    <>
      {}
      <div className="admin-list-actions">
        <button
          className="btn btn-clear"
          onClick={handleClearDone}
          disabled={doneRequests.length === 0}
        >
          Очистить обработанные ({doneRequests.length})
        </button>
      </div>

      <div className="applications-grid">
        {requests.map((req) => (
          <div className="card" key={req.id}>
            {}
            <button
              type="button"
              className="card-close-btn"
              onClick={() => handleDeleteRequest(req.id)}
              title="Удалить запрос"
            >
              ×
            </button>
            <h2 className="card-title">{req.name}</h2>
            <div className="card-time">
              {req.floor} этаж · {formatDateTime(req.created_at)}
            </div>

            <div className="card-content">
              {req.comment ? (
                <div className="request-comment-text">{req.comment}</div>
              ) : (
                <i>Без комментария</i>
              )}
            </div>

            {}
            {req.status === "done" ? (
              <div className="request-done-badge">Кабинет создан</div>
            ) : (
              <div className="request-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleCreateRoom(req)}
                >
                  Создать кабинет
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminRoomRequestsField;
