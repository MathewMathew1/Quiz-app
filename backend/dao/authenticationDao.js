import { response, text } from "express"
import mongodb from "mongodb"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const ObjectId = mongodb.ObjectId

let users

export default class AuthenticationDAO {
    static async injectDB(conn) {
        if(users) {
            return
        }
        try{
            users = await conn.db(process.env.RESTQUIZ_NS).collection("users")
            users.createIndex( { "username": 1 }, { unique: true } )
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in authDAO`
            )
        } 
    }

    static async createUser(hashedPassword, username) {
        try{
            const newUser = { 
                username: username,
                password: hashedPassword,
                isAdmin: false
            }
            return await users.insertOne(newUser)
        } catch(e){
            return {error: e}
        }
    }

    static async validateUser(password, username) {
        try{
            const user = await users.findOne({ 'username': {$eq: username} })
            if(await bcrypt.compare(password, user.password)) return {id: user._id.toString()}
            return {error: "invalid password"}    
        } 
        catch(e){
            return {error: e}
        }
      
    }


    static async isUserAdmin(token){
        try{
            if(token == null) return false
            let id = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const userDb = await users.findOne({ '_id': {$eq: ObjectId(id)} })
            const doesTokenBelongsToAdminUser = userDb===undefined || !userDb?.isAdmin
            if(doesTokenBelongsToAdminUser){
                return false
            }
            return true
        }
        catch(e){
            return {error : e}
        }    
    }

    static async setUser(req){
        try{

            const authHeader = req.headers["authorization"]
            const token = authHeader.split(' ')[1]
            
            if(token == null) return
            let id = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const userDb = await users.findOne({ '_id': {$eq: ObjectId(id)} })

            req.user = userDb
        } 
        catch(e){
            return {error: e}
        } 
    }

    static async getIdFromUser(username){
        try{
            const user = await users.findOne({username: username})
            return user._id
        } 
        catch(e){
            return {error: e}
        } 
    }
}