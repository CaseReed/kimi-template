import { createNavigation } from "next-intl/navigation";
import { routing as i18nRouting } from "../../i18n/routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(i18nRouting);
