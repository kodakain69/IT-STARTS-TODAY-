import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageHeader, Grid, Stack, StatCard, DataTable, Badge, Card, BarChart } from 'dashboard-blocks';

interface TemplateProps { workspaceId: string; }

export function RevenueDashboard({ workspaceId }: TemplateProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [paymentIntents, setPaymentIntents] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/stripe-connect/subscriptions?workspaceId=${workspaceId}`).then(r => r.json()),
      fetch(`/api/stripe-connect/payment-intents?workspaceId=${workspaceId}`).then(r => r.json()),
      fetch(`/api/stripe-connect/refunds?workspaceId=${workspaceId}`).then(r => r.json()),
    ]).then(([subData, piData, refData]) => {
      setSubscriptions(subData.subscriptions || []);
      setPaymentIntents(piData.paymentIntents || []);
      setRefunds(refData.refunds || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Revenue calculations
  const succeededPayments = paymentIntents.filter(p => p.status === 'succeeded');
  const totalPaymentRevenue = succeededPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const canceledSubscriptions = subscriptions.filter(s => s.status === 'canceled');
  const monthlyRecurring = activeSubscriptions.reduce((sum, s) => {
    const price = s.items?.[0]?.price || 0;
    const interval = s.items?.[0]?.interval;
    if (interval === 'year') return sum + price / 12;
    return sum + price;
  }, 0) / 100;

  const totalRefunded = refunds.reduce((sum, r) => sum + (r.amount || 0), 0) / 100;

  // Sub revenue from latest invoices
  const subRevenue = subscriptions.reduce((sum, s) => {
    return sum + (s.latestInvoiceAmountPaid || 0);
  }, 0) / 100;

  const totalRevenue = totalPaymentRevenue + subRevenue;

  // Chart data: subscriptions by month created
  const subsByMonth: Record<string, number> = {};
  subscriptions.forEach(s => {
    if (s.created_iso) {
      const month = new Date(s.created_iso).toLocaleString('default', { month: 'short', year: '2-digit' });
      subsByMonth[month] = (subsByMonth[month] || 0) + 1;
    }
  });
  const subChartData = Object.entries(subsByMonth).map(([label, value]) => ({ label, value }));

  const statusVariant = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'canceled') return 'error';
    if (status === 'past_due') return 'warning';
    if (status === 'trialing') return 'info';
    return 'default';
  };

  const piStatusVariant = (status: string) => {
    if (status === 'succeeded') return 'success';
    if (status === 'requires_payment_method' || status === 'canceled') return 'error';
    if (status === 'processing') return 'warning';
    return 'default';
  };

  return (
    <Stack>
      <PageHeader
        title="Revenue Dashboard"
        subtitle="DAM Fortunes Casino — Stripe earnings overview"
        icon={<DollarSign className="w-5 h-5" />}
      />

      <Grid cols={4}>
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Payments + subscriptions"
          icon={<DollarSign className="w-4 h-4" />}
          loading={loading}
        />
        <StatCard
          title="Monthly Recurring"
          value={`$${monthlyRecurring.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${activeSubscriptions.length} active subscriptions`}
          icon={<TrendingUp className="w-4 h-4" />}
          loading={loading}
        />
        <StatCard
          title="Total Subscribers"
          value={subscriptions.length}
          subtitle={`${activeSubscriptions.length} active · ${canceledSubscriptions.length} canceled`}
          icon={<Users className="w-4 h-4" />}
          loading={loading}
        />
        <StatCard
          title="Total Refunded"
          value={`$${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${refunds.length} refunds`}
          icon={<RotateCcw className="w-4 h-4" />}
          loading={loading}
        />
      </Grid>

      {subChartData.length > 0 && (
        <Card title="New Subscriptions by Month">
          <BarChart data={subChartData} color="#6366f1" />
        </Card>
      )}

      <DataTable
        title="Subscriptions"
        data={subscriptions}
        loading={loading}
        searchable
        searchKeys={['customerEmail', 'customerName', 'status']}
        pageSize={10}
        emptyMessage="No subscriptions found"
        columns={[
          { key: 'customerName', header: 'Customer', sortable: true, render: (v, row) => (
            <div>
              <div className="font-medium">{v || '—'}</div>
              <div className="text-xs text-gray-500">{row.customerEmail || ''}</div>
            </div>
          )},
          { key: 'items', header: 'Plan / Price', render: (v) => {
            if (!v || v.length === 0) return '—';
            const item = v[0];
            const amount = item.price ? `$${(item.price / 100).toFixed(2)}` : '—';
            const interval = item.interval ? `/ ${item.interval}` : '';
            return <span>{amount} {interval}</span>;
          }},
          { key: 'status', header: 'Status', render: (v) => (
            <Badge variant={statusVariant(v)}>{v}</Badge>
          )},
          { key: 'created_iso', header: 'Signup Date', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
          { key: 'current_period_end_iso', header: 'Renews', render: (v, row) => {
            if (row.status === 'canceled') return <span className="text-gray-400">Canceled {row.canceled_at ? new Date(row.canceled_at).toLocaleDateString() : ''}</span>;
            return v ? new Date(v).toLocaleDateString() : '—';
          }},
        ]}
      />

      {paymentIntents.length > 0 && (
        <DataTable
          title="One-Time Payments"
          data={paymentIntents}
          loading={loading}
          searchable
          pageSize={10}
          emptyMessage="No payments found"
          columns={[
            { key: 'id', header: 'Payment ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
            { key: 'amount', header: 'Amount', sortable: true, render: (v, row) => (
              <span className="font-semibold">${((v || 0) / 100).toFixed(2)} {(row.currency || 'usd').toUpperCase()}</span>
            )},
            { key: 'status', header: 'Status', render: (v) => (
              <Badge variant={piStatusVariant(v)}>{v}</Badge>
            )},
            { key: 'created', header: 'Date', sortable: true, render: (v) => v ? new Date(v * 1000).toLocaleDateString() : '—' },
          ]}
        />
      )}

      {refunds.length > 0 && (
        <DataTable
          title="Refunds"
          data={refunds}
          loading={loading}
          pageSize={10}
          emptyMessage="No refunds"
          columns={[
            { key: 'id', header: 'Refund ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
            { key: 'amount', header: 'Amount', render: (v, row) => (
              <span className="text-red-600 font-semibold">-${((v || 0) / 100).toFixed(2)} {(row.currency || 'usd').toUpperCase()}</span>
            )},
            { key: 'status', header: 'Status', render: (v) => <Badge variant={v === 'succeeded' ? 'success' : 'warning'}>{v}</Badge> },
            { key: 'created', header: 'Date', render: (v) => v ? new Date(v * 1000).toLocaleDateString() : '—' },
          ]}
        />
      )}
    </Stack>
  );
}
