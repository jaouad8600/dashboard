export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, code: string = "INTERNAL_ERROR", isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class AuthError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401, "AUTH_ERROR");
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Permission denied") {
        super(message, 403, "PERMISSION_DENIED");
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404, "NOT_FOUND");
    }
}

export const handleError = (error: unknown) => {
    if (error instanceof AppError) {
        return {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
        };
    }

    console.error("Unexpected error:", error);
    return {
        message: "An unexpected error occurred",
        code: "INTERNAL_ERROR",
        statusCode: 500,
    };
};
