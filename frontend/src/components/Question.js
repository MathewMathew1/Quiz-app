import React, {useState, useEffect} from "react"
import queryString from 'query-string';
import LoadingCircle from "./LoadingCircle";


const TIME_TO_ANSWERS = 30

const Question = ({ location }) => {
    const [questions, setQuestions] =  useState([])
    const [finishedAnswering, setFinishedAnswering] = useState(false)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [remainingTime, setRemainingTime] = useState(false)
    const [timer, setTimer] =useState("")
    const [answersLabel] = useState(["A", "B", "C", "D"])
    const [numberOfQuestions, setaNumberOfQuestions] = useState(0)
    const [numberOfGoodAnswers, setNumberOfGoodAnswers] = useState(0)
    const [isDataFetched, setIsDataFetched] = useState(false)

    const [controller] = useState(new AbortController())

    const nextQuestion = async () => {
        for(let i =0; i<4; i++){
            highlightAnswer(i, "white")
        }
        
        let elementToRotate = document.getElementById("right")
        elementToRotate.style.transform = `rotate(${0}deg)`

        elementToRotate = document.getElementById("left")
        elementToRotate.style.transform = `rotate(${0}deg)`

        let root = document.documentElement;
        root.style.setProperty('--progress-circle-color', "--green-starting")
        
        setFinishedAnswering(false)
        setQuestionNumber(questionNumber+1)
        setRemainingTime(TIME_TO_ANSWERS)
        
    }


    

    const highlightAnswer = (answer, color) =>{
        const idOfDivOfAnswer = "a" + answer 
        const divOfAnswer = document.getElementById(idOfDivOfAnswer)
        divOfAnswer.style.backgroundColor = color
    }



    const userAnswer = (answer) => {

        if(finishedAnswering === true || remainingTime <= 0) return
        
        setaNumberOfQuestions(numberOfQuestions+1)
        clearTimeout(timer)
        setFinishedAnswering(true)

        const goodAnswer = questions[questionNumber].correctAnswer
        highlightAnswer(goodAnswer, "var(--green-correct)")

        if(goodAnswer !== answer){
            highlightAnswer(answer, "var(--red-bad)")
        }
        else{
            setNumberOfGoodAnswers(numberOfGoodAnswers+1)
        }
        
        const body = {
            "answerFromUser": answer
        }
        
        const { signal } = controller
        fetch(`http://localhost:3000/api/v1/quiz/question/id/${questions[questionNumber]._id}`,{
            method: "PUT",
            signal,
            body: JSON.stringify(body),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': localStorage.getItem("token")
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                return
            })
            .catch(error=>{console.log(error)})
    }


    const destroyTimer = () =>{
        setFinishedAnswering(true)
    }

    
    const evaluateNumberOfAnswers = (answer, questionNumberOfAnswer) => {
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
            console.log(elementToRotate)
            elementToRotate.style.transform = `rotate(${degreeToRotate}deg)`
            return
        }
        let elementToRotate = document.getElementById("right")
        let degreeToRotate = 180/(TIME_TO_ANSWERS/2)*(TIME_TO_ANSWERS/2-remainingTime+1)
        elementToRotate.style.transform = `rotate(${degreeToRotate}deg)`
    }

    useEffect(  () => {
        if(remainingTime===false) return
        setTimer(setTimeout(() => {
            if (remainingTime <= 0 || finishedAnswering) {
                destroyTimer()
                highlightAnswer(questions[questionNumber].correctAnswer , "rgb(76, 235, 70)")
                clearTimeout(timer)
            } else {
                changeColor()
                rotate()
                setRemainingTime(remainingTime-1)
            }
        }, 1000))
        return () => {
            clearTimeout(timer);
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingTime]);

    useEffect(  () => {
        const makeAnswersNotHoverable = () => {
            if(finishedAnswering===false){
                let answers = document.getElementsByClassName("answer")
                console.log(answers)
                console.log(answers.length)
                for(let i=0; i<answers.length; i++){
                    answers[i].className += "hoverable"
                    console.log(answers[i])
                }
                return
            }
            let answers = document.getElementsByClassName("answer")
            console.log(answers)
            for(let i=0; i<answers.length; i++){
                answers[i].className = answers[i].className.replace("hoverable", "")
                console.log(answers[i])
            }
        } 
        makeAnswersNotHoverable()
    }, [finishedAnswering])

    useEffect(  () => {
        const getQuestions = async() => {
            let filter = queryString.parse(location.search)
            let param = ""
    
            if(filter["category"]){
                param = `?category=${filter["category"]}`
            }
            else if(filter["user"]){
                param = `?user=${filter["user"]}`
            }
            else if(filter["id"]){
                param = `?category=${filter["id"]}`
            }

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
                    if(response.questions.length===0) {
                        setIsDataFetched(true)
                        return
                    }
                    setQuestions(response.questions)
                    setIsDataFetched(true)
                    setRemainingTime(TIME_TO_ANSWERS)
                    return
                })
                .catch(error=>{console.log(error)})
        }
        getQuestions() 

        return () => {
            controller.abort()
        }// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    

    const finishQuiz = () =>{
        
    }



    return(
        <div>
            { isDataFetched  ? (
               <div> 
                   { questions.length > 0 ? (
                        <div className="questionBox">
                                <div className="question">
                                <div className="container">
                                    <div className="question-text">
                                        {questions[questionNumber].question}
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
                                    <div className="answer-box" id={"a"+i.toString()} key={i} onClick={ () => userAnswer(i)} >
                                        <div className="container">
                                            <div className="answer-label">{answersLabel[i]}</div> 
                                            <div className="answer hoverable">{questions[questionNumber].answers[i]}</div>
                                        </div>    
                                    </div>
                                )
                            })}
                            {finishedAnswering ? (
                                <div className="question">
                                {questions[questionNumber].description}
                                {Array.from(Array(4), (e, i) => {
                                    return (
                                        <div key={i} className="container margin-top">
                                            <div className="answer-label">{answersLabel[i]}</div>
                                            <div className="progress-bar">
                                                <div style={{width: evaluateNumberOfAnswers(i, questionNumber)}}>
                                                    {evaluateNumberOfAnswers(i, questionNumber)}
                                                </div>
                                            </div>
                                        </div>    
                                    )
                                })}
                                <div className="author-name">Author: {questions[questionNumber].author[0]["username"]} </div>
                                {questionNumber + 1 < questions.length  ? (
                                    <div className="question-button" onClick={() => nextQuestion()}>Next</div>
                                ):<div className="question-button" onClick={() => finishQuiz()}>Finish</div>}

                                </div>  
                            ):null}
                    </div>   
                ) : (
                            
                    <p className="notFound">No question have been found under this search</p>
                )}  
                </div>    
            ):(
                <LoadingCircle/>
            )}    
        </div>
    )
}

export default Question