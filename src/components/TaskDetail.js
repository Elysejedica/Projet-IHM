import React, { useEffect, useState } from 'react';
import AddMember from './AddMember';

const TaskDetail = ({ taskId }) => {
    const [task, setTask] = useState(null);
    const [isAddingMember, setIsAddingMember] = useState(false); // État pour contrôler l'affichage du formulaire

    useEffect(() => {
        fetch(`/api/tasks/${taskId}/`)
            .then(response => response.json())
            .then(data => setTask(data))
            .catch(error => console.error('Erreur:', error));
    }, [taskId]);

    const handleMemberAdded = () => {
        // Mettre à jour la tâche pour afficher le nouveau membre
        fetch(`/api/tasks/${taskId}/`)
            .then(response => response.json())
            .then(data => setTask(data));
        setIsAddingMember(false); // Fermer le formulaire après ajout
    };

    if (!task) return <div>Chargement...</div>;

    return (
        <div>
            <h1>{task.title}</h1>
            <h2>Membres</h2>
            <ul>
                {task.members.map(member => (
                    <li key={member.id}>{member.username}</li>
                ))}
            </ul>
            <button onClick={() => setIsAddingMember(true)}>Ajouter un Membre</button> {/* Bouton pour ajouter un membre */}
            {isAddingMember && <AddMember taskId={taskId} onMemberAdded={handleMemberAdded} />} {/* Afficher le formulaire si isAddingMember est vrai */}
        </div>
    );
};

export default TaskDetail;
