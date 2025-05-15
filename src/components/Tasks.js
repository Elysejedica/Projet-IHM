// components/Task.js
import React, { useState } from 'react';
import Modal from './Modal';

const Task = ({ task, onUpdate, onAddMember, onRemoveMember }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');

    const handleUpdate = (updatedTask) => {
        onUpdate(updatedTask);
        setIsOpen(false);
    };

    const handleAddMember = () => {
        if (newMemberId) {
            onAddMember(task.id, newMemberId);
            setNewMemberId('');
        }
    };

    const handleRemoveMember = (memberId) => {
        onRemoveMember(task.id, memberId);
    };

    return (
        <div className="task">
            <h4 onClick={() => setIsOpen(true)}>{task.title}</h4>
            <div className="task-members">
                <h5>Membres :</h5>
                <ul>
                    {task.members.map(member => (
                        <li key={member.id}>
                            {member.name}
                            <button onClick={() => handleRemoveMember(member.id)}>Retirer</button>
                        </li>
                    ))}
                </ul>
                <input
                    type="text"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    placeholder="ID du membre à ajouter"
                />
                <button onClick={handleAddMember}>Ajouter un membre</button>
            </div>
            {isOpen && (
                <Modal
                    task={task}
                    onClose={() => setIsOpen(false)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default Task;
