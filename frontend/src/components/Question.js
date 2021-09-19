
import { useEffect, useState } from "react"
import ProgressBar from "./MiniComponents/ProgressBar"
import deleteSign from "../deleteSign.png"


const answersLabel = ["A", "B", "C", "D"]

const QuestionInQuiz = ({question, remainingTime, userAnswerFunction, TIME_TO_ANSWERS}) => {
    

    useEffect(() => {
        let root = document.documentElement;
        root.style.setProperty('--progress-circle-color', "--green-starting")
    }, [question])

    useEffect(() => {
        if(remainingTime===0){
            return
        }
        rotate()
        changeColor()
    }, [remainingTime])

    const changeColor = () => {
        let root = document.documentElement;
        if(remainingTime-1===25){
            root.style.setProperty('--progress-circle-color', "var(--green-middle)")
        }
        if(remainingTime-1===16){
            root.style.setProperty('--progress-circle-color', "var(--yellow-starting)")
        }
        if(remainingTime-1===12){
            root.style.setProperty('--progress-circle-color', "var(--orange-starting)")
        }
        if(remainingTime-1===6){
            root.style.setProperty('--progress-circle-color', "var(--red-finish)")
        }
    }

    const rotate = () => {

        if(remainingTime-1>=TIME_TO_ANSWERS/2){
            
            let elementToRotate = document.getElementById("left")
            let degreeToRotate = 180/(TIME_TO_ANSWERS/2)*(TIME_TO_ANSWERS-remainingTime+1)

            elementToRotate.style.transform = `rotate(${degreeToRotate}deg)`
            return
        }

        let elementToRotate = document.getElementById("right")
        let degreeToRotate = 180/(TIME_TO_ANSWERS/2)*(TIME_TO_ANSWERS/2-remainingTime+1)
        elementToRotate.style.transform = `rotate(${degreeToRotate}deg)`
    }


    return(
        <div>   
            <div>
                <div>
                    <div className="questionBox">
                        <div className="question">
                            <div className="container">
                                <div className="question-text">
                                    {question.question}
                                </div>
                                <div className="circular">
                                    <div className="inner"></div>
                                    <div className="number">{remainingTime}</div>
                                    <div className="circle">
                                    <div className="bar left">
                                        <div id="left" className="progress"></div>
                                    </div>
                                    <div className="bar right">
                                        <div id="right" className="progress"></div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {Array.from(Array(4), (e, i) => {
                            return ( 
                                <div className="answer-box" id={"a"+i.toString()} key={i} onClick={ () => userAnswerFunction(i)} >
                                    <div className="container">
                                        <div className="answer-label">{answersLabel[i]}</div> 
                                        <div className="answer hoverable">{question.answers[i]}</div>
                                    </div>    
                                </div>
                            )
                        })}
                    </div> 
                </div> 
            </div>    
        </div>
    )
}

const QuestionView = ({ question, index, remainingTime, showTimer=true, userAnswer, showNextButton, lastQuestion, nextQuestion, setFinished, user}) => {

    console.log(index)
    useEffect(() => {
        highlightAnswer(question.correctAnswer, "var(--green-correct)")
        if(userAnswer!==question.correctAnswer && userAnswer!==undefined){
            highlightAnswer(userAnswer, "var(--red-bad)")
        }
    }, [question])

    const highlightAnswer = (answer, color) =>{
        try{
            const idOfDivOfAnswer = "a" + answer + index
            const divOfAnswer = document.getElementById(idOfDivOfAnswer)
            divOfAnswer.style.backgroundColor = color
        }
        catch(e){
            console.log(e)
        }
    }

    const showPercentageBar = (answer) => {
        let numberOfAnswers = 0
        for(let i = 0; i < question.answersFromUsers.length; i++){
            if( answer === question.answersFromUsers[i]["answerFromUser"]){
                numberOfAnswers += 1
            }
        }
        return <ProgressBar showInPercents={true} partNumber={numberOfAnswers} WholeNumber={question.answersFromUsers.length} />

    }

    return(
        <div>   
            <div>
                <div>
                    <div className="questionBox">
                        <div className="question">
                            <div className="container">
                                <div className="question-text">
                                    {question.question}
                                </div>
                                {showTimer  ? (
                                    <div className="circular">
                                        <div className="inner"></div>
                                        <div className="number">{remainingTime}</div>
                                        <div className="circle">
                                        <div className="bar left">
                                            <div id="left" className="progress"></div>
                                        </div>
                                        <div className="bar right">
                                            <div id="right" className="progress"></div>
                                        </div>
                                        </div>
                                    </div>
                                ):null}
                            </div>
                        </div>
                        {Array.from(Array(4), (e, i) => {
                            return ( 
                                <div className="answer-box" id={"a"+i.toString()+index} key={i} >
                                    <div className="container">
                                        <div className="answer-label">{answersLabel[i]}</div> 
                                        <div className="answer">{question.answers[i]}</div>
                                    </div>    
                                </div>
                            )
                        })}
                        <div className="question">
                            {question.description}
                            {Array.from(Array(4), (e, i) => {
                                return (
                                    <div key={i} className="container margin-top">
                                        
                                        {showPercentageBar(i)}
                                    </div>    
                                )
                            })}
                            <div className="author-name">Author: {question.author[0]["username"]} </div>
                            {showNextButton  ? (
                                <div>
                                    {lastQuestion  ? (
                                        <div className="question-button" onClick={() => nextQuestion()}>Next</div>
                                    ):
                                        <div className="question-button" onClick={() => setFinished(true)}>Finish</div>
                                    }
                                </div>
                                ):null}
                        </div>  
                    </div> 
                </div> 
            </div>    
        </div>
    )
}


