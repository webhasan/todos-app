import classNames from 'classnames';
import { Button } from 'antd';
import {FormOutlined, DeleteOutlined, CheckCircleTwoTone} from '@ant-design/icons';
import { Popconfirm } from 'antd';

const SingleTodo = ({id, title, changeStatus, editTodo, deleteTodo, isCompleted}) => {
    let checkColour = isCompleted ? '#52c41a' : '#d9d9d9';
    return (
        <div className={classNames('single-todo', {completed: isCompleted})}>
            <h3 className="todo-title">
                <Button onClick={() => changeStatus(id)} type="link" icon={<CheckCircleTwoTone twoToneColor={checkColour}/>} size={'small'} /> 
                {title}
            </h3>
            <div className="action">
                <Button type="link" icon={<FormOutlined />} size={'small'} 
                    onClick={() => editTodo(id, prompt('Edit the task.'))}
                />
                <Popconfirm
                    title="Are you sure to delete this task?"
                    onConfirm={() => deleteTodo(id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="link" icon={<DeleteOutlined />} size={'small'} />
                </Popconfirm>
                
            </div>
        </div>
    );
}

export default SingleTodo;  