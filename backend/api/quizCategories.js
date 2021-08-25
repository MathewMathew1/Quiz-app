

import QuizCategoriesDAO from "../dao/quizCategoriesDAO.js"
import { redisClient } from "../server.js"

export default class QuizCategoriesCtrl {
    static async apiGetAllGroups(req, res, next){
        try{

            let groups 

            groups = redisClient.get("groups", function(err, reply) {
    
                if (err) {
                    return res.status(400).json({error: "Unexpected error, try again." })
                }
                    return res.status(201).json(JSON.parse(reply))
            });
            
            
            }
        catch (e) {
            console.log(e)
            return res.status(500).json({ error: e.message })
        }
    }

    static async apiGetAllCategories(req, res, next){
        try{
            let categories

            categories = redisClient.get("categories", function(err, reply) {
    
                if (err) {
                    return res.status(400).json({error: "Unexpected error, try again." })
                }
                    return res.status(201).json(JSON.parse(reply))
            });
        }
        catch (e) {
            return res.status(500).json("Something went wrong")
        }
    }
}