import { FormEvent, useState } from 'react';
import { CheckCircle2, ClipboardList, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_REGISTRATION_TITLE,
  DuplicateRegistrationError,
  isValidBdMobile,
  registrationWindowStatus,
  submitRegistration,
  useRegistrationSettings,
} from '@/lib/registrations';

type FormState = {
  name: string;
  mobile: string;
  school: string;
  branch: string;
  roll: string;
  shift: string;
  whatsapp: string;
};

const emptyForm: FormState = {
  name: '',
  mobile: '',
  school: '',
  branch: '',
  roll: '',
  shift: '',
  whatsapp: '',
};

export default function StudentRegistrationForm() {
  const { settings, loading } = useRegistrationSettings();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (loading) return null;

  const status = registrationWindowStatus(settings);
  if (status === 'disabled') return null;

  if (status !== 'open') {
    return (
      <section className="bg-slate-50 py-12 dark:bg-slate-950 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ClipboardList className="mx-auto h-10 w-10 text-teal-600 dark:text-teal-300" />
            <p className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
              {status === 'not-open' ? 'রেজিস্ট্রেশন শীঘ্রই শুরু হবে' : 'রেজিস্ট্রেশন বন্ধ আছে'}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              BIO LAB-এর পরবর্তী আয়োজনের খবর পেতে আমাদের সাথেই থাকুন।
            </p>
          </div>
        </div>
      </section>
    );
  }

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError(null);
    setSubmitted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const required: (keyof FormState)[] = ['name', 'mobile', 'school', 'branch', 'roll', 'shift'];
    for (const key of required) {
      if (!form[key].trim()) {
        setError('সবগুলো ঘর পূরণ করুন (WhatsApp Number ছাড়া)।');
        return;
      }
    }

    if (!isValidBdMobile(form.mobile)) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (01XXXXXXXXX)।');
      return;
    }

    if (form.whatsapp.trim() && !isValidBdMobile(form.whatsapp)) {
      setError('সঠিক ১১ ডিজিটের WhatsApp নম্বর দিন (01XXXXXXXXX)।');
      return;
    }

    setSubmitting(true);
    try {
      await submitRegistration(form);
      setForm(emptyForm);
      setSubmitted(true);
    } catch (submitError) {
      if (submitError instanceof DuplicateRegistrationError) {
        setError('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে রেজিস্ট্রেশন করা হয়েছে।');
      } else {
        console.error('Registration submit failed:', submitError);
        setError('রেজিস্ট্রেশন সম্পন্ন হয়নি। একটু পরে আবার চেষ্টা করুন।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-12 dark:bg-slate-950 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-teal-100 bg-teal-50/60 px-6 py-8 text-center dark:border-teal-900/50 dark:bg-teal-950/30 sm:px-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              BIO LAB
            </p>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-3xl">
              {settings?.title || DEFAULT_REGISTRATION_TITLE}
            </h2>
            <p className="mt-2 text-sm font-bold text-teal-700 dark:text-teal-300">
              জীববিজ্ঞানে সহজ সমাধান
            </p>
          </div>

          {submitted ? (
            <div className="px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/50">
                <CheckCircle2 className="h-8 w-8 text-teal-600 dark:text-teal-300" />
              </div>
              <h3 className="mt-5 text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                Registration Complete!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                Thank you for registering with BIO LAB. Our admin team will contact you soon.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="mt-6 h-11 rounded-xl font-bold"
              >
                Register another student
              </Button>
            </div>
          ) : (
          <form className="grid gap-5 px-6 py-8 sm:grid-cols-2 sm:px-10" onSubmit={handleSubmit}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reg-name">শিক্ষার্থীর নাম *</Label>
              <Input
                id="reg-name"
                value={form.name}
                onChange={update('name')}
                placeholder="আপনার সম্পূর্ণ নাম"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-mobile">মোবাইল *</Label>
              <Input
                id="reg-mobile"
                value={form.mobile}
                onChange={update('mobile')}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-whatsapp">WhatsApp Number</Label>
              <Input
                id="reg-whatsapp"
                value={form.whatsapp}
                onChange={update('whatsapp')}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-school">স্কুল *</Label>
              <Input
                id="reg-school"
                value={form.school}
                onChange={update('school')}
                placeholder="স্কুলের নাম"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-branch">শাখা *</Label>
              <Input
                id="reg-branch"
                value={form.branch}
                onChange={update('branch')}
                placeholder="যেমন: বিজ্ঞান"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-roll">রোল *</Label>
              <Input
                id="reg-roll"
                value={form.roll}
                onChange={update('roll')}
                placeholder="রোল নম্বর"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-shift">শিফট *</Label>
              <Input
                id="reg-shift"
                value={form.shift}
                onChange={update('shift')}
                placeholder="যেমন: সকাল"
                className="h-11"
              />
            </div>

            <div className="sm:col-span-2">
              {error && (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl bg-teal-600 text-base font-extrabold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
              >
                {submitting ? 'জমা হচ্ছে...' : 'রেজিস্ট্রেশন করুন'}
              </Button>
            </div>
          </form>
          )}
        </div>
      </div>
    </section>
  );
}
