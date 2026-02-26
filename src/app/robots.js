export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/coach/', '/member/'],
        },
        sitemap: 'https://johan-swimming-club.vercel.app/sitemap.xml',
    }
}
