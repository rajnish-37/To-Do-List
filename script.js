// Select DOM elements
let addBtn = document.querySelector(".addBtn");
let body = document.querySelector("body");
let taskInput = document.querySelector("#taskInput");
let taskList = document.querySelector(".taskList");

let API = "https://6a374d6bc105017aa638ddf8.mockapi.io/todo/api/v1/todos";

function createButton(className, text, handler) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", handler);
  return btn;
}

function createCheckbox(onChange) {
  const wrapper = document.createElement("label");
  wrapper.className = "checkboxWrapper";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "taskCheckbox";
  checkbox.addEventListener("change", onChange);

  const custom = document.createElement("span");
  custom.className = "customCheckbox";

  wrapper.appendChild(checkbox);
  wrapper.appendChild(custom);
  return { wrapper, checkbox };
}

function createTaskLeft(text, checkboxWrapper) {
  const taskLeft = document.createElement("div");
  taskLeft.className = "taskLeft";

  const taskText = document.createElement("span");
  taskText.className = "taskText";
  taskText.textContent = text;

  taskLeft.appendChild(checkboxWrapper.wrapper);
  taskLeft.appendChild(taskText);
  return { taskLeft, taskText, checkbox: checkboxWrapper.checkbox };
}

function createTaskActions(taskItem, taskText) {
  const taskActions = document.createElement("div");
  taskActions.className = "taskActions";

  const deleteBtn = createButton("deleteBtn", "Delete", () => {
    let selectedTaskIndex = getCurrentTaskIndex(taskList, taskItem);
    reorderingTasksUponDeletion(selectedTaskIndex + 1, taskList);
    taskItem.remove();
    deleteDataFromDB(taskItem.dataset.taskId);
  });

  const editBtn = createButton("editBtn", "Edit", () => {
    let editedTask = extractTaskContent(taskText.textContent);
    taskInput.value = editedTask;
    taskInput.dataset.ref = getCurrentTaskIndex(taskList, taskItem);
    taskInput.dataset.updateId = taskItem.dataset.taskId;
    addBtn.textContent = "Update";
  });

  taskActions.appendChild(deleteBtn);
  taskActions.appendChild(editBtn);
  return { taskActions, deleteBtn, editBtn };
}

// Function to create a new task
function createNewTask(task, length, task_id) {
  const taskItem = document.createElement("li");
  taskItem.className = "taskItem";
  taskItem.id = `task_${length + 1}`;

  taskItem.dataset.taskId = task_id;
  console.log(
    `The value of taskItem.dataset.taskId = ${taskItem.dataset.taskId}`,
  );

  const taskTextContent = `Task ${length + 1} : ${task}`;

  // Create checkbox + left section
  const checkboxWrapper = createCheckbox(() => {
    taskItem.classList.toggle("completed");
    // toggle disable state
    deleteBtn.disabled = !deleteBtn.disabled;
    editBtn.disabled = !editBtn.disabled;
  });

  const { taskLeft, taskText, checkbox } = createTaskLeft(
    taskTextContent,
    checkboxWrapper,
  );

  // Create actions
  const { taskActions, deleteBtn, editBtn } = createTaskActions(
    taskItem,
    taskText,
  );

  taskItem.appendChild(taskLeft);
  taskItem.appendChild(taskActions);

  taskList.appendChild(taskItem);
}

// Function to reorder tasks after deletion
function reorderingTasksUponDeletion(position, taskList) {
  let taskItems = [...taskList.children];

  let length = taskItems.length;

  console.log(`Position : ${position}, Length : ${length}`);
  console.log(taskItems[position]);

  // Only iterate from the deleted position to the end
  for (let i = position; i < length; i++) {
    let taskItem = taskItems[i];

    // Extract current index from id
    let currentIndex = parseInt(taskItem.id.split("_")[1]);

    // Update id
    taskItem.id = `task_${currentIndex - 1}`;

    let taskText = taskItem.querySelector(".taskText");

    // Update text content (must reassign after replace!)
    taskText.textContent = taskText.textContent.replace(
      `Task ${currentIndex} :`,
      `Task ${currentIndex - 1} :`,
    );
  }
}

