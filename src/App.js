import { useState } from "react";

// Recupera los datos guardados en localStorage
function loadNotes() {
  const saved = localStorage.getItem("notes");
  if (!saved) return [];
  try {
    // Parse las notas guardadas y las convierte a un formato adecuado
    const parsed = JSON.parse(saved);
    return parsed.map((note) =>
      // Si la nota es un string, la convierte a un objeto con checked en false
      typeof note === "string"
        ? // Si no hay error, devuelve un array de objetos con text y checked
          { text: note, checked: false }
        : // Si la nota es un objeto, asegura que checked sea un booleano
          { text: note.text, checked: !!note.checked }
    );
    // Si hay un error en el parseo, devuelve un array vacío
  } catch (e) {
    return [];
  }
}

// Array de notas, indica qué nota estás editando y guarda el texto
export default function App() {
  const [notes, setNotes] = useState(loadNotes());
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Crea nueva nota, la añade al final de la lista y actualiza el estado
  function addNote(text) {
    const newNotes = [...notes, { text, checked: false }];
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Alterna el estado de la nota entre check y no check. Actualiza lista y guarda
  function toggleCheck(index) {
    const newNotes = [...notes];
    newNotes[index].checked = !newNotes[index].checked;
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Elimina la nota seleccionada por su indice, actualiza el estado y guarda notas
  function deleteNotes(index) {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
    savedNotes(newNotes);
  }

  // Función auxiliar que guarda las notas en localStorage
  function savedNotes(newNotes) {
    localStorage.setItem("notes", JSON.stringify(newNotes));
  }

  // Guarda los cambios de la nota cuando terminas de editarla
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

// Componente que recibe la lista de notas y las muestra
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
  // Mapea las notas y ordena las notas por estado (completadas y no completadas)
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

// Componente de formulario para añadir nuevas notas
function NoteForm({ addNote }) {
  const [text, setText] = useState("");

  // Maneja el evento de envío del formulario a la función addNote
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
