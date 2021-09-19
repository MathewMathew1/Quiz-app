import { Switch, Route, Link} from "react-router-dom";
import './App.css';
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Categories from "./components/Categories";
import SignUp from "./components/Sign-up";
import AddQuestion from "./components/AddQuestion";
import Quiz from "./components/Quiz"
import YourQuestions from "./components/YourQuestions"
import UserStats from "./components/Stats"
import Logout from "./components/Logout";
import NotFound from "./components/NotFound.js";
import Category from "./components/Category";
import AdminPage from "./components/AdminPage";
import PrivateRoute from "./components/MiniComponents/PrivateRoute";
import AdminRoute from "./components/MiniComponents/AdminRoute";



function App() {
  const [user, setUser] = useState(null)
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  async function login(user = null){
    setUser(user)
  }

  async function logout(){
    setUser(null)
    setIsUserAdmin(false)
    localStorage.removeItem("username")
    localStorage.removeItem("token")
  }

  useEffect(()=>{
    if(localStorage.getItem("username")) login(localStorage.getItem("username"))

    IsUserAdmin()
  }, [])

  const IsUserAdmin = () => {
      const controller = new AbortController()
      const { signal } = controller
      fetch(`http://localhost:3000/api/v1/admin`,{
          method: "GET",
          signal,
          headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'Authorization': localStorage.getItem("token")
          }})
          .then(response => response.json())
          .then(response => {
              console.log(response)
              if(response.error){
                setIsUserAdmin(false)
              }
              setIsUserAdmin(response)
          })
          .catch(error=>{console.log(error)}) 
  }

  const changeSidebarStatus = () => {
    let topNav = document.getElementById("myTopNav");
    if (topNav.className === "topNav") {
      topNav.className += " responsive";
    } else {
      topNav.className = "topNav";
    }
  }

 

  return (
    <div className="App">
      <div className="topNav" id="myTopNav">
        <a href="/" className="active">QUIZZ</a>
        <a href="/categories">Category</a>
        <a href="/add-question">Add question</a>
        { user ? (
          
        <div className="topNav-a"  style={{cursor:'pointer'}}>
          <div className="dropdown">
            Profile
            <li className="dropdown-content">
              <a href="/profile/stats">Stats</a>
              <a href={'/profile/question/?user='+ user}>Your questions</a>
              { isUserAdmin ? (<a href="/profile/admin">Admin</a>):null}
              <a href="/logout" onClick={logout}>Log out</a>
            </li>
          </div>
        </div>
        ) : (            
        <Link to={"/login"}>
          Login
        </Link>
        )}
        <div onClick={() => changeSidebarStatus()} href="#"  className="icon" >
          <div className="hamburger"></div>
          <div className="hamburger"></div>
          <div className="hamburger"></div>
        </div>
      </div>
      <Switch>
          <Route 
            exact path={["/", "/categories"]}
            render={() => (
              <Categories />
            )}
          />
          <Route 
            exact path={"/category"}
            render={(props) => (
              <Category {...props} />
            )}
          />
          <Route 
            path="/login"
            render={(props) => (
              <Login {...props} user={user} login={login} />
            )}
          />
          
          <Route 
            path="/sign-up"
            render={(props) => (
              <SignUp {...props} user={user} />
            )}
          />
          <Route 
            path="/add-question"
            render={(props) => (
              <AddQuestion {...props} />
            )}
          />
          <Route 
            path="/question"
            render={(props) => (
              <Quiz  {...props} />
            )}
          />
          <PrivateRoute path="/profile/question" user={user} component={YourQuestions} />
          <PrivateRoute path="/profile/stats" user={user} component={UserStats} />
          <AdminRoute path="/profile/admin" user={user} component={AdminPage} isUserAdmin={isUserAdmin} />
          <Route 
            path="/logout"
            render={() => (
              <Logout/>
            )}
          />
          <Route path="*" component={NotFound} />
        </Switch>
    </div>
  );
}

export default App;
