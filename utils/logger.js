import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: 'booking-api'}
})

if (process.env.NODE_ENV !== "production"){
    new winston.transports.Console({
        format: winston.format.simple(),
    })
}

export default logger