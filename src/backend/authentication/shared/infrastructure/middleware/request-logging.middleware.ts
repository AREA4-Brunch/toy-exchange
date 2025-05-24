import express from 'express';

export interface IRequestLoggingMiddlewareConfig {
    logger?: { info: (_: string, meta?: any) => void };
    logLevel?: 'basic' | 'detailed' | 'debug';
    sensitiveHeaders?: string[];
    fieldsToRedact?: string[];
}

export class RequestLoggingMiddleware {
    private readonly logger: { info: (_: string, meta?: any) => void };
    private readonly logLevel: 'basic' | 'detailed' | 'debug';
    private readonly sensitiveHeaders: string[];
    private readonly fieldsToRedact: string[];

    constructor(config: IRequestLoggingMiddlewareConfig) {
        this.logger = config.logger || console;
        this.logLevel = config.logLevel || 'basic';
        this.sensitiveHeaders = config.sensitiveHeaders || [
            'authorization',
            'cookie',
            'set-cookie',
        ];
        this.fieldsToRedact = config.fieldsToRedact || [
            'authorization',
            'password',
            'token',
            'secret',
        ];
    }

    public createLogRequest(): express.RequestHandler {
        return this.logRequest.bind(this);
    }

    public logRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const { method, originalUrl: url, ip } = req;
        const id = req.id || 'no-id';

        const headers: string = this.shouldLogHeaders(req)
            ? ` [Headers: ${this.safelyLogHeaders(req.headers)}]`
            : ``;

        const body: string = this.shouldLogBody(req)
            ? ` [Body: ${this.sanitizeBody(req.body)}]`
            : ``;

        this.logger.info(
            `[REQ.ID: ${id}] [${method}] [${url}] [IP: ${ip}]${headers}${body}`,
        );
        next();
    }

    protected shouldLogHeaders(req: express.Request): boolean {
        return this.logLevel === 'detailed' || this.logLevel === 'debug';
    }

    protected shouldLogBody(req: express.Request): boolean {
        if (this.logLevel !== 'debug') return false;
        const contentType = req.get('Content-Type') || '';
        return !contentType.includes('multipart/form-data');
    }

    protected sanitizeBody(body: any): any {
        if (!body) return body;

        const sanitized = JSON.parse(JSON.stringify(body));
        const redact = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach((key) => {
                if (
                    this.fieldsToRedact.some((field) =>
                        key.toLowerCase().includes(field),
                    )
                ) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object') {
                    redact(obj[key]);
                }
            });
        };
        redact(sanitized);
        return sanitized;
    }

    protected safelyLogHeaders(headers: any): any {
        const sanitized = { ...headers };
        this.sensitiveHeaders.forEach((header) => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }
}
