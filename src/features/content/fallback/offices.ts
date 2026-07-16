import type { Office } from "../types";

export const OFFICES: Office[] = [
  {
    slug: "ghana-accra",
    sort: 1,
    phone: "+233 50 051 1996",
    whatsapp: "+233500511996",
    email: "info@primaddc.com",
    mapUrl: null,
    t: {
      en: {
        name: "Ghana, Accra (Head Office)",
        addressLines: ["Lartebiokorshie, Accra", "Greater Accra Region, Ghana"],
      },
      fr: {
        name: "Ghana, Accra (Siège)",
        addressLines: ["Lartebiokorshie, Accra", "Région du Grand Accra, Ghana"],
      },
      es: {
        name: "Ghana, Accra (Sede central)",
        addressLines: ["Lartebiokorshie, Accra", "Región del Gran Accra, Ghana"],
      },
    },
  },
  {
    slug: "ghana-tamale",
    sort: 2,
    phone: "+233 50 051 1996",
    whatsapp: "+233500511996",
    email: "info@primaddc.com",
    mapUrl: null,
    t: {
      en: {
        name: "Ghana, Tamale",
        addressLines: ["Tamale", "Northern Region, Ghana"],
      },
      fr: {
        name: "Ghana, Tamale",
        addressLines: ["Tamale", "Région du Nord, Ghana"],
      },
      es: {
        name: "Ghana, Tamale",
        addressLines: ["Tamale", "Región Norte, Ghana"],
      },
    },
  },
  {
    slug: "rwanda-kigali",
    sort: 3,
    phone: "+250 795 590 285",
    whatsapp: "+250795590285",
    email: "info.rw@primaddc.com",
    mapUrl: null,
    t: {
      en: {
        name: "Rwanda, Kigali",
        addressLines: ["Kigali", "Kigali Province, Rwanda"],
      },
      fr: {
        name: "Rwanda, Kigali",
        addressLines: ["Kigali", "Province de Kigali, Rwanda"],
      },
      es: {
        name: "Ruanda, Kigali",
        addressLines: ["Kigali", "Provincia de Kigali, Ruanda"],
      },
    },
  },
];
