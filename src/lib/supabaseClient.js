import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

// Helper to create a dummy chainable object that handles any property access
const createSafeProxy = () => {
    const handler = {
        get: (target, prop) => {
            if (prop === 'then') {
                return (onfulfilled) => Promise.resolve({ data: null, error: { message: 'Supabase URL/Key missing' } }).then(onfulfilled)
            }
            if (typeof prop === 'string' && prop !== 'toJSON') {
                return (...args) => createSafeProxy()
            }
            return undefined
        }
    }
    return new Proxy(() => { }, handler)
}

const dummy = {
    from: () => createSafeProxy(),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase URL/Key missing' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase URL/Key missing' } }),
        signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
        from: () => createSafeProxy()
    }
}

// Custom fetch workaround for Node.js environments where native fetch (undici) fails (e.g. Node v25 bugs)
const customHTTPSFetch = async (url, options = {}, retries = 2) => {
    if (typeof window !== 'undefined') return fetch(url, options);

    const https = require('https');

    const executeRequest = () => new Promise((resolve, reject) => {
        const u = new URL(url);

        // Robustly handles both plain objects and Headers instances
        const headers = {};
        if (options.headers) {
            if (typeof options.headers.forEach === 'function') {
                options.headers.forEach((v, k) => headers[k] = v);
            } else {
                Object.assign(headers, options.headers);
            }
        }

        const reqOptions = {
            hostname: u.hostname,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: headers,
            family: 4, // Force IPv4 - often resolves weird timeout issues in Node/Windows environments
            timeout: 10000 // 10s per attempt
        };

        const req = https.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        text: () => Promise.resolve(data),
                        json: () => Promise.resolve(JSON.parse(data || '{}')),
                        headers: {
                            get: (name) => res.headers[name.toLowerCase()]
                        }
                    });
                } catch (e) {
                    reject(new Error('Failed to parse JSON response'));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy(new Error('Connection Timeout'));
        });

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }

        req.end();
    });

    try {
        return await executeRequest();
    } catch (err) {
        if (retries > 0) {
            console.warn(`[CustomFetch] Request to ${url} failed (${err.message}). Retrying... (${retries} left)`);
            // Wait 1s before retrying
            await new Promise(r => setTimeout(r, 1000));
            return customHTTPSFetch(url, options, retries - 1);
        }
        console.error(`[CustomFetch] Final failure for ${url}:`, err.message);
        throw err;
    }
};

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.warn('⚠️ Supabase connection URL missing or invalid.')
}

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseKey, { global: { fetch: customHTTPSFetch } })
    : dummy

export const supabaseAdmin = (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseServiceKey, {
        global: { fetch: customHTTPSFetch },
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : dummy
