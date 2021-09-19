import React, {useState, useEffect} from "react"
import queryString from 'query-string';
import LoadingCircle from "./MiniComponents/LoadingCircle";
import AfterQuiz from "./AfterQuiz";
import useUpdateEffect from "./CustomHooks/useUpdateEffect";
import { QuestionInQuiz, QuestionView } from "./Question";
import useArray from "./CustomHooks/useArray";

const TIME_TO_ANSWERS = 30

const Quiz = ({ location }) => {
    const [questions, setQuestions] =  useState([])
    const [finishedAnswering, setFinishedAnswering] = useState(false)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [remainingTime, setRemainingTime] = useState(99)
    const [timer, setTimer] =useState("")
    

    const [remainingQuestions, setRemainingQuestions] = useState(0)
    const [numberOfQuestions, setaNumberOfQuestions] = useState(0)
    const userAnswers = useArray([])
    const [isDataFetched, setIsDataFetched] = useState(false)
    const [finished, setFinished] = useState(false)

    const [controller] = useState(new AbortController())

    const nextQuestion = async () => {
        setRemainingTime(TIME_TO_ANSWERS)
        setFinishedAnswering(false)
        setQuestionNumber(questionNumber+1) 
    }


    const userAnswerFunction = (answer) => {
  
        if(finishedAnswering === true || remainingTime <= 0) return
        
        setaNumberOfQuestions(numberOfQuestions+1)
        clearTimeout(timer)
        setFinishedAnswering(true)

        console.log(questions)
        userAnswers.push(answer)
        
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

    const fetchNextQuestions = async () => {
        setQuestionNumber(0)
        setIsDataFetched(false)
        userAnswers.set([])
        setFinishedAnswering(false)
        await getQuestions()
        setFinished(false)
    }

    const destroyTimer = () => {
        setFinishedAnswering(true)
    }

    useUpdateEffect(  () => {

        setTimer(setTimeout(() => {
            if (remainingTime <= 0 || finishedAnswering) {
                destroyTimer()
                clearTimeout(timer)
                userAnswers.push("")
            } else {
                setRemainingTime(remainingTime-1)
            }
        }, 1000))
        return () => {
            clearTimeout(timer);
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remainingTime]);

    useEffect(  () => {
        
        getQuestions() 

        return () => {
            controller.abort()
        }// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                setIsDataFetched(true)
                
                if(response.questions.length===0) {

                    return
                }
                
                setRemainingQuestions(response.unansweredQuestions)
                setQuestions(response.questions)
                setRemainingTime(TIME_TO_ANSWERS)
                return
            })
            .catch(error=>{console.log(error)})
    }

    return(
        <div>
            { isDataFetched  ? (
               <div>
                   { finished  ? (
                       <AfterQuiz remainingQuestions={remainingQuestions} fetchNextQuestions={fetchNextQuestions}
                       search={queryString.parse(location.search)} result={userAnswers} questions={questions}/>
                   ):(
                    <div>
                        <div className="results-container"> 
                            {questions.map((_value, index) => {
                                return(
                                    <div className="result-box" key={index}>
                                        { userAnswers.array[index] === questions[index].correctAnswer ? (
                                            <span className="checkmark">✓</span>
                                        ): [0,1,2,3,''].includes(userAnswers.array[index])?
                                            (
                                            <span className="bad-checkmark">X</span>
                                            ) : null}
                                        {index + 1}
                                    </div>
                                )
                            })}
                        </div>
                            { questions.length > 0 ? (
                                <div>
                                    {finishedAnswering ? (
                                        <div>
                                            <QuestionView question={questions[questionNumber]} remainingTime={remainingTime} 
                                                userAnswer={userAnswers.array[questionNumber]}  showNextButton={true}
                                                setFinished={setFinished} lastQuestion={questionNumber + 1 < questions.length}
                                                nextQuestion={nextQuestion}  />
                                        </div>    
                                    ):(
                                        <QuestionInQuiz userAnswerFunction={userAnswerFunction} question={questions[questionNumber]}
                                             TIME_TO_ANSWERS={TIME_TO_ANSWERS} remainingTime={remainingTime} />
                                    )}
                            </div> 
                        ) : (
                            <p className="notFound">No question have been found under this search</p>
                        )} 
                    </div>)}  
                </div>    
            ):(
                <LoadingCircle/>
            )}    
        </div>
    )
}

export default Quiz