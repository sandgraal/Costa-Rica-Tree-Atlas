import { setRequestLocale } from "next-intl/server";
import IdentifyClient from "./IdentifyClient";

interface IdentifyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function IdentifyPage({ params }: IdentifyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <IdentifyClient locale={locale} />;
}
