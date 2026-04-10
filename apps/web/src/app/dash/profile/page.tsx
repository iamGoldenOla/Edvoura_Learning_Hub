import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ProfileDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role || 'student';
  const email = user?.email;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-8">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div className="text-sm font-medium text-slate-500">Email Address</div>
            <div className="col-span-2 text-slate-900 font-medium">{email}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div className="text-sm font-medium text-slate-500">System Role</div>
            <div className="col-span-2 text-slate-900 capitalize font-medium">{role}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 pb-4">
            <div className="text-sm font-medium text-slate-500">Authentication</div>
            <div className="col-span-2">
              <Button variant="outline" className="text-sm">Change Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
