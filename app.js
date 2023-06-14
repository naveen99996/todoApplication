const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: databasePath, driver: sqlite3.Database });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// !== for this symbol we can type (! = =) in brackets symbols type without spaces its automatically change symbol

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%'
                  AND status = '${status}'
                  AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%'
                  AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%'
                  AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
            SELECT * FROM todo
            WHERE todo LIKE '${search_q}%';`;
      break;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
            SELECT * FROM todo
            WHERE id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO todo (id, todo, priority, status)
    VALUES (${id},'${todo}','${priority}', '${status}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
        SELECT * FROM todo
        WHERE id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
        UPDATE todo SET todo='${todo}',
                        priority='${priority}',
                        status='${status}'
        WHERE id = ${todoId};`;
  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
            DELETE FROM todo
            WHERE id = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

// *************************************************************************************

// after completed the code we have type in terminal below command

//sqlite3 todoApplication.db

// ----------------------------------------------------

// after that type below script in terminal

//sqlite> CREATE TABLE todo(id INTEGER, todo TEXT, priority TEXT, status TEXT);
//sqlite> INSERT INTO todo (id, todo, priority, status)
//   ...> Values (1, "Learn HTML", "HIGH", "TO DO"),
//   ...> (2, "Learn JS", "MEDIUM", "DONE"),
//   ...> (3, "Learn CSS", "LOW", "DONE");
//sqlite> SELECT * from todo;

// _____________________________________________________

// It will give you table solution

//1|Learn HTML|HIGH|TO DO
//2|Learn JS|MEDIUM|DONE
//3|Learn CSS|LOW|DONE
//sqlite>
