import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import axios from 'axios';
import '../styles/KanbanBoard.css';
import Column from './Column';

const API_URL = 'http://localhost:8000/api';

const KanbanBoard = () => {
  const [columns, setColumns] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');

  // Charger les colonnes et les tâches depuis le backend
  useEffect(() => {
    axios.get(`${API_URL}/columns/`)
      .then((res) => {
        console.log('Colonnes chargées:', res.data);
        setColumns(res.data);
      })
      .catch((err) => {
        console.error('Erreur chargement colonnes :', err);
      });
  }, []);

  // Thème sombre
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Afficher un message temporaire
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const reload = () => {
    axios.get(`${API_URL}/columns/`)
      .then((res) => setColumns(res.data));
  };

  // Ajouter une tâche
  const addTask = (columnId, newTaskTitle) => {
    if (newTaskTitle.trim() === '') {
      showMessage('❌ Le titre de la tâche ne peut pas être vide');
      return;
    }

    axios.post(`${API_URL}/tasks/`, {
      title: newTaskTitle,
      column: columnId,
      order: 0,
    }).then(() => {
      showMessage('✅ Tâche ajoutée');
      reload();
    }).catch(err => {
      showMessage('❌ Erreur ajout tâche');
      console.error('Erreur:', err);
    });
  };

  // Supprimer une tâche
  const removeTask = (taskId) => {
    axios.delete(`${API_URL}/tasks/${taskId}/`).then(() => {
      showMessage('🗑️ Tâche supprimée');
      reload();
    }).catch(err => {
      showMessage('❌ Erreur suppression tâche');
      console.error('Erreur:', err);
    });
  };

  // Modifier une tâche
  const editTask = (taskId, newTitle) => {
  if (newTitle.trim() === '') {
    showMessage('❌ Le titre ne peut pas être vide');
    return;
  }

  axios.patch(`${API_URL}/tasks/${taskId}/`, { title: newTitle }).then(() => {
    showMessage('✏️ Tâche modifiée');
    reload();
  }).catch(err => {
    showMessage('❌ Erreur modification tâche');
    console.error('Erreur:', err);
  });
};


  // Gérer le drag-and-drop
  const onDragEnd = async (result) => {
  const { source, destination } = result;
  if (!destination) return;

  const sourceColIndex = columns.findIndex(c => c.id === parseInt(source.droppableId));
  const destColIndex = columns.findIndex(c => c.id === parseInt(destination.droppableId));

  const sourceCol = { ...columns[sourceColIndex] };
  const destCol = { ...columns[destColIndex] };

  const [movedTask] = sourceCol.tasks.splice(source.index, 1);
  destCol.tasks.splice(destination.index, 0, movedTask);

  // Mettre à jour les ordres dans source
  const updateTasksOrder = async (tasks, columnId) => {
    for (let i = 0; i < tasks.length; i++) {
      await axios.patch(`${API_URL}/tasks/${tasks[i].id}/`, {
        order: i,
        column: columnId
      });
    }
  };

  try {
    await updateTasksOrder(sourceCol.tasks, sourceCol.id);
    if (sourceCol.id !== destCol.id) {
      await updateTasksOrder(destCol.tasks, destCol.id);
    }

    showMessage('🔁 Tâches mises à jour');
    reload();
  } catch (err) {
    console.error('Erreur de mise à jour ordre des tâches', err);
    showMessage('❌ Erreur lors du déplacement');
  }
};


  return (
    <div className={`kanban-container ${darkMode ? 'dark' : 'light'}`}>
      <header className="kanban-header">
        <h1>Mini Trello</h1>
        <button onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={`${column.id}`}>
              {(provided) => (
                <Column
                  key={column.id}
                  column={column}
                  provided={provided}
                  addTask={addTask}
                  removeTask={removeTask}
                  editTask={editTask}
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {message && (
        <div className="message-popup">
          {message}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
