import { useEffect, useState } from "react";
import queryString from 'query-string';
import LoadingCircle from "./MiniComponents/LoadingCircle";
import ProgressBar from "./MiniComponents/ProgressBar"

const Category = ({ location }) => {
    const [isDataFetched, setIsDataFetched] = useState(false)
    const [categoryUserData, setUserCategoryData] = useState(Object)
    const [categoriesBiggestAuthors, setCategoriesBiggestAuthors] = useState([])
    const [image, setImage] = useState(Object)

    useEffect(() => {
        let filter = queryString.parse(location.search)
        let param = `?category=${filter["category"]}`
        document.title = filter["category"]

        const controller = new AbortController()
        const fetchStats = async () =>{
            const { signal } = controller
            await fetch(`http://localhost:3000/api/v1/quiz/user/stats/${param}`,{
                method: "GET",
                signal,
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                    'Authorization': localStorage.getItem("token")
                }})
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                    setUserCategoryData(response.QuizDataForUser)
                    setCategoriesBiggestAuthors(response.authors)
                    setImage(response.image)
                    setIsDataFetched(true)
                    return
                })
                .catch(error=>{console.log(error)})
            }
        fetchStats()
        return () => {
            controller.abort()
        }
    }, []);

    return (
        <div>
            { isDataFetched? (
                <div className="categoryBox">
                    <div className="background-image" style={{backgroundImage: `url(data:image/png;base64,${image})`}}>
                        <h1>quiz about {categoryUserData.name} 
                            <a className="button blue-button" href={'/question/category?category='+categoryUserData.name}>
                                Play
                            </a>
                        </h1>
                    </div> 
                    <div className="container2">   
                        <div className="gridLabel columns3">
                                <div className="label-progressBar" >Your Progress in this quiz: </div>
                                <div className="progressBarDiv">
                                    <ProgressBar showInPercents={false} partNumber={categoryUserData.numberOfBadAnswers + categoryUserData.numberOfCorrectAnswers} WholeNumber={categoryUserData.numberOfAllQuestions} />
                                </div>
                                <div className="label-progressBar" >Your accuracy: </div>
                                <div className="progressBarDiv">
                                    <ProgressBar showInPercents={true} partNumber={categoryUserData.numberOfCorrectAnswers} WholeNumber={categoryUserData.numberOfBadAnswers + categoryUserData.numberOfCorrectAnswers} />
                                </div>
                                <div className="label-progressBar" >Average accuracy: </div>
                                <div className="progressBarDiv">
                                    <ProgressBar showInPercents={true} partNumber={categoryUserData.accuracyOfUsers.numberOfCorrectAnswers} 
                                    WholeNumber={categoryUserData.accuracyOfUsers.numberOfBadAnswers + categoryUserData.accuracyOfUsers.numberOfCorrectAnswers} />
                                </div>
                        </div>
                        <div className="authorsList">
                            <h3>Authors:</h3>
                            <ol>
                                {categoriesBiggestAuthors.map((value, index) => {
                                    return(
                                        <li key={index}>
                                            {value.author[0].username}: {value.count}
                                        </li>
                                    )
                                })}
                            </ol>
                        </div>
                    </div>
                </div>
            ):(
                <LoadingCircle/>
            )}
        </div>
    );
}
 
export default Category;