import { useMemo, useState } from 'react';
import {
  CalendarClock,
  Download,
  Loader2,
  Power,
  Printer,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Seo from '@/src/components/Seo';
import {
  DEFAULT_REGISTRATION_TITLE,
  registrationWindowStatus,
  saveRegistrationSettings,
  useAdminRegistrations,
  useRegistrationSettings,
  type Registration,
} from '@/lib/registrations';

function formatDate(timestamp?: number) {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

function toDateTimeLocal(timestamp: number | null | undefined) {
  if (timestamp == null) return '';
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).getTime();
}

function statusTone(status: ReturnType<typeof registrationWindowStatus>) {
  if (status === 'open') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300';
  if (status === 'not-open') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300';
  if (status === 'closed') return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300';
  return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400';
}

function statusLabel(status: ReturnType<typeof registrationWindowStatus>) {
  if (status === 'open') return 'Live — ফর্ম দেখানো হচ্ছে';
  if (status === 'not-open') return 'Off — তারিখ শুরু হয়নি';
  if (status === 'closed') return 'Off — তারিখ শেষ হয়েছে';
  return 'Off — রেজিস্ট্রেশন বন্ধ';
}

export default function AdminRegistrations() {
  const { settings, loading: settingsLoading } = useRegistrationSettings();
  const { registrations, loading: listLoading, deleteRegistration } = useAdminRegistrations();

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [opensAtLocal, setOpensAtLocal] = useState<string | null>(null);
  const [closesAtLocal, setClosesAtLocal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [busyMobile, setBusyMobile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentSettings = useMemo(() => {
    if (settings && enabled === null && title === null && opensAtLocal === null && closesAtLocal === null) {
      return settings;
    }
    const base = settings ?? { enabled: false, title: DEFAULT_REGISTRATION_TITLE, opensAt: null, closesAt: null };
    return {
      ...base,
      enabled: enabled ?? base.enabled,
      title: title ?? base.title,
      opensAt: opensAtLocal === null ? base.opensAt : fromDateTimeLocal(opensAtLocal),
      closesAt: closesAtLocal === null ? base.closesAt : fromDateTimeLocal(closesAtLocal),
    };
  }, [settings, enabled, title, opensAtLocal, closesAtLocal]);

  const resetDraft = () => {
    setEnabled(null);
    setTitle(null);
    setOpensAtLocal(null);
    setClosesAtLocal(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveRegistrationSettings({
        enabled: currentSettings.enabled,
        title: currentSettings.title.trim() || DEFAULT_REGISTRATION_TITLE,
        opensAt: currentSettings.opensAt,
        closesAt: currentSettings.closesAt,
      });
      resetDraft();
      setSaveMessage('সেটিংস সংরক্ষণ করা হয়েছে।');
    } catch (error) {
      console.error('Failed to save registration settings:', error);
      setSaveMessage('সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const filteredRegistrations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return registrations;
    return registrations.filter((registration) =>
      [registration.name, registration.mobile, registration.school, registration.roll, registration.shift]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [registrations, searchTerm]);

  const handleDelete = async (registration: Registration) => {
    if (!window.confirm(`${registration.name} (${registration.mobile})-এর রেজিস্ট্রেশন মুছে ফেলবেন?`)) return;
    setBusyMobile(registration.mobile);
    try {
      await deleteRegistration(registration.mobile);
    } catch (error) {
      console.error('Failed to delete registration:', error);
      window.alert('মুছে ফেলা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setBusyMobile(null);
    }
  };

  const downloadCsv = () => {
    const headers = ['Name', 'Mobile', 'School', 'Branch', 'Roll', 'Shift', 'WhatsApp', 'Submitted'];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = filteredRegistrations.map((registration) => [
      registration.name,
      registration.mobile,
      registration.school,
      registration.branch,
      registration.roll,
      registration.shift,
      registration.whatsapp,
      formatDate(registration.createdAt),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `biolab-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    const rows = filteredRegistrations
      .map(
        (registration) => `<tr>
          <td>${registration.name}</td>
          <td>${registration.mobile}</td>
          <td>${registration.school}</td>
          <td>${registration.branch}</td>
          <td>${registration.roll}</td>
          <td>${registration.shift}</td>
          <td>${registration.whatsapp || '—'}</td>
          <td>${formatDate(registration.createdAt)}</td>
        </tr>`,
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.alert('Popup ব্লক করা আছে। ব্রাউজারে popup allow করুন।');
      return;
    }
    printWindow.document.write(`<!doctype html>
      <html lang="bn">
      <head>
        <meta charset="utf-8" />
        <title>BIO LAB Registration List</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Hind Siliguri', 'Noto Sans Bengali', sans-serif; color: #0f172a; margin: 24px; }
          h1 { font-size: 20px; margin: 0 0 2px; }
          .sub { font-size: 12px; color: #64748b; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #0f766e; color: #fff; }
          tr:nth-child(even) td { background: #f1f5f9; }
          .footer { margin-top: 16px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <h1>BIO LAB — Registration List</h1>
        <p class="sub">মোট রেজিস্ট্রেশন: ${filteredRegistrations.length} · তারিখ: ${formatDate(Date.now())}</p>
        <table>
          <thead>
            <tr>
              <th>নাম</th><th>মোবাইল</th><th>স্কুল</th><th>শাখা</th>
              <th>রোল</th><th>শিফট</th><th>WhatsApp</th><th>জমার সময়</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="footer">Generated by BIO LAB Admin · জীববিজ্ঞানে সহজ সমাধান</p>
      </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  };

  const status = registrationWindowStatus(currentSettings);
  const inWindowCount = registrations.filter((registration) => {
    if (!currentSettings.opensAt && !currentSettings.closesAt) return true;
    const createdAt = registration.createdAt ?? 0;
    if (currentSettings.opensAt && createdAt < currentSettings.opensAt) return false;
    if (currentSettings.closesAt && createdAt > currentSettings.closesAt) return false;
    return true;
  }).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Seo title="রেজিস্ট্রেশন | Admin" description="Student registration settings and submissions." />

      <header className="bio-grid rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Student Registration</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">রেজিস্ট্রেশন কন্ট্রোল</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-slate-500">
              হোমপেজের রেজিস্ট্রেশন ফর্ম চালু/বন্ধ করুন, তারিখ ঠিক করুন এবং জমা পড়া শিক্ষার্থীদের তালিকা দেখুন।
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setEnabled(!currentSettings.enabled)}
            className={`h-11 w-fit rounded-xl font-bold ${
              currentSettings.enabled
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Power className="mr-2 h-4 w-4" />
            {currentSettings.enabled ? 'Live — বন্ধ করুন' : 'Off — চালু করুন'}
          </Button>
        </div>
      </header>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Form Settings</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">ফর্ম ও তারিখ</h2>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusTone(status)}`}>
            {statusLabel(status)}
          </span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="reg-settings-title">ফর্মের শিরোনাম</Label>
            <Input
              id="reg-settings-title"
              value={title ?? currentSettings.title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-settings-opens">শুরুর তারিখ ও সময় (খালি = এখনই)</Label>
            <Input
              id="reg-settings-opens"
              type="datetime-local"
              value={opensAtLocal ?? toDateTimeLocal(currentSettings.opensAt)}
              onChange={(event) => setOpensAtLocal(event.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-settings-closes">শেষের তারিখ ও সময় (খালি = কোনো সীমা নেই)</Label>
            <Input
              id="reg-settings-closes"
              type="datetime-local"
              value={closesAtLocal ?? toDateTimeLocal(currentSettings.closesAt)}
              onChange={(event) => setClosesAtLocal(event.target.value)}
              className="h-11"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-xl bg-orange-500 font-bold text-white hover:bg-orange-600"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
            সেটিংস সংরক্ষণ করুন
          </Button>
          {saveMessage && <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{saveMessage}</p>}
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[
          { label: 'মোট রেজিস্ট্রেশন', value: registrations.length, icon: Users, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
          { label: 'বর্তমান উইন্ডোতে', value: inWindowCount, icon: UserRound, tone: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
          { label: 'বর্তমান স্ট্যাটাস', value: status === 'open' ? 'Live' : 'Off', icon: Power, tone: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}><Icon className="h-4 w-4" /></span>
                <p className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">{item.value}</p>
              </div>
              <p className="mt-3 text-xs font-bold text-slate-500">{item.label}</p>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="নাম, মোবাইল বা স্কুল খুঁজুন"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={downloadPdf} disabled={filteredRegistrations.length === 0} className="h-11 rounded-xl font-bold">
              <Printer className="mr-2 h-4 w-4" /> PDF Download
            </Button>
            <Button type="button" variant="outline" onClick={downloadCsv} disabled={filteredRegistrations.length === 0} className="h-11 rounded-xl font-bold">
              <Download className="mr-2 h-4 w-4" /> Excel Export ({filteredRegistrations.length})
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">Registration List</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950 dark:text-white">{filteredRegistrations.length}টি রেজিস্ট্রেশন</h2>
        </div>
      </div>

      {listLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Users className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-sm font-bold text-slate-500">এখনও কোনো রেজিস্ট্রেশন জমা হয়নি</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredRegistrations.map((registration) => (
            <Card key={registration.mobile} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid flex-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-bold text-slate-400">শিক্ষার্থী</p>
                    <p className="mt-0.5 font-extrabold text-slate-950 dark:text-white">{registration.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">মোবাইল</p>
                    <p className="mt-0.5 font-bold text-slate-700 dark:text-slate-200">{registration.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">WhatsApp</p>
                    <p className="mt-0.5 font-bold text-slate-700 dark:text-slate-200">{registration.whatsapp || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">স্কুল</p>
                    <p className="mt-0.5 font-bold text-slate-700 dark:text-slate-200">{registration.school}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">শাখা · রোল · শিফট</p>
                    <p className="mt-0.5 font-bold text-slate-700 dark:text-slate-200">
                      {registration.branch} · {registration.roll} · {registration.shift}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">জমার সময়</p>
                    <p className="mt-0.5 font-bold text-slate-700 dark:text-slate-200">{formatDate(registration.createdAt)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(registration)}
                  disabled={busyMobile === registration.mobile}
                  className="self-start rounded-xl font-bold"
                >
                  {busyMobile === registration.mobile ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  মুছুন
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
