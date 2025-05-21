// 1. Get References to HTML Elements
const todoInput = document.getElementById('new-task-input');
const taskDateInput = document.getElementById('task-date-input');
const addTaskButton = document.getElementById('add-task-button');
const taskList = document.getElementById('task-list');

// ---

// Helper function to format date for display
function formatDateForDisplay(dateString) {
    if (!dateString) return 'No due date';
    const dateObj = new Date(dateString + 'T00:00:00'); // Use 'T00:00:00' to avoid timezone issues
    // Format as "May 21, 2025"
    return `Due: ${dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
}

// Helper function to get today's date in YYYY-MM-DD format for comparison
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// ---

// 2. Function to Add a New Task
function addTask() {
    const taskText = todoInput.value.trim();
    const taskDate = taskDateInput.value; // YYYY-MM-DD string

    // Basic validation: Task text cannot be empty.
    if (taskText === '') {
        alert('Please enter a task description!');
        return;
    }

    // Create the main list item (<li>) for the new task
    const listItem = document.createElement('li');
    listItem.classList.add('todo-item');

    // Add classes for reminders based on date
    if (taskDate) {
        const todayDate = getTodayDateString();
        if (taskDate < todayDate) {
            listItem.classList.add('overdue');
        } else if (taskDate === todayDate) {
            listItem.classList.add('due-today');
        }
    }


    // Create a div to hold both task text and date
    const taskContentDiv = document.createElement('div');
    taskContentDiv.classList.add('task-content');
    // REMOVED: Clicking task-content no longer toggles complete. The button does.

    // Create a <span> for the task text
    const taskTextSpan = document.createElement('span');
    taskTextSpan.classList.add('task-text');
    taskTextSpan.textContent = taskText;

    // Create a <span> for the task date
    const taskDateSpan = document.createElement('span');
    taskDateSpan.classList.add('task-date');
    taskDateSpan.textContent = formatDateForDisplay(taskDate);
    // Store the original date string in a data attribute for persistence
    taskDateSpan.dataset.originalDate = taskDate;


    // Assemble the content div
    taskContentDiv.appendChild(taskTextSpan);
    taskContentDiv.appendChild(taskDateSpan);


    // Create a <div> to hold action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    // New: Create the Complete button
    const completeButton = document.createElement('button');
    completeButton.textContent = '✔️'; // Checkmark icon
    completeButton.classList.add('complete-button');
    // Add an event listener to the Complete button
    completeButton.addEventListener('click', toggleComplete);


    // Create the Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', deleteTask);

    // Assemble the actions div
    actionsDiv.appendChild(completeButton);
    actionsDiv.appendChild(deleteButton);


    // Assemble the list item:
    listItem.appendChild(taskContentDiv);
    listItem.appendChild(actionsDiv);
    taskList.appendChild(listItem);

    // Clear the input fields after adding the task
    todoInput.value = '';
    taskDateInput.value = '';

    // Save the updated list of tasks to local storage
    saveTasks();
}

// ---

// 3. Function to Toggle Task Completion Status (now triggered by the button)
function toggleComplete(event) {
    // 'event.target' is the complete button.
    // Its parent is 'actionsDiv', and its grandparent is the 'listItem'.
    const listItemToToggle = event.target.parentElement.parentElement;
    listItemToToggle.classList.toggle('completed');

    // When a task is completed, remove reminder classes
    if (listItemToToggle.classList.contains('completed')) {
        listItemToToggle.classList.remove('overdue', 'due-today');
    } else {
        // If un-completing, re-check reminder status
        const originalDate = listItemToToggle.querySelector('.task-date').dataset.originalDate;
        if (originalDate) {
            const todayDate = getTodayDateString();
            if (originalDate < todayDate) {
                listItemToToggle.classList.add('overdue');
            } else if (originalDate === todayDate) {
                listItemToToggle.classList.add('due-today');
            }
        }
    }

    // Save the updated list of tasks to local storage
    saveTasks();
}

// ---

// 4. Function to Delete a Task
function deleteTask(event) {
    const listItemToRemove = event.target.parentElement.parentElement;
    taskList.removeChild(listItemToRemove);
    saveTasks();
}

// ---

// 5. Functions for Local Storage Persistence

// Saves the current tasks from the DOM into local storage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.todo-item').forEach(item => {
        const textSpan = item.querySelector('.task-text');
        const dateSpan = item.querySelector('.task-date');

        tasks.push({
            text: textSpan.textContent,
            originalDate: dateSpan.dataset.originalDate || '', // Retrieve original YYYY-MM-DD
            completed: item.classList.contains('completed')
        });
    });
    localStorage.setItem('todos', JSON.stringify(tasks));
}

// Loads tasks from local storage and displays them in the DOM
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('todos') || '[]');
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        if (task.completed) {
            listItem.classList.add('completed');
        }

        // Apply reminder classes on load if not completed
        if (!task.completed && task.originalDate) {
            const todayDate = getTodayDateString();
            if (task.originalDate < todayDate) {
                listItem.classList.add('overdue');
            } else if (task.originalDate === todayDate) {
                listItem.classList.add('due-today');
            }
        }


        const taskContentDiv = document.createElement('div');
        taskContentDiv.classList.add('task-content');
        // No click listener here anymore for toggling completion

        const taskTextSpan = document.createElement('span');
        taskTextSpan.classList.add('task-text');
        taskTextSpan.textContent = task.text;

        const taskDateSpan = document.createElement('span');
        taskDateSpan.classList.add('task-date');
        taskDateSpan.textContent = formatDateForDisplay(task.originalDate);
        taskDateSpan.dataset.originalDate = task.originalDate; // Crucial for saving later

        taskContentDiv.appendChild(taskTextSpan);
        taskContentDiv.appendChild(taskDateSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        // New: Create the Complete button for loaded tasks
        const completeButton = document.createElement('button');
        completeButton.textContent = '✔️';
        completeButton.classList.add('complete-button');
        completeButton.addEventListener('click', toggleComplete);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', deleteTask);

        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(deleteButton);
        listItem.appendChild(taskContentDiv);
        listItem.appendChild(actionsDiv);
        taskList.appendChild(listItem);
    });
}

// ---

// 6. Event Listeners (Connecting User Actions to Functions)

addTaskButton.addEventListener('click', addTask);

// Now listen for 'Enter' key on both text and date inputs
todoInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

taskDateInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Load tasks when the page loads
document.addEventListener('DOMContentLoaded', loadTasks);
