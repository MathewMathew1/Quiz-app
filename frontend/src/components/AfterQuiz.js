
import ProgressBar from "./MiniComponents/ProgressBar"
import { QuestionView, QuestionSpoilerView } from "./Question"
import useArray from "./CustomHooks/useArray"
import { useEffect } from "react"

const AfterQuiz = ({search, result, remainingQuestions, questions, fetchNextQuestions}) => {
    
    const spoilerForQuestion  =  useArray([])
    console.log(spoilerForQuestion)

    useEffect(() => {
        for(let i=0; i<questions.length; i++){
            spoilerForQuestion.push(true)
        }

    }, []);

    const textProceedingAButton = () =>{
        if(remainingQuestions===0){
            return `You have answered all questions from this category, if you want you can try again`
        }
        
        if(remainingQuestions===1){
            return `There is still ${remainingQuestions} question, from this category, that you didn't answer`
        }
        return `There are still ${remainingQuestions} questions, from this category, that you didn't answer`
        

    }

    const numberOfCorrectAnswers = () => {
        let numberOfCorrectAnswers = 0
        for(let i=0; i<result.array.length; i++){
            console.log(questions[i])
            if(result.array[i]===questions[i].correctAnswer) numberOfCorrectAnswers += 1
        }
        return numberOfCorrectAnswers
    }
    
    const changeSpoilerStatus = (index) => {
        spoilerForQuestion.update(!spoilerForQuestion.array[index], index)
    }

    return (
        <div className="categoryBox" >
            <div className="gridLabel columns3 no-border">
                <div className="label-progressBar">
                 Your result in this session of {search["category"]} questions:
                </div>
                <div className="progressBarDiv">
                    <ProgressBar showInPercents={false} partNumber={numberOfCorrectAnswers()} WholeNumber={result.array.length} />
                </div>
                
            </div>
            <div className="gridLabel columns3 no-border" >
                {textProceedingAButton()}
                <button onClick={fetchNextQuestions}  className="button green-button" >Play</button>
            </div>
           <div>
                {questions.map((_value, index) => {
                    return(
                        <div key={index} className="spoiler">
                            { spoilerForQuestion.array[index]  ? (
                                <QuestionSpoilerView question={questions[index].question} 
                                    correctAnswer={result.array[index]===questions[index].correctAnswer}
                                    changeSpoilerStatus={changeSpoilerStatus} index={index}
                                />
                            ):( 
                                <div>
                                    <QuestionView question={questions[index]} showTimer={false} index={index} userAnswer={result.array[index]}/>
                                    <div className="right-corner">
                                        <i onClick={() => changeSpoilerStatus(index)} className="spoiler-arrow up"></i>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
           </div>
        </div>
    )
}
 
export default AfterQuiz;