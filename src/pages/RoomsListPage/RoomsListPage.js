import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BasePage from "../BasePage/BasePage";
import Loading from "../../components/Loading/Loading";
import RoomRequestModal from "../../components/RoomRequestModal/RoomRequestModal";
import { supabase } from "../../supabaseClient";
import "./RoomsListPage.css";
const RoomsListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(location.state?.toast || null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const handleSubmitRoomRequest = async ({ name, floor, comment }) => {
    try {
      const { error } = await supabase
        .from("room_requests")
        .insert([{ name, floor, comment }]);
      if (error) throw error;
      setShowRequestModal(false);
      setToast("Запрос отправлен. Админ скоро добавит кабинет.");
    } catch (err) {
      alert("Не удалось отправить запрос. Попробуйте ещё раз.");
      console.error("Ошибка отправки запроса кабинета:", err);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("rooms")
          .select("id, name, floor")
          .eq("has_plan", true)
          .order("floor", { ascending: true })
          .order("name", { ascending: true });

        if (error) throw error;
        setRooms(data);
      } catch (err) {
        setError("Не удалось загрузить список кабинетов.");
        console.error("Ошибка загрузки кабинетов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <BasePage mainContent={<Loading text="Загрузка кабинетов..." />} />;
  }

  return (
    <BasePage
      mainContent={
        <div className="rooms-list">
          {toast && <div className="toast-success">{toast}</div>}

          <h1 className="rooms-list-title">Кабинеты</h1>
          <p className="rooms-list-hint">
            Выберите кабинет, чтобы оставить заявку о поломке.
          </p>

          {error && <div className="error">Ошибка: {error}</div>}

          {!error && rooms.length === 0 && (
            <div className="empty-state">
              Пока нет кабинетов с готовым планом.
            </div>
          )}

          <div className="rooms-grid">
            {rooms.map((room) => (
              <button
                key={room.id}
                className="room-card"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <div className="room-card-name">{room.name}</div>
                <div className="room-card-floor">{room.floor} этаж</div>
              </button>
            ))}
          </div>

          {}
          <div className="rooms-list-request">
            <p className="rooms-list-request-hint">
              Не нашли нужный кабинет?
            </p>
            <button
              type="button"
              className="btn btn-request"
              onClick={() => setShowRequestModal(true)}
            >
              Запросить новый кабинет
            </button>
          </div>

          <RoomRequestModal
            isOpen={showRequestModal}
            onSubmit={handleSubmitRoomRequest}
            onCancel={() => setShowRequestModal(false)}
          />
        </div>
      }
    />
  );
};

export default RoomsListPage;
