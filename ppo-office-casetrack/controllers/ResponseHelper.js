class ResponseHelper {
    static success(res, message, data = null, token = null) {
        res.json({
            status: 0,
            message: message || "Success",
            access_token: token || null,
            data: data || null,
        });
    }

    // static error(res, message, data = null) {
    //     res.json({
    //         status: 1,
    //         message: message || "An error occurred",
    //         data: data || null,
    //     });
    // }

    static error(res, message, data = null, statusCode = 400) {
        res.status(statusCode).json({
            status: 1,
            message: message || "An error occurred",
            data: data || null,
        });
    }
    
    static success_reponse(res, message, data = null) {
        res.json({
            status: 0,
            message: message || "Success",
            data: data || null,
        });
    }

   
    
}

module.exports = ResponseHelper;



// static error(res, message, data = null, statusCode = 400) {
//     res.status(statusCode).json({
//         status: 1,
//         message: message || "An error occurred",
//         data: data || null,
//     });
// }
