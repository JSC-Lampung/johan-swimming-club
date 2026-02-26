export default async function sitemap() {
    const baseUrl = 'https://johan-swimming-club.vercel.app'

    // Fetch dynamic content for sitemap (e.g. news/programs if they have individual pages)
    // For now, these are sections on the homepage, but we add the base and common landing paths

    const staticPages = [
        '',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1 : 0.8,
    }))

    return [...staticPages]
}
