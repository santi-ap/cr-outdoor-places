import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // react-leaflet manipulates the DOM directly to create the Leaflet map
  // instance; React 18 Strict Mode's dev-only double-invoke of effects
  // causes it to throw "Map container is already initialized" on every
  // load. Production builds don't double-invoke effects, so this only
  // affects local dev — safe to disable for this app.
  reactStrictMode: false,
};

export default nextConfig;
