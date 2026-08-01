import { getCloudflareContext } from '@opennextjs/cloudflare';
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';

function createClient() {
  const { env } = getCloudflareContext();
  return new PrismaClient({ adapter: new PrismaD1(env.DB) });
}

// Resolve the D1 binding in request context. Module-global clients can leak
// I/O objects between Worker requests, which Cloudflare does not permit.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property: keyof PrismaClient) {
    const client = createClient();
    const value = client[property];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
