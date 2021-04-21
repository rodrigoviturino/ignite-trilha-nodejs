const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } =  request.headers;

  const userMiddleware = users.find( (user) => user.username === username);

  if(!userMiddleware){
    return response.status(404).json({
      error: "User exists!"
    });
  }

  request.userMiddleware = userMiddleware;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find((user) => user.username === username);
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  if(userExists){
    return response.status(400).json({
      error: "User exists!"
    });
  }
  
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userMiddleware } = request;
  return response.status(200).json(userMiddleware.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userMiddleware } = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  };
  userMiddleware.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userMiddleware } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const idTodo = userMiddleware.todos.find((user) => user.id === id);

  if(!idTodo){
    return response.status(404).json({
      error: "TODO exists!"
    });
  }

  idTodo.title = title;
  idTodo.deadline = deadline;

  return response.json(idTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { userMiddleware } = request;
  const { id } = request.params;
  
  const idUser = userMiddleware.todos.find((userTodo) => userTodo.id === id);

  if(!idUser){
    return response.status(404).json({
      error: "ID inexistis!"
    });
  };

  idUser.done = true;
  
  return response.json(idUser);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { userMiddleware } = request;
  const { id } = request.params;

  const todoIndex = userMiddleware.todos.findIndex((todo) => todo.id === id);
  
  if(todoIndex == -1){
    return response.status(404).json({
      error: "TODO not found!"
    });
  };
  
  userMiddleware.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;