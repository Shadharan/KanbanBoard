import React, {
  useState,
  useEffect,
  useContext,
  useReducer,
  useRef,
  useMemo,
  createContext,
} from "react";
import "./KanbanBoard.css";

const KanbanContext = createContext();

const initialState = {
  todo: [
    { id: "1", text: "Task A" },
    { id: "2", text: "Task B" },
  ],
  inProgress: [],
  done: [],
};

function KanbanReducer(state, action) {
  switch (action.type) {
    case "MOVE_CARD": {
      const { card, from, to } = action.payload;
      return {
        ...state,
        [from]: state[from].filter((c) => c.id !== card.id),
        [to]: [...state[to], card],
      };
    }
    default:
      return state;
  }
}

function KanbanProvider({ children }) {
  const [state, dispatch] = useReducer(KanbanReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <KanbanContext.Provider value={value}>
      {children}
    </KanbanContext.Provider>
  );
}

function Card({ card, from }) {
  const dragRef = useRef(null);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("card", JSON.stringify({ card, from }));
  };

  return (
    <div
      className="card"
      draggable
      ref={dragRef}
      onDragStart={handleDragStart}
    >
      {card.text}
    </div>
  );
}

function Column({ title, columnkey }) {
  const { state, dispatch } = useContext(KanbanContext);
  const dropRef = useRef(null);

  useEffect(() => {
    const dropArea = dropRef.current;

    const handleDrop = (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("card"));
      dispatch({
        type: "MOVE_CARD",
        payload: { card: data.card, from: data.from, to: columnkey },
      });
    };

    const handleDragOver = (e) => e.preventDefault();

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [dispatch, columnkey]);

  return (
    <div className="column" ref={dropRef}>
      <h2>{title}</h2>
      {state[columnkey].map((card) => (
        <Card key={card.id} card={card} from={columnkey} />
      ))}
    </div>
  );
}

function KanbanBoard() {
  return (
    <KanbanProvider>
      <div className="board">
        <Column title="To Do" columnkey="todo" />
        <Column title="In Progress" columnkey="inProgress" />
        <Column title="Done" columnkey="done" />
      </div>
    </KanbanProvider>
  );
}

export default KanbanBoard;
