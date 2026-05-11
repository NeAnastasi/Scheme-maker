import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import SVGUnmovingElement from "../../elements/SVGUnmovingElement/SVGUnmovingElement";
import Loading from "../Loading/Loading";
import "./ApplicationSchemeModal.css";
const PIXELS_PER_METER = 50;
const RULER_SIZE = 30;
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
const ApplicationSchemeModal = ({ app, onClose }) => {
  const [elements, setElements] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!app) return;
    const load = async () => {
      try {
        setLoading(true);
        const roomId = app.rooms?.id || app.room_id;

        const [roomResp, elementsResp] = await Promise.all([
          supabase
            .from("rooms")
            .select("id, name, floor, width_m, height_m")
            .eq("id", roomId)
            .single(),
          supabase
            .from("room_elements")
            .select("*")
            .eq("room_id", roomId),
        ]);

        if (roomResp.error) throw roomResp.error;
        if (elementsResp.error) throw elementsResp.error;

        setRoom(roomResp.data);
        setElements(elementsResp.data || []);
      } catch (err) {
        setError("Не удалось загрузить схему.");
        console.error("Ошибка загрузки схемы для заявки:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [app]);

  if (!app) return null;

  const problems = app.application_problems || [];
  const brokenIds = new Set(
    problems.filter((p) => p.element_id).map((p) => p.element_id)
  );
  const elementsToRender = elements.map((row) => ({
    id: row.id,
    type: row.type,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    rotation: row.rotation,
    isBroken: brokenIds.has(row.id),
  }));
  const hasSize = !!(room && room.width_m && room.height_m);
  let viewBox;
  let roomRect = null;
  if (hasSize) {
    const w = RULER_SIZE * 2 + room.width_m * PIXELS_PER_METER;
    const h = RULER_SIZE * 2 + room.height_m * PIXELS_PER_METER;
    viewBox = `0 0 ${w} ${h}`;
    roomRect = (
      <rect
        x={RULER_SIZE}
        y={RULER_SIZE}
        width={room.width_m * PIXELS_PER_METER}
        height={room.height_m * PIXELS_PER_METER}
        fill="#fafafa"
        stroke="#666"
        strokeWidth="1"
      />
    );
  } else if (elements.length > 0) {
    const maxX = Math.max(...elements.map((el) => el.x + el.width));
    const maxY = Math.max(...elements.map((el) => el.y + el.height));
    viewBox = `0 0 ${maxX + 40} ${maxY + 40}`;
  } else {
    viewBox = "0 0 600 400";
  }
  const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const d = new Date(app.created_at);
  const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const roomTitle = app.rooms
    ? `${app.rooms.name}, ${app.rooms.floor} этаж`
    : "Кабинет удалён";

  return (
    <div
      className="scheme-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="scheme-modal">
        <div className="scheme-modal-header">
          <h2 className="scheme-modal-title">
            Заявка · {roomTitle} · {dateStr}
          </h2>
          <button
            type="button"
            className="scheme-modal-close"
            onClick={onClose}
            title="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="scheme-modal-body">
          <aside className="scheme-modal-sidebar">
            <h3 className="scheme-modal-sidebar-title">
              Поломки ({problems.length})
            </h3>

            {problems.length === 0 ? (
              <div className="scheme-modal-empty">Нет отметок</div>
            ) : (
              problems.map((p) => {
                const elementLabel = translateElementType(p.element_type);
                const problemLabel = translateProblem(p.problem);
                const label =
                  elementLabel === problemLabel
                    ? elementLabel
                    : `${elementLabel} — ${problemLabel}`;
                const isRemoved = !p.element_id;
                return (
                  <div
                    key={p.id}
                    className={
                      "scheme-modal-problem" +
                      (isRemoved ? " scheme-modal-problem-removed" : "")
                    }
                  >
                    <div className="scheme-modal-problem-title">{label}</div>
                    {p.comment && (
                      <div className="scheme-modal-problem-comment">
                        {p.comment}
                      </div>
                    )}
                    {isRemoved && (
                      <div className="scheme-modal-problem-removed-note">
                        Элемент удалён из плана
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </aside>

          <div className="scheme-modal-canvas">
            {loading ? (
              <Loading text="Загрузка схемы..." />
            ) : error ? (
              <div className="error">Ошибка: {error}</div>
            ) : elements.length === 0 ? (
              <div className="scheme-modal-empty">
                В этом кабинете ещё нет плана
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
              >
                {roomRect}
                {elementsToRender.map((el) => (
                  <SVGUnmovingElement
                    key={el.id}
                    element={el}
                    onContextMenu={() => {}}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSchemeModal;
