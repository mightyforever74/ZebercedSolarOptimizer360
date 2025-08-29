/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://solaroptimizer360.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/_next/"] },
    ],
  },
  changefreq: "weekly",
  priority: 0.7,
  exclude: ["/api/*"],
};
