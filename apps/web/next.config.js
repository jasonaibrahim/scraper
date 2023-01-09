/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")(["@scraper-js/core"]);
const nextConfig = {
  reactStrictMode: true,
}

module.exports = withTM(nextConfig)
