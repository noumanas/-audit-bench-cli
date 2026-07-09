export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface Plan {
  slug: string;
  name: string;
  dailyAuditLimit: number | null;
  monthlyAuditLimit: number | null;
  repositoryScan: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
}

export interface Usage {
  plan: Plan;
  dailyUsed: number;
  dailyLimit: number | null;
  monthlyUsed: number;
  monthlyLimit: number | null;
  dailyResetsAt: string;
  monthlyResetsAt: string;
}

export interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  line: number | null;
  description: string;
  suggestedFix: string;
}

export interface Audit {
  id: string;
  filename: string;
  verdict: 'pass' | 'needs_work' | 'do_not_ship';
  summary: string;
  findings: Finding[];
  aiInvoked: boolean;
  fromCache: boolean;
}

export interface ScanJob {
  id: string;
  sourceName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  fileCount: number;
  filesScanned: number;
  filesFromCache: number;
  filesAiSkipped: number;
  verdict: 'pass' | 'needs_work' | 'do_not_ship' | null;
  summary: string | null;
  error: string | null;
  files?: { path: string; verdict: string | null; findings: Finding[] }[];
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed with status ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export class ApiClient {
  constructor(
    private readonly apiUrl: string,
    private readonly token?: string,
  ) {}

  private authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    return fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((res) => unwrap(res));
  }

  getUsage(): Promise<Usage> {
    return fetch(`${this.apiUrl}/me/usage`, { headers: this.authHeaders() }).then((res) => unwrap(res));
  }

  getMe(): Promise<User> {
    return fetch(`${this.apiUrl}/me`, { headers: this.authHeaders() }).then((res) => unwrap(res));
  }

  runAudit(input: { filename: string; code: string; provider?: string }): Promise<Audit> {
    return fetch(`${this.apiUrl}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders() },
      body: JSON.stringify(input),
    }).then((res) => unwrap(res));
  }

  startRepositoryScan(zipBuffer: Buffer, filename: string, provider?: string): Promise<ScanJob> {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(zipBuffer)]), filename);
    if (provider) form.append('provider', provider);
    return fetch(`${this.apiUrl}/repository`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: form,
    }).then((res) => unwrap(res));
  }

  getRepositoryScan(id: string): Promise<ScanJob> {
    return fetch(`${this.apiUrl}/repository/${id}`, { headers: this.authHeaders() }).then((res) =>
      unwrap(res),
    );
  }
}
