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
  todo: [],
  inProgress: [],
  done: [],
};

function KanbanReducer(state, action) {
  switch (action.type) {
    case "MOVE_CARD": {
      const { card, from, to } = action.payload;
      if (from === to) return state;
      return {
        ...state,
        [from]: state[from].filter((c) => c.id !== card.id),
        [to]: state[to].some((c) => c.id === card.id)
          ? state[to]
          : [...state[to], card],
      };
    }
    case "ADD_TASK": {
      const newTask = {
        id: Date.now().toString(),
        text: action.payload.text,
      };
      return {
        ...state,
        todo: [...state.todo, newTask],
      };
    }
    case "DELETE_TASK": {
      const { cardId, from } = action.payload;
      return {
        ...state,
        [from]: state[from].filter((card) => card.id !== cardId),
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

function TaskInput() {
  const { dispatch } = useContext(KanbanContext);
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({ type: "ADD_TASK", payload: { text } });
    setText("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        placeholder="Add new task..."
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
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

function Column({ title, columnkey, className }) {
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
    <div className={`column ${className}`} ref={dropRef}>
      <h2>{title}</h2>
      {state[columnkey].map((card) => (
        <Card key={card.id} card={card} from={columnkey} />
      ))}
    </div>
  );
}

function TrashDropZone({ setCardToDelete }) {
  const dropRef = useRef(null);

  useEffect(() => {
    const dropArea = dropRef.current;

    const handleDrop = (e) => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("card"));
      setCardToDelete({
        cardId: data.card.id,
        from: data.from,
      });
    };

    const handleDragOver = (e) => e.preventDefault();

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [setCardToDelete]);

  return (
    <div className="trash-drop-zone" ref={dropRef}>
      🗑️
      <div style={{ fontSize: "2rem", fontWeight: "bolder" }}>Delete</div>
    </div>
  );
}

function KanbanBoardUI() {
  const { state, dispatch } = useContext(KanbanContext);
  const [cardToDelete, setCardToDelete] = useState(null);

  const cardText = useMemo(() => {
    if (!cardToDelete) return "";
    const cardsInColumn = state[cardToDelete.from] || [];
    const card = cardsInColumn.find(c => c.id === cardToDelete.cardId);
    return card?.text || "this task";
  }, [cardToDelete, state]);

  return (
    <div className="board-container">
      <TaskInput />
      <div className="board">
        <Column title="To Do" columnkey="todo" className="column-red" />
        <Column
          title="In Progress"
          columnkey="inProgress"
          className="column-yellow"
        />
        <Column title="Done" columnkey="done" className="column-green" />
        <TrashDropZone setCardToDelete={setCardToDelete} />

        {cardToDelete && (
          <div className="modal">
            <div className="modal-content">
              <p>Are you sure you want to delete this task? <strong>{cardText}</strong></p>
              <button
                onClick={() => {
                  dispatch({
                    type: "DELETE_TASK",
                    payload: {
                      cardId: cardToDelete.cardId,
                      from: cardToDelete.from,
                    },
                  });
                  setCardToDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button onClick={() => setCardToDelete(null)}>No</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanBoard() {
  return (
    <KanbanProvider>
      <KanbanBoardUI />
    </KanbanProvider>
  );
}

export default KanbanBoard;
