import { useMemo } from "react";

interface NotFoundPageProps {
  language?: string;
}

export function NotFoundPage({ language = "fr" }: NotFoundPageProps) {
  const texts = useMemo(() => ({
    fr: {
      title: "Page introuvable",
      description: "La section demandée n'existe pas ou n'est plus disponible.",
      action: "Retour à l'accueil"
    },
    ar: {
      title: "الصفحة غير موجودة",
      description: "القسم المطلوب غير موجود أو لم يعد متاحًا.",
      action: "العودة إلى الصفحة الرئيسية"
    },
    en: {
      title: "Page not found",
      description: "The requested section does not exist or is no longer available.",
      action: "Back to home"
    }
  }), []);

  const t = texts[(language as keyof typeof texts) || "fr"] || texts.fr;

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
        <p className="text-muted-foreground mb-4">{t.description}</p>
        <a
          href="/"
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {t.action}
        </a>
      </div>
    </div>
  );
}

export default NotFoundPage;

