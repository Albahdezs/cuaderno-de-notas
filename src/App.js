import { useState } from "react";

// Recuepra los datos guardados en localStorage
function loadNotes() {
  const saved = localStorage.getItem("notes");
  if (!saved) return [];
  try {
    // Si no hay datos guardados, devuelve un array vacío
    const parsed = JSON.parse(saved);
    return parsed.map((note) =>
      typeof note === "string"
        ? { text: note, checked: false }
        : { text: note.text, checked: !!note.checked }
    );
  } catch (e) {
    return [];
  }
}

// Array de tareas, indica qué tarea estás editando y guarda el texto
export default function App() {
  const [notes, setNotes] = useState(loadNotes());
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Crea nueva nota no marcada, la añade al final de la lista y actualiza el estado
  function addNote(text) {
    const newNotes = [...notes, { text, checked: false }];
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Alterna el estado de la tarea entre check y no check. Actualiza lista y guarda
  function toggleCheck(index) {
    const newNotes = [...notes];
    newNotes[index].checked = !newNotes[index].checked;
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Elimina la tarea seleccionada y actualiza el estado
  function deleteNotes(index) {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Guarda las notas en localStorage
  function savedNotes(newNotes) {
    localStorage.setItem("notes", JSON.stringify(newNotes));
  }

  // Guarda la tarea editada y actualiza el estado
  function saveEdit(index) {
    const newNotes = [...notes];
    newNotes[index].text = editingText;
    setNotes(newNotes);
    savedNotes(newNotes);
    setEditingIndex(null);
  }

  return (
    <div className="app-container">
      <h1 className="app-title">📝 Cuaderno de Notas</h1>
      <div className="notes-container">
        <NoteForm addNote={addNote} />
        <p>Tareas pendientes: {notes.filter((note) => !note.checked).length}</p>
        <NoteList
          notes={notes}
          toggleCheck={toggleCheck}
          deleteNotes={deleteNotes}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          editingText={editingText}
          setEditingText={setEditingText}
          saveEdit={saveEdit}
        />
      </div>
    </div>
  );
}

function NoteList({
  notes,
  toggleCheck,
  deleteNotes,
  editingIndex,
  setEditingIndex,
  editingText,
  setEditingText,
  saveEdit,
}) {
  // Ordena las notas por estado (completadas y no completadas)
  const sortedNotes = notes
    .map((note, originalIndex) => ({ ...note, originalIndex }))
    .sort((a, b) => a.checked - b.checked);

  return (
    <ul className="notes-list">
      {/* Mapea cada nota y crea un elemento de lista */}
      {sortedNotes.map((note) => (
        <li key={note.originalIndex} className="note-item">
          {/* Checkbox para marcar como hecho */}
          <input
            type="checkbox"
            checked={note.checked}
            onChange={() => toggleCheck(note.originalIndex)}
          />

          {/* Campo de texto para editar la nota */}
          {editingIndex === note.originalIndex ? (
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={() => saveEdit(note.originalIndex)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(note.originalIndex);
              }}
              autoFocus
            />
          ) : (
            <span
              onDoubleClick={() => {
                if (!note.checked) {
                  setEditingIndex(note.originalIndex);
                  setEditingText(note.text);
                }
              }}
              style={{
                textDecoration: note.checked ? "line-through" : "none",
                marginLeft: "8px",
                cursor: "pointer",
                color: note.checked ? "#999" : "inherit",
              }}
            >
              {note.text}
            </span>
          )}
          <button
            onClick={() => deleteNotes(note.originalIndex)}
            className="delete-button"
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
}

// Componente para añadir nuevas notas
function NoteForm({ addNote }) {
  const [text, setText] = useState("");

  // Maneja el evento de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNote(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe una nota..."
        className="note-input"
      />
      <button type="submit" className="note-button">
        Añadir nota
      </button>
    </form>
  );
}
