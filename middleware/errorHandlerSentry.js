import * as Sentry from "@sentry/node";

const errorHandlerSentry = (err,req,res,next) =>{
    console.error(err);
    Sentry.captureException(err);
    res.status(500).json({
        error: "Something went wrong with this request!"
    })
}

export default errorHandlerSentry