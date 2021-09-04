import { useMemo } from "react"

const ProgressBar = ({showInPercents, partNumber, WholeNumber}) => {
    
    const evaluatePercentage = useMemo(() => {
        if( WholeNumber===0) return "0%"

        
        let percentageOfAllAnswers = Math.round((partNumber/WholeNumber)* 100)  + '%'
        return percentageOfAllAnswers
       
    },[partNumber, WholeNumber])

    return ( 
            <div className="progress-bar">
                <div style={{width: evaluatePercentage}}>
                    { showInPercents  ? (
                        <span>{evaluatePercentage}</span>):
                        (<span>{partNumber}/{WholeNumber}</span>)
                    }
                </div>
            </div>
    );
}
 
export default ProgressBar;