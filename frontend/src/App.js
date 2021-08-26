import { Switch, Route, Link, Redirect } from "react-router-dom";
import './App.css';
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Category from "./components/Category";
import SignUp from "./components/Sign-up";
import AddQuestion from "./components/AddQuestion";
import Question from "./components/Question"
import YourQuestions from "./components/YourQuestions"
import UserStats from "./components/Stats"
import Logout from "./components/Logout";
import NotFound from "./components/NotFound.js";

function App() {
  const [user, setUser] = useState(null)

  async function login(user = null){
    setUser(user)
  }

  async function logout(){
    setUser(null)
    localStorage.removeItem("username")
    localStorage.removeItem("token")
  }

  useEffect(()=>{
    if(localStorage.getItem("username")) login(localStorage.getItem("username"))
  }, [])


  const changeSidebarStatus = () => {
    let topNav = document.getElementById("myTopNav");
    if (topNav.className === "topNav") {
      topNav.className += " responsive";
    } else {
      topNav.className = "topNav";
    }
  }

  const PrivateRoute = ({component: Component, user, ...rest}) => {
    return (
      <Route
        {...rest}
        render={(props) => localStorage.getItem("token")
          ? <Component user={user} {...props} />
          : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
      />
    )
  }

  return (
    <div className="App">
      <div className="topNav" id="myTopNav">
        <a href="/" className="active">QUIZZ</a>
        <a href="/category">Category</a>
        <a href="/add-question">Add question</a>
        { user ? (
          
        <div className="topNav-a"  style={{cursor:'pointer'}}>
          <div className="dropdown">
            Profile
            <li className="dropdown-content">
              <a href="/profile/stats">Stats</a>
              <a href={'/profile/question/?user='+ user}>Your questions</a>
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
            exact path={["/", "/category"]}
            render={() => (
              <Category />
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
              <Question  {...props} />
            )}
          />
          <PrivateRoute path="/profile/question" user={user} component={YourQuestions} />
          <PrivateRoute path="/profile/stats" user={user} component={UserStats} />
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
