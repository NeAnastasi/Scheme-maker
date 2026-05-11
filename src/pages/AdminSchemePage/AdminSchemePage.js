import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SchemePage from "../SchemePage/SchemePage";
import { supabase } from "../../supabaseClient";
import Loading from "../../components/Loading/Loading";
const AdminSchemePage = () => {
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const [initialElements, setInitialElements] = useState(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomResp, elementsResp] = await Promise.all([
          supabase
            .from("rooms")
            .select("id, name, floor, description, width_m, height_m")
            .eq("id", roomId)
            .single(),
          supabase
            .from("room_elements")
            .select("*")
            .eq("room_id", roomId),
        ]);

        if (roomResp.error) throw roomResp.error;
        if (elementsResp.error) throw elementsResp.error;
        const elements = elementsResp.data.map((row) => ({
          id: row.id,
          type: row.type,
          x: row.x,
          y: row.y,
          width: row.width,
          height: row.height,
          rotation: row.rotation,
          isBroken: false,
        }));

        setRoom(roomResp.data);
        setInitialElements(elements);
      } catch (err) {
        setError("Не удалось загрузить план кабинета.");
        console.error("Ошибка загрузки схемы:", err);
      }
    };

    loadData();
  }, [roomId]);

  const handleSave = async (elements) => {
    try {
      const originalIds = new Set(initialElements.map((el) => el.id));
      const currentIds = new Set(elements.map((el) => el.id));

      const toUpdate = elements.filter((el) => originalIds.has(el.id));
      const toInsert = elements.filter((el) => !originalIds.has(el.id));
      const toDeleteIds = initialElements
        .filter((el) => !currentIds.has(el.id))
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
            .eq("id", el.id)
            .then(({ error }) => {
              if (error) throw error;
            })
        )
      );
      if (toInsert.length > 0) {
        const rows = toInsert.map((el) => ({
          room_id: roomId,
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
      const { error: updateError } = await supabase
        .from("rooms")
        .update({ has_plan: elements.length > 0 })
        .eq("id", roomId);

      if (updateError) throw updateError;
      navigate("/admin/rooms");
    } catch (err) {
      alert("Не удалось сохранить план кабинета. Попробуйте ещё раз.");
      console.error("Ошибка сохранения схемы:", err);
    }
  };

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  if (initialElements === null || room === null) {
    return <Loading text="Загрузка плана кабинета..." fullScreen />;
  }

  return (
    <SchemePage
      initialElements={initialElements}
      onSave={handleSave}
      room={room}
    />
  );
};

export default AdminSchemePage;
