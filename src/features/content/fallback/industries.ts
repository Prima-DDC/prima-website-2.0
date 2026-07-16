import type { Industry } from "../types";

export const INDUSTRIES: Industry[] = [
  {
    slug: "financial-services",
    sort: 1,
    icon: "Landmark",
    relatedServiceSlugs: [
      "corporate-intelligence-due-diligence",
      "intelligence-risk-advisory",
      "investigations-fraud-risk",
    ],
    t: {
      en: {
        title: "Financial Services",
        description:
          "Banks, insurers, asset managers, and microfinance institutions rely on PRIMA for enhanced due diligence, AML/CFT compliance intelligence, and fraud investigations that satisfy regulators and boards alike.",
      },
      fr: {
        title: "Services financiers",
        description:
          "Banques, assureurs, gestionnaires d'actifs et institutions de microfinance font appel à PRIMA pour la due diligence renforcée, le renseignement de conformité LBC/FT et les enquêtes sur les fraudes, à la hauteur des attentes des régulateurs et des conseils d'administration.",
      },
      es: {
        title: "Servicios financieros",
        description:
          "Bancos, aseguradoras, gestoras de activos e instituciones de microfinanzas confían en PRIMA para due diligence reforzada, inteligencia de cumplimiento ALD/CFT e investigaciones de fraude que satisfacen tanto a reguladores como a consejos.",
      },
    },
  },
  {
    slug: "extractives-energy",
    sort: 2,
    icon: "Mountain",
    relatedServiceSlugs: [
      "corporate-intelligence-due-diligence",
      "intelligence-risk-advisory",
    ],
    t: {
      en: {
        title: "Extractives & Energy",
        description:
          "Mining and oil & gas operators engage PRIMA for third-party risk assessment, beneficial ownership research, and market entry intelligence in jurisdictions where ownership structures are rarely what they appear.",
      },
      fr: {
        title: "Industries extractives & Énergie",
        description:
          "Les opérateurs miniers et pétroliers confient à PRIMA l'évaluation des risques tiers, la recherche de bénéficiaires effectifs et le renseignement d'entrée sur les marchés, dans des juridictions où les structures de propriété sont rarement ce qu'elles paraissent.",
      },
      es: {
        title: "Extractivas y energía",
        description:
          "Los operadores de minería y de petróleo y gas contratan a PRIMA para evaluación de riesgos de terceros, investigación de beneficiarios finales e inteligencia de entrada a mercados, en jurisdicciones donde las estructuras de propiedad rara vez son lo que aparentan.",
      },
    },
  },
  {
    slug: "telecommunications",
    sort: 3,
    icon: "Radio",
    relatedServiceSlugs: [
      "corporate-intelligence-due-diligence",
      "investigations-fraud-risk",
      "forensic-services",
    ],
    t: {
      en: {
        title: "Telecommunications",
        description:
          "Telecom operators use PRIMA for vendor due diligence, fraud investigations, and digital forensics across high-volume, technology-intensive environments.",
      },
      fr: {
        title: "Télécommunications",
        description:
          "Les opérateurs télécoms font appel à PRIMA pour la due diligence fournisseurs, les enquêtes sur les fraudes et l'investigation numérique dans des environnements à fort volume et à forte intensité technologique.",
      },
      es: {
        title: "Telecomunicaciones",
        description:
          "Los operadores de telecomunicaciones recurren a PRIMA para due diligence de proveedores, investigaciones de fraude y forense digital en entornos de alto volumen e intensivos en tecnología.",
      },
    },
  },
  {
    slug: "government-public-sector",
    sort: 4,
    icon: "Building2",
    relatedServiceSlugs: [
      "intelligence-risk-advisory",
      "training-professional-development",
      "forensic-services",
    ],
    t: {
      en: {
        title: "Government & Public Sector",
        description:
          "Government agencies, regulators, and development organizations engage PRIMA for compliance intelligence, forensic examination, and professional training built to institutional standards.",
      },
      fr: {
        title: "Gouvernement & Secteur public",
        description:
          "Agences gouvernementales, régulateurs et organisations de développement sollicitent PRIMA pour le renseignement de conformité, l'examen forensique et la formation professionnelle aux standards institutionnels.",
      },
      es: {
        title: "Gobierno y sector público",
        description:
          "Agencias gubernamentales, reguladores y organizaciones de desarrollo contratan a PRIMA para inteligencia de cumplimiento, examen forense y formación profesional con estándares institucionales.",
      },
    },
  },
  {
    slug: "insurance",
    sort: 5,
    icon: "Umbrella",
    relatedServiceSlugs: ["insurance-sector-solutions", "forensic-services"],
    t: {
      en: {
        title: "Insurance",
        description:
          "Insurers across motor, property, life, and health lines rely on PRIMA's dedicated insurance practice for claims investigation, verification, and fraud indicator detection at scale.",
      },
      fr: {
        title: "Assurance",
        description:
          "Les assureurs automobile, habitation, vie et santé s'appuient sur la pratique assurance dédiée de PRIMA pour l'enquête sinistres, la vérification et la détection d'indicateurs de fraude à grande échelle.",
      },
      es: {
        title: "Seguros",
        description:
          "Las aseguradoras de automóvil, propiedad, vida y salud confían en la práctica de seguros de PRIMA para investigación de siniestros, verificación y detección de indicadores de fraude a escala.",
      },
    },
  },
  {
    slug: "multinationals-entering-africa",
    sort: 6,
    icon: "Globe2",
    relatedServiceSlugs: [
      "corporate-intelligence-due-diligence",
      "intelligence-risk-advisory",
    ],
    t: {
      en: {
        title: "Multinationals Entering African Markets",
        description:
          "Multinational corporations entering African markets engage PRIMA for market entry assessment, third-party risk, and enhanced due diligence delivered with genuine on-ground insight.",
      },
      fr: {
        title: "Multinationales entrant sur les marchés africains",
        description:
          "Les multinationales qui entrent sur les marchés africains confient à PRIMA l'évaluation d'entrée sur le marché, les risques tiers et la due diligence renforcée, avec une véritable connaissance du terrain.",
      },
      es: {
        title: "Multinacionales que entran en mercados africanos",
        description:
          "Las corporaciones multinacionales que entran en mercados africanos contratan a PRIMA para evaluación de entrada al mercado, riesgo de terceros y due diligence reforzada con conocimiento real sobre el terreno.",
      },
    },
  },
];
