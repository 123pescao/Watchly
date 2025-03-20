import logging
import os

#Ensure logs directory exists
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)

#Configure logging
log_file = os.path.join(log_dir, "app.log")


logging.basicConfig(
    level=logging.DEBUG,        #Set to debug for detailed logs
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file),      #Save the logs
        logging.StreamHandler()         #Print the logs to the console
    ]
)

#Create a logger instance
logger = logging.getLogger("WatchlyLogger")


if __name__ == "__main__":
    logger.info("Logging system initialized successfully.")
    logger.warning("This is a warning log")
    logger.error("This is an error log.")
    logger.debug("Debugging details go here.")