import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (authToken) {
    redirect('/dashboard');
  }

  redirect('/login');
}
