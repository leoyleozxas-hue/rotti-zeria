// next.config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Raíz explícita del proyecto. Sin esto Turbopack busca el lockfile hacia
// arriba y encuentra C:\Users\teamy\package-lock.json, así que indexa y vigila
// todo el home del usuario: arranques de 2 minutos y compilaciones de 60-127 s.
// La doc lo advierte: "Do not extend the root directory too broadly".
// https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lqjeijiqwevvaircywdl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
    ],
  },
}

export default nextConfig
