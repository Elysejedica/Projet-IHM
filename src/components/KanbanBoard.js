import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import axios from 'axios';
import '../styles/KanbanBoard.css';
import Column from './Column';
import Modal from './Modal'; 

const API_URL = 'http://localhost:8000/api';

const KanbanBoard = () => {
  const [columns, setColumns] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/columns/`)
      .then((res) => {
        setColumns(res.data);
      })
      .catch((err) => {
        console.error('Erreur chargement colonnes :', err);
      });
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const reload = () => {
    axios.get(`${API_URL}/columns/`)
      .then((res) => setColumns(res.data));
  };

  const logAction = async (taskId, action, details) => {
    await axios.post(`${API_URL}/tasks/${taskId}/history/`, {
        action,
        details,
    });
  };

  const addMemberToTask = async (taskId, userId) => {
    await axios.post(`${API_URL}/tasks/${taskId}/members/`, { userId });
    showMessage(`✅ Membre ajouté à la tâche ${taskId}`);
  };

  const removeMemberFromTask = async (taskId, userId) => {
    await axios.delete(`${API_URL}/tasks/${taskId}/members/${userId}/`);
    showMessage(`🗑️ Membre retiré de la tâche ${taskId}`);
  };

  const addTask = async (columnId, newTaskTitle) => {
    if (newTaskTitle.trim() === '') {
      showMessage('❌ Le titre de la tâche ne peut pas être vide');
      return;
    }

    const response = await axios.post(`${API_URL}/tasks/`, {
      title: newTaskTitle,
      column: columnId,
      order: 0,
    });

    const newTaskId = response.data.id; 
    await logAction(newTaskId, 'ajout', { title: newTaskTitle });
    showMessage('✅ Tâche ajoutée');
    reload();
  };

  const removeTask = (taskId) => {
    axios.delete(`${API_URL}/tasks/${taskId}/`).then(() => {
      showMessage('🗑️ Tâche supprimée');
      reload();
    }).catch(err => {
      showMessage('❌ Erreur suppression tâche');
      console.error('Erreur:', err);
    });
  };

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

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColIndex = columns.findIndex(c => c.id === parseInt(source.droppableId));
    const destColIndex = columns.findIndex(c => c.id === parseInt(destination.droppableId));

    const sourceCol = { ...columns[sourceColIndex] };
    const destCol = { ...columns[destColIndex] };

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

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

  const handleTaskClick = (task) => {
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(null);
    } else {
      setSelectedTask(task);
    }
  };

  return (
    <div className={`kanban-container ${darkMode ? 'dark' : 'light'}`}>
      <header className="kanban-header">
        <h1>Mini Trello</h1>
        <button onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? '☀️' : '🌙'}
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
                  onTaskClick={handleTaskClick}
                  onAddMember={addMemberToTask} // Passer la fonction ici
                  onRemoveMember={removeMemberFromTask} // Passer la fonction ici
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal task={selectedTask} onClose={() => setSelectedTask(null)} darkMode={darkMode} />

      {message && (
        <div className="message-popup">
          {message}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
