class ApiError extends Error {
    constructor(
        message = "Something went wrong",
        statusCode,
        errors=[]) {

        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;
        this.success = false;

    }
}

export default ApiError;