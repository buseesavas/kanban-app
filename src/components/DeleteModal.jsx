import { useEffect, useRef } from "react";

export default function DeleteModal({ type, item, closeModal, closeParentModal }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeModal]);

  return (
    <div className="delete-modal-overlay">
      <div className="deleteModal" ref={modalRef}>
        <h4>Delete this {type === "board" ? "board" : "task"}?</h4>
        <p>
          Are you sure you want to delete '<strong>{item?.name || item?.title}</strong>'?  
          This action cannot be reversed.
        </p>
        <div className="deleteModalBtns">
          <button onClick={() => { closeModal(); if (closeParentModal) closeParentModal(); }}>Delete</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
