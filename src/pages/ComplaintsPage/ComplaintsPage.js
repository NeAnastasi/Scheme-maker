import "./ComplaintsPage.css";
import BasePage from "../BasePage/BasePage.js";
import SideComplaintsMenu from "../../components/SideComplaintsMenu/SideComplaintsMenu.js";
import { useNavigate, useParams } from "react-router-dom";
import SmallMenu from "../../components/SmallMenu/SmallMenu";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useEffect, useRef, useState } from "react";
import SVGUnmovingElement from "../../elements/SVGUnmovingElement/SVGUnmovingElement.js";
import SchemePage from "../SchemePage/SchemePage.js";
import { supabase } from "../../supabaseClient";
import Loading from "../../components/Loading/Loading";
function ComplaintsPage() {
  const navigate = useNavigate();
  const { id: roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [elements, setElements] = useState([]);
  const [brokenElements, setBrokenElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view");
  const [editorElements, setEditorElements] = useState([]);

  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    elementId: null,
    elementType: "",
    isBroken: false,
  });
  const [confirm, setConfirm] = useState({ type: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(null);
  const refreshTimerRef = useRef(null);
  const brokenElementsRef = useRef([]);
  useEffect(() => {
    brokenElementsRef.current = brokenElements;
  }, [brokenElements]);
  const draftStorageKey = `draft-room-${roomId}`;
  const [draftToRestore, setDraftToRestore] = useState(null);

  const fetchElements = async () => {
    const { data, error } = await supabase
      .from("room_elements")
      .select("*")
      .eq("room_id", roomId);
    if (error) throw error;
    return data.map((row) => ({
      id: row.id,
      type: row.type,
      x: row.x,
      y: row.y,
      width: row.width,
      height: row.height,
      rotation: row.rotation,
      isBroken: false,
    }));
  };

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);

        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("id, name, floor, description, width_m, height_m")
          .eq("id", roomId)
          .single();
        if (roomError) throw roomError;

        const mappedElements = await fetchElements();

        setRoom(roomData);
        setElements(mappedElements);
      } catch (err) {
        setError("Не удалось загрузить кабинет.");
        console.error("Ошибка загрузки кабинета:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId]);
  useEffect(() => {
    if (loading || !room) return;
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDraftToRestore(parsed);
      } else {
        localStorage.removeItem(draftStorageKey);
      }
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, [loading, room]);
  useEffect(() => {
    if (loading || draftToRestore !== null) return;
    if (brokenElements.length > 0) {
      localStorage.setItem(draftStorageKey, JSON.stringify(brokenElements));
    } else {
      localStorage.removeItem(draftStorageKey);
    }
  }, [brokenElements, loading, draftToRestore]);
  useEffect(() => {
    const refreshScheme = async () => {
      if (mode !== "view") return;
      setIsRefreshing(true);
      try {
        const elems = await fetchElements();

        const prevBroken = brokenElementsRef.current;
        const newIds = new Set(elems.map((e) => e.id));
        const survivors = prevBroken.filter((b) => newIds.has(b.id));
        const lostCount = prevBroken.length - survivors.length;

        const survivorIds = new Set(survivors.map((s) => s.id));
        const elemsWithMarks = elems.map((e) =>
          survivorIds.has(e.id) ? { ...e, isBroken: true } : e
        );

        setElements(elemsWithMarks);
        setBrokenElements(survivors);

        if (survivors.length === 0 && prevBroken.length > 0) {
          setMode("view");
        }

        setConfirm({ type: null });
        closeMenu();

        let noticeText;
        if (prevBroken.length === 0) {
          noticeText = "Администратор обновил план кабинета.";
        } else if (lostCount === 0) {
          noticeText = "Администратор обновил план. Ваши отметки сохранены.";
        } else if (survivors.length === 0) {
          noticeText = "Администратор обновил план. Ваши отметки сброшены.";
        } else {
          noticeText = `Администратор обновил план. ${lostCount} из ваших отметок снято (элементы удалены).`;
        }
        setRefreshNotice(noticeText);
        setTimeout(() => setRefreshNotice(null), 5000);
      } catch (err) {
        console.error("Ошибка обновления плана:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    const channel = supabase
      .channel(`room-elements-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_elements",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(refreshScheme, 500);
        }
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [roomId, mode]);

  const handleStartEditing = () => {
    setEditorElements(elements);
    setMode("edit");
  };

  const handleCancelEditing = () => {
    setBrokenElements([]);
    setElements((prev) => prev.map((el) => ({ ...el, isBroken: false })));
    setEditorElements([]);
    setMode("view");
  };

  const handleDeleteAll = () => {
    setConfirm({ type: "deleteAll" });
  };

  const confirmDeleteAll = () => {
    setBrokenElements([]);
    setConfirm({ type: null });
  };

  const handleRemoveProblem = (elementId) => {
    setBrokenElements((prev) => prev.filter((el) => el.id !== elementId));
  };

  const handleUpdateComment = (elementId, newComment) => {
    setBrokenElements((prev) =>
      prev.map((el) =>
        el.id === elementId ? { ...el, comment: newComment } : el
      )
    );
  };
  const handleElementClick = (elementId, clientX, clientY) => {
    const target = editorElements.find((el) => el.id === elementId);
    if (!target) return;

    const alreadyBroken = brokenElements.some((b) => b.id === elementId);
    setContextMenu({
      show: true,
      x: clientX,
      y: clientY,
      elementId,
      elementType: target.type,
      isBroken: alreadyBroken,
    });
  };

  const handleIsBroken = (problemType, comment = "") => {
    if (contextMenu.elementId) {
      const targetElement = editorElements.find(
        (el) => el.id === contextMenu.elementId
      );
      setBrokenElements((prev) => {
        const filtered = prev.filter((b) => b.id !== contextMenu.elementId);
        return [
          ...filtered,
          {
            id: contextMenu.elementId,
            elementType: targetElement?.type || contextMenu.elementType,
            problem: problemType,
            comment: comment,
          },
        ];
      });
    }

    closeMenu();
  };

  const closeMenu = () => {
    setContextMenu({
      show: false,
      x: 0,
      y: 0,
      elementId: null,
      elementType: "",
      isBroken: false,
    });
  };
  const hasLayoutChanges = () => {
    if (editorElements.length !== elements.length) return true;

    const initialById = new Map(elements.map((el) => [el.id, el]));
    for (const cur of editorElements) {
      const orig = initialById.get(cur.id);
      if (!orig) return true;
      if (
        Math.round(cur.x) !== Math.round(orig.x) ||
        Math.round(cur.y) !== Math.round(orig.y) ||
        Math.round(cur.width) !== Math.round(orig.width) ||
        Math.round(cur.height) !== Math.round(orig.height) ||
        Math.round(cur.rotation || 0) !== Math.round(orig.rotation || 0) ||
        cur.type !== orig.type
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSubmitClick = () => {
    const hasBroken = brokenElements.length > 0;
    const hasChanges = hasLayoutChanges();

    if (!hasBroken && !hasChanges) {
      alert(
        "Отметьте поломку или измените планировку, чтобы было что отправить."
      );
      return;
    }
    setConfirm({ type: "submit" });
  };

  const handleRestoreDraft = () => {
    const newIds = new Set(elements.map((e) => e.id));
    const survivors = draftToRestore.filter((d) => newIds.has(d.id));

    if (survivors.length > 0) {
      setBrokenElements(survivors);
      setEditorElements(elements);
      setMode("edit");

      const lostCount = draftToRestore.length - survivors.length;
      if (lostCount > 0) {
        setRefreshNotice(
          `Часть отметок (${lostCount}) не восстановлена — элементы были изменены.`
        );
        setTimeout(() => setRefreshNotice(null), 5000);
      }
    } else {
      localStorage.removeItem(draftStorageKey);
      setRefreshNotice(
        "Черновик не восстановлен — все отмеченные элементы были удалены администратором."
      );
      setTimeout(() => setRefreshNotice(null), 5000);
    }
    setDraftToRestore(null);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setDraftToRestore(null);
  };

  const confirmSubmit = async () => {
    setConfirm({ type: null });

    const hasBroken = brokenElements.length > 0;
    const hasChanges = hasLayoutChanges();

    try {
      if (hasBroken) {
        const editorIds = new Set(editorElements.map((e) => e.id));
        const allValid = brokenElements.every((b) => editorIds.has(b.id));
        if (!allValid) {
          const survivors = brokenElements.filter((b) => editorIds.has(b.id));
          setBrokenElements(survivors);
          const noticeText =
            survivors.length === 0
              ? "Часть элементов изменилась. Отмеченных поломок не осталось."
              : "Часть отметок снято — связанные элементы изменились. Проверьте и нажмите Отправить ещё раз.";
          setRefreshNotice(noticeText);
          setTimeout(() => setRefreshNotice(null), 5000);
          return;
        }
      }
      if (hasBroken) {
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .insert([{ room_id: roomId }])
          .select()
          .single();
        if (appError) throw appError;

        const problemRows = brokenElements.map((el) => ({
          application_id: appData.id,
          element_id: el.id,
          element_type: el.elementType,
          problem: el.problem,
          comment: el.comment || "",
        }));

        const { error: problemsError } = await supabase
          .from("application_problems")
          .insert(problemRows);
        if (problemsError) throw problemsError;
      }
      if (hasChanges) {
        const { data: proposal, error: pErr } = await supabase
          .from("layout_proposals")
          .insert([{ room_id: roomId, status: "pending" }])
          .select()
          .single();
        if (pErr) throw pErr;
        const originalIds = new Set(elements.map((el) => el.id));
        const rows = editorElements.map((el) => ({
          proposal_id: proposal.id,
          source_element_id: originalIds.has(el.id) ? el.id : null,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          rotation: Math.round(el.rotation || 0),
        }));

        if (rows.length > 0) {
          const { error: eErr } = await supabase
            .from("proposal_elements")
            .insert(rows);
          if (eErr) throw eErr;
        }
      }
      localStorage.removeItem(draftStorageKey);
      const toast =
        hasBroken && hasChanges
          ? "Заявка о поломках и предложение отправлены"
          : hasBroken
          ? "Заявка отправлена"
          : "Предложение отправлено";
      navigate("/", { state: { toast } });
    } catch (err) {
      alert("Не удалось отправить. Попробуйте ещё раз через минуту.");
      console.error("Ошибка отправки:", err);
    }
  };

  if (loading) {
    return (
      <BasePage mainContent={<Loading text="Загрузка кабинета..." />} />
    );
  }

  if (error) {
    return (
      <BasePage mainContent={<div className="error">Ошибка: {error}</div>} />
    );
  }

  if (!room) {
    return (
      <BasePage mainContent={<div>Кабинет не найден.</div>} />
    );
  }
  const renderEditSidebar = (api) => (
    <SideComplaintsMenu
      mode="edit"
      roomName={room.name}
      roomFloor={room.floor}
      roomDescription={room.description}
      brokenElements={brokenElements}
      onCancel={handleCancelEditing}
      onDeleteAll={handleDeleteAll}
      onRemoveProblem={handleRemoveProblem}
      onChangeComment={handleUpdateComment}
      onSubmit={handleSubmitClick}
      onDragStart={api.onDragStart}
      onDragCancel={api.onDragCancel}
      isDragging={api.isDragging}
      canShowGrid={api.canShowGrid}
      gridOn={api.gridOn}
      gridOpacity={api.gridOpacity}
      onGridToggle={api.onGridToggle}
      onGridOpacityChange={api.onGridOpacityChange}
      canShowZoom={api.canShowZoom}
      scale={api.scale}
      onZoomIn={api.onZoomIn}
      onZoomOut={api.onZoomOut}
      onZoomReset={api.onZoomReset}
    />
  );
  const brokenIds = new Set(brokenElements.map((b) => b.id));

  return (
    <>
      {mode === "edit" ? (
        <SchemePage
          initialElements={elements}
          room={room}
          sidebar={renderEditSidebar}
          brokenIds={brokenIds}
          onElementClick={handleElementClick}
          onDragStartReal={closeMenu}
          onElementsChange={setEditorElements}
        />
      ) : (
        <BasePage
          sidebar={
            <SideComplaintsMenu
              mode="view"
              roomName={room.name}
              roomFloor={room.floor}
              roomDescription={room.description}
              onStartEditing={handleStartEditing}
            />
          }
          mainContent={
            <div className="SVGFieldCanvas">
              <svg width="100%" height="100%">
                {elements.map((element) => (
                  <SVGUnmovingElement
                    key={element.id}
                    element={element}
                    onContextMenu={() => {}}
                  />
                ))}
              </svg>
            </div>
          }
        />
      )}

      {}
      {contextMenu.show && (
        <SmallMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementType={contextMenu.elementType}
          isBroken={contextMenu.isBroken}
          handleIsBroken={handleIsBroken}
          onClose={closeMenu}
        />
      )}

      <ConfirmModal
        isOpen={confirm.type === "deleteAll"}
        title="Удалить все отметки?"
        message="Все отмеченные поломки будут сняты. Изменения планировки сохранятся."
        confirmText="Удалить"
        onConfirm={confirmDeleteAll}
        onCancel={() => setConfirm({ type: null })}
      />

      <ConfirmModal
        isOpen={confirm.type === "submit"}
        title="Отправить?"
        message={(() => {
          const parts = [];
          if (brokenElements.length > 0) {
            const n = brokenElements.length;
            parts.push(
              `${n} ${n === 1 ? "поломка" : "поломок"}`
            );
          }
          if (hasLayoutChanges()) parts.push("изменение планировки");
          return `Будет отправлено: ${parts.join(" + ")}. После отправки изменить нельзя.`;
        })()}
        confirmText="Отправить"
        onConfirm={confirmSubmit}
        onCancel={() => setConfirm({ type: null })}
      />

      <ConfirmModal
        isOpen={draftToRestore !== null}
        title="Восстановить незавершённую заявку?"
        message={`У вас остались несохранённые отметки в этом кабинете (${draftToRestore?.length || 0}). Хотите продолжить с того же места?`}
        confirmText="Восстановить"
        cancelText="Удалить черновик"
        onConfirm={handleRestoreDraft}
        onCancel={handleDiscardDraft}
      />

      {isRefreshing && (
        <div className="scheme-refresh-overlay">
          <div className="scheme-refresh-spinner">План обновляется...</div>
        </div>
      )}

      {refreshNotice && (
        <div className="scheme-refresh-notice">{refreshNotice}</div>
      )}
    </>
  );
}

export default ComplaintsPage;
