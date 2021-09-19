import React, {useState, useEffect} from "react"
import questionMark from "../questionMark.svg" 
import deleteSign from "../deleteSign.png" 
import useArray from "./CustomHooks/useArray"

const AddQuestion = () => {
    
    const [question, setQuestion] =  useState("")
    const [answerA, setAnswerA] =  useState("")
    const [answerB, setAnswerB] =  useState("")
    const [answerC, setAnswerC] =  useState("")
    const [answerD, setAnswerD] =  useState("")
    const [description, setDescription] =  useState("")
    const [category, setCategory] =  useState("")
    const [correctAnswer, setCorrectAnswer] = useState("0")

    const categories = useArray([])
    const errors = useArray([])
    const categoriesForSuggestion = useArray([])
    const suggestedCategories = useArray([])



    useEffect(  () => {
        document.title = "Add question"
        
        const controller = new AbortController()
        const { signal } = controller
        const getCategories = async () => {
            await fetch(`http://localhost:3000/api/v1/quiz/categories`,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }})
                .then(response => response.json())
                .then(response => {            
                    categoriesForSuggestion.set(response)
                    return  
                })
                .catch(error=>{console.log(error)})
        }
        
        getCategories()
        return () => {
            controller.abort()
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const createQuestion = async (e) =>{

        e.preventDefault()

        errors.set([])


        const body = {
            "question": question,
            "answers": [answerA, answerB, answerC, answerD],
            "correctAnswer": correctAnswer,
            "category": categories.array,
            "description": description,
        }

        await fetch("http://localhost:3000/api/v1/quiz/question",{
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': localStorage.getItem("token")
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(response.error){
                    errors.push(response.error)
                    return
                }
                setQuestion("")
                setAnswerA("")
                setAnswerB("")
                setAnswerC("")
                setAnswerD("")
                categories.set([])
                setDescription("")
                setCategory("")
                setCorrectAnswer(0)
                return
            })
            .catch(error=>{console.log(error)})
    }

    const addCategory = (e) => {
        e.preventDefault()
        errors.set([])
        let newErrors = []

        if (category.length < 4){
            newErrors.push("Category name too short at least 4 letters required.")
            errors.set(newErrors)
            return
        }
        if(categories.array.includes(category)){
            newErrors.push("This category is already used in this question.")
            errors.set(newErrors)
            return
        }
        setCategory("")
        categories.push(category)   
    }

    useEffect(  () => {
        if(category.length<3){
            suggestedCategories.set([])
            return
        }
        
        let copySuggestedCategories = []
        console.log(categoriesForSuggestion.array)
        for(let i=0; i<categoriesForSuggestion.array.length; i++){
            if(copySuggestedCategories.length>3){
               break 
            }
            if(categoriesForSuggestion.array[i].includes(category) && !categories.includes(categoriesForSuggestion.array[i])){
                copySuggestedCategories.push(categoriesForSuggestion.array[i])
            }
        }
        console.log(copySuggestedCategories)
        suggestedCategories.set(copySuggestedCategories) // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    
    const addSuggested = (value) =>{
        categories.push(value)
        setCategory("")
    } 

    return(
        <div className="box">
            <div className="login-box">
                <div className="gridLabel">
                    <form onSubmit={(e) => createQuestion(e)} >
                        <img  id="question-mark"  src={questionMark} alt="question Mark" />

                            <label htmlFor="question-field">Question</label>
                            <textarea placeholder="Question asked" className="input"  id="question-field" name="w3review" rows="5" cols="30" value={question} onChange={ (e)=>setQuestion(e.target.value)} required>
                            </textarea><br/> 

                            <label htmlFor="answerA-field">A</label>
                            <input placeholder="Answer A" className="input"  id="answerA-field" type="text" value={answerA} onChange={ (e)=>setAnswerA(e.target.value)} required></input><br/>

                            <label htmlFor="answerB-field">B</label>
                            <input placeholder="Answer B" className="input"  id="answerB-field" type="text" value={answerB} onChange={ (e)=>setAnswerB(e.target.value)} required></input><br/>

                            <label htmlFor="answerC-field">C</label>
                            <input placeholder="Answer C" className="input"  id="answerC-field" type="text" value={answerC} onChange={ (e)=>setAnswerC(e.target.value)} required></input><br/>

                            <label htmlFor="answerD-field">D</label>
                            <input placeholder="Answer D" className="input"  id="answerD-field" type="text" value={answerD} onChange={ (e)=>setAnswerD(e.target.value)} required></input><br/>
                            
                            <label htmlFor="correct-answer">Correct answer</label>
                            <select value={correctAnswer} onChange={(e) =>setCorrectAnswer(e.target.value)} id="correct-answer" name="correct-answer">
                                <option value="0">A</option>
                                <option value="1">B</option>
                                <option value="2">C</option>
                                <option value="3">D</option>
                            </select>
                            
                            <br/>
                            
                            <label htmlFor="description">Description</label> 
                            <textarea placeholder="Description, explaining question shown after user answer" className="input"  
                                id="description" type="text" value={description} onChange={ (e)=>setDescription(e.target.value)} rows="4" required>
                            </textarea><br/>
                            <label htmlFor="category-field">Add Category</label>
                            <div className="blockForSuggestion">
                                <input autoComplete="off" placeholder="At least 4 letters" maxLength="16"  className="input margin0-bottom"
                                  id="category-field" type="text" value={category} 
                                  onChange={ (e)=>{setCategory(e.target.value.toLocaleLowerCase()); errors.set([])} } >
                                </input>             
                                <input disabled={category.length < 4} type="submit" style={{marginLeft: "-3rem"}} value="Add" onClick={ (e)=>addCategory(e) }></input><br/>
                                { suggestedCategories.array.length > 0 && errors.array.length === 0 ? ( 
                                    <div className="suggestion-dropdown">
                                        {suggestedCategories.array.map((value, index) => { 
                                            return(
                                                <div onClick={ (e) => addSuggested(value) } className="suggestion" key={index} >
                                                    {value} 
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : null}
                            </div>    
                            <div className="tags" >
                                {categories.array.map((value, index) => {
                                    return(
                                        <span key={index} className="delete-span" >{value} 
                                            <img className="delete-mark" onClick={ () => categories.removeValueByIndex(index)} src={deleteSign} alt="delete" /> 
                                        </span>
                                    )
                                })}
                            </div>
                        {errors.array.map((value) => {
                            return(
                                <div className="error">{value}</div>
                            )
                        })}
                        <div className="align-right">
                            <button  className="button green-button" >Add Question  </button>
                        </div>       
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddQuestion