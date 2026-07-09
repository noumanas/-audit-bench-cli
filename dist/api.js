"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = exports.ApiError = void 0;
class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.ApiError = ApiError;
async function unwrap(res) {
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(body.message || `Request failed with status ${res.status}`, res.status);
    }
    return res.json();
}
class ApiClient {
    apiUrl;
    token;
    constructor(apiUrl, token) {
        this.apiUrl = apiUrl;
        this.token = token;
    }
    authHeaders() {
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }
    login(email, password) {
        return fetch(`${this.apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }).then((res) => unwrap(res));
    }
    getUsage() {
        return fetch(`${this.apiUrl}/me/usage`, { headers: this.authHeaders() }).then((res) => unwrap(res));
    }
    getMe() {
        return fetch(`${this.apiUrl}/me`, { headers: this.authHeaders() }).then((res) => unwrap(res));
    }
    runAudit(input) {
        return fetch(`${this.apiUrl}/audit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
            body: JSON.stringify(input),
        }).then((res) => unwrap(res));
    }
    startRepositoryScan(zipBuffer, filename, provider) {
        const form = new FormData();
        form.append('file', new Blob([new Uint8Array(zipBuffer)]), filename);
        if (provider)
            form.append('provider', provider);
        return fetch(`${this.apiUrl}/repository`, {
            method: 'POST',
            headers: this.authHeaders(),
            body: form,
        }).then((res) => unwrap(res));
    }
    getRepositoryScan(id) {
        return fetch(`${this.apiUrl}/repository/${id}`, { headers: this.authHeaders() }).then((res) => unwrap(res));
    }
}
exports.ApiClient = ApiClient;
