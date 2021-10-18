import { useState, useEffect } from "react";
import LoadingCircle from "./MiniComponents/LoadingCircle";
import useStateWithHistory from "./CustomHooks/useStateWithHistory";

const AdminPage = () => {
    const [isDataFetched, setIsDataFetched] = useState(false)
    const [groupCategories, setGroupCategories] = useState(Array)
    const [whichCategoryIsChanged, setWhichCategoryIsChanged] = useState(Array)
    const [isAnyDivSelected, setIsAnyDivSelected] = useState(false)
    const changesMade = useStateWithHistory(0)
    const [controller] = useState(new AbortController())
    

    useEffect(() => {

        document.addEventListener("keydown", goBack, false);
        document.title = "AdminPage"
        
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
            document.removeEventListener("keydown", goBack, false)
        } // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const changeColorOfDiv = (idOfDiv, color) => {

        let div = document.getElementById(idOfDiv)
        if(div!==null){
            div.style.backgroundColor = color
        }
    }

    const changeSelectedCategory = (index, index2) => {
        setIsAnyDivSelected(true)

        let idOfDiv = whichCategoryIsChanged[0]+"/"+whichCategoryIsChanged[1]
        changeColorOfDiv(idOfDiv, "")
        
        
        
        setWhichCategoryIsChanged([index, index2])

        idOfDiv = index+"/"+index2
        changeColorOfDiv(idOfDiv, "green")
    }

    const changeToWhichGroupCategoryBelongs = (index) => {
        if(!isAnyDivSelected){
            return
        }

        let idOfDiv = whichCategoryIsChanged[0]+"/"+whichCategoryIsChanged[1]
        changeColorOfDiv(idOfDiv, "")

        addChange(index)
        
        let copyGroupCategories = [...groupCategories]
        let category = copyGroupCategories[whichCategoryIsChanged[0]].categories[whichCategoryIsChanged[1]]

        
        copyGroupCategories[index].categories.push(category)
        copyGroupCategories[whichCategoryIsChanged[0]].categories.splice(whichCategoryIsChanged[1], 1)

        setIsAnyDivSelected(false)
        setGroupCategories(copyGroupCategories)
    }

    const addChange = (index) => {
        let nameOfFormerGroup = groupCategories[whichCategoryIsChanged[0]].name
        let nameOfNewGroup = groupCategories[index].name
        let nameOfCategory = groupCategories[whichCategoryIsChanged[0]].categories[whichCategoryIsChanged[1]]
        let change = {
            nameOfFormerGroup: nameOfFormerGroup,
            nameOfNewGroup: nameOfNewGroup,
            nameOfCategory: nameOfCategory
        }

        changesMade.set(change)

    }


    const sendChangedCategory = () => {
        const { signal } = controller
        const body = {changes: changesMade.history}
        console.log(body)
        fetch(`http://localhost:3000/api/v1/quiz/groups`,{
            method: "POST",
            body: JSON.stringify(body),
            signal,
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': localStorage.getItem("token")
            }})
            .then(response => response.json())
            .then(response => {
                console.log(response)
                
            })
            .catch(error=>{console.log(error)})
        
    }

    const goBack = (e) => {
        const isCtrlZPressed = e.ctrlKey===false || e.keyCode !== 90
        if(isCtrlZPressed){
            return
        }
        console.log(changesMade)
        let changesToRevert = changesMade.value
        changesMade.back()
        console.log(changesToRevert)
    }

    return (
        <div>
            {isDataFetched?(
                <div className="adminPageMain">
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
                    <div className="center-vertically">
                        <button className="button green-button" onClick={() => sendChangedCategory()}>Submit</button>
                    </div>
                </div>
            ):(
                <LoadingCircle/>
            )}
        </div>
    )
}

export default AdminPage;