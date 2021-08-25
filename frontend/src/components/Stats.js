import React, {useState, useEffect} from "react"
import LoadingCircle from "./LoadingCircle";


const UserStats = (props) => {
    const [userStats, setUserStats] =  useState([])
    const [isDataFetched, setIsDataFetched] = useState(false)

    useEffect(()=>{
        fetchStats()
    },[])
    
    const fetchStats =  () =>{
        fetch("http://localhost:3000/api/v1/quiz/user/stats",{
        method: "GET",
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': localStorage.getItem("token")
        }})
        .then(response => response.json())
        .then(response => {
            console.log(response)
            setUserStats(response)
            setIsDataFetched(true)
        })
        .catch(error=>{console.log(error)})
    }

    const sortUserStats = (e, field, sortOrder) => {
        let copyArray = [...userStats]

        if(field==="amount"){
            copyArray.sort(sortByAccuracy("numberOfCorrectAnswers", "numberOfAllQuestions",sortOrder))
        }
        else{
            copyArray.sort(dynamicSort(field, sortOrder))
        }
        setUserStats(copyArray)
    }

    const sortByAccuracy = (field1, field2, sortOrder) => {
        return function (a,b) {
            let result
            if(a[field2]===0){
                result = 1
                return result  * sortOrder
            }
            if(b[field2]===0){
                result = -1
                return result * sortOrder
            }
            result = (a[field1]/a[field2] < b[field1]/b[field2]) ? 1 : (a[field1]/a[field2] > b[field1]/b[field2]) ? -1 : 0;
            return result * sortOrder;
        }
    }

    const dynamicSort = (property, sortOrder) => {
        return function (a,b) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    } 

    const evaluateProgressBarWidth = (category) =>{
        if(category.numberOfAllQuestions===0){
            return "100%"
        }
        let ProgressBarWidth = Math.round(((category.numberOfCorrectAnswers+category.numberOfBadAnswers)/category.numberOfAllQuestions)* 100)  + '%'
        return ProgressBarWidth
    }

    const accuracyOfAnswers = (category) => {
        if(category.numberOfAllQuestions===0){
            return "0%"
        }
        let ProgressBarWidth = Math.round((category.numberOfCorrectAnswers/category.numberOfAllQuestions)* 100)  + '%'
        return ProgressBarWidth
    }

    return (
        <div>
            { isDataFetched  ? (
                <div className="stats-box">
                    <table  className="stats-table">
                        <caption  >Your stats</caption>
                        <tbody>
                        <tr>
                            <th className="title">Category name 
                                <i className="arrow" >
                                    <i className="arrow-up" onClick={ (e) => sortUserStats(e, "name", 1)}></i>
                                    <i className="arrow-down" onClick={ (e) => sortUserStats(e, "name", -1)}></i>
                                </i>
                            </th>
                            <th className="title">Questions answered 
                                <i className="arrow" >
                                    <i className="arrow-up" onClick={ (e) => sortUserStats(e, "numberOfAllQuestions", -1)}></i>
                                    <i className="arrow-down" onClick={ (e) => sortUserStats(e, "numberOfAllQuestions", 1)}></i>
                                </i>
                            </th>
                            <th className="title">Accuracy 
                                <i className="arrow" >
                                    <i className="arrow-up" onClick={ (e) => sortUserStats(e, "amount", 1)}></i>
                                    <i className="arrow-down" onClick={ (e) => sortUserStats(e, "amount", -1)}></i>
                                </i>
                            </th>
                        </tr>  
                            {userStats.map((category, index) => {
                                return(
                                    <tr key={index}>
                                        <td>{category.name}</td>
                                        <td>
                                            <div className="progress-bar">
                                                <div style={{width: evaluateProgressBarWidth(category)}}>
                                                    {category.numberOfCorrectAnswers+category.numberOfBadAnswers}/{category.numberOfAllQuestions}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{accuracyOfAnswers(category)}</td>
                                    </tr>
                                )  
                            })} 
                        </tbody>
                    </table>
                </div>
            ):(
                <LoadingCircle/>
            )} 
        </div> 
    )
}

export default UserStats