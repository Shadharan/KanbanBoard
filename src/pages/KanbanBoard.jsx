import React,{useState, useEffect, useContext, useReducer, useRef,useMemo ,createContext} from "react";
import './KanbanBoard.css';

const kanbanContext=createContext();

const initialState={
    todo:[
        {id:'1',text:'Task A'},
        {id:'2',text: 'Task B'}
    ],
    inProgress:[],
    done:[]
};


function KanbanReducer(state,action){
    switch(action.type){
        case 'MOVE_CARD':{
            const{card,from,to}=action.payload;
            return {
                ...state,
                [from]:state[from].filter(c=>c.id !== card.id),
                [to]:[...state[to],card]
            }
        }
        default:
            return state;
    }
}

function KanbanProvider({children}) {
    const [state, dispatch] = useReducer(kanbanReducer , initialState);
    const value = useMemo(() =>({state, dispatch}),[state]);
    return (
        <KanbanContext.Provider value = {value}>
            {children}
        </KanbanContext.Provider>
    )
}

function card({card , from}){
    const dragRef = useRef(null);

    const handleDragStart = (e) => {
        e.dataTransfer.setData('card' , JSON.stringify({card , from}));
    };

    return(
        <div>
            {card.text}
        </div>
    )
}


function KanbanBoard(){
    return(
        <KanbanProvider>
            <div className="Board">
                <column title="To Do" columnkey="todo"/>
            </div>
        </KanbanProvider>
    )
}

export default KanbanBoard;


































// import React, { createContext, useReducer } from 'react'
// const kanbanContext =createContext();

// const initialState={
//     todo:[
//         {id:'1',text:'Task A'},
//         {id:'2',text:'Task B'},
//     ],
//     inProgress:[],
//     done:[]
// };
// function kanbanReducer(state,action){
//     switch(action.type){
//         case "MOVE_CARD" :{
//             const{card,from,to}=action.payload;
//             return{
//                 ...state,
//                 [from]:state[from].filter(c=> c.id !==card.id),
//                 [to]:[...state[to],card]

//             }
//         }
//     default:
//         return state;
// }
// }

// function KanbanProvider({children}){
//     const [state, dispatch] =useReducer(kanbanReducer,initialState);
//     const value =useMemo(()=>({state,dispatch}),
//     [state]);

//     return<kanbanContext.Provider value={value}>{</kanbanContext.Provider>}
// function KanbanBoard() {
//   return (
//     <div>
//         <li>To Do</li>
//         <li>In Progress</li>
//         <li>Done</li>
//     </div>
//   )
// }

// export default KanbanBoard