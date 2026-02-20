import { cloudinary } from "./file-uploader.js";

export const cleanUploaderFileOnFinish = (req, res, next) => {
    if(req.file){
        res.on('finish', async () => {
            try {
                if(res.statusCode >= 400) {
                    const publicId = req.file.public_id || req.file.filename;
                    if(publicId){
                        await cloudinary.uploader.destroy(publicId);
                        console.log(
                            `Archivo Cloudinary eliminado por respuesta ${res.statusCode}: ${publicId}`
                        )
                    }
                }
            } catch (error) {
                console.error(`Error al eliminar archivo de cloudinary tras error de respuesta: ${e.message}`)
            }
        })
    }

    next();
}

export const deleteFileOnError = async(err, req, res, next) => {
    try {
        if(req.file) {
            const publicId = req.file.public_id || req.file.filename;
            if(publicId){
                await cloudinary.uploader.destroy(publicId);
                console.log(
                    `Archivo Cloudinary eliminado por error en cadena: ${publicId}`
                )
            }
        }
    } catch (unlinkErr) {
        console.error(
            `Error al eliminar archivo de Clodinary (error handler): ${unlinkErr.message}`
        )
    }
    return next(err);
}