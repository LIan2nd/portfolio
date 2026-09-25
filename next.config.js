function r2RemotePattern() {
  try {
    const url = new URL(process.env.R2_PUBLIC_BASE_URL);
    return {
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname.replace(/\/$/, "")}/**`,
    };
  } catch {
    return null;
  }
}

const r2Pattern = r2RemotePattern();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/resume.pdf",
        destination: "/file/resume.pdf",
      },
    ];
  },
};

module.exports = nextConfig;