// Add button click handler
addBtn.addEventListener("click", () => {
  console.log(taskInput.value);
  if (addBtn.textContent === "Add") {
    if (taskInput.value.trim() != "") {
      postDataOnDB(`${taskInput.value}`, (newTask) => {
        createNewTask(newTask.text, taskList.children.length, newTask.id);
        console.log(`The task Id of newly created DB Task is : ${newTask.id}`);
      });
    }
  } else {
    updateDataOnDB(
      taskInput.dataset.updateId,
      taskInput.value,
      (task) => {
        updateTask(task)
      },
    );
  }
  taskInput.value = "";
});

// Enter key handler
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (addBtn.textContent === "Add") {
      if (taskInput.value.trim() != "") {
        postDataOnDB(`${taskInput.value}`, (newTask) => {
          createNewTask(newTask.text, taskList.children.length, newTask.id);
          console.log(
            `The task Id of newly created DB Task is : ${newTask.id}`,
          );
        });
      }
    } else {
      updateDataOnDB(
        taskInput.dataset.updateId,
        taskInput.value,
        (task) => {
          updateTask(task);
        },
      );
    }
    taskInput.value = "";
  }
});

// Extracting the Task Content for Editing
function extractTaskContent(text) {
  let match = text.match(/^Task\s+\d+\s*:\s*(.*)$/);
  return match ? match[1] : null;
}

function updateTaskContent(updatedTask, taskItem, taskIndex) {
  let taskText = taskItem.querySelector(".taskText");

  console.log(`Task to be edited is : ${taskText.textContent}`);
  console.log(`Updated TextContent : ${updatedTask.text}`);

  if (updatedTask.text !== taskText.textContent) {
    taskText.textContent = `Task ${taskIndex + 1} : ${updatedTask.text}`;
  }
}

function updateTask(updatedTask) {
  let taskItems = [...taskList.children];
  let taskIndex = Number(taskInput.dataset.ref);

  if (taskItems[taskIndex]) {
    updateTaskContent(updatedTask, taskItems[taskIndex], taskIndex);
  } else {
    console.error("No task item found at index", taskIndex);
  }

  addBtn.textContent = "Add";
  taskInput.value = "";
  taskInput.dataset.ref = "";
  taskInput.dataset.updateId = ""; // clear only after update
}


function getCurrentTaskIndex(taskList, taskItem) {
  return [...taskList.children].indexOf(taskItem);
}

/* INTEGRATION of Database */
async function fetchDataFromDB() {
  let response = await fetch(API);

  let data = await response.json();

  data.forEach((element) => {
    createNewTask(element.text, taskList.children.length, element.id);
  });

  console.log(response);
  console.log(data);

  if (data.length !== 0) {
    console.log(`ID : ${data[0].id}`);
    console.log(`Content : ${data[0].text}`);
  }
}

async function postDataOnDB(task, callback) {
  let objData = {
    text: task.trim(),
  };

  let response = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objData),
  });

  console.log(response);

  let newTask = await response.json();
  console.log(`Created task - ID : ${newTask.id}, Task : ${newTask.text}`);

  // If a callback was provided, call it with the new task object
  if (typeof callback === "function") {
    callback(newTask);
  }
}

async function deleteDataFromDB(taskId) {
  let response = await fetch(`${API}/${taskId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log(`Task ${taskId} deleted successfully from DB`);
  } else {
    console.error(`Failed to delete task ${taskId}`);
  }
}

async function updateDataOnDB(taskId, newText, callBack) {
  let objData = {
    text: newText.trim(),
  };

  let response = await fetch(`${API}/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(objData),
  });

  if (response.ok) {
    let updatedTask = await response.json();
    console.log(
      `Updated task - ID: ${updatedTask.id}, Text: ${updatedTask.text}`,
    );

    // Call your local UI update function only after DB success
    if (typeof callBack === "function") {
      callBack(updatedTask);
    }
  } else {
    console.error(`Failed to update task ${taskId}`);
  }
}

fetchDataFromDB();
