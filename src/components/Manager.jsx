import React, { useEffect, useState, useRef } from 'react';
import './manager.css';
import { ToastContainer, toast } from 'react-toastify';

const Manager = () => {
  const ref = useRef();
  const [form, setform] = useState({ site: "", username: "", password: "" })
  const [visible, setVisible] = useState(false);

  const [passwordArray, setpasswordArray] = useState([])

  // Replace localStorage logic with backend API calls
  const getpasswords = async () => {
    try {
      const res = await fetch("http://localhost:3001/");
      const data = await res.json();
      setpasswordArray(data);
    } catch (err) {
      toast.error("Failed to fetch passwords from server", { autoClose: 2000 });
    }
  }

  useEffect(() => {
    getpasswords();
  }, [])


  const showPassword = () => {
    setVisible(v => !v);
  }


  const savePass = async () => {
    if (!form.site.trim() || !form.username.trim() || !form.password.trim()) {
      toast.error("Please fill in all fields before adding.", { autoClose: 2000 });
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Password added!", { autoClose: 2000 });
        setform({ site: "", username: "", password: "" });
        getpasswords();
      } else {
        toast.error("Failed to add password", { autoClose: 2000 });
      }
    } catch (err) {
      toast.error("Server error while adding password", { autoClose: 2000 });
    }
  }

  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    toast('Copied to clipboard', {
position: "top-right",
autoClose: 5000,
hideProgressBar: false,
closeOnClick: false,
pauseOnHover: true,
draggable: true,
progress: undefined,
theme: "light",

});
  }

  const handleEdit = (index) => {
    setEditIndex(index);
    setform({
      site: passwordArray[index].site,
      username: passwordArray[index].username,
      password: passwordArray[index].password
    });
  };

  const handleDelete = async (index) => {
    const id = passwordArray[index]._id;
    try {
      const res = await fetch(`http://localhost:3001/${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Password deleted!", { autoClose: 2000 });
        getpasswords();
      } else {
        toast.error("Failed to delete password", { autoClose: 2000 });
      }
    } catch (err) {
      toast.error("Server error while deleting password", { autoClose: 2000 });
    }
  };

  const [editIndex, setEditIndex] = useState(null);

  const handleUpdate = async () => {
    if (editIndex !== null) {
      const id = passwordArray[editIndex]._id;
      try {
        const res = await fetch(`http://localhost:3001/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const result = await res.json();
        if (result.success) {
          toast.success("Password updated!", { autoClose: 2000 });
          setEditIndex(null);
          setform({ site: "", username: "", password: "" });
          getpasswords();
        } else {
          toast.error("Failed to update password", { autoClose: 2000 });
        }
      } catch (err) {
        toast.error("Server error while updating password", { autoClose: 2000 });
      }
    }
  };



  useEffect(() => {
    // Ensure lordicon script is loaded
    if (!window.LordiconElement) {
      const script = document.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);



  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition="Bounce"
      />
      <div className='container'>
        <div className="head">
          <h3>PassMaster-The best PassManager</h3>
        </div>
        <div className="add">
          <p>Enter the platform</p>
          <input onChange={handlechange} type="text" className='text' placeholder='  Type Here' name='site' value={form.site} />
        </div>
        <div className="add">
          <p>Enter the username</p>
          <input onChange={handlechange} value={form.username} type="text" className='text' placeholder='  Type here' name='username' />
        </div>
        <div className="add">
          <p>Enter the password</p>
          <input
            onChange={handlechange}
            value={form.password}
            type={visible ? "text" : "password"}
            className='text'
            placeholder='  Type here'
            name='password'
          />
          <span onClick={showPassword} className="material-symbols-outlined" style={{ cursor: 'pointer' }}>
            {visible ? 'visibility_off' : 'visibility'}
          </span>
        </div>
        <div className="but">
          <button className='button' onClick={editIndex === null ? savePass : handleUpdate} >
            {editIndex === null ? "Add Pass" : "Update Pass"}
            <lord-icon
              id="lordicon-btn-icon"
              src="https://cdn.lordicon.com/tsrgicte.json"
              trigger="click"
              stroke="bold"
              colors="primary:#000000,secondary:#4f1091"
              style={{width: '40px', height: '40px', marginLeft: '8px'}}>
            </lord-icon>
          </button>
        </div>
        <div className="passwords">
          <h3>Your Passwords</h3>
          {passwordArray.length === 0 ? (
            <div className='error'>No Passwords To Show</div>
          ) : (
            <div className="table">
              <table className="tab">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Username</th>
                    <th scope="col">Password</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordArray.map((item, index) => (
                    <tr key={index}>
                      <td>{item.platform}<span className="material-symbols-outlined" onClick={() => copyText(item.platform)} style={{cursor: 'pointer', marginLeft: '8px'}}>content_copy</span></td>
                      <td>{item.username}<span className="material-symbols-outlined" onClick={() => copyText(item.username)} style={{cursor: 'pointer', marginLeft: '8px'}}>content_copy</span></td>
                      <td>{item.password}<span className="material-symbols-outlined" onClick={() => copyText(item.password)} style={{cursor: 'pointer', marginLeft: '8px'}}>content_copy</span></td>
                      <td>
                        <span className="material-symbols-outlined" onClick={() => handleEdit(index)} style={{cursor: 'pointer', marginRight: '8px', color: '#4f1091'}}>edit</span>
                        <span className="material-symbols-outlined" onClick={() => handleDelete(index)} style={{cursor: 'pointer', color: 'red'}}>delete</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;

// In your backend server.js, ensure you have these endpoints:
// POST /        -> Add password
// GET /         -> Get all passwords
// DELETE /:id   -> Delete password by id
// PUT /:id      -> Update password by id

// In your frontend manager.jsx, all CRUD operations already use fetch to call these endpoints.
// The frontend calls getpasswords() after every add, delete, or update to refresh the UI from the database.
// No further code changes are needed for syncing, but here is a comment for clarity:
// After every successful add, delete, or update, getpasswords() is called to fetch the latest data from MongoDB.