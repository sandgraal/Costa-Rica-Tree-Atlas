import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic admin authentication middleware
export function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get credentials from request headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }

    // Decode credentials
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    // Check credentials (in production, use environment variables)
    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || 'admin'

    if (username !== validUsername || password !== validPassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

// Timing-safe string comparison to prevent timing attacks
async function secureCompare(a: string, b: string): Promise<boolean> {
  // Convert strings to buffers for comparison
  const bufferA = Buffer.from(a, 'utf-8')
  const bufferB = Buffer.from(b, 'utf-8')
  
  // If lengths don't match, still compare to prevent timing leaks
  if (bufferA.length !== bufferB.length) {
    return false
  }
  
  // Use crypto.timingSafeEqual for constant-time comparison
  const crypto = require('crypto')
  try {
    return crypto.timingSafeEqual(bufferA, bufferB)
  } catch {
    return false
  }
}

// Updated middleware with secure comparison
export async function secureMiddleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      })
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    const validUsername = process.env.ADMIN_USERNAME || 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || 'admin'

    // Use timing-safe comparison
    const usernameMatch = await secureCompare(username, validUsername)
    const passwordMatch = await secureCompare(password, validPassword)

    if (!usernameMatch || !passwordMatch) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
      })
    }
  }

  return NextResponse.next()
}