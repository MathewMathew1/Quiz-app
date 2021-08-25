import React, {useState, useEffect} from "react"
import person from "../person.png"

const Login = (props) => {

    const [username, setUserName] =  useState("")
    const [password, setPassword] =  useState("")
    const [errors, setErrors] = useState([])

    useEffect(()=>{
        if(props.user!==null) props.history.push("/category")
        return // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.user])   
        
    useEffect(()=>{
        document.title = "login"
        if(sessionStorage.getItem("showModal")==='1'){
            sessionStorage.removeItem("showModal")
            let toast = document.getElementById("toast");
            toast.className = "show";
            setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        }
      }, [])

    const Login = async (event)=>{
        event.preventDefault()
        
        setErrors([])
        
        const body = {
            "username": username,
            "password": password,
        }
        await fetch("http://localhost:3000/api/v1/login",{
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(response.accessToken !== undefined) {
                    localStorage.setItem("token","Bearer " + response.accessToken)
                    localStorage.setItem("username", username)
                    props.login(username)
                    props.history.push("/category")
                  }
                  else{
                    setErrors(["An Incorrect password or username"])
                    setUserName("")
                    setPassword("")
                  }
            })
            .catch(error=>{console.log(error)})        
    }

    const handleKeypress = event => {
        //it triggers by pressing the enter key
      if (event.keyCode === 13) {
        Login(event)
      }
    }

    return(
    
        <div className="box">
            <div className="login-box">
            <img  id="login-person"  src={person} alt="login person" />
                <form onSubmit={Login} onKeyDown={handleKeypress}>  
                    <label htmlFor="username">Username:</label><br/>
                    <input className="input" id="username-field" placeholder="Username" type="text" value={username} onChange={ (e)=>setUserName(e.target.value)} required></input><br/>
                    <label htmlFor="username">Password:</label><br/>
                    <input className="input" id="password-field" type="password" placeholder="password" value={password} onChange={ (e)=>setPassword(e.target.value)} required></input><br/>
                    {errors.map((value) => {
                        return(
                            <div className="error">{value}</div>
                        )
                    })}
                    <div className="align-right">
                        <button  className="button green-button" >Login</button>
                    </div>    
                    Or <a href="sign-up">click here</a> to sign up!
                   
                </form>
            </div>
            <div id="toast">You have created account successfully</div>
        </div>
        )
    }


export default Login