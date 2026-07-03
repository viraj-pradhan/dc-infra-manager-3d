import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    // Protect dashboard base path and API topology paths, exclude login, signup, and static assets
    '/',
    '/api/topologies/:path*',
    '/api/user/theme/:path*',
  ],
};
