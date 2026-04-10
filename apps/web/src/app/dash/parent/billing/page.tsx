import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ParentBillingPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-edvoura-navy mb-8">Billing & Subscriptions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-2xl font-bold text-edvoura-navy-dark">Free Tier</span>
            </div>
            <p className="text-slate-600 text-sm mb-6">Upgrade to Edvoura Premium to access dedicated private tutors and priority live sessions.</p>
            <Button variant="primary" className="w-full">Upgrade via Paystack</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-slate-500 text-sm">
              <p>No past invoices recorded.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
