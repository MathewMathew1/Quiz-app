
import {arrayContainsValue, ListOfObjectContainsValue} from "../functions.js"
import mongodb from "mongodb"
import {categories} from "../server.js"

const ObjectId = mongodb.ObjectId
let quiz

export default class QuizDAO {
    static async injectDB(conn) {
        if(quiz) {
            return
        }
        try{
            quiz = await conn.db(process.env.RESTQUIZ_NS).collection("questions")
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in quizDAO`
            )
        } 
    }

    static async addQuestion(user, answers, correctAnswer, category, date, question, description) {
        try{
            const newQuestion = { 
                user: user ?ObjectId(user._id) : "",
                answers: answers,
                correctAnswer: correctAnswer,
                category: category,
                question: question,
                date: date,
                description: description,
                accepted: true,
                answersFromUsers: [],
            }
            return await quiz.insertOne(newQuestion)
        } catch(e){
            return {error: e}
        }
    }

    static async deleteQuestion(user, questionId) {
        try {
            const deleteResponse = await quiz.deleteOne({
                _id: ObjectId(questionId),
                user: ObjectId(user._id),
            })
            return deleteResponse
        } catch (e) {
            return { error: e }
        }
    }

    static async updateQuestion(user, answers, correctAnswer, category, question, description, questionId, dropData) {
        try {    
            const updateResponse = await quiz.updateOne(
                { user: ObjectId(user._id), _id: ObjectId(questionId)},
                [{ $set: { 
                    answers: answers, 
                    correctAnswer: correctAnswer,
                    question: question,
                    description: description,
                    category: category,
                    answersFromUsers: {
                        $cond: {
                            if: dropData,
                            then: [], 
                            else: '$answersFromUsers', 
                        }
                    }  
                } }],        
            )
            return updateResponse
        } catch (e) {
            return { error: e }
        }
    }

    static async updateAnswersFromUserToQuestion(questionId, user, answerFromUser){
        try {
            const userId = user? user._id : ""
            const addNewAnswerFromUser = await quiz.updateOne( {_id: ObjectId(questionId), "answersFromUsers.user" : ObjectId(userId) } , 
                {$set : {"answersFromUsers.$.answerFromUser" : answerFromUser} } , 
               );
            
            if(addNewAnswerFromUser.modifiedCount>0){
                return addNewAnswerFromUser
            }

            const editNewAnswerFromUser = await quiz.updateOne(
                {_id: ObjectId(questionId), "answersFromUsers.user" : {$ne : ObjectId(userId) }} , 
                {$addToSet : {"answersFromUsers" : {'user' : user? ObjectId(userId): "" , 'answerFromUser' : answerFromUser }} }
            )

            return editNewAnswerFromUser
        }
        catch (e) {
            console.log
            return { error: e }
        }
    }

    static async getQuestion({filters = null, page = 0, questionsPerPage = 10, user = none} = {}){
        try {
            let query

            console.log(user)
            if(filters){
                if("id" in filters){
                    query = {"_id": {$eq: ObjectId(filters["id"])}}
                } else if ("category" in filters){
                    query = {"category": { $elemMatch: { $eq: filters["category"]  } } }
                } else if ("user" in filters){
                    query = {"user" : {$eq: ObjectId(filters["user"]) }}
                }
            }
            let questionList
        
            const pipeline = [
                { $match: query },
                { $limit : questionsPerPage },
                { $skip: questionsPerPage * page },

                {$lookup: {
                        from: "users",
                        let: {
                            user: "$user",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$user"],
                                    },
                                },
                            },
                            {
                                $project: {
                                    username:1, _id:0
                                },
                            },
                        ],
                        as: "author",
                    },    
                },
                {$project: {"user" : 0, "answersFromUsers.user" : 0},}
            ]
            
            questionList = await quiz.aggregate(pipeline).toArray()

            
            const totalNumQuestions =  await quiz.countDocuments(query)
         
            return { questionList, totalNumQuestions}
        } catch (e) {
            console.log(e)
            return { questionList: [], totalNumQuestions: 0 }
        }
    }

    static async validateQuestionFormat(answers, question, correctAnswer, category){
        
        const areThereFourAnswers = !Array.isArray(answers) || answers.length!==4
        if(areThereFourAnswers) return { error: "Answers are not formatted correctly."}
        
        if(!Array.isArray(category)) return { error: "Category is not formatted correctly."}

        for (var i=0; i < answers.length; i++) {
            if (answers[i]=="") {
                return { error: "Answer cannot be empty."}
            }    
        }
        
        if (question==="") return { error: "Question cannot be empty."}


        const possibleCorrectAnswers = [0, 1, 2, 3]
        if(!arrayContainsValue(possibleCorrectAnswers, correctAnswer)) return { error: "Chose which answer is correct"}
       
        return ({status: "question is valid"})
    }


    static async getAllCategoriesStatistics(){
        try {
        
            let categoriesStatistics = []
            let allQuestions = await quiz.find().toArray()
            for(let i = 0; i < allQuestions.length; i++){
                for(let j = 0; j < allQuestions[i].category.length; j++){
                    const result = categoriesStatistics.find( ({ name }) => name === allQuestions[i].category[j] )
                    if(result === undefined){
                        let newCategory = {name: allQuestions[i].category[j], amount: 1}
                        categoriesStatistics.push(newCategory)
                        continue
                    }
                    result.amount += 1
                }
            }
            return categoriesStatistics
        }
        catch(e){
            console.log(e)
            return { error: e }
        }
    }

    static async getUserQuizData(User) {
        let userStatistics = []
        try {
            for(let i=0; i<categories.length; i++){
                
                let allQuestions = await quiz.find({category: categories[i]}).toArray()

                let numberOfCorrectAnswers = 0
                let numberOfBadAnswers = 0
                for(let j=0; j<allQuestions.length; j++){
                    console.log(categories)
                    console.log(allQuestions[j])
                    const result = allQuestions[j].answersFromUsers.find( ({ user }) => user.toString() === User._id.toString() )
                    if(result===undefined) continue

                    if(allQuestions[j].correctAnswer===result.answerFromUser){
                        numberOfCorrectAnswers += 1
                    }
                    else numberOfBadAnswers += 1
                 
                }
                const dataFromCurrentCategory = {
                    name:  categories[i], 
                    numberOfCorrectAnswers: numberOfCorrectAnswers, 
                    numberOfBadAnswers: numberOfBadAnswers,
                    numberOfAllQuestions: allQuestions.length  
                }
                userStatistics.push(dataFromCurrentCategory)
            }
            return userStatistics
        }
        catch(e){
            console.log(e)
            return { error: e }
        }

    }


}