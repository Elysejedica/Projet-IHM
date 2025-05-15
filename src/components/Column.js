import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Column = ({ column, provided, addTask, removeTask, editTask, onTaskClick }) => {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      addTask(column.id, newTaskTitle);
      setNewTaskTitle('');
      setAddingTask(false);
    }
  };

  const handleRemoveTask = (taskId) => {
    const card = document.getElementById(`task-${taskId}`);
    if (card) {
      card.classList.add("fade-out");
      setTimeout(() => removeTask(taskId), 300);
    } else {
      removeTask(taskId);
    }
  };

  const handleEdit = (taskId) => {
    if (editedTitle.trim()) {
      editTask(taskId, editedTitle);
      setEditingTaskId(null);
      setEditedTitle('');
    }
  };

  // ✅ Tri des tâches selon la propriété "order"
  const sortedTasks = [...column.tasks].sort((a, b) => a.order - b.order);

  return (
    <div
      className="kanban-column"
      ref={provided.innerRef}
      {...provided.droppableProps}
    >
      <h2>{column.title}</h2>

      {addingTask ? (
        <div className="task-input">
          <input
            className="task-edit-input"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nouvelle tâche..."
            autoFocus
          />
          <div className="task-edit-actions">
            <button className="btn-save" onClick={handleAdd}>Valider</button>
            <button
              className="btn-cancel"
              onClick={() => {
                setAddingTask(false);
                setNewTaskTitle('');
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => setAddingTask(true)}>
          <span role="img" aria-label="ajouter">➕</span> Ajouter une tâche
        </button>
      )}

      <div className="task-list">
        {sortedTasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
            {(provided) => (
              <div
                id={`task-${task.id}`}
                className="task-card"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick = {() => onTaskClick(task)}
              >
                {editingTaskId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div className="task-input-actions">
                      <button onClick={() => handleEdit(task.id)}>Valider</button>
                      <button onClick={() => setEditingTaskId(null)}>Annuler</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{task.title}</p>
                    <div className="task-actions">
                      <button onClick={() => {
                        setEditingTaskId(task.id);
                        setEditedTitle(task.title);
                      }}>
                        <span role="img" aria-label="modifier">✏️</span>
                      </button>
                      <button onClick={() => handleRemoveTask(task.id)}>
                        <span role="img" aria-label="supprimer">🗑️</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  );
};

export default Column;
