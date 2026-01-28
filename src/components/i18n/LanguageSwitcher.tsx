"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language.switcher");

  const handleLocaleChange = (newLocale: string) => {
    // Navigate to new locale using next-intl's router
    // This changes the locale prefix in the URL and updates the messages
    // without a full page reload
    router.push(pathname, { locale: newLocale });
  };

  const currentLocale = locales.find((l) => l.code === locale);

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger
        className="w-[130px] h-9"
        aria-label={t("label")}
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLocale?.flag}</span>
            <span className="text-sm">{currentLocale?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            <span className="flex items-center gap-2">
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
