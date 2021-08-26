import React, {useState, useEffect} from "react"
import queryString from 'query-string';
import deleteSign from "../deleteSign.png" 
import LoadingCircle from "./LoadingCircle";
import ReactModal from 'react-modal';;

const YourQuestions = ({ location, user }) => {

    const [questions, setQuestions] =  useState([])
    const [answersLabel] = useState(["A", "B", "C", "D"])
    const [isQuestionEdited, setIsQuestionEdited] = useState([])
    const [errorsInUpdateOfQuestion, setErrorsInUpdateOfQuestion] = useState([])
    const [questionsCopy, setQuestionsCopy] = useState([])
    const [newCategories, setNewCategories] = useState([])
    const [newCategoriesErrors, setNewCategoriesErrors] = useState([])
    const [dropData, setDropData] = useState([])
    const [isDataFetched, setIsDataFetched] = useState(false)

    const [categoriesForSuggestion, setCategoriesForSuggestion] = useState([])
    const [suggestedCategories, setSuggestedCategories] = useState([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deletedQuestion, setDeletedQuestion] = useState(0)

    useEffect(  () => {
        const controller = new AbortController()
        const getQuestions = async () => {
            let filter = queryString.parse(location.search)
            let param = `?user=${filter["user"]}`
            const { signal } = controller
            await fetch(`http://localhost:3000/api/v1/quiz/question/${param}`,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': localStorage.getItem("token")
                }})
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                    let isQuestionEdited = []
                    let errorsInUpdateOfQuestion = []
                    let newCategories = []
                    let newCategoriesErrors = []
                    let suggestedCategories = []
                    for(let i=0; i<response.questions.length; i++){
                        isQuestionEdited.push(false)
                        errorsInUpdateOfQuestion.push([])
                        newCategoriesErrors.push([])
                        newCategories.push('')
                        suggestedCategories.push([])
                        setDropData(dropData => [...dropData, false])
                    }
                    setNewCategoriesErrors(newCategoriesErrors)
                    setNewCategories(newCategories)
                    setSuggestedCategories(suggestedCategories)
                    setErrorsInUpdateOfQuestion(errorsInUpdateOfQuestion)
                    setIsQuestionEdited(isQuestionEdited)
                    setQuestions(response.questions)
                    setIsDataFetched(true)
                    return  
                })
                .catch(error=>{console.log(error)})
        }   
    
        const getCategories = async () => {
            const { signal } = controller
            await fetch(`http://localhost:3000/api/v1/quiz/categories`,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                }})
                .then(response => response.json())
                .then(response => {            
                    setCategoriesForSuggestion(response)
                    return  
                })
                .catch(error=>{console.log(error)})
        }
        
        getCategories()
        getQuestions()

        return () => {
            controller.abort()
        }

    }, [location.search])

    

    const evaluateNumberOfAnswers = (answer, questionNumberOfAnswer) =>{
        if(questions[questionNumberOfAnswer].answersFromUsers.length===0) return "0%" 
        let numberOfAnswers = 0
        for(let i = 0; i < questions[questionNumberOfAnswer].answersFromUsers.length; i++){
            if( answer === questions[questionNumberOfAnswer].answersFromUsers[i]["answerFromUser"]){
                numberOfAnswers += 1
            }
        }
        let percentageOfAllAnswers = Math.round((numberOfAnswers/questions[questionNumberOfAnswer].answersFromUsers.length)* 100)  + '%'
        return percentageOfAllAnswers
    }

    const makeQuestionEditable = (index) => {
        let copyIsQuestionEdited = [...isQuestionEdited]
        copyIsQuestionEdited[index] = true
        setIsQuestionEdited(copyIsQuestionEdited)
        
        let copyQuestionsCopy = [...questionsCopy]

        copyQuestionsCopy.push(
            {
                id: index,
                question: JSON.parse(JSON.stringify(questions[index]))
            }
        )
        setQuestionsCopy(copyQuestionsCopy)
    }

    const discardChanges = (index) => {
        let copyQuestions = [...questions]
        let copyQuestionsCopy = [...questionsCopy]

        for(let i=0; i<copyQuestionsCopy.length; i++){
            if(copyQuestionsCopy[i].id===index){
                
                copyQuestions[index] = copyQuestionsCopy[i].question
                copyQuestionsCopy.splice(i, 1)
                break
            }
        }
        setQuestions(copyQuestions)
        setQuestionsCopy(copyQuestionsCopy)
        
        let copyIsQuestionEdited = [...isQuestionEdited]
        copyIsQuestionEdited[index] = false
        setIsQuestionEdited(copyIsQuestionEdited)
    }

    const deleteQuestionInBackend = async () => {

        await fetch(`http://localhost:3000/api/v1/quiz/question/id/${questions[deletedQuestion]._id}`,{
            method: "DELETE",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': localStorage.getItem("token")
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(!response.error){
                    let copyQuestions = [...questions]
                    copyQuestions[deletedQuestion].splice(deletedQuestion, 1)
                    return
                }
                let copyErrorsInUpdateOfQuestion = [...errorsInUpdateOfQuestion]
                copyErrorsInUpdateOfQuestion[deletedQuestion].push("Couldn't delete question.")
                setErrorsInUpdateOfQuestion(copyErrorsInUpdateOfQuestion)
            })
            .catch(error=>{console.log(error)})
            
    }

    const changeQuestionInBackend = async (index) => {
        let copyErrorsInUpdateOfQuestion = [...errorsInUpdateOfQuestion]
        copyErrorsInUpdateOfQuestion[index] = []
        setErrorsInUpdateOfQuestion(copyErrorsInUpdateOfQuestion)
        
        for(let i=0; i<questionsCopy.length; i++){
            if(index===questionsCopy[i].id){
                const isQuestionNotChanged = JSON.stringify(questions[index])===JSON.stringify(questionsCopy[i].question) && dropData[index] === false
                if(isQuestionNotChanged){
                    copyErrorsInUpdateOfQuestion[index].push("Updated question cannot be the same as old one.")
                    setErrorsInUpdateOfQuestion(copyErrorsInUpdateOfQuestion)
                    return
                }
            }
        }
        
        const body = {
            "question": questions[index].question,
            "answers": questions[index].answers,
            "correctAnswer":  questions[index].correctAnswer,
            "category": questions[index].category, 
            "description": questions[index].description, 
            "dropData": dropData[index],
        }
        const param = `id/${questions[index]._id}`

        await fetch(`http://localhost:3000/api/v1/quiz/question/${param}`,{
            method: "PUT",
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': localStorage.getItem("token")
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(response.error){
                    copyErrorsInUpdateOfQuestion[index].push(response.error)
                    setErrorsInUpdateOfQuestion(copyErrorsInUpdateOfQuestion)
                    return
                }
                
                if(dropData[index]){
                    let copyQuestions = questions
                    copyQuestions[index].answersFromUsers = []
                    setQuestions(copyQuestions)
                }

                let copyQuestionsCopy = [...questionsCopy]
                for(let i=0; i<copyQuestionsCopy.length; i++){
                    if(copyQuestionsCopy[i].id===index){
                        copyQuestionsCopy.splice(i, 1)
                        break
                    }
                }
                setQuestionsCopy(copyQuestionsCopy)

                let copyIsQuestionEdited = [...isQuestionEdited]
                copyIsQuestionEdited[index] = false
                setIsQuestionEdited(copyIsQuestionEdited)
            })
            .catch(error=>{console.log(error)})
    }

    const changeQuestionDescription = (e, index) =>{
        let copyQuestions = [...questions]
        copyQuestions[index].description = e.target.value
        setQuestions(copyQuestions)
    }

    const changeQuestion = (e, index) =>{
        let copyQuestions = [...questions]
        copyQuestions[index].question = e.target.value
        setQuestions(copyQuestions)
    }

    const changeAnswers = (e, index, i) =>{
        let copyQuestions = [...questions]
        copyQuestions[index].answers[i] = e.target.value
        
        setQuestions(copyQuestions)
    }

    const changeCorrectAnswer = (e, index) => {
        if(isQuestionEdited[index]===false) return
        let copyQuestions = [...questions]
        copyQuestions[index].correctAnswer = parseInt(e.target.value)
        setQuestions(copyQuestions)
    }

    const changeCategory = (e, index) => {
        let copyNewCategories = [...newCategories]
        copyNewCategories[index] = e.target.value.toLocaleLowerCase()
        setNewCategories(copyNewCategories)

        if( e.target.value.length<3){
            let copySuggestedCategories = [...suggestedCategories]
            copySuggestedCategories[index] = []
            setSuggestedCategories(copySuggestedCategories)
            return
        }
        
        let copySuggestedCategories = suggestedCategories
        copySuggestedCategories[index] = []
        for(let i=0; i<categoriesForSuggestion.length; i++){
            if(copySuggestedCategories[index].length>3){
               break 
            }
            if(categoriesForSuggestion[i].includes(e.target.value) && !newCategories[index].includes(categoriesForSuggestion[i])){
                copySuggestedCategories[index].push(categoriesForSuggestion[i])
            }
        }
        setSuggestedCategories(copySuggestedCategories)
    }

    const addCategory = (e, index) => {
       
        e.preventDefault()
        let copyNewCategoryErrors = [...newCategoriesErrors]
        copyNewCategoryErrors[index] = []

        setNewCategoriesErrors(copyNewCategoryErrors)
        
        if (newCategories[index].length < 4){
            copyNewCategoryErrors[index].push("Category name too short at least 4 letters required")
            setNewCategoriesErrors(copyNewCategoryErrors)
            return
        }
        
        let copySuggestedCategories = suggestedCategories
        copySuggestedCategories[index] = []
        setSuggestedCategories(copySuggestedCategories)

        let copyQuestions = [...questions]
        copyQuestions[index].category.push(newCategories[index])
        setQuestions(copyQuestions)
    }

    const deleteCategory = (index, index2) => {
        let copyQuestions = [...questions]
        copyQuestions[index].category.splice(index2, 1)
        setQuestions(copyQuestions)
    }

    const changeDropData = (index) => {
        let copyDropData = [...dropData]
        copyDropData[index] = !copyDropData[index]
        setDropData(copyDropData)
    }

    const addSuggested = (value, index) =>{
        
        let copyNewCategories = [...newCategories]
        copyNewCategories[index] = []
        setNewCategories(copyNewCategories)

        let copyQuestions = [...questions]
        copyQuestions[index].category.push(value)
        setQuestions(copyQuestions)
        
        let copySuggestedCategories = [...suggestedCategories]
        copySuggestedCategories[index] = []
        setSuggestedCategories(copySuggestedCategories)
    } 

    const deleteQuestion = (index) => {
        setIsModalOpen(true)
        setDeletedQuestion(index)
    }

    return(
        <div> 
            { isDataFetched  ? (
               <div> 
                   { questions.length > 0 ? (  
                        <div className="container columns2">
                            {questions.map((value, index) => {
                                return(
                                    <div key={index} className="questionBox">
                                        <div className="question">
                                            <div className="container">
                                                <label htmlFor={"textArea"+index.toString()+index.toString()}></label>
                                                <textarea onChange={ (e)=>changeQuestion(e, index)} id={"textArea"+index.toString()+index.toString()} rows="4"  readOnly={!isQuestionEdited[index]} className="answer" value={value.question}>
                                                </textarea>
                                            </div>
                                        </div>
                                        {Array.from(Array(4), (e, i) => {
                                            return ( 
                                                <div className="answer-box" id={"a"+i.toString()+index.toString()} key={i}  >
                                                    <div className="container">
                                                        <div  className="answer-label">{answersLabel[i]}</div>
                                                        {i===value.correctAnswer ? (
                                                            <input id={"answer"+i+"/"+index} style={{backgroundColor: "var(--green-correct)"}} onChange={ (e)=>changeAnswers(e, index, i)} readOnly={!isQuestionEdited[index]} className="answer" value={value.answers[i]}></input>
                                                        ) : (
                                                            <input id={"answer"+i+"/"+index} onChange={ (e)=>changeAnswers(e, index, i)} readOnly={!isQuestionEdited[index]} className="answer" value={value.answers[i]}></input>
                                                        )}    

                                                            <input onChange={(e) => changeCorrectAnswer(e, index)} checked={i===value.correctAnswer} value={i} type="radio"  name={index+"checkButton"}></input>
                                                            <span className="checkmark"></span>

                                                    </div>    
                                                </div>
                                            )
                                        })}
                                        <div className="question">
                                            <div className="container">
                                                <textarea onChange={ (e)=>changeQuestionDescription(e, index)} id={"description"+index.toString()+index.toString()} rows="4" className="answer" readOnly={!isQuestionEdited[index]} value={value.description}>

                                                </textarea>
                                            </div>    
                                            {Array.from(Array(4), (e, i) => {
                                                return (
                                                    <div key={i} className="container margin-top">
                                                        <div className="answer-label">{answersLabel[i]}</div>
                                                        <div className="progress-bar">
                                                            <div style={{width: evaluateNumberOfAnswers(i, index)}}>
                                                                {evaluateNumberOfAnswers(i, index)}
                                                            </div>
                                                        </div>
                                                    </div>    
                                                )
                                            })}
                                            <div className="align-right">
                                                <label> Drop Data 
                                                    <input type="radio" onClick={()=>changeDropData(index)} checked={dropData[index]} readOnly></input>
                                                    <span className="checkmark"></span>
                                                </label>
                                            </div>
                                            <div className="tags" >
                                                <label >Add Category</label>
                                                <input readOnly={!isQuestionEdited[index]} maxLength="16" className="add"  id={"category-field"+index} type="text" value={newCategories[index]} onChange={ (e)=>changeCategory(e, index)} ></input>
                                                <input disabled={!isQuestionEdited[index]} type="submit" value="Add" onClick={ (e)=>addCategory(e, index)}></input><br/>
                                                { suggestedCategories[index].length > 0 && newCategoriesErrors[index].length === 0 ? ( 
                                                    <div className="suggestion-dropdown">
                                                        {suggestedCategories[index].map((value, index2) => { 
                                                            return(
                                                                <div onClick={ (e) => addSuggested(value, index2) } className="suggestion" key={index2} >
                                                                    {value} 
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                ) : null}          
                                                {newCategoriesErrors[index].map((value2, index2) => {
                                                    return(
                                                        <div key={index2} className="error">{value2}</div>
                                                    )
                                                })}
                                                {value.category.map((value2, index2) => {
                                                    return(
                                                        <span key={index2} className="delete-span" >{value2} 
                                                            {isQuestionEdited[index] ? (
                                                                <img  className="delete-mark" onClick={ () => deleteCategory(index,index2)} src={deleteSign} alt="delete" /> 
                                                            ) : null}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                            <div className="author-name">Author: {value.author[0]["username"]} </div>
                                            <div className="align-right">
                                                {errorsInUpdateOfQuestion[index].map((value2, index2) => {
                                                    return(
                                                        <div key={index2} className="error">{value2}</div>
                                                    )
                                                })}
                                                {user===value.author[0]["username"] ? (
                                                    <span>
                                                        {!isQuestionEdited[index] ? (
                                                            <span>
                                                                <button className="button blue-button" onClick={ () => makeQuestionEditable(index)}>Edit</button>
                                                                <button className="button red-button" onClick={ () => deleteQuestion(index)}>Delete</button>
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                <button className="button blue-button" onClick={ () => discardChanges(index)}>Discard Changes</button>  
                                                                <button className="button blue-button" onClick={ () => changeQuestionInBackend(index)}>Save Changes</button>
                                                            </span>
                                                        )}  
                                                </span>
                                                ) : null}
                                            </div>    
                                        </div>  
                                    </div>   
                                )
                         })}
                    </div>
                    ):(
                        <p className="notFound">Looks like you haven't created question yet, go <a href="/add-question">there</a> to create one</p>
                    )}
                </div>
            ):(
                <LoadingCircle/>
            )}  
            <ReactModal
                isOpen={isModalOpen}
                contentLabel={"Delete Question"}
                id={"delete"}
                shouldCloseOnOverlayClick={true}
                shouldCloseOnEsc={true}
                shouldReturnFocusAfterClose={true}z
                
                appElement={document.getElementById('root') || undefined}
                style={{
                    overlay: {
                        
                        padding: "1rem"
                    },
                    content: {
                        marginRight: "auto",
                        marginLeft: "auto",
                        minWidth: "15rem",
                        width: "25%",
                        border: '1px solid #ccc',
                        background: '#fff',
                        WebkitOverflowScrolling: 'touch',
                        borderRadius: '4px',
                        
                        padding: '0.8rem',
                        height: "fit-content"
                    }
                }}>
                Are you sure you want to delete this question?
                <div className="right" style={{marginTop: "0.5rem"}}>
                    <button className="button blue-button" onClick={ () => setIsModalOpen(false)} >Close</button>
                    <button className="button red-button" onClick={ () => deleteQuestionInBackend()} >Delete</button>
                </div>
            </ReactModal>
        </div>
    )
}

export default YourQuestions