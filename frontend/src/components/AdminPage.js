import { useState, useEffect } from "react";
import LoadingCircle from "./MiniComponents/LoadingCircle";

const AdminPage = () => {
    const [isDataFetched, setIsDataFetched] = useState(false)
    const [groupCategories, setGroupCategories] = useState(Array)
    const [whichCategoryIsChanged, setWhichCategoryIsChanged] = useState(Array)

    useEffect(() => {
        const controller = new AbortController()
        const fetchCategories = async () =>{
            const { signal } = controller
            await fetch(`http://localhost:3000/api/v1/quiz/groups/?updatedData=true`,{
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
                    if(response.error){
                        return
                    }
                    setGroupCategories(response)
                })
                .catch(error=>{console.log(error)})
            }
        fetchCategories()
        return () => {
            controller.abort()
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const changeSelectedCategory = (index, index2) => {

        let idOfDiv = whichCategoryIsChanged[0]+"/"+whichCategoryIsChanged[1]
        let div = document.getElementById(idOfDiv)
        if(div!=undefined){
            div.style.backgroundColor = "white"
        }
        
        
        setWhichCategoryIsChanged([index, index2])

        idOfDiv = index+"/"+index2
        div = document.getElementById(idOfDiv)
        div.style.backgroundColor = "Green"
    }

    const changeToWhichGroupCategoryBelongs = (index) => {
        let copyGroupCategories = [...groupCategories]
        let category = copyGroupCategories[whichCategoryIsChanged[0]].categories[whichCategoryIsChanged[1]]

        
        copyGroupCategories[index].categories.push(category)
        copyGroupCategories[whichCategoryIsChanged[0]].categories.splice(whichCategoryIsChanged[1], 1)

        console.log(whichCategoryIsChanged[1])
        setGroupCategories(copyGroupCategories)
    }

    return (
        <div>
            {isDataFetched?(
                <div className="adminPage-categories">
                    {groupCategories.map((value, index) => {
                        return(
                            <div className="" key={index}>
                                <div onClick={() => changeToWhichGroupCategoryBelongs(index)} className="category-title-name">{value.name} </div>

                                {value.categories.map((value2, index2) => {
                                    return(
                                        
                                        <div id={index+"/"+index2} onClick={()=>changeSelectedCategory(index, index2)} 
                                            className="category-name"key={index2}>
                                                 {value2}
                                        </div>
                                    )
                                })}

                            </div>
                        )
                    })}
                </div>
            ):(
                <LoadingCircle/>
            )}
        </div>
    )
}

export default AdminPage;