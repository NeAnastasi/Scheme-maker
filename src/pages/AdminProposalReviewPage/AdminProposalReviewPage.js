import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminProposalReviewPage.css";
import BasePage from "../BasePage/BasePage";
import BaseSideMenu from "../../components/BaseSideMenu/BaseSideMenu";
import AdminSideMenu from "../../components/AdminSideMenu/AdminSideMenu";
import SVGUnmovingElement from "../../elements/SVGUnmovingElement/SVGUnmovingElement";
import SchemePage from "../SchemePage/SchemePage";
import MenuItem from "../../components/MenuItem/MenuItem";
import Button from "../../components/Button/Button";
import { supabase } from "../../supabaseClient";
import Loading from "../../components/Loading/Loading";
const EditingSidebar = ({ api, onDone }) => {
  const menuItems = [
    { iconType: "Table", label: "Стол" },
    { iconType: "PC", label: "Компьютер" },
    { iconType: "Screen", label: "Экран" },
    { iconType: "Speaker", label: "Колонка" },
  ];

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (api.isDragging && api.onDragCancel) api.onDragCancel();
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [api.isDragging, api.onDragCancel]);

  return (
    <BaseSideMenu
      title="Редактирование предложения"
      mainContent={
        <>
          <h4 className="side-section-title">Элементы</h4>
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="menu-item-wrapper"
                onMouseDown={(e) => {
                  e.preventDefault();
                  api.onDragStart(item.iconType);
                }}
                style={{
                  cursor: api.isDragging ? "grabbing" : "grab",
                  opacity: api.isDragging ? 0.7 : 1,
                }}
              >
                <MenuItem iconType={item.iconType} />
                <span className="item-label">{item.label}</span>
              </div>
            ))}
          </div>

          {api.canShowGrid && (
            <div className="grid-controls">
              <label className="grid-checkbox">
                <input
                  type="checkbox"
                  checked={api.gridOn}
                  onChange={(e) => api.onGridToggle(e.target.checked)}
                />
                <span>Сетка</span>
              </label>
              <div className="grid-opacity">
                <span>Контраст</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={api.gridOpacity}
                  onChange={(e) =>
                    api.onGridOpacityChange(parseFloat(e.target.value))
                  }
                  disabled={!api.gridOn}
                />
              </div>
            </div>
          )}

          {api.canShowZoom && (
            <div className="zoom-controls">
              <button type="button" onClick={api.onZoomOut} title="Уменьшить">
                −
              </button>
              <button
                type="button"
                className="zoom-reset"
                onClick={api.onZoomReset}
                title="По размеру окна"
              >
                {Math.round((api.scale || 1) * 100)}%
              </button>
              <button type="button" onClick={api.onZoomIn} title="Увеличить">
                +
              </button>
            </div>
          )}
        </>
      }
      buttons={
        <div className="button-container">
          <Button text="Готово" onClick={onDone} />
        </div>
      }
    />
  );
};
const AdminProposalReviewPage = () => {
  const navigate = useNavigate();
  const { id: proposalId } = useParams();

  const [proposal, setProposal] = useState(null);
  const [room, setRoom] = useState(null);
  const [currentElements, setCurrentElements] = useState([]);
  const [proposedElements, setProposedElements] = useState([]);
  const [editorElements, setEditorElements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("proposed");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        const { data: prop, error: pErr } = await supabase
          .from("layout_proposals")
          .select("id, room_id, status, created_at")
          .eq("id", proposalId)
          .single();
        if (pErr) throw pErr;

        const { data: roomData, error: rErr } = await supabase
          .from("rooms")
          .select("id, name, floor, description, width_m, height_m")
          .eq("id", prop.room_id)
          .single();
        if (rErr) throw rErr;

        const [currentResp, proposedResp] = await Promise.all([
          supabase.from("room_elements").select("*").eq("room_id", prop.room_id),
          supabase.from("proposal_elements").select("*").eq("proposal_id", prop.id),
        ]);
        if (currentResp.error) throw currentResp.error;
        if (proposedResp.error) throw proposedResp.error;

        const mapElement = (row) => ({
          id: row.id,
          type: row.type,
          x: row.x,
          y: row.y,
          width: row.width,
          height: row.height,
          rotation: row.rotation,
          isBroken: false,
        });

        const proposed = proposedResp.data.map((row) => ({
          ...mapElement(row),
          source_element_id: row.source_element_id,
        }));

        setProposal(prop);
        setRoom(roomData);
        setCurrentElements(currentResp.data.map(mapElement));
        setProposedElements(proposed);
        setEditorElements(proposed);
      } catch (err) {
        setError("Не удалось загрузить предложение.");
        console.error("Ошибка загрузки предложения:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [proposalId]);
  const handleAccept = async () => {
    if (!window.confirm("Принять это предложение и применить к кабинету?")) {
      return;
    }
    try {
      setSaving(true);

      const originalIds = new Set(currentElements.map((el) => el.id));

      const toUpdate = editorElements.filter(
        (el) => el.source_element_id && originalIds.has(el.source_element_id)
      );
      const toInsert = editorElements.filter(
        (el) => !el.source_element_id || !originalIds.has(el.source_element_id)
      );
      const proposalSourceIds = new Set(
        editorElements
          .filter((el) => el.source_element_id)
          .map((el) => el.source_element_id)
      );
      const toDeleteIds = currentElements
        .filter((el) => !proposalSourceIds.has(el.id))
        .map((el) => el.id);

      await Promise.all(
        toUpdate.map((el) =>
          supabase
            .from("room_elements")
            .update({
              type: el.type,
              x: Math.round(el.x),
              y: Math.round(el.y),
              width: Math.round(el.width),
              height: Math.round(el.height),
              rotation: Math.round(el.rotation || 0),
            })
            .eq("id", el.source_element_id)
            .then(({ error }) => {
              if (error) throw error;
            })
        )
      );

      if (toInsert.length > 0) {
        const rows = toInsert.map((el) => ({
          room_id: proposal.room_id,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          rotation: Math.round(el.rotation || 0),
        }));
        const { error: insertError } = await supabase
          .from("room_elements")
          .insert(rows);
        if (insertError) throw insertError;
      }

      if (toDeleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("room_elements")
          .delete()
          .in("id", toDeleteIds);
        if (deleteError) throw deleteError;
      }

      const finalCount =
        currentElements.length - toDeleteIds.length + toInsert.length;
      const { error: roomUpdateError } = await supabase
        .from("rooms")
        .update({ has_plan: finalCount > 0 })
        .eq("id", proposal.room_id);
      if (roomUpdateError) throw roomUpdateError;

      const { error: statusError } = await supabase
        .from("layout_proposals")
        .update({ status: "accepted" })
        .eq("id", proposal.id);
      if (statusError) throw statusError;

      navigate("/admin/layout-proposals");
    } catch (err) {
      alert("Не удалось применить предложение. Попробуйте ещё раз.");
      console.error("Ошибка применения предложения:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Отклонить это предложение?")) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("layout_proposals")
        .update({ status: "rejected" })
        .eq("id", proposal.id);
      if (error) throw error;
      navigate("/admin/layout-proposals");
    } catch (err) {
      alert("Не удалось отклонить предложение.");
      console.error("Ошибка отклонения предложения:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BasePage
        sidebar={<AdminSideMenu />}
        mainContent={<Loading text="Загрузка предложения..." />}
      />
    );
  }
  if (error) {
    return (
      <BasePage
        sidebar={<AdminSideMenu />}
        mainContent={<div className="error">Ошибка: {error}</div>}
      />
    );
  }

  const isPending = proposal.status === "pending";
  if (editing) {
    return (
      <SchemePage
        initialElements={editorElements}
        room={room}
        sidebar={(api) => (
          <EditingSidebar api={api} onDone={() => setEditing(false)} />
        )}
        onElementsChange={setEditorElements}
      />
    );
  }
  const elementsToShow =
    view === "current" ? currentElements : editorElements;

  return (
    <BasePage
      sidebar={<AdminSideMenu />}
      mainContent={
        <div className="proposal-review">
          <div className="proposal-review__header">
            <div>
              <h2 className="proposal-review__title">
                {room.name}, {room.floor} этаж
              </h2>
              {room.description && (
                <div className="proposal-review__desc">{room.description}</div>
              )}
            </div>
            <div className="proposal-review__toggle">
              <button
                className={view === "current" ? "active" : ""}
                onClick={() => setView("current")}
              >
                Текущий план
              </button>
              <button
                className={view === "proposed" ? "active" : ""}
                onClick={() => setView("proposed")}
              >
                Предложенный план
              </button>
            </div>
          </div>

          <div className="proposal-review__canvas">
            <svg width="100%" height="100%">
              {elementsToShow.map((el) => (
                <SVGUnmovingElement
                  key={el.id}
                  element={el}
                  onContextMenu={() => {}}
                />
              ))}
            </svg>
          </div>

          <div className="proposal-review__actions">
            {isPending ? (
              <>
                {}
                {view === "proposed" && (
                  <button
                    className="btn btn-edit"
                    onClick={() => setEditing(true)}
                    disabled={saving}
                  >
                    Редактировать
                  </button>
                )}
                <button
                  className="btn btn-accept"
                  onClick={handleAccept}
                  disabled={saving}
                >
                  Принять
                </button>
                <button
                  className="btn btn-reject"
                  onClick={handleReject}
                  disabled={saving}
                >
                  Отклонить
                </button>
              </>
            ) : (
              <div
                className={`proposal-review__status status-${proposal.status}`}
              >
                {proposal.status === "accepted"
                  ? "Это предложение уже принято"
                  : "Это предложение уже отклонено"}
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};

export default AdminProposalReviewPage;
