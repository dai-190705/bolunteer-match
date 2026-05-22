import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /dashboard/* /mypage /admin はログイン必須（/admin/login は除外）
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/mypage') || (pathname.startsWith('/admin') && pathname !== '/admin/login')) {
    // Supabaseのsession cookieが存在するか確認
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
    )

    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
