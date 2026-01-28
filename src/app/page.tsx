import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Detect language from Accept-Language header and redirect
export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  
  // Check if French is preferred
  const prefersFrench = acceptLanguage.toLowerCase().includes("fr");
  
  // Redirect to appropriate locale
  redirect(prefersFrench ? "/fr" : "/en");
}
