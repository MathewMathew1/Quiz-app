import React, {useState, useEffect} from "react"
import person from "../person.png"

const SignUp = (props) => {

    const [username, setUserName] =  useState("")
    const [password, setPassword] =  useState("")
    const [password2, setPassword2] =  useState("")
    const [errors, setErrors] = useState([])
    const [controller] = useState(new AbortController())

    useEffect(()=>{
        if(props.user!==null) props.history.push("/category")
        return // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.user] ) 

    useEffect(()=>{
        document.title = "sign up"
        return () => {
            controller.abort()
        }
      }, [controller])

    const SignUp = async (event)=>{
        event.preventDefault()
        
        let errorsInForm = []
        if(password.length<8) errorsInForm.push("Passwords too short")
        if(password !== password2) errorsInForm.push("Passwords doesn't match")
        if(username.length<3) errorsInForm.push("Username too short")
        if(username.length>16) errorsInForm.push("Username too long")
        setErrors(errorsInForm)
        if(errorsInForm.length>0) return

        const body = {
            "username": username,
            "password": password,
        }

        const { signal } = controller
        await fetch("http://localhost:3000/api/v1/sign-up",{
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(response.error){
                    setErrors(errors => [...errors, response.error])
                    setUserName("")
                    setPassword("")
                    setPassword2("")
                    return
                }
                sessionStorage.setItem("showModal", "1")
                props.history.push("/login")
                return
            })
            .catch(error=>{console.log(error)})        
    }

    const handleKeypress = event => {
        //it triggers by pressing the enter key
      if (event.keyCode === 13) {
        SignUp(event)
      }
    }

    return(
    
        <div className="box">
            <div className="login-box">
            <img onDragEnd={() => this.clearHighlights()} id="login-person"  src={person} alt="login person" />
                <form onSubmit={SignUp} onKeyDown={handleKeypress}>  
                    <label htmlFor="username">Username:</label><br/>
                    <input maxLength="16" className="input" id="username-field" placeholder="Username(4-16 letters)" type="text" value={username} onChange={ (e)=>setUserName(e.target.value)} required></input><br/>
                    <label htmlFor="username">Password:</label><br/>
                    <input className="input" id="password-field" type="password" placeholder="Password(at least 8 letters)" value={password} onChange={ (e)=>setPassword(e.target.value)} required></input><br/>
                    <label htmlFor="username">Repeat Password:</label><br/>
                    <input className="input" id="password2-field" type="password" placeholder="Repeat password" value={password2} onChange={ (e)=>setPassword2(e.target.value)} required></input><br/>
                    {errors.map((value) => {
                        return(
                            <div className="error">{value}</div>
                        )
                    })}
                    <div className="align-right">
                        <button  className="button green-button" >Sign Up</button>
                    </div>    
                    Or <a href="login">click here</a> to login!
                   
                </form>
            </div>
    </div>
        )
    }

export default SignUp