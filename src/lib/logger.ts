type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
}

class Logger {
    private log(level: LogLevel, message: string, context?: Record<string, any>) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
        };

        // In production, this would send to a logging service (e.g., Datadog, Sentry)
        console.log(JSON.stringify(entry));
    }

    info(message: string, context?: Record<string, any>) {
        this.log("info", message, context);
    }

    warn(message: string, context?: Record<string, any>) {
        this.log("warn", message, context);
    }

    error(message: string, context?: Record<string, any>) {
        this.log("error", message, context);
    }

    debug(message: string, context?: Record<string, any>) {
        this.log("debug", message, context);
    }
}

export const logger = new Logger();