const QuestionEdit = ({index, question,
    makeQuestionEditable, discardChanges, changeQuestionInBackend ,
    changeQuestionDescription, changeQuestion, changeAnswers, changeCorrectAnswer, changeCategory,
    addCategory, deleteCategory, changeDropData, addSuggested, user, setIsModalOpen, setQuestionBeingDeleted
    }) => {
    
    const openDeleteModal = () => {
        setQuestionBeingDeleted(index)
        setIsModalOpen(true)
    }

    const showPercentageBar = (answer) =>{
        let numberOfAnswers = 0
        for(let i = 0; i < question.answersFromUsers.length; i++){
            if( answer === question.answersFromUsers[i]["answerFromUser"]){
                numberOfAnswers += 1
            }
        }
        return <ProgressBar showInPercents={true} partNumber={numberOfAnswers} WholeNumber={question.answersFromUsers.length} />
    }

    return(      
        <div key={index} className="questionBox">
            <div className="question">
                <div className="container">
                    <label htmlFor={"textArea"+index.toString()+index.toString()}></label>
                    <textarea onChange={ (e)=>changeQuestion(e, index)} id={"textArea"+index.toString()+index.toString()} rows="4"  
                        readOnly={!question.isQuestionEdited} className="answer" value={question.question}>
                    </textarea>
                </div>
            </div>
            {Array.from(Array(4), (_e, i) => {
                return ( 
                    <div className="answer-box" id={"a"+i.toString()+index.toString()} key={i}  >
                        <div className="container">
                            <div  className="answer-label">{answersLabel[i]}</div>
                            {i===question.correctAnswer ? (
                                <input id={"answer"+i+"/"+index} style={{backgroundColor: "var(--green-correct)"}} onChange={ (e)=>changeAnswers(e, index, i)} 
                                    readOnly={!question.isQuestionEdited} className="answer" value={question.answers[i]}></input>
                            ) : (
                                <input id={"answer"+i+"/"+index} onChange={ (e)=>changeAnswers(e, index, i)} 
                                    readOnly={!question.isQuestionEdited} className="answer" value={question.answers[i]}></input>
                            )}    

                                <input onChange={(e) => changeCorrectAnswer(e, index)} checked={i===question.correctAnswer}
                                 value={i} type="radio"  name={index+"checkButton"}></input>
                                <span className="checkmark"></span>

                        </div>    
                    </div>
                )
            })}
            <div className="question">
                <div className="container">
                    <textarea onChange={ (e)=>changeQuestionDescription(e, index)} id={"description"+index.toString()+index.toString()} 
                        rows="4" className="answer" readOnly={!question.isQuestionEdited} value={question.description}>

                    </textarea>
                </div>    
                {Array.from(Array(4), (_e, i) => {
                    return (
                        <div key={i} className="container margin-top">
                            <div className="answer-label">{answersLabel[i]}</div>
                            {showPercentageBar(i, index)}
                        </div>         
                    )
                })}
                <div className="align-right">
                    <label> Drop Data 
                        <input type="radio" onClick={()=>changeDropData(index)} checked={question.dropData} readOnly></input>
                        <span className="checkmark"></span>
                    </label>
                </div>
                <div className="tags" >
                    <label >Add Category</label>
                    <input autoComplete="off" readOnly={!question.isQuestionEdited} maxLength="16" className="add"  id={"category-field"+index} 
                        type="text" value={question.NewCategory} onChange={ (e)=>changeCategory(e, index)} ></input>
                    <input disabled={!question.isQuestionEdited} type="submit" 
                        value="Add" onClick={ (e)=>addCategory(e, index)}>
                    </input><br/>
                    { question.suggestedCategories.length > 0 && question.NewCategoryErrors.length === 0 ? ( 
                        <div className="suggestion-dropdown">
                            {question.suggestedCategories.map((value, index2) => { 
                                return(
                                    <div onClick={ (_e) => addSuggested(value, index2) } className="suggestion" key={index2} >
                                        {value} 
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}   
                 </div>          
                    {question.NewCategoryErrors.map((value2, index2) => {
                        return(
                            <div key={index2} className="error">{value2}</div>
                        )
                    })}
                    {question.category.map((value2, index2) => {
                        return(
                            <span key={index2} className="delete-span" >{value2} 
                                {question.isQuestionEdited? (
                                    <img  className="delete-mark" onClick={ () => deleteCategory(index,index2)} src={deleteSign} alt="delete" /> 
                                ) : null}
                            </span>
                        )
                    })}
                <div className="author-name">Author: {question.author[0]["username"]} </div>
                <div className="align-right">
                    {question.errorsInUpdateOfQuestion.map((value2, index2) => {
                        return(
                            <div key={index2} className="error">{value2}</div>
                        )
                    })}
                    {user===question.author[0]["username"] ? (
                        <span>
                            {!question.isQuestionEdited ? (
                                <span>
                                    <button className="button blue-button" onClick={ () => makeQuestionEditable(index)}>Edit</button>
                                    <button className="button red-button" onClick={ () => openDeleteModal()}>Delete</button>
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
}

const QuestionSpoilerView = ({ question, correctAnswer, index, changeSpoilerStatus}) => {


    return(
        <div >   
            {question}
            { correctAnswer  ? (
                <span className="checkmark">✓</span>
            ):(
                <span className="bad-checkmark">X</span>
            )}
            <span className="right-corner">
                <i onClick={() => changeSpoilerStatus(index)} className="spoiler-arrow down"></i>
            </span>
        </div>
    )
}


export {QuestionInQuiz, QuestionView, QuestionEdit, QuestionSpoilerView}