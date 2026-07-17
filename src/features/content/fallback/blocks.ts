import type {
  CertificationsBlock,
  ClientsStatsBlock,
  ContentBlockRow,
  CredentialsBlock,
  CtaBlock,
  FaqBlock,
  HeroBlock,
  ItemListBlock,
  Localized,
  StatBarBlock,
  TextBlock,
} from "../types";

function block<T>(
  page: string,
  section: string,
  sort: number,
  t: Localized<T>,
  imagePath: string | null = null,
): ContentBlockRow {
  return { page, section, sort, imagePath, t };
}

/** Media slots in the Supabase public-media bucket (seeded by media:upload). */
const IMG = {
  heroCorporate: "site/hero-corporate.webp",
  officeSign: "site/office-sign.webp",
  officeReception: "site/office-reception.webp",
  trainingSession: "site/training-session.webp",
  seminarAudience: "site/seminar-audience.webp",
  cyberPolicy: "site/cyber-policy-handover.webp",
  boardroom: "site/boardroom-meeting.webp",
  corporateBuilding: "site/corporate-building.webp",
  citySkyline: "site/city-skyline.webp",
  documentsReview: "site/documents-review.webp",
  handshake: "site/partnership-handshake.webp",
} as const;

export const CONTENT_BLOCKS: ContentBlockRow[] = [
  // ---------------------------------------------------------------- home
  block<HeroBlock>("home", "hero", 1, {
    en: {
      kicker: "Corporate Intelligence & Risk Advisory",
      title: "Trusted Intelligence for Critical Decisions",
      subtitle:
        "PRIMA Due Diligence Consult provides independent investigative, forensic, and intelligence services to organizations that cannot afford to be wrong about the people, entities, and risks behind their most important decisions.",
      ctaPrimary: "Speak to our team",
      ctaSecondary: "Explore our practice areas",
    },
    fr: {
      kicker: "Intelligence économique & Conseil en risques",
      title: "Une intelligence de confiance pour des décisions critiques",
      subtitle:
        "PRIMA Due Diligence Consult fournit des services indépendants d'investigation, de forensique et de renseignement aux organisations qui ne peuvent pas se permettre de se tromper sur les personnes, les entités et les risques derrière leurs décisions les plus importantes.",
      ctaPrimary: "Parler à notre équipe",
      ctaSecondary: "Découvrir nos domaines d'expertise",
    },
    es: {
      kicker: "Inteligencia corporativa y asesoría de riesgos",
      title: "Inteligencia confiable para decisiones críticas",
      subtitle:
        "PRIMA Due Diligence Consult presta servicios independientes de investigación, forense e inteligencia a organizaciones que no pueden permitirse equivocarse sobre las personas, entidades y riesgos detrás de sus decisiones más importantes.",
      ctaPrimary: "Hable con nuestro equipo",
      ctaSecondary: "Explore nuestras áreas de práctica",
    },
  }),

  block<TextBlock>("home", "who-we-are", 2, {
    en: {
      kicker: "Who We Are",
      title: "Independent. Evidence-based. Built for scrutiny.",
      paragraphs: [
        "We operate under strict confidentiality protocols, documented conflict-of-interest controls, and a defined chain of custody for all evidence and findings. Our teams combine investigative, forensic, and intelligence disciplines with the regulatory fluency required to work alongside banks, insurers, regulators, multinationals, and government institutions.",
        "Independence is not a marketing claim for us, it is a working condition. We do not accept engagements where a conflict of interest exists, and every deliverable passes through internal quality review before it reaches a client.",
      ],
    },
    fr: {
      kicker: "Qui sommes-nous",
      title: "Indépendants. Fondés sur les preuves. Conçus pour l'examen.",
      paragraphs: [
        "Nous opérons selon des protocoles de confidentialité stricts, des contrôles documentés des conflits d'intérêts et une chaîne de conservation définie pour l'ensemble des preuves et des conclusions. Nos équipes combinent les disciplines d'investigation, de forensique et de renseignement avec la maîtrise réglementaire requise pour travailler aux côtés des banques, assureurs, régulateurs, multinationales et institutions publiques.",
        "L'indépendance n'est pas un argument marketing pour nous, c'est une condition de travail. Nous n'acceptons aucune mission en présence d'un conflit d'intérêts, et chaque livrable passe par une revue qualité interne avant d'atteindre le client.",
      ],
    },
    es: {
      kicker: "Quiénes somos",
      title: "Independientes. Basados en evidencia. Preparados para el escrutinio.",
      paragraphs: [
        "Operamos bajo protocolos estrictos de confidencialidad, controles documentados de conflictos de interés y una cadena de custodia definida para todas las pruebas y conclusiones. Nuestros equipos combinan las disciplinas de investigación, forense e inteligencia con la fluidez regulatoria necesaria para trabajar junto a bancos, aseguradoras, reguladores, multinacionales e instituciones públicas.",
        "La independencia no es un argumento de marketing para nosotros, es una condición de trabajo. No aceptamos encargos donde exista un conflicto de interés, y cada entregable pasa por una revisión interna de calidad antes de llegar al cliente.",
      ],
    },
  }),

  block<StatBarBlock>("home", "stat-bar", 3, {
    en: {
      items: [
        { value: "5+", label: "Years in Operation" },
        { value: "4,300+", label: "Cases Handled" },
        { value: "3", label: "Offices in Africa" },
        { value: "14+", label: "Dedicated Professionals" },
      ],
    },
    fr: {
      items: [
        { value: "5+", label: "Années d'activité" },
        { value: "4 300+", label: "Dossiers traités" },
        { value: "3", label: "Bureaux en Afrique" },
        { value: "14+", label: "Professionnels dédiés" },
      ],
    },
    es: {
      items: [
        { value: "5+", label: "Años de actividad" },
        { value: "4.300+", label: "Casos gestionados" },
        { value: "3", label: "Oficinas en África" },
        { value: "14+", label: "Profesionales dedicados" },
      ],
    },
  }),

  block<CredentialsBlock>("home", "credentials", 4, {
    en: {
      kicker: "Our Expertise",
      title: "Four disciplines under one roof",
      framing:
        "PRIMA's team combines four disciplines rarely found together: law, financial and forensic accounting, security and intelligence, and forensic science. This allows us to move between legal admissibility, financial complexity, intelligence tradecraft, and scientific examination within a single engagement, rather than referring clients elsewhere.",
      clusters: [
        {
          title: "Legal & Regulatory",
          credentials: "Bachelor of Laws, Qualified Lawyer",
          powers:
            "Corporate investigations, compliance intelligence, and evidentiary standards firm-wide.",
        },
        {
          title: "Financial & Forensic Accounting",
          credentials:
            "Bachelor of Commerce, MBA (Finance), Chartered Accountant, Chartered Tax Practitioner",
          powers:
            "Financial forensics, enhanced due diligence, and asset tracing and recovery.",
        },
        {
          title: "Security & Intelligence",
          credentials:
            "MA Security and Intelligence Management, PhD Candidate (International Security and Intelligence)",
          powers:
            "Intelligence analysis and risk advisory, OSINT, and risk assessments.",
        },
        {
          title: "Forensic Science",
          credentials: "MSc Forensic Science",
          powers: "Forensic services and scientific examination.",
        },
      ],
    },
    fr: {
      kicker: "Notre expertise",
      title: "Quatre disciplines sous un même toit",
      framing:
        "L'équipe de PRIMA réunit quatre disciplines rarement rassemblées : le droit, la comptabilité financière et forensique, la sécurité et le renseignement, et les sciences forensiques. Cela nous permet de passer de la recevabilité juridique à la complexité financière, au savoir-faire du renseignement et à l'examen scientifique au sein d'une même mission, sans renvoyer nos clients ailleurs.",
      clusters: [
        {
          title: "Juridique & Réglementaire",
          credentials: "Licence en droit, Avocat qualifié",
          powers:
            "Investigations en entreprise, renseignement de conformité et standards de preuve pour tout le cabinet.",
        },
        {
          title: "Comptabilité financière & forensique",
          credentials:
            "Licence de commerce, MBA (Finance), Expert-comptable agréé, Praticien fiscal agréé",
          powers:
            "Forensique financière, due diligence renforcée, traçage et recouvrement d'actifs.",
        },
        {
          title: "Sécurité & Renseignement",
          credentials:
            "Master en gestion de la sécurité et du renseignement, Doctorant (sécurité internationale et renseignement)",
          powers:
            "Analyse du renseignement et conseil en risques, OSINT et évaluations des risques.",
        },
        {
          title: "Sciences forensiques",
          credentials: "Master en sciences forensiques",
          powers: "Services forensiques et examen scientifique.",
        },
      ],
    },
    es: {
      kicker: "Nuestra experiencia",
      title: "Cuatro disciplinas bajo un mismo techo",
      framing:
        "El equipo de PRIMA combina cuatro disciplinas que rara vez se encuentran juntas: derecho, contabilidad financiera y forense, seguridad e inteligencia, y ciencia forense. Esto nos permite movernos entre la admisibilidad legal, la complejidad financiera, el oficio de inteligencia y el examen científico dentro de un mismo encargo, sin derivar a nuestros clientes a terceros.",
      clusters: [
        {
          title: "Jurídico y regulatorio",
          credentials: "Grado en Derecho, Abogado colegiado",
          powers:
            "Investigaciones corporativas, inteligencia de cumplimiento y estándares probatorios en toda la firma.",
        },
        {
          title: "Contabilidad financiera y forense",
          credentials:
            "Grado en Comercio, MBA (Finanzas), Contador colegiado, Asesor fiscal colegiado",
          powers:
            "Forense financiera, due diligence reforzada y rastreo y recuperación de activos.",
        },
        {
          title: "Seguridad e inteligencia",
          credentials:
            "Máster en Gestión de Seguridad e Inteligencia, Doctorando (Seguridad Internacional e Inteligencia)",
          powers:
            "Análisis de inteligencia y asesoría de riesgos, OSINT y evaluaciones de riesgo.",
        },
        {
          title: "Ciencia forense",
          credentials: "Máster en Ciencia Forense",
          powers: "Servicios forenses y examen científico.",
        },
      ],
    },
  }),

  block<CertificationsBlock>("home", "certifications", 5, {
    en: {
      kicker: "Certifications & Licenses",
      title: "Accredited to recognized standards",
      intro:
        "Our team holds certifications and licenses spanning fraud examination, compliance, cyber security, and forensic practice.",
      items: [],
    },
    fr: {
      kicker: "Certifications & Licences",
      title: "Accrédités selon des standards reconnus",
      intro:
        "Notre équipe détient des certifications et licences couvrant l'examen des fraudes, la conformité, la cybersécurité et la pratique forensique.",
      items: [],
    },
    es: {
      kicker: "Certificaciones y licencias",
      title: "Acreditados según estándares reconocidos",
      intro:
        "Nuestro equipo posee certificaciones y licencias que abarcan el examen de fraude, el cumplimiento, la ciberseguridad y la práctica forense.",
      items: [],
    },
  }),

  block<ClientsStatsBlock>("home", "clients-stats", 6, {
    en: {
      kicker: "Our Clients",
      title: "Trusted by organizations that cannot afford to be wrong",
      intro:
        "We work with banks, insurers, law firms, government institutions, and multinationals operating across Africa:",
      items: [
        {
          value: "4,300+",
          connector: "cases completed",
          description: "for insurers, banks, law firms, and corporates",
        },
        {
          value: "4",
          connector: "disciplines",
          description:
            "law, forensic accounting, intelligence, and forensic science under one roof",
        },
        {
          value: "6",
          connector: "practice areas",
          description:
            "spanning due diligence, investigations, forensics, and training",
        },
        {
          value: "3",
          connector: "offices",
          description: "across Ghana and Rwanda, with reach across the region",
        },
        {
          value: "3",
          connector: "working languages",
          description: "serving clients in English, French, and Spanish",
        },
        {
          value: "100%",
          connector: "of reports",
          description: "pass internal quality review before delivery",
        },
      ],
    },
    fr: {
      kicker: "Nos clients",
      title: "La confiance d'organisations qui ne peuvent pas se tromper",
      intro:
        "Nous travaillons avec des banques, assureurs, cabinets d'avocats, institutions publiques et multinationales opérant à travers l'Afrique :",
      items: [
        {
          value: "4 300+",
          connector: "dossiers traités",
          description:
            "pour des assureurs, banques, cabinets d'avocats et entreprises",
        },
        {
          value: "4",
          connector: "disciplines",
          description:
            "droit, comptabilité forensique, renseignement et sciences forensiques sous un même toit",
        },
        {
          value: "6",
          connector: "domaines d'expertise",
          description:
            "couvrant la due diligence, les investigations, la forensique et la formation",
        },
        {
          value: "3",
          connector: "bureaux",
          description: "au Ghana et au Rwanda, avec une portée régionale",
        },
        {
          value: "3",
          connector: "langues de travail",
          description: "au service de nos clients en anglais, français et espagnol",
        },
        {
          value: "100%",
          connector: "des rapports",
          description: "passent une revue qualité interne avant livraison",
        },
      ],
    },
    es: {
      kicker: "Nuestros clientes",
      title: "La confianza de organizaciones que no pueden equivocarse",
      intro:
        "Trabajamos con bancos, aseguradoras, despachos de abogados, instituciones públicas y multinacionales que operan en toda África:",
      items: [
        {
          value: "4.300+",
          connector: "casos completados",
          description:
            "para aseguradoras, bancos, despachos de abogados y corporaciones",
        },
        {
          value: "4",
          connector: "disciplinas",
          description:
            "derecho, contabilidad forense, inteligencia y ciencia forense bajo un mismo techo",
        },
        {
          value: "6",
          connector: "áreas de práctica",
          description:
            "que abarcan due diligence, investigaciones, forense y formación",
        },
        {
          value: "3",
          connector: "oficinas",
          description: "en Ghana y Ruanda, con alcance regional",
        },
        {
          value: "3",
          connector: "idiomas de trabajo",
          description: "atendiendo a clientes en inglés, francés y español",
        },
        {
          value: "100%",
          connector: "de los informes",
          description: "pasan una revisión interna de calidad antes de la entrega",
        },
      ],
    },
  }),

  block<TextBlock>("home", "regional-teaser", 7, {
    en: {
      kicker: "The PRIMA Network",
      title: "Genuine on-ground presence across African markets",
      paragraphs: [
        "Global firms typically operate through a single regional hub and subcontract on-the-ground work to local partners they do not fully control. PRIMA's advantage is the opposite: direct presence, regulatory relationships, and cultural and linguistic fluency, delivered to the same methodological standard international clients expect.",
      ],
    },
    fr: {
      kicker: "Le réseau PRIMA",
      title: "Une présence réelle sur le terrain à travers les marchés africains",
      paragraphs: [
        "Les cabinets mondiaux opèrent généralement depuis un hub régional unique et sous-traitent le travail de terrain à des partenaires locaux qu'ils ne contrôlent pas entièrement. L'avantage de PRIMA est inverse : une présence directe, des relations avec les régulateurs et une maîtrise culturelle et linguistique, avec le même standard méthodologique que celui attendu par les clients internationaux.",
      ],
    },
    es: {
      kicker: "La red PRIMA",
      title: "Presencia real sobre el terreno en los mercados africanos",
      paragraphs: [
        "Las firmas globales suelen operar desde un único hub regional y subcontratan el trabajo de campo a socios locales que no controlan por completo. La ventaja de PRIMA es la contraria: presencia directa, relaciones con los reguladores y fluidez cultural y lingüística, con el mismo estándar metodológico que esperan los clientes internacionales.",
      ],
    },
  }),

  block<ItemListBlock>("home", "standards-excerpt", 8, {
    en: {
      kicker: "Our Standards",
      title: "A defined methodology behind every engagement",
      intro:
        "Structured intake and scoping, evidence-based fieldwork, internal quality review, and a deliverable built to the standard your decision requires.",
      items: [
        {
          title: "Independence",
          body: "No engagement is accepted where a conflict of interest exists.",
        },
        {
          title: "Chain of custody",
          body: "All evidence and documentation is tracked and preserved to evidentiary standard.",
        },
        {
          title: "Quality review",
          body: "Every report passes internal review before delivery.",
        },
        {
          title: "Confidentiality",
          body: "Client information is handled under strict data protection protocols.",
        },
      ],
    },
    fr: {
      kicker: "Nos standards",
      title: "Une méthodologie définie derrière chaque mission",
      intro:
        "Cadrage structuré, travail de terrain fondé sur les preuves, revue qualité interne et un livrable au niveau exigé par votre décision.",
      items: [
        {
          title: "Indépendance",
          body: "Aucune mission n'est acceptée en présence d'un conflit d'intérêts.",
        },
        {
          title: "Chaîne de conservation",
          body: "Toutes les preuves et la documentation sont tracées et préservées au standard probatoire.",
        },
        {
          title: "Revue qualité",
          body: "Chaque rapport passe une revue interne avant livraison.",
        },
        {
          title: "Confidentialité",
          body: "Les informations des clients sont traitées selon des protocoles stricts de protection des données.",
        },
      ],
    },
    es: {
      kicker: "Nuestros estándares",
      title: "Una metodología definida detrás de cada encargo",
      intro:
        "Alcance estructurado, trabajo de campo basado en evidencia, revisión interna de calidad y un entregable al nivel que exige su decisión.",
      items: [
        {
          title: "Independencia",
          body: "No se acepta ningún encargo donde exista un conflicto de interés.",
        },
        {
          title: "Cadena de custodia",
          body: "Todas las pruebas y la documentación se registran y preservan con estándar probatorio.",
        },
        {
          title: "Revisión de calidad",
          body: "Cada informe pasa una revisión interna antes de la entrega.",
        },
        {
          title: "Confidencialidad",
          body: "La información del cliente se maneja bajo protocolos estrictos de protección de datos.",
        },
      ],
    },
  }),

  block<CtaBlock>("home", "cta", 9, {
    en: {
      title: "Facing a sensitive decision?",
      body: "Speak confidentially with our team about due diligence, investigations, forensics, or risk advisory. We respond within one business day.",
    },
    fr: {
      title: "Face à une décision sensible ?",
      body: "Échangez en toute confidentialité avec notre équipe sur la due diligence, les investigations, la forensique ou le conseil en risques. Nous répondons sous un jour ouvré.",
    },
    es: {
      title: "¿Ante una decisión sensible?",
      body: "Hable confidencialmente con nuestro equipo sobre due diligence, investigaciones, forense o asesoría de riesgos. Respondemos en un día hábil.",
    },
  }),

  // ---------------------------------------------------------- who-we-are
  block<TextBlock>("who-we-are", "intro", 1, {
    en: {
      kicker: "Who We Are",
      title: "An African corporate intelligence firm built for scrutiny",
      paragraphs: [
        "PRIMA Due Diligence Consult provides independent investigative and intelligence services to organizations that cannot afford to be wrong about the people, entities, and risks behind their most important decisions.",
        "We operate under strict confidentiality protocols, documented conflict-of-interest controls, and a defined chain of custody for all evidence and findings. Our teams combine investigative, forensic, and intelligence disciplines with the regulatory fluency required to work alongside banks, insurers, regulators, multinationals, and government institutions.",
        "Independence is not a marketing claim for us, it is a working condition. We do not accept engagements where a conflict of interest exists, and every deliverable passes through internal quality review before it reaches a client.",
      ],
    },
    fr: {
      kicker: "Qui sommes-nous",
      title: "Un cabinet africain d'intelligence économique conçu pour l'examen",
      paragraphs: [
        "PRIMA Due Diligence Consult fournit des services indépendants d'investigation et de renseignement aux organisations qui ne peuvent pas se permettre de se tromper sur les personnes, les entités et les risques derrière leurs décisions les plus importantes.",
        "Nous opérons selon des protocoles de confidentialité stricts, des contrôles documentés des conflits d'intérêts et une chaîne de conservation définie pour l'ensemble des preuves et conclusions. Nos équipes combinent les disciplines d'investigation, de forensique et de renseignement avec la maîtrise réglementaire requise pour travailler aux côtés des banques, assureurs, régulateurs, multinationales et institutions publiques.",
        "L'indépendance n'est pas un argument marketing pour nous, c'est une condition de travail. Nous n'acceptons aucune mission en présence d'un conflit d'intérêts, et chaque livrable passe par une revue qualité interne avant d'atteindre le client.",
      ],
    },
    es: {
      kicker: "Quiénes somos",
      title: "Una firma africana de inteligencia corporativa preparada para el escrutinio",
      paragraphs: [
        "PRIMA Due Diligence Consult presta servicios independientes de investigación e inteligencia a organizaciones que no pueden permitirse equivocarse sobre las personas, entidades y riesgos detrás de sus decisiones más importantes.",
        "Operamos bajo protocolos estrictos de confidencialidad, controles documentados de conflictos de interés y una cadena de custodia definida para todas las pruebas y conclusiones. Nuestros equipos combinan las disciplinas de investigación, forense e inteligencia con la fluidez regulatoria necesaria para trabajar junto a bancos, aseguradoras, reguladores, multinacionales e instituciones públicas.",
        "La independencia no es un argumento de marketing para nosotros, es una condición de trabajo. No aceptamos encargos donde exista un conflicto de interés, y cada entregable pasa por una revisión interna de calidad antes de llegar al cliente.",
      ],
    },
  }),

  block<ItemListBlock>("who-we-are", "mission-vision", 2, {
    en: {
      title: "Mission and vision",
      items: [
        {
          title: "Our mission",
          body: "To provide trusted, evidence-based intelligence that enables critical business and institutional decisions across Africa.",
        },
        {
          title: "Our vision",
          body: "To be Africa's leading intelligence-led due diligence, investigations, and risk advisory firm, the partner of choice when the stakes are highest.",
        },
      ],
    },
    fr: {
      title: "Mission et vision",
      items: [
        {
          title: "Notre mission",
          body: "Fournir un renseignement fiable et fondé sur les preuves qui permet des décisions critiques aux entreprises et institutions à travers l'Afrique.",
        },
        {
          title: "Notre vision",
          body: "Être le premier cabinet africain de due diligence, d'investigations et de conseil en risques fondé sur le renseignement, le partenaire de référence quand les enjeux sont les plus élevés.",
        },
      ],
    },
    es: {
      title: "Misión y visión",
      items: [
        {
          title: "Nuestra misión",
          body: "Proporcionar inteligencia confiable y basada en evidencia que haga posibles decisiones críticas de empresas e instituciones en toda África.",
        },
        {
          title: "Nuestra visión",
          body: "Ser la firma africana líder en due diligence, investigaciones y asesoría de riesgos basadas en inteligencia, el socio de referencia cuando hay más en juego.",
        },
      ],
    },
  }),

  block<FaqBlock>("who-we-are", "faq", 3, {
    en: {
      title: "Frequently asked questions",
      items: [
        {
          question: "How is confidentiality protected during an engagement?",
          answer:
            "Every engagement runs under strict confidentiality protocols: information is access-restricted to assigned case staff, evidence is handled under a documented chain of custody, and client data is encrypted in storage and retained only as long as the engagement or applicable law requires.",
        },
        {
          question: "How does an engagement with PRIMA begin?",
          answer:
            "It starts with a confidential scoping conversation. We define the question you need answered, confirm there is no conflict of interest, agree deliverables and timelines, and only then begin fieldwork.",
        },
        {
          question: "Where does PRIMA operate?",
          answer:
            "We operate from offices in Ghana (Accra and Tamale) and Rwanda (Kigali), with investigative reach across African markets through vetted, directly managed resources rather than uncontrolled subcontractors.",
        },
        {
          question: "Can PRIMA's findings be used in court or before regulators?",
          answer:
            "Yes. Our methodology is built for scrutiny: evidence is preserved to evidentiary standard, findings are documented and sourced, and every report passes internal quality review so it holds up in litigation, arbitration, disciplinary proceedings, or regulatory review.",
        },
      ],
    },
    fr: {
      title: "Questions fréquentes",
      items: [
        {
          question: "Comment la confidentialité est-elle protégée pendant une mission ?",
          answer:
            "Chaque mission est conduite selon des protocoles de confidentialité stricts : l'accès aux informations est limité au personnel affecté au dossier, les preuves sont gérées sous une chaîne de conservation documentée, et les données des clients sont chiffrées et conservées uniquement le temps requis par la mission ou la loi applicable.",
        },
        {
          question: "Comment débute une mission avec PRIMA ?",
          answer:
            "Tout commence par un échange de cadrage confidentiel. Nous définissons la question à laquelle vous devez répondre, vérifions l'absence de conflit d'intérêts, convenons des livrables et des délais, et seulement ensuite commençons le travail de terrain.",
        },
        {
          question: "Où PRIMA opère-t-elle ?",
          answer:
            "Nous opérons depuis nos bureaux au Ghana (Accra et Tamale) et au Rwanda (Kigali), avec une portée d'investigation sur les marchés africains grâce à des ressources vérifiées et gérées directement, plutôt que des sous-traitants non contrôlés.",
        },
        {
          question:
            "Les conclusions de PRIMA peuvent-elles être utilisées en justice ou devant les régulateurs ?",
          answer:
            "Oui. Notre méthodologie est conçue pour l'examen : les preuves sont préservées au standard probatoire, les conclusions sont documentées et sourcées, et chaque rapport passe une revue qualité interne afin de résister au contentieux, à l'arbitrage, aux procédures disciplinaires ou à l'examen réglementaire.",
        },
      ],
    },
    es: {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿Cómo se protege la confidencialidad durante un encargo?",
          answer:
            "Cada encargo se desarrolla bajo protocolos estrictos de confidencialidad: el acceso a la información se restringe al personal asignado al caso, las pruebas se gestionan bajo una cadena de custodia documentada, y los datos del cliente se cifran y se conservan solo el tiempo que exige el encargo o la ley aplicable.",
        },
        {
          question: "¿Cómo comienza un encargo con PRIMA?",
          answer:
            "Comienza con una conversación confidencial de alcance. Definimos la pregunta que necesita responder, confirmamos que no existe conflicto de interés, acordamos entregables y plazos, y solo entonces iniciamos el trabajo de campo.",
        },
        {
          question: "¿Dónde opera PRIMA?",
          answer:
            "Operamos desde oficinas en Ghana (Accra y Tamale) y Ruanda (Kigali), con alcance investigativo en los mercados africanos mediante recursos verificados y gestionados directamente, en lugar de subcontratistas sin control.",
        },
        {
          question:
            "¿Pueden usarse las conclusiones de PRIMA ante tribunales o reguladores?",
          answer:
            "Sí. Nuestra metodología está preparada para el escrutinio: las pruebas se preservan con estándar probatorio, los hallazgos se documentan y respaldan con fuentes, y cada informe pasa una revisión interna de calidad para resistir litigios, arbitrajes, procedimientos disciplinarios o revisiones regulatorias.",
        },
      ],
    },
  }),

  // ---------------------------------------------------- practice-areas index
  block<TextBlock>("practice-areas", "intro", 1, {
    en: {
      kicker: "Practice Areas",
      title: "Six practices, one evidentiary standard",
      paragraphs: [
        "From enhanced due diligence to forensic examination, every PRIMA practice follows the same defined methodology: structured scoping, evidence-based fieldwork, internal quality review, and deliverables built to hold up under board, investor, or regulatory scrutiny.",
      ],
    },
    fr: {
      kicker: "Domaines d'expertise",
      title: "Six pratiques, un même standard probatoire",
      paragraphs: [
        "De la due diligence renforcée à l'examen forensique, chaque pratique de PRIMA suit la même méthodologie définie : cadrage structuré, travail de terrain fondé sur les preuves, revue qualité interne et des livrables conçus pour résister à l'examen d'un conseil, d'investisseurs ou de régulateurs.",
      ],
    },
    es: {
      kicker: "Áreas de práctica",
      title: "Seis prácticas, un mismo estándar probatorio",
      paragraphs: [
        "Desde la due diligence reforzada hasta el examen forense, cada práctica de PRIMA sigue la misma metodología definida: alcance estructurado, trabajo de campo basado en evidencia, revisión interna de calidad y entregables preparados para resistir el escrutinio de consejos, inversores o reguladores.",
      ],
    },
  }),

  // --------------------------------------------------------- industries index
  block<TextBlock>("industries", "intro", 1, {
    en: {
      kicker: "Industries We Serve",
      title: "Sector fluency, not just service breadth",
      paragraphs: [
        "Enterprise buyers ask two questions: who understands my problem, and who understands my industry. PRIMA's six practice areas are delivered with sector-specific fluency across the industries below.",
      ],
    },
    fr: {
      kicker: "Secteurs servis",
      title: "Une maîtrise sectorielle, pas seulement une largeur de services",
      paragraphs: [
        "Les acheteurs institutionnels posent deux questions : qui comprend mon problème, et qui comprend mon secteur. Les six domaines d'expertise de PRIMA sont délivrés avec une maîtrise sectorielle spécifique dans les industries ci-dessous.",
      ],
    },
    es: {
      kicker: "Sectores que servimos",
      title: "Fluidez sectorial, no solo amplitud de servicios",
      paragraphs: [
        "Los compradores institucionales hacen dos preguntas: quién entiende mi problema y quién entiende mi sector. Las seis áreas de práctica de PRIMA se prestan con fluidez sectorial específica en las industrias siguientes.",
      ],
    },
  }),

  // ------------------------------------------------------ regional-coverage
  block<TextBlock>("regional-coverage", "intro", 1, {
    en: {
      kicker: "Regional Coverage",
      title: "The PRIMA Network",
      paragraphs: [
        "PRIMA operates directly from offices in Ghana and Rwanda, with on-ground investigators and analysts who understand local regulatory environments, languages, and business cultures, not subcontracted intermediaries.",
        "This means faster fieldwork, more reliable source verification, and findings that account for local context a fly-in team would miss, delivered against the same evidentiary and reporting standards international clients expect.",
      ],
    },
    fr: {
      kicker: "Couverture régionale",
      title: "Le réseau PRIMA",
      paragraphs: [
        "PRIMA opère directement depuis ses bureaux au Ghana et au Rwanda, avec des enquêteurs et analystes de terrain qui comprennent les environnements réglementaires, les langues et les cultures d'affaires locales, et non des intermédiaires sous-traités.",
        "Cela signifie un travail de terrain plus rapide, une vérification des sources plus fiable et des conclusions qui tiennent compte du contexte local qu'une équipe de passage manquerait, le tout selon les mêmes standards probatoires et de reporting attendus par les clients internationaux.",
      ],
    },
    es: {
      kicker: "Cobertura regional",
      title: "La red PRIMA",
      paragraphs: [
        "PRIMA opera directamente desde oficinas en Ghana y Ruanda, con investigadores y analistas sobre el terreno que entienden los entornos regulatorios, los idiomas y las culturas de negocio locales, no intermediarios subcontratados.",
        "Esto significa trabajo de campo más rápido, verificación de fuentes más fiable y hallazgos que consideran el contexto local que un equipo visitante pasaría por alto, con los mismos estándares probatorios y de reporte que esperan los clientes internacionales.",
      ],
    },
  }),

  block<ItemListBlock>("regional-coverage", "pillars", 2, {
    en: {
      title: "What our network delivers",
      items: [
        {
          title: "Direct on-ground presence",
          body: "Offices in Accra, Tamale, and Kigali with directly managed investigators and analysts, not uncontrolled subcontractors.",
        },
        {
          title: "Language coverage",
          body: "Engagements delivered in English and French, with Spanish-language reporting available, plus local language fluency across our markets.",
        },
        {
          title: "Regulatory relationships",
          body: "Working familiarity with national regulators, industry bodies, and public registries across our markets.",
        },
        {
          title: "One quality standard",
          body: "Every market operates under the same intake, evidence, and quality review methodology described in Our Standards.",
        },
      ],
    },
    fr: {
      title: "Ce que notre réseau apporte",
      items: [
        {
          title: "Présence directe sur le terrain",
          body: "Des bureaux à Accra, Tamale et Kigali avec des enquêteurs et analystes gérés directement, et non des sous-traitants non contrôlés.",
        },
        {
          title: "Couverture linguistique",
          body: "Des missions menées en anglais et en français, avec des rapports disponibles en espagnol, et une maîtrise des langues locales sur nos marchés.",
        },
        {
          title: "Relations avec les régulateurs",
          body: "Une connaissance pratique des régulateurs nationaux, des organismes professionnels et des registres publics sur nos marchés.",
        },
        {
          title: "Un standard de qualité unique",
          body: "Chaque marché applique la même méthodologie de cadrage, de preuve et de revue qualité décrite dans Nos standards.",
        },
      ],
    },
    es: {
      title: "Lo que aporta nuestra red",
      items: [
        {
          title: "Presencia directa sobre el terreno",
          body: "Oficinas en Accra, Tamale y Kigali con investigadores y analistas gestionados directamente, no subcontratistas sin control.",
        },
        {
          title: "Cobertura de idiomas",
          body: "Encargos realizados en inglés y francés, con informes disponibles en español, además de dominio de idiomas locales en nuestros mercados.",
        },
        {
          title: "Relaciones regulatorias",
          body: "Familiaridad práctica con reguladores nacionales, organismos sectoriales y registros públicos en nuestros mercados.",
        },
        {
          title: "Un único estándar de calidad",
          body: "Cada mercado opera con la misma metodología de alcance, evidencia y revisión de calidad descrita en Nuestros estándares.",
        },
      ],
    },
  }),

  // ---------------------------------------------------------- our-standards
  block<TextBlock>("our-standards", "intro", 1, {
    en: {
      kicker: "Our Standards",
      title: "Process rigor is the product",
      paragraphs: [
        "Every PRIMA engagement follows a defined methodology: structured intake and scoping, evidence-based fieldwork, internal quality review, and a final deliverable built to the standard our clients need, whether that is a board decision, a regulatory submission, or litigation support.",
      ],
    },
    fr: {
      kicker: "Nos standards",
      title: "La rigueur du processus est le produit",
      paragraphs: [
        "Chaque mission PRIMA suit une méthodologie définie : cadrage structuré, travail de terrain fondé sur les preuves, revue qualité interne et un livrable final au niveau requis par nos clients, qu'il s'agisse d'une décision de conseil d'administration, d'une soumission réglementaire ou d'un appui au contentieux.",
      ],
    },
    es: {
      kicker: "Nuestros estándares",
      title: "El rigor del proceso es el producto",
      paragraphs: [
        "Cada encargo de PRIMA sigue una metodología definida: alcance estructurado, trabajo de campo basado en evidencia, revisión interna de calidad y un entregable final al nivel que necesitan nuestros clientes, ya sea una decisión de consejo, una presentación regulatoria o apoyo en litigios.",
      ],
    },
  }),

  block<ItemListBlock>("our-standards", "standards", 2, {
    en: {
      title: "Four commitments on every engagement",
      items: [
        {
          title: "Independence",
          body: "No engagement is accepted where a conflict of interest exists. Conflict checks are documented before work begins.",
        },
        {
          title: "Chain of custody",
          body: "All evidence and documentation is tracked and preserved to evidentiary standard, from collection through delivery.",
        },
        {
          title: "Quality review",
          body: "Every report passes internal review before delivery. No finding reaches a client without a second set of qualified eyes.",
        },
        {
          title: "Confidentiality",
          body: "Client information is handled under strict data protection protocols, with access limited to assigned case staff.",
        },
      ],
    },
    fr: {
      title: "Quatre engagements sur chaque mission",
      items: [
        {
          title: "Indépendance",
          body: "Aucune mission n'est acceptée en présence d'un conflit d'intérêts. Les vérifications de conflits sont documentées avant le début des travaux.",
        },
        {
          title: "Chaîne de conservation",
          body: "Toutes les preuves et la documentation sont tracées et préservées au standard probatoire, de la collecte à la livraison.",
        },
        {
          title: "Revue qualité",
          body: "Chaque rapport passe une revue interne avant livraison. Aucune conclusion n'atteint un client sans un second regard qualifié.",
        },
        {
          title: "Confidentialité",
          body: "Les informations des clients sont traitées selon des protocoles stricts de protection des données, avec un accès limité au personnel affecté au dossier.",
        },
      ],
    },
    es: {
      title: "Cuatro compromisos en cada encargo",
      items: [
        {
          title: "Independencia",
          body: "No se acepta ningún encargo donde exista un conflicto de interés. Las comprobaciones de conflictos se documentan antes de empezar.",
        },
        {
          title: "Cadena de custodia",
          body: "Todas las pruebas y la documentación se registran y preservan con estándar probatorio, desde la recogida hasta la entrega.",
        },
        {
          title: "Revisión de calidad",
          body: "Cada informe pasa una revisión interna antes de la entrega. Ningún hallazgo llega a un cliente sin una segunda mirada cualificada.",
        },
        {
          title: "Confidencialidad",
          body: "La información del cliente se maneja bajo protocolos estrictos de protección de datos, con acceso limitado al personal asignado al caso.",
        },
      ],
    },
  }),

  block<TextBlock>("our-standards", "data-protection", 3, {
    en: {
      title: "Data protection",
      paragraphs: [
        "Client information and evidence are encrypted in storage, access-restricted to assigned case staff, retained only for the duration required by the engagement or applicable law, and securely disposed of thereafter.",
      ],
    },
    fr: {
      title: "Protection des données",
      paragraphs: [
        "Les informations et preuves des clients sont chiffrées en stockage, accessibles uniquement au personnel affecté au dossier, conservées seulement pendant la durée requise par la mission ou la loi applicable, puis détruites de manière sécurisée.",
      ],
    },
    es: {
      title: "Protección de datos",
      paragraphs: [
        "La información y las pruebas del cliente se cifran en almacenamiento, se restringen al personal asignado al caso, se conservan solo durante el tiempo que exige el encargo o la ley aplicable, y después se eliminan de forma segura.",
      ],
    },
  }),

  // ---------------------------------------------------------------- contact
  block<TextBlock>("contact", "intro", 1, {
    en: {
      kicker: "Contact",
      title: "Start a confidential conversation",
      paragraphs: [
        "Whether you are facing a transaction, a dispute, a suspected fraud, or a market entry decision, our team is ready to help. All enquiries are handled in strict confidence and answered within one business day.",
      ],
    },
    fr: {
      kicker: "Contact",
      title: "Engagez une conversation confidentielle",
      paragraphs: [
        "Que vous soyez face à une transaction, un litige, une fraude présumée ou une décision d'entrée sur un marché, notre équipe est prête à vous aider. Toutes les demandes sont traitées en stricte confidentialité et reçoivent une réponse sous un jour ouvré.",
      ],
    },
    es: {
      kicker: "Contacto",
      title: "Inicie una conversación confidencial",
      paragraphs: [
        "Ya se trate de una transacción, una disputa, un fraude presunto o una decisión de entrada a un mercado, nuestro equipo está listo para ayudar. Todas las consultas se tratan con estricta confidencialidad y se responden en un día hábil.",
      ],
    },
  }),

  // ------------------------------------------------- data-protection-policy
  block<TextBlock>("data-protection-policy", "policy", 1, {
    en: {
      kicker: "Legal",
      title: "Data Protection Policy",
      paragraphs: [
        "This policy explains how PRIMA Due Diligence Consult collects, stores, protects, and disposes of information belonging to clients, engagement subjects, and website visitors.",
        "What we collect and why. We collect only the information required to deliver an engagement: client contact and instruction details, engagement-related evidence and documentation, and enquiry details submitted through this website. We do not sell or share personal information with third parties for marketing purposes.",
        "How information is stored and who has access. Client information and evidence are encrypted in storage and access-restricted to staff assigned to the relevant case. Internal access is logged, and evidence is handled under a documented chain of custody.",
        "Retention and disposal. Information is retained only for the duration required by the engagement or by applicable law, and is securely disposed of thereafter: digital data is irreversibly deleted and physical materials are destroyed or returned to the client.",
        "Website enquiries. Details submitted through our contact form are stored securely, used only to respond to your enquiry, and never added to marketing lists without your consent.",
        "Questions. For any data protection query, including access or deletion requests, contact info@primaddc.com. We respond to data protection queries within five business days.",
      ],
    },
    fr: {
      kicker: "Mentions légales",
      title: "Politique de protection des données",
      paragraphs: [
        "Cette politique explique comment PRIMA Due Diligence Consult collecte, stocke, protège et détruit les informations appartenant aux clients, aux personnes concernées par les missions et aux visiteurs du site.",
        "Ce que nous collectons et pourquoi. Nous collectons uniquement les informations nécessaires à la réalisation d'une mission : coordonnées et instructions du client, preuves et documentation liées à la mission, et détails des demandes soumises via ce site. Nous ne vendons ni ne partageons de données personnelles à des tiers à des fins marketing.",
        "Stockage et accès. Les informations et preuves des clients sont chiffrées en stockage et accessibles uniquement au personnel affecté au dossier concerné. Les accès internes sont journalisés et les preuves sont gérées sous une chaîne de conservation documentée.",
        "Conservation et destruction. Les informations sont conservées uniquement pendant la durée requise par la mission ou la loi applicable, puis détruites de manière sécurisée : les données numériques sont supprimées de façon irréversible et les supports physiques sont détruits ou restitués au client.",
        "Demandes via le site. Les informations soumises via notre formulaire de contact sont stockées de manière sécurisée, utilisées uniquement pour répondre à votre demande, et jamais ajoutées à des listes marketing sans votre consentement.",
        "Questions. Pour toute question relative à la protection des données, y compris les demandes d'accès ou de suppression, contactez info@primaddc.com. Nous répondons aux questions de protection des données sous cinq jours ouvrés.",
      ],
    },
    es: {
      kicker: "Legal",
      title: "Política de protección de datos",
      paragraphs: [
        "Esta política explica cómo PRIMA Due Diligence Consult recopila, almacena, protege y elimina la información de clientes, sujetos de encargos y visitantes del sitio web.",
        "Qué recopilamos y por qué. Recopilamos solo la información necesaria para realizar un encargo: datos de contacto e instrucciones del cliente, pruebas y documentación relacionadas con el encargo, y los detalles de las consultas enviadas a través de este sitio. No vendemos ni compartimos información personal con terceros con fines de marketing.",
        "Cómo se almacena la información y quién tiene acceso. La información y las pruebas del cliente se cifran en almacenamiento y su acceso se restringe al personal asignado al caso correspondiente. El acceso interno queda registrado y las pruebas se gestionan bajo una cadena de custodia documentada.",
        "Conservación y eliminación. La información se conserva solo durante el tiempo que exige el encargo o la ley aplicable, y después se elimina de forma segura: los datos digitales se borran de manera irreversible y los materiales físicos se destruyen o se devuelven al cliente.",
        "Consultas del sitio web. Los datos enviados a través de nuestro formulario de contacto se almacenan de forma segura, se usan solo para responder a su consulta y nunca se añaden a listas de marketing sin su consentimiento.",
        "Preguntas. Para cualquier consulta de protección de datos, incluidas solicitudes de acceso o eliminación, escriba a info@primaddc.com. Respondemos a las consultas de protección de datos en un plazo de cinco días hábiles.",
      ],
    },
  }),

  // ---------------------------------------------------------------- training
  block<TextBlock>("training", "intro", 1, {
    en: {
      kicker: "Training",
      title: "Capability building by practitioners, not presenters",
      paragraphs: [
        "PRIMA trains investigators, compliance teams, and risk officers to global investigative and forensic standards. Programs are designed and delivered by the same credentialed practitioners who run our casework, and can be tailored to your institution's regulatory context.",
      ],
    },
    fr: {
      kicker: "Formation",
      title: "Un renforcement des capacités par des praticiens, pas des présentateurs",
      paragraphs: [
        "PRIMA forme les enquêteurs, les équipes conformité et les responsables risques aux standards mondiaux d'investigation et de forensique. Les programmes sont conçus et animés par les praticiens certifiés qui mènent nos dossiers, et peuvent être adaptés au contexte réglementaire de votre institution.",
      ],
    },
    es: {
      kicker: "Formación",
      title: "Desarrollo de capacidades por profesionales en ejercicio, no presentadores",
      paragraphs: [
        "PRIMA forma a investigadores, equipos de cumplimiento y responsables de riesgo según estándares globales de investigación y forense. Los programas los diseñan e imparten los mismos profesionales acreditados que llevan nuestros casos, y pueden adaptarse al contexto regulatorio de su institución.",
      ],
    },
  }),
];

// Image assignments per block (page/section). Kept separate from the copy so
// the mapping is auditable at a glance; editable later via the admin CMS.
const BLOCK_IMAGES: Record<string, string> = {
  "home/hero": IMG.heroCorporate,
  "home/who-we-are": IMG.officeSign,
  "home/regional-teaser": IMG.citySkyline,
  "who-we-are/intro": IMG.boardroom,
  "who-we-are/mission-vision": IMG.officeSign,
  "practice-areas/intro": IMG.corporateBuilding,
  "industries/intro": IMG.handshake,
  "regional-coverage/intro": IMG.citySkyline,
  "regional-coverage/pillars": IMG.seminarAudience,
  "our-standards/intro": IMG.documentsReview,
  "our-standards/standards": IMG.cyberPolicy,
  "training/intro": IMG.trainingSession,
  "contact/intro": IMG.officeReception,
};

for (const b of CONTENT_BLOCKS) {
  b.imagePath = BLOCK_IMAGES[`${b.page}/${b.section}`] ?? null;
}
