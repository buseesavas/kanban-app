import { useState, useEffect, useContext } from "react";
import { DeleteSvg } from "../Svg";
import { TodoContext } from "./TodoContext";

export default function AddColumnModal({ closeModal, selectedBoard }) {
  const { updateBoardColumns } = useContext(TodoContext); // Context'ten alınır
  const [columns, setColumns] = useState([]);
  const [isEmptyBoard, setIsEmptyBoard] = useState(
    selectedBoard?.columns?.length === 0 ||
    selectedBoard?.columns?.every((col) => col.tasks.length === 0)
  );  
  console.log("isEmptyBoard in Modal:", isEmptyBoard);

  useEffect(() => {
    if (selectedBoard?.columns) {
      setColumns([...selectedBoard.columns]);
    }
  }, [selectedBoard]);

  const handleColumnChange = (index, value) => {
    setColumns((prev) => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  const deleteColumn = (e, index) => {
    e.preventDefault();
    setColumns((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setIsEmptyBoard(updated.length === 0); // ✅ Kolon silindikten sonra kontrol
      return updated;
    });
  };
  

  const addColumn = () => {
    const newColumn = { id: crypto.randomUUID(), name: "", tasks: [] };
    setColumns((prev) => {
      const updated = [...prev, newColumn];
      setIsEmptyBoard(updated.length === 0); // ✅ isEmptyBoard'u güncelleyin
      return updated;
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredColumns = columns.filter((col) => col.name.trim() !== "");
  
    updateBoardColumns(filteredColumns);
    closeModal();
  };
  
  

  return (
    <div className="addColumnModalOverlay" onClick={closeModal}>
      <div className="addColumnModalContent" onClick={(e) => e.stopPropagation()}>
        <button className="addColumncloseBtn" onClick={closeModal}>✖</button>
        <h2>Add New Column</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            className="addColumnModalNameInput"
            type="text"
            value={selectedBoard?.name || ""}
            disabled
          />

          <label>Columns</label>
          {columns.map((column, index) => (
            <div key={column.id} className="addColumnModalColumnInput">
              <input
                type="text"
                value={column.name}
                onChange={(e) => handleColumnChange(index, e.target.value)}
                placeholder="Column Name"
                required
              />
              <button
                type="button"
                className="addColumnModalDelete"
                onClick={(e) => deleteColumn(e, index)}
              >
                <DeleteSvg width={20} height={20} />
              </button>
            </div>
          ))}

          <button type="button" className="addColumnModalAddBtn" onClick={addColumn}>
            + Add New Column
          </button>
          <button type="submit" className="addColumnModalSaveBtn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}