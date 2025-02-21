import { createContext, useState, useEffect, useRef } from "react";

export const TodoContext = createContext(null);

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem("kanbanTodos");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });

  const [isEdit, setEdit] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const dialogRef = useRef(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditDeleteBoard, setIsEditDeleteBoard] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);  
  const columns = currentBoard?.columns ?? [];
  const isEmptyBoard =
  columns.length === 0 ||
  columns.every((col) => Array.isArray(col.tasks) && col.tasks.length === 0);


  useEffect(() => {
    localStorage.setItem("kanbanTodos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (todos.length === 0) {
      async function fetchNotes() {
        const data = await fetch("data/data.json").then((r) => r.json());
        setTodos(data.boards);
        localStorage.setItem("kanbanTodos", JSON.stringify(data.boards)); 
      }
      fetchNotes();
    }
  }, []);

  function openTaskModal(isEditMode = false, task = null) {
    setEdit(isEditMode);             
    setSelectedTask(task);          
    setIsTaskModalOpen(true);       
  }  

  function closeTaskModal() {
    setIsTaskModalOpen(false);
  }

  function deleteModal() {
    setIsDeleteModal((prev) => !prev);
  }

  // ✅ Yeni: Kolonları güncelleyen fonksiyon
  function updateBoardColumns(newColumns) {
    if (!currentBoard) return;
  
    const sanitizedColumns = newColumns.map((col) => ({
      ...col,
      tasks: Array.isArray(col.tasks) ? col.tasks : [], // ✅ tasks garantileniyor
    }));
  
    const updatedBoard = { ...currentBoard, columns: sanitizedColumns };
  
    setTodos((prevTodos) =>
      prevTodos.map((board) =>
        board.id === currentBoard.id ? updatedBoard : board
      )
    );
  
    setCurrentBoard(updatedBoard); // ✅ Güncellenmiş board anında yansır
  }
  

  return (
    <TodoContext.Provider value={{
      todos, setTodos, isEdit, setEdit, currentBoard, setCurrentBoard,
      dialogRef, isTaskModalOpen, closeTaskModal, openTaskModal,
      isEditDeleteBoard, setIsEditDeleteBoard, deleteModal, isDeleteModal, setIsDeleteModal,
      updateBoardColumns, isEmptyBoard, columns
    }}>
      {children}
    </TodoContext.Provider>
  );
}
