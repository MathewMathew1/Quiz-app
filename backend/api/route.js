import express from "express"
import AuthenticationCtrl from "./authentication.js"
import QuizCtrl from "./quiz.js"
import QuizCategoriesCtrl from "./quizCategories.js"


const router = express.Router()

router.route("/sign-up").post(AuthenticationCtrl.apiSignUp)
router.route("/login").post(AuthenticationCtrl.apiLoginIn)
router.route("/admin").get(AuthenticationCtrl.apiIsUserAdmin)
router.route("/quiz/question").post(QuizCtrl.apiAddQuestion)
.get(QuizCtrl.apiGetQuestion) 
router.route("/quiz/question/id/:id").put(QuizCtrl.apiUpdateQuestion)
.delete(QuizCtrl.apiDeleteQuestion)
router.route("/quiz/user/stats/").get(QuizCategoriesCtrl.apiGetUserQuizData) 
router.route("/quiz/groups").get(QuizCategoriesCtrl.apiGetAllGroups)
router.route("/quiz/categories").get(QuizCategoriesCtrl.apiGetAllCategories)



export default router