import {pino} from 'pino'
import winston from 'winston'
const { combine, timestamp,  printf, colorize } = winston.format;

const color = {
  'debug': "\u001b[32;1m",
  'info': "\u001b[36;1m",
  'error': "\u001b[31;1m",
  'warn': "\u001b[33;1m"
 
  };

function colorizeTimestamp(timestamp: any) {
  let background = `\u001b[40m`
  let foreground = `\u001b[37m`
  let reset = `\x1b[0m`
  return `${background}${foreground}${timestamp}${reset}`
}


const myFormat = printf(({ level, message, timestamp }) => {
  // @ts-ignore
  return `${colorizeTimestamp(timestamp)} ${color[level] || ''}[${level.toUpperCase()}]: ${message}`;
});


const logger = winston.createLogger({
  
  
  //defaultMeta: {service: 'user-service'},
  
  transports: [
    new winston.transports.Console({
      
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SS'}),
        myFormat,
    
        ),
        
    }),
  ]
})

export { logger }
