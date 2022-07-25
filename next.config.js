const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const nextConfig = (phase) => {
    if (phase == PHASE_DEVELOPMENT_SERVER) {
        return {
            reactStrictMode: true,
            swcMinify: true,
            env: {
            }
        }
    }

    return {
        reactStrictMode: true,
        swcMinify: true,
        env: {
        }
    }
}

module.exports = nextConfig
