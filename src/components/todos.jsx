import { CheckSquareOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { Input, Button, Radio, message, Progress, Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';
import SingleTodo from './singleTodo';
import { useState, useEffect } from 'react';
import db from '../utils/firebase';
import {collection, doc, getDocs, addDoc, updateDoc, deleteDoc} from 'firebase/firestore';

const Todo = () => {
    const [loadingData, setLoadingData] = useState(true);
    const [todos, setTodos] = useState([]);
    const [todo, setTodo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('ALL_TODOS');
    const todosRef = collection(db, 'todos');
    const LoadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    /**
     * Loading all data for first time.
     */
    useEffect(() => {
        const getTodos = async () => {
            let response = await getDocs(todosRef);
            setTodos(response.docs.map(doc => ({id: doc.id, ...doc.data()})));
            setLoadingData(false);
        }
        getTodos();
    }, []);

    /**
     * Handle input value change
     * @param {object} e Event object
     */
    const handleChange = (e) => {
        let value = e.target.value;
        let fieldName = e.target.name;

        if(fieldName === 'todo') {
            setTodo(value);
        }
        
        if(fieldName === 'search') {
            setSearchQuery(value)
        }
    }

    /**
     * Add new task in todo list
     * @param {object} e Event object
     */
    const addTodo = async (e) => {
        e.preventDefault();

        let newTodo = {
            title: todo,
            completed: false
        }

        try {
            let response = await addDoc(todosRef, newTodo);
            setTodos([...todos, {id: response.id, ...newTodo}]);
            setTodo('');
            setFilter('ALL_TODOS');
            setSearchQuery('');
        }catch(e) {
            message.error(e.message);
        }
    }

    /**
     * Delete task from todo list
     * @param {string} id of task
     */
    const deleteTodo = async (id) => {
        let taskRef = doc(db, 'todos', id);
        try {
            await deleteDoc(taskRef);
            setTodos(todos.filter(todo => todo.id !== id));
            message.error('The task has been deleted.');
        }catch(e) {
            message.error(e.message);
        }
    }

    /**
     * Update task title
     * @param {string} id of task
     * @param {string} title of task 
     */
    const editTodo = async (id, title) => {
        if(!title) return; 

        let taskRef = doc(db, 'todos', id);
        try {
            await updateDoc(taskRef, { title });
            setTodos(todos.map(todo => {
                if(todo.id === id ) {
                    return {...todo, title}
                }
                return todo;
            }));
        }catch(e) {
            message.error(e.message);
        }
    }

    /**
     * Toggle task status
     * @param {string} id of task 
     */
    const changeStatus = async (id) => {
        let taskRef = doc(db, 'todos', id);

        try {
            await updateDoc(taskRef, {
                completed: !isCompleted(id)
            });

            setTodos(todos.map(todo => {
                if(todo.id === id ) {
                    return {...todo, completed: !todo.completed}
                }
                return todo;
            }));
        }catch(e) {
            message.error(e.message);
        }

    }

    /**
     * Return boolean status of task completation
     * @param {string} id of task
     * @returns {boolean}
     */
    const isCompleted = (id) => {
        return todos.find(todo => todo.id === id).completed;
    }

    /**
     * Return total task progress as percentage value
     */
    const completeStatus =  () => {
        return (( todos.filter(todo => todo.completed).length / todos.length) * 100).toFixed(1);
    }

    /**
     * Change filter key
     * @param {objct} e Event object of targated element
     */
    const changeFilter = (e) => {
        setFilter(e.target.value);
    }

    /**
     * Apply search, filter of viewable todos
     * @param {arr} todos Array of todos
     * @returns new array of visible todos
     */
    const visibleTodos = (todos) => {
        //check search query 
        if(searchQuery) {
            todos = todos.filter(todo => todo.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1);
        }

        //filter todos
        if(filter === 'COMPLETED_TODOS') {
            todos = todos.filter(todo => todo.completed);
        }else if(filter === 'INCOMPLETE_TODOS') {
            todos = todos.filter(todo => !todo.completed);
        }
        return todos;
    }

    let allTodos = todos.length; // all todos count
    let completedTodos = todos.filter(todo => todo.completed).length; // completed todos count
    let incompleteTodos = todos.filter(todo => !todo.completed).length; // incomplete todos count

    return (
        <div className="container">
            <header className='app-header'>
                <h1><CheckSquareOutlined />Todos</h1>
                {!!allTodos && !loadingData && <Progress percent={completeStatus()} />}
                {loadingData && <Spin indicator={LoadingIcon} />}
            </header>

            {!!allTodos &&
                <main>
                    <div className="search-filer">
                        <div className="filter-todos">
                            <Radio.Group value={filter} onChange={changeFilter}>
                                <Radio.Button value="ALL_TODOS">All: {allTodos}</Radio.Button>
                                <Radio.Button value="COMPLETED_TODOS">Completed: {completedTodos}</Radio.Button>
                                <Radio.Button value="INCOMPLETE_TODOS">Incomplete: {incompleteTodos}</Radio.Button>
                            </Radio.Group>
                        </div>

                        <div className="search-todo">
                            <Input name='search' value={searchQuery} onChange={handleChange} placeholder="Search..." suffix={<SearchOutlined/>}/>
                        </div>
                    </div>
                    <div className="toto-lits">
                    <ul>
                        {visibleTodos(todos).map(todo => {
                            return(                    
                            <li key={todo.id}>
                                <SingleTodo 
                                    id= {todo.id}
                                    title={todo.title} 
                                    changeStatus = {changeStatus}
                                    editTodo = {editTodo}
                                    deleteTodo = {deleteTodo}
                                    isCompleted = {todo.completed}
                                />
                            </li>
                            );
                        })}

                    </ul>
                    </div>
                </main>
            }

            <footer className="add-todo">
                <form onSubmit={addTodo}>
                    <Input placeholder="Write todo..." name="todo" value={todo} onChange={handleChange} disabled={loadingData}/>
                    <Button type="primary" htmlType="submit" disabled={loadingData}>Add Todo</Button>
                </form>
            </footer>
        </div>
    )
}

export default Todo;