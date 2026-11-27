type Text = { en: string; zh: string };

export const companyStages = [
  {
    color: '#252B39',
    title: { en: 'Setting up', zh: '设立公司' },
    description: {
      en: 'Choosing Singapore, Hong Kong or both, incorporating, and getting your first hires through MOM.',
      zh: '选择新加坡、香港或两地布局，完成公司注册，并办理首批员工的人力部手续。',
    },
    services: [{ en: 'Company incorporation', zh: '公司注册' }],
    guide: { en: 'Guide: Singapore or Hong Kong?', zh: '指南：新加坡还是香港？' },
    image: 'company-card-01.webp', width: 1200, height: 1800,
    alt: 'A professional seated in a warm timber-panelled meeting room',
  },
  {
    color: '#6D170A',
    title: { en: 'Running your company', zh: '运营公司' },
    description: {
      en: 'Filings, books, tax, payroll and work passes, handled by one team that sees the whole company.',
      zh: '由了解公司全貌的同一团队，统筹申报、账务、税务、薪资及工作准证。',
    },
    services: [
      { en: 'Corporate secretarial', zh: '公司秘书服务' },
      { en: 'Accounting and financial reporting', zh: '会计与财务报告' },
      { en: 'Tax compliance and advisory', zh: '税务合规与咨询' },
      { en: 'Executive search, HR and work passes', zh: '高管招聘、人力资源与工作准证' },
      { en: 'Executive search, HR and work passes', zh: '高管招聘、人力资源与工作准证' },
    ],
    guide: { en: 'Guide: Compliance calendar 2027', zh: '指南：2027年合规日历' },
    image: 'company-card-02.webp', width: 1200, height: 1499,
    alt: 'Two professionals talking in a softly lit lounge',
  },
  {
    color: '#DE865E',
    title: { en: 'Funds and family offices', zh: '基金与家族办公室' },
    description: {
      en: "Fund administration and family office set-up under Singapore's August 2026 rules and Hong Kong's family office regime.",
      zh: '依据新加坡2026年8月规则及香港家族办公室制度，提供基金行政管理与家族办公室设立服务。',
    },
    services: [
      { en: 'Fund administration', zh: '基金行政管理' },
      { en: 'Family office support', zh: '家族办公室支持' },
    ],
    guide: { en: 'Guide: Single family office 2026', zh: '指南：2026年单一家族办公室' },
    image: 'company-card-03.webp', width: 735, height: 1132,
    alt: 'Books and a glowing table lamp on dark timber shelves',
  },
  {
    color: '#AD4112',
    title: { en: 'Restructuring or closing', zh: '重组或结业' },
    description: {
      en: 'Early advice when cash is tight, and an orderly closure when a company has done its job.',
      zh: '在资金紧张时及早提供建议，并在公司完成使命后协助有序结业。',
    },
    services: [{ en: 'Insolvency, restructuring and investigation', zh: '破产、重组与调查' }],
    guide: { en: 'Guide: Closing a Singapore company', zh: '指南：关闭新加坡公司' },
    image: 'company-card-04.webp', width: 1400, height: 1750,
    alt: 'A team meeting seen through curtains in a warmly lit interior',
  },
];

const translatedFields = (language: keyof Text) => Object.fromEntries(companyStages.flatMap((stage, index) => [
  [`stageTitle${index}`, stage.title[language]],
  [`stageDescription${index}`, stage.description[language]],
  [`stageGuide${index}`, stage.guide[language]],
  ...stage.services.map((service, serviceIndex) => [`stageService${index}_${serviceIndex}`, service[language]]),
]));

export const companyStageTranslations = {
  en: { stagesHeading: 'Where is your company today?', stagesIncludes: 'Includes', ...translatedFields('en') },
  zh: { stagesHeading: '您的公司目前处于哪个阶段？', stagesIncludes: '包含服务', ...translatedFields('zh') },
};
