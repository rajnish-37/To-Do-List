// Select DOM elements
let addBtn = document.querySelector(".addBtn");
let body = document.querySelector("body");
let taskInput = document.querySelector("#taskInput");
let taskList = document.querySelector(".taskList");

// Function to create a new task
function createNewTask(task, length) {
  let taskItem = document.createElement("li");
  taskItem.className = "taskItem";

  /* Child of TaskItem */
  let taskLeft = document.createElement("div");
  taskLeft.className = "taskLeft";

  /* Child of TaskLeft */
  let checkboxWrapper = document.createElement("label");
  checkboxWrapper.className = "checkboxWrapper";

  /* Child of CheckBoxWrapper */
  let taskCheckbox = document.createElement("input");
  taskCheckbox.type = "checkbox";
  taskCheckbox.className = "taskCheckbox";
  taskCheckbox.addEventListener("change", () => {
    const taskItem = taskCheckbox.closest(".taskItem");
    taskItem.classList.toggle("completed", taskCheckbox.checked);

    deleteBtn.disabled = !deleteBtn.disabled;
    editBtn.disabled = !editBtn.disabled;
  });

  /* Child of CheckBoxWrapper */
  let customCheckbox = document.createElement("span");
  customCheckbox.className = "customCheckbox";

  /* Child of TaskLeft */
  let taskText = document.createElement("span");
  taskText.className = "taskText";

  /* Child of TaskItem */
  let taskActions = document.createElement("div");
  taskActions.className = "taskActions";

  /* Delete button - Child of TaskActions */
  let deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    let selectedTaskIndex = getCurrentTaskIndex(taskList, taskItem);

    console.log(
      `We are deleting task : ${taskItem.id} at position ${selectedTaskIndex + 1}`,
    );

    reorderingTasksUponDeletion(selectedTaskIndex + 1, taskList);

    taskItem.remove();
  });

  /* Edit button - Child of TaskActions */
  let editBtn = document.createElement("button");
  editBtn.className = "editBtn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    console.log(
      `I will edit the content of current task i.e.; ${taskText.textContent}`,
    );
    console.log(typeof extractTaskContent(taskText.textContent));

    let editedTask = extractTaskContent(taskText.textContent);
    taskInput.value = editedTask;

    let selectedTaskIndex = getCurrentTaskIndex(taskList, taskItem);
    taskInput.dataset.ref = selectedTaskIndex;
    addBtn.textContent = "Update";
  });

  // TASK LEFT
  checkboxWrapper.appendChild(taskCheckbox);
  checkboxWrapper.appendChild(customCheckbox);

  taskLeft.appendChild(checkboxWrapper);
  taskLeft.appendChild(taskText);
  taskText.textContent = `Task ${length + 1} : ${task}`;

  // TASK ACTIONS
  taskActions.appendChild(deleteBtn);
  taskActions.appendChild(editBtn);

  // TASK ITEM
  taskItem.appendChild(taskLeft);
  taskItem.appendChild(taskActions);
  taskItem.id = `task_${length + 1}`;

  console.log(taskItem.id);

  // Add to list
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
    createNewTask(taskInput.value, taskList.children.length);
  } else {
    updateTask();
  }
  taskInput.value = "";
});

// Enter key handler
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (addBtn.textContent === "Add") {
      createNewTask(taskInput.value, taskList.children.length);
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
