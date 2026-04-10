import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ParentChildrenPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-edvoura-navy">My Children</h1>
        <Button variant="primary">Add Child Account</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Linked Learner Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <span className="text-4xl block mb-4">👨‍👩‍👧‍👦</span>
            <p>You haven't linked any child accounts to your Parent Profile yet.</p>
            <p className="text-sm mt-2">Add a child to select their Learner Band and enroll them in premium K-12 classes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
