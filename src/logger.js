import { createLogger,format,level,transports } from "winston";
const { combine, timestamp, json, colorize } = format;

const consoleformat = format.combine(
    format.colorize(),
    format.printf( ({level, message, timestamp}) => {
        return `${level}: ${message} :${timestamp}`;
    })
)

const logger = createLogger({
    level:'info',
    format: combine(
        timestamp(),json(),colorize()
    ),
    transports: [
        new transports.Console({
            format:consoleformat,
        }),
        new transports.File({filename:"app.log"})
    ]
})