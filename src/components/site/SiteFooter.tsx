import { FormEvent, useState } from 'react';
import { Code2, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminWhatsAppPhone,
  createWhatsAppUrl,
  developerWhatsAppPhone,
} from '@/src/lib/whatsapp';

export default function SiteFooter() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      return;
    }

    window.open(
      createWhatsAppUrl(
        adminWhatsAppPhone,
        `BIO LAB suggestion\nName: ${trimmedName}\nMessage: ${trimmedMessage}`,
      ),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_1.2fr] lg:px-8">
        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-300">
            Terms & Conditions
          </p>
          <details className="mt-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 open:border-teal-700/60">
            <summary className="cursor-pointer list-none text-sm font-bold text-white">
              Read policy
            </summary>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              <p>Resources are shared for educational use only.</p>
              <p>Do not redistribute files without permission from BIO LAB.</p>
              <p>For corrections or content requests, contact the admin team.</p>
            </div>
          </details>
        </section>

        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-300">
            Contact Address
          </p>
          <address className="mt-4 space-y-3 text-sm not-italic text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
              <span>BIO LAB online support, Bangladesh</span>
            </div>
            <a
              href={createWhatsAppUrl(adminWhatsAppPhone, 'Assalamu alaikum, I need support from BIO LAB.')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0 text-emerald-300" />
              <span>WhatsApp: +8801849625831</span>
            </a>
          </address>
        </section>

        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-300">
            Suggestion Box
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-11 border-slate-700 bg-slate-900/80 px-3 text-white placeholder:text-slate-500"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Your message"
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/15"
            />
            <Button
              type="submit"
              disabled={!name.trim() || !message.trim()}
              className="shine-chip relative h-11 w-full rounded-lg bg-teal-500 font-bold text-slate-950 hover:bg-teal-400"
            >
              <Send className="mr-2 h-4 w-4" />
              Send to WhatsApp
            </Button>
          </form>
        </section>
      </div>

      <div className="border-t border-slate-800 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm font-medium text-slate-400">Developed by Ramjan Sarker</p>
          <a
            href={createWhatsAppUrl(developerWhatsAppPhone, 'Assalamu alaikum, I want to contact the developer.')}
            target="_blank"
            rel="noreferrer"
            className="developer-ribbon inline-flex items-center gap-3 px-7 py-3 text-sm font-extrabold text-slate-950 transition-transform hover:-translate-y-0.5"
          >
            <Code2 className="h-4 w-4" />
            Contact with developer
            <MessageCircle className="h-4 w-4" />
            01518657869
          </a>
        </div>
      </div>
    </footer>
  );
}
