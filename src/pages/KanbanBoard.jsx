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


function TaskInput(){
    const {dispatch} = useContext(KanbanContext);
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!text.trim()) return;
        dispatch({type: 'ADD_TASK', payload: {text}});
        setText('');
    };
    return(
        <form className = "task-form" onSubmit = {handleSubmit}>
            <input type="text" value={text} onChange={e => setText(e.target.value)} />
            <button type="submit">Add</button>
        </form>
    )
}

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
    case 'ADD_TASK' : {
        const newTask = {
            id: Date.now().toString(),
            text : action.payload.text,
        }
        return{
            ...state,
            todo: [...state.todo , newTask]
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

function Column({ title, columnkey , className }) {
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
    <div className = {`column ${className}`} ref={dropRef}>
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
      <div className="board-container">
        <TaskInput />
      <div className="board">
        <Column title="To Do" columnkey="todo" className = "column-red"/>
        <Column title="In Progress" columnkey="inProgress" className = "column-yellow" />
        <Column title="Done" columnkey="done" className = "column-green"/>
      </div>
      </div>
    </KanbanProvider>
  );
}

export default KanbanBoard;
