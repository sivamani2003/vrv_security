import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance"; // Import the axios instance

const Home = () => {
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "", dueDate: "", status: "Pending" });

  const [selectedUserId, setSelectedUserId] = useState("");  // State to hold the selected user ID
  const [userRole, setUserRole] = useState("");  // State to hold the role of the selected user
  const [userStatus, setUserStatus] = useState("");  // State to hold the status of the selected user

  useEffect(() => {
    // Retrieve role from localStorage every time the component renders
    const storedRole = localStorage.getItem("userRole");
    console.log(storedRole);

    if (storedRole) {
      setRole(storedRole); // Update state with stored role
    }

    // Fetch users from backend
    axiosInstance.get("/users")
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error fetching users:", error));

    // Fetch tasks from backend
    axiosInstance.get("/tasks")
      .then(response => setTasks(response.data))
      .catch(error => console.error("Error fetching tasks:", error));
  }, []);

  // Handle adding a new task
  const handleAddTask = () => {
    const taskData = { 
      ...newTask, 
      assignedTo: newTask.assignedTo, // User ID for the task
      dueDate: newTask.dueDate,
      status: newTask.status
    };

    axiosInstance.post("/task", taskData)
      .then(response => {
        setTasks([...tasks, response.data.task]);
        setNewTask({ title: "", description: "", assignedTo: "", dueDate: "", status: "Pending" });
      })
      .catch(error => console.error("Error adding task:", error));
  };

  // Handle updating user role and status
  const handleUpdateUser = () => {
    if (!selectedUserId) {
      alert("Please select a user to update.");
      return;
    }

    const updatedUser = { role: userRole, status: userStatus };

    axiosInstance.put(`/user/${selectedUserId}`, updatedUser)
      .then(response => {
        alert("User updated successfully.");
        setUsers(users.map(user => user._id === selectedUserId ? { ...user, ...updatedUser } : user));  // Update user list locally
        setSelectedUserId("");  // Clear selected user ID
        setUserRole("");  // Clear role
        setUserStatus("");  // Clear status
      })
      .catch(error => console.error("Error updating user:", error));
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
        {role === "admin" ? "Admin Dashboard" : "Task Management"}
      </h1>

      {/* Admin Dashboard */}
      {role === "admin" && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>

          {/* User Management Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Manage Users</h3>
            <div className="space-y-4">
              <div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full sm:w-64 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.fullName}</option>
                  ))}
                </select>
              </div>

              {selectedUserId && (
                <div className="flex gap-4 mt-6">
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full sm:w-64 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>

                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value)}
                    className="w-full sm:w-64 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <button
                    onClick={handleUpdateUser}
                    className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    Update User
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Management Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full sm:w-96 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full sm:w-96 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
              />
              <select
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                className="w-full sm:w-96 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
              >
                <option value="">Assign to User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>{user.fullName}</option>
                ))}
              </select>

              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full sm:w-96 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                className="w-full sm:w-96 border-gray-300 rounded-lg py-2 px-4 text-gray-700 shadow-md"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button 
                onClick={handleAddTask}
                className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List (for both admins and users) */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Task List</h3>
        <table className="w-full table-auto border-collapse text-left">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Assigned To</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{task.title}</td>
                <td className="border px-4 py-2">{task.description}</td>
                <td className="border px-4 py-2">{task.assignedTo ? task.assignedTo.fullName : "Unassigned"}</td>
                <td className="border px-4 py-2">{task.dueDate}</td>
                <td className="border px-4 py-2">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
