import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminField.css";
import { supabase } from "../../supabaseClient";
import Loading from "../Loading/Loading";

const AdminField = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newRoomWidthM, setNewRoomWidthM] = useState("");
  const [newRoomHeightM, setNewRoomHeightM] = useState("");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null); 

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('floor', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      const formattedData = data.map(room => ({
        ...room,
        hasPlan: room.has_plan,
        scale: room.scale || null
      }));
      
      setRooms(formattedData);
    } catch (error) {
      setError("Не удалось загрузить список кабинетов.");
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName || !newRoomFloor) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          {
            name: newRoomName,
            floor: parseInt(newRoomFloor),
            description: newRoomDescription.trim() || null,
            width_m: newRoomWidthM ? parseFloat(newRoomWidthM) : null,
            height_m: newRoomHeightM ? parseFloat(newRoomHeightM) : null,
            has_plan: false,
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newRoom = {
          ...data[0],
          hasPlan: data[0].has_plan
        };
        setRooms([...rooms, newRoom]);
      }

      setShowAddModal(false);
      setNewRoomName("");
      setNewRoomFloor("");
      setNewRoomDescription("");
      setNewRoomWidthM("");
      setNewRoomHeightM("");
      
    } catch (error) {
      alert("Не удалось добавить кабинет. Попробуйте ещё раз.");
      console.error('Ошибка добавления:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот кабинет?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      setRooms(rooms.filter((room) => room.id !== roomId));
      
    } catch (error) {
      alert("Не удалось удалить кабинет. Попробуйте ещё раз.");
      console.error('Ошибка удаления:', error);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    
    if (!currentRoom || !currentRoom.name || !currentRoom.floor) return;

    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          name: currentRoom.name,
          floor: parseInt(currentRoom.floor),
          description: (currentRoom.description || "").trim() || null,
          width_m: currentRoom.widthM ? parseFloat(currentRoom.widthM) : null,
          height_m: currentRoom.heightM ? parseFloat(currentRoom.heightM) : null,
        })
        .eq('id', currentRoom.id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const updatedRooms = rooms.map(room => 
          room.id === currentRoom.id 
            ? { ...data[0], hasPlan: data[0].has_plan }
            : room
        );
        setRooms(updatedRooms);
      }

      setShowUpdateModal(false);
      setCurrentRoom(null);
      
    } catch (error) {
      alert("Не удалось сохранить изменения. Попробуйте ещё раз.");
      console.error('Ошибка обновления:', error);
    }
  };

  const openUpdateModal = (room) => {
    setCurrentRoom({
      id: room.id,
      name: room.name,
      floor: room.floor,
      description: room.description || "",
      widthM: room.width_m ? String(room.width_m) : "",
      heightM: room.height_m ? String(room.height_m) : ""
    });
    setShowUpdateModal(true);
  };

  if (loading) {
    return <Loading text="Загрузка помещений..." />;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <div className="admin-rooms">
      <div className="admin-header">
        <h1>Управление помещениями</h1>
        <button
          className="btn btn-add"
          onClick={() => setShowAddModal(true)}
        >
          + Добавить кабинет
        </button>
      </div>

      <div className="rooms-table">
        <div className="table-header">
          <div className="col-name">Название</div>
          <div className="col-floor">Этаж</div>
          <div className="col-status">Статус плана</div>
          <div className="col-actions">Действия</div>
        </div>

        {rooms.map((room) => (
          <div key={room.id} className="table-row">
            <div className="col-name">{room.name}</div>
            <div className="col-floor">{room.floor} этаж</div>
            <div className="col-status">
              {room.hasPlan ? (
                <span className="status-badge success">
                  План загружен {room.scale ? `(1px = ${room.scale} см)` : ''}
                </span>
              ) : (
                <span className="status-badge warning">План не загружен</span>
              )}
            </div>
            <div className="col-actions">
              {}
              <button
                className="btn btn-edit"
                onClick={() => navigate(`/admin/rooms/${room.id}/scheme`)}
              >
                План
              </button>
              <button
                className="btn btn-edit"
                onClick={() => openUpdateModal(room)}
              >
                Редактировать
              </button>
              <button
                className="btn btn-delete"
                onClick={() => handleDeleteRoom(room.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="empty-state">
            Пока нет добавленных кабинетов. Нажмите "Добавить кабинет", чтобы
            начать.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Добавить новый кабинет</h2>
            <form onSubmit={handleAddRoom}>
              <div className="form-group">
                <label>Название кабинета *</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Кабинет 301"
                  required
                />
              </div>
              <div className="form-group">
                <label>Этаж *</label>
                <input
                  type="number"
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(e.target.value)}
                  placeholder="2"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Например: компьютерный класс на 12 мест"
                  rows="3"
                />
              </div>
              {}
              <div className="form-group form-group--row">
                <div>
                  <label>Ширина (м)</label>
                  <input
                    type="number"
                    value={newRoomWidthM}
                    onChange={(e) => setNewRoomWidthM(e.target.value)}
                    placeholder="6.0"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <label>Высота (м)</label>
                  <input
                    type="number"
                    value={newRoomHeightM}
                    onChange={(e) => setNewRoomHeightM(e.target.value)}
                    placeholder="8.0"
                    step="0.1"
                    min="0.1"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Добавить
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && currentRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Редактировать кабинет</h2>
            <form onSubmit={handleUpdateRoom}>
              <div className="form-group">
                <label>Название кабинета *</label>
                <input
                  type="text"
                  value={currentRoom.name}
                  onChange={(e) => setCurrentRoom({
                    ...currentRoom,
                    name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Этаж *</label>
                <input
                  type="number"
                  value={currentRoom.floor}
                  onChange={(e) => setCurrentRoom({
                    ...currentRoom,
                    floor: e.target.value
                  })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={currentRoom.description}
                  onChange={(e) => setCurrentRoom({
                    ...currentRoom,
                    description: e.target.value
                  })}
                  placeholder="Например: компьютерный класс на 12 мест"
                  rows="3"
                />
              </div>
              <div className="form-group form-group--row">
                <div>
                  <label>Ширина (м)</label>
                  <input
                    type="number"
                    value={currentRoom.widthM}
                    onChange={(e) => setCurrentRoom({
                      ...currentRoom,
                      widthM: e.target.value
                    })}
                    placeholder="6.0"
                    step="0.1"
                    min="0.1"
                  />
                </div>
                <div>
                  <label>Высота (м)</label>
                  <input
                    type="number"
                    value={currentRoom.heightM}
                    onChange={(e) => setCurrentRoom({
                      ...currentRoom,
                      heightM: e.target.value
                    })}
                    placeholder="8.0"
                    step="0.1"
                    min="0.1"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-add">
                  Сохранить
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setCurrentRoom(null);
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminField;