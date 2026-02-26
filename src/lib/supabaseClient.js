import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper to create a dummy chainable object that handles any property access
const createSafeProxy = () => {
    const handler = {
        get: (target, prop) => {
            // If the property is 'then', it's being awaited
            if (prop === 'then') {
                return (onfulfilled) => Promise.resolve({ data: null, error: null }).then(onfulfilled)
            }
            // Otherwise, return the proxy itself for chaining
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
        signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
        signUp: () => Promise.resolve({ data: {}, error: null }),
        signOut: () => Promise.resolve({ error: null }),
    },
    storage: {
        from: () => createSafeProxy()
    }
}

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseKey)
    : dummy
