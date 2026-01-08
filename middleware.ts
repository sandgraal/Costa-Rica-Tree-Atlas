import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Constant-time comparison to prevent timing attacks
async function secureCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);

  // If lengths differ, still compare to maintain constant time
  const maxLength = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length === bBytes.length ? 0 : 1;

  for (let i = 0; i < maxLength; i++) {
    const aByte = i < aBytes.length ? aBytes[i] : 0;
    const bByte = i < bBytes.length ? bBytes[i] : 0;
    result |= aByte ^ bByte;
  }

  return result === 0;
}

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }

    try {
      // Decode credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [user, pwd] = credentials.split(':');

      // Get admin credentials from environment variables
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        console.error('Admin credentials not configured in environment variables');
        return new NextResponse('Server configuration error', {
          status: 500,
        });
      }

      // Validate credentials using constant-time comparison
      if (!user || !pwd) {
        return new NextResponse('Invalid credentials format', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        });
      }

      // Use async secure comparison
      const userValid = await secureCompare(user, adminUsername);
      const pwdValid = await secureCompare(pwd, adminPassword);

      if (!userValid || !pwdValid) {
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
          },
        });
      }

      // Authentication successful, continue to the admin page
      return NextResponse.next();
    } catch (error) {
      console.error('Authentication error:', error);
      return new NextResponse('Authentication failed', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }
  }

  // For all other routes, continue without authentication
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
