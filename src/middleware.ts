import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * O middleware roda no Edge, onde o Prisma não funciona — então aqui só
 * checamos a presença do cookie. A validação real da sessão e do papel
 * acontece nos layouts de /app, /pro e /admin, que rodam em Node.
 */
export function middleware(req: NextRequest) {
  const temSessao = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;

  if (!temSessao) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/pro/:path*", "/trocar-senha"],
};
