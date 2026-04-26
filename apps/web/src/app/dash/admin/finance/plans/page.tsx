import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default async function AdminPlansPage() {
  const supabase = await createClient();

  const { data: rawPlans } = await supabase
    .schema('billing')
    .from('plans')
    .select('*')
    .order('amount_minor', { ascending: true });

  const plans = rawPlans ?? [];

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-purple-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
              Subscription Plans
            </h1>
            <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
              Configure your business tiers, pricing, and Paystack integration codes.
            </p>
          </div>
          <Button className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-3 h-auto">
            <Plus className="mr-2 h-5 w-5" /> Create New Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-[28px] border-[4px] border-dark bg-white p-8 shadow-[8px_8px_0px_#060E1C] flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <span className={`px-4 py-1.5 rounded-full border-[3px] border-dark text-[10px] font-black uppercase tracking-widest ${plan.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-500'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg border-[2px] border-dark hover:bg-slate-100">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg border-[2px] border-dark hover:bg-rose-100 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-dark">{plan.name}</h3>
            <p className="text-sm font-bold text-dark/60 mt-2 mb-6">{plan.description}</p>
            
            <div className="mt-auto pt-6 border-t-[3px] border-dark/5">
              <p className="text-4xl font-black text-dark">
                {(plan.amount_minor / 100).toLocaleString()} <span className="text-sm text-dark/40">{plan.currency_code}</span>
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-dark/40">Paystack Code: {plan.paystack_plan_code}</p>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-[28px] border-[4px] border-dashed border-dark/20 bg-slate-50">
            <p className="text-lg font-bold text-dark/40">No plans configured yet. Start by creating one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
