

let groupCategories

import ImagesDao from './imagesDAO.js'

export default class QuizCategoriesDAO {
    static async injectDB(conn) {
        if(groupCategories) {
            return
        }
        try{
            groupCategories = await conn.db(process.env.RESTQUIZ_NS).collection("categories_group")
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in quizCategoriesDAO`
            )
        } 
    }

    static async getAllCategories() {
        try{
            let categories = await groupCategories.find({}
            ).project({  categories: 1, _id: 0 }).toArray()
            
            let listOfAllCategories = [] 
            for(let i=0; i<categories.length; i++){
                for(let j=0; j<categories[i].categories.length; j++){
                    listOfAllCategories.push(categories[i].categories[j])
                }
            }    
            return listOfAllCategories
        }
        catch(e){
            console.log(e)
            return {error: e}
        }
    }

    static async getAllGroups() {
        try{
            let groups = await groupCategories.find()
            groups = await groups.toArray()
            let groupsWithImage = ImagesDao.getImagesForCategories(groups)
            if(!groupsWithImage.error){
                groups = groupsWithImage
            }
            return groupsWithImage
        }catch(e){
            console.log(e)
            return {error: e}
        }
    }

    static async createNewCategory(name) {
        try{
            const updateResponse = await groupCategories.updateOne(
                { name : "Other"},
                {
                    $push: {
                        categories: {
                         $each: [name ],
                      }
                    }
                }        
            )
            return updateResponse
        } catch(e){
            console.log(e)
            return {error: e}
        }
    }


}