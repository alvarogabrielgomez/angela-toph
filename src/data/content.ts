export type Lang = "es" | "en" | "pt";

export const LANGS: Lang[] = ["es", "en", "pt"];

export const DEFAULT_LANG: Lang = "es";

/** localStorage key for the user's last chosen language. */
export const LANG_STORAGE_KEY = "angela-lang";

export function isLang(value: unknown): value is Lang {
  return value === "es" || value === "en" || value === "pt";
}

/** Bio copy per language (matches the design handoff verbatim). */
export const bios: Record<Lang, string> = {
  es: "Soy copywriter y UX Designer. Trabajo creando contenido y estrategias que ayudan a atraer potenciales clientes, aumentar el valor percibido y la usabilidad de un producto, y fortalecer la relación de los consumidores con las marcas.",
  en: "I'm a copywriter and UX Designer. I craft content and strategies that attract potential clients, raise a product's perceived value and usability, and strengthen the bond between brands and their consumers.",
  pt: "Sou copywriter e UX Designer. Crio conteúdo e estratégias que ajudam a atrair potenciais clientes, aumentar o valor percebido e a usabilidade de um produto, e fortalecer a relação dos consumidores com as marcas.",
};

export type IconKey = "linkedin" | "blog" | "youtube" | "instagram" | "behance";

export interface LinkItem {
  key: IconKey;
  label: string;
  handle: string;
  url: string;
}

export const links: LinkItem[] = [
  {
    key: "linkedin",
    label: "LinkedIn",
    handle: "in/angelapotenza",
    url: "https://www.linkedin.com/in/angelapotenza/",
  },
  {
    key: "blog",
    label: "Accentio Blog",
    handle: "blog.accentiostudios.com",
    url: "https://blog.accentiostudios.com/author/angela/",
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "@accentiostudios",
    url: "https://www.youtube.com/@accentiostudios/featured",
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@accentiostudios",
    url: "https://www.instagram.com/accentiostudios",
  },
  {
    key: "behance",
    label: "Behance",
    handle: "behance.net/angelap",
    url: "https://www.behance.net/angelap211ecb2",
  },
];
