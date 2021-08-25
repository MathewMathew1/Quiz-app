

let chunks
let files

export default class ImagesDao {
    static async injectDB(conn) {
        if(chunks) {
            return
        }
        try{
            chunks = await conn.db(process.env.RESTQUIZ_NS).collection("uploads.chunks")
            files = await conn.db(process.env.RESTQUIZ_NS).collection("uploads.files")
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in chunksDAO`
            )
        } 
    }

    static async getImagesForCategories(categories) {
            for(let i=0; i<categories.length; i++){
                try{
                    let id = categories[i]._id
                    let image = await files.findOne({ image_of_id: id})

                    let id_of_image = image._id
                    let image_data = await chunks.findOne({files_id: id_of_image})
                    categories[i].image = image_data.data
                }
                catch(e){
                   console.log(e)
                }
            }
            return categories
            
    }


}