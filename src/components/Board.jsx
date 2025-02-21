import { TodoContext } from "./TodoContext";
import { useContext, useState, useEffect, Fragment } from "react";
import NewEditBoard from "./NewEditBoard";
import AddColumnModal from "./AddColumnModal";
import ViewTask from "./ViewTask";
import { BoardIconSvg, HideIconSvg, ShowIconSvg } from "../Svg";
import { useTheme } from "./ThemeContext";
import {
  closestCorners,
  useDroppable,
  DndContext,
  closestCenter,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

export default function Board() {
  const {
    todos,
    setTodos,
    setEdit,
    currentBoard,
    setCurrentBoard,
    updateBoardColumns,
    isEmptyBoard,
  } = useContext(TodoContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { darkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (todos.length > 0 && !currentBoard) setCurrentBoard(todos[0]);
  }, [todos, currentBoard, setCurrentBoard]);

  const openModal = (isEditMode) => {
    setEdit(isEditMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEdit(false);
  };

  const openColumnModal = () => setIsColumnModalOpen(true);
  const closeColumnModal = () => setIsColumnModalOpen(false);
  const openTaskModal = (task) => setSelectedTask(task);
  const closeTaskModal = () => setSelectedTask(null);

  const handleBoardCreation = (newBoard) => {
    setTodos((prevTodos) => [...prevTodos, newBoard]);
    setCurrentBoard(newBoard);
    setIsModalOpen(false);
  };

  return (
    <div className={`boardPage ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Sidebar
        todos={todos}
        currentBoard={currentBoard}
        openModal={openModal}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
      />

      <div className="main-content">
        {currentBoard ? (
          <BoardColumns
            openColumnModal={openColumnModal}
            openTaskModal={openTaskModal}
          />
        ) : (
          <p>No board selected.</p>
        )}
      </div>

      {isModalOpen && (
        <Modal closeModal={closeModal}>
          <NewEditBoard
            closeModal={closeModal}
            onBoardCreated={handleBoardCreation}
          />
        </Modal>
      )}

      {isColumnModalOpen && (
        <Modal closeModal={closeColumnModal}>
          <AddColumnModal
            closeModal={closeColumnModal}
            selectedBoard={currentBoard}
            updateBoardColumns={updateBoardColumns}
            isEmptyBoard={isEmptyBoard}
          />
        </Modal>
      )}

      {selectedTask && (
        <Modal closeModal={closeTaskModal}>
          <ViewTask task={selectedTask} closeModal={closeTaskModal} />
        </Modal>
      )}
    </div>
  );
}

function Sidebar({
  todos,
  currentBoard,
  openModal,
  isSidebarOpen,
  toggleSidebar,
  darkMode,
  toggleTheme,
}) {
  const { setCurrentBoard, setEdit } = useContext(TodoContext);

  return (
    <div className={`sideNav-board ${isSidebarOpen ? "open" : "closed"}`}>
      <ul className="allBoards">
        <h2>ALL BOARDS ({todos.length})</h2>
        {todos.map((board) => (
          <li
            key={board.id}
            className={`board ${
              currentBoard?.id === board.id ? "active" : "passive"
            }`}
          >
            <button
              onClick={() => {
                setCurrentBoard(board);
                setEdit(false);
              }}
            >
              <BoardIconSvg />
              {board.name}
            </button>
          </li>
        ))}
        <li>
          <button className="modal-btn" onClick={() => openModal(false)}>
            <BoardIconSvg /> + Create New Board
          </button>
        </li>
      </ul>

      <div className="navBar-bottom">
        <div className="navBar-themeBtn">
          <span className="white-mode-background">
            <img src="img/white-mode-theme-icon.svg" alt="" />
          </span>
          <label className="bg-theme-checkbox">
            <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
            <span className="slider"></span>
          </label>
          <span className="icon">
            <img src="img/dark-mode-theme-icon.svg" alt="" />
          </span>
        </div>
        <button className="hideIcon" onClick={toggleSidebar}>
          {isSidebarOpen && <HideIconSvg />} <p>Hide Sidebar</p>
        </button>
      </div>

      {!isSidebarOpen && (
        <div className="showSidebar-btn" onClick={toggleSidebar}>
          <ShowIconSvg />
        </div>
      )}
    </div>
  );
}

function BoardColumns({ openColumnModal, openTaskModal }) {
  const { columns, updateBoardColumns } = useContext(TodoContext); // ✅ Context'ten alın
  const [activeTask, setActiveTask] = useState(null);
  console.log("currentBoard columns:", columns);

  const isEmptyBoard = columns.length === 0;

  const handleDragStart = ({ active }) => {
    const foundTask = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === active.id);
    setActiveTask(foundTask || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return setActiveTask(null);

    const sourceColumnIndex = columns.findIndex((col) =>
      col.tasks.some((task) => task.id === active.id)
    );

    const destinationColumnIndex = columns.findIndex(
      (col) =>
        col.id === over.id || col.tasks.some((task) => task.id === over.id)
    );

    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
      setActiveTask(null);
      return;
    }

    const sourceColumn = { ...columns[sourceColumnIndex] };
    const destinationColumn = { ...columns[destinationColumnIndex] };

    const oldIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === active.id
    );
    const [movedTask] = sourceColumn.tasks.splice(oldIndex, 1);

    const newIndex =
      over.id === destinationColumn.id && destinationColumn.tasks.length === 0
        ? 0
        : over.data?.current?.sortable?.index ?? destinationColumn.tasks.length;

    destinationColumn.tasks.splice(newIndex, 0, movedTask);

    const updatedColumns = columns.map((col, idx) => {
      if (idx === sourceColumnIndex) return sourceColumn;
      if (idx === destinationColumnIndex) return destinationColumn;
      return col;
    });

    updateBoardColumns(updatedColumns); // ✅ Context üzerinden güncelle
    setActiveTask(null);
  };

  return (
    <DndContext
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {isEmptyBoard ? (
        <div className="emptyBoard">
          <h5>This board is empty. Create a new column to get started.</h5>
          <button className="emptyBoardBtn" onClick={openColumnModal}>
            + Add New Column
          </button>
        </div>
      ) : (
        <div className="boardColumns">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              openColumnModal={openColumnModal}
              openTaskModal={openTaskModal}
            />
          ))}
          <button onClick={openColumnModal} className="add-column-btn">
            + New Column
          </button>
        </div>
      )}

      <DragOverlay>
        {activeTask ? (
          <div className="dragged-task">
            <p>{activeTask.title}</p>
            <span className="board-subtasks-info">
              Subtasks (
              {activeTask.subtasks?.filter((st) => st.isCompleted).length ?? 0}{" "}
              of {activeTask.subtasks?.length ?? 0})
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Modal({ children, closeModal }) {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Column({ column, openColumnModal, openTaskModal }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  console.log("Column Props:", column);

  return (
    <div
      className={`boardColumn ${isOver ? "column-hover" : ""}`}
      ref={setNodeRef}
    >
      <div className="boardColumnTitle">
        <h3>
          {column.name}
          <span>({column.tasks.length})</span>
        </h3>
      </div>

      <SortableContext
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="task-list-container">
          {(column.tasks ?? []).length > 0 ? (
            (column.tasks ?? []).map((task) => (
              <SortableItem
                key={task.id}
                task={task}
                openTaskModal={openTaskModal}
              />
            ))
          ) : (
            <div
              className={`emptyColumnBorder ${
                isOver ? "emptyColumnBorder-hover" : ""
              }`}
            >
              <p>No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
