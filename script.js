// Select DOM elements
let addBtn = document.querySelector(".addBtn");
let body = document.querySelector("body");
let taskInput = document.querySelector("#taskInput");
let taskList = document.querySelector(".taskList");

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
  });

  const editBtn = createButton("editBtn", "Edit", () => {
    let editedTask = extractTaskContent(taskText.textContent);
    taskInput.value = editedTask;
    taskInput.dataset.ref = getCurrentTaskIndex(taskList, taskItem);
    addBtn.textContent = "Update";
  });

  taskActions.appendChild(deleteBtn);
  taskActions.appendChild(editBtn);
  return { taskActions, deleteBtn, editBtn };
}

// Function to create a new task
function createNewTask(task, length) {
  const taskItem = document.createElement("li");
  taskItem.className = "taskItem";
  taskItem.id = `task_${length + 1}`;

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
      createNewTask(taskInput.value, taskList.children.length);
    }
  } else {
    updateTask();
  }
  taskInput.value = "";
});

// Enter key handler
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (addBtn.textContent === "Add") {
      if (taskInput.value.trim() != "") {
        createNewTask(taskInput.value, taskList.children.length);
      }
    } else {
      updateTask();
    }
    taskInput.value = "";
  }
});

// Extracting the Task Content for Editing
function extractTaskContent(text) {
  let match = text.match(/^Task\s+\d+\s*:\s*(.*)$/);
  return match ? match[1] : null;
}

function updateTaskContent(taskInput, taskItem, taskIndex) {
  // let taskText = taskItem.firstElementChild.children[1];
  let taskText = taskItem.querySelector(".taskText");

  console.log(`Task to be edited is : ${taskText.textContent}`);

  if (taskInput.value.trim() !== taskText.textContent) {
    taskText.textContent = `Task ${taskIndex + 1} : ${taskInput.value}`;
  }
}

function updateTask() {
  let taskItems = [...taskList.children];
  let taskIndex = Number(taskInput.dataset.ref);
  updateTaskContent(taskInput, taskItems[taskIndex], taskIndex);
  addBtn.textContent = "Add";
  taskInput.value = "";
}

function getCurrentTaskIndex(taskList, taskItem) {
  return [...taskList.children].indexOf(taskItem);
}

