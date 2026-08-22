export class AuthServiceError extends Error {
    statusCode: number;
    errors: string[];

    constructor(
        message: string,
        statusCode: number,
        errors: string[] = [],
    ) {
        super(message);

        this.name = "AuthServiceError";
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

export class UrlServiceError extends Error {
    statusCode: number;
    errors: string[];

    constructor(message: string, statusCode: number, errors: string[] = []) {
        super(message);
        this.name = "UrlServiceError";
        this.statusCode = statusCode;
        this.errors = errors;
    }
}