import { GlobeIcon, PhoneIcon } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/brand-icons';
import type { Place } from '@/lib/validation/schemas';

function normalizeWebsiteHref(website: string): string {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function websiteDisplayLabel(website: string): string {
  return website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

// wa.me takes digits only (country code, no +/spaces/dashes) and opens a
// chat with no message pre-filled — exactly what a bare wa.me/<number>
// link (no ?text= param) does.
function whatsappHref(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
}

type Labels = {
  contact: string;
  website: string;
  whatsappButton: string;
};

// Only shown when at least one of website/phone/whatsapp is actually set
// on the place — no placeholder/empty state, per Santi's ask ("only if
// the information is included"). Detail page only; not part of the
// list-view card pills.
export function PlaceContact({ place, t }: { place: Place; t: Labels }) {
  if (!place.website && !place.phone && !place.whatsapp) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-bark text-[19px] font-medium">{t.contact}</h2>
      <div className="flex flex-col gap-1.5">
        {place.website && (
          <a
            href={normalizeWebsiteHref(place.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-line bg-cream flex items-center gap-3 rounded-2xl border px-3.5 py-2.5"
          >
            <GlobeIcon className="text-clay size-4 shrink-0" />
            <span className="text-bark min-w-0 flex-1 truncate text-[13px] font-medium">
              {websiteDisplayLabel(place.website)}
            </span>
          </a>
        )}
        {place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="border-line bg-cream flex items-center gap-3 rounded-2xl border px-3.5 py-2.5"
          >
            <PhoneIcon className="text-clay size-4 shrink-0" />
            <span className="text-bark min-w-0 flex-1 truncate text-[13px] font-medium">{place.phone}</span>
          </a>
        )}
        {place.whatsapp && (
          <a
            href={whatsappHref(place.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            <WhatsAppIcon className="size-4" />
            {t.whatsappButton}
          </a>
        )}
      </div>
    </div>
  );
}
