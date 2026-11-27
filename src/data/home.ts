export const services = [
  { title: 'Corporate Secretarial Services', zh: '公司秘书服务', image: 'story-09.webp', description: 'Finova provides comprehensive corporate secretarial services to meet your corporate obligation and ensure that your company keep up to date with the evolving compliance requirements.', descriptionZh: 'Finova提供全面的公司秘书服务，协助履行公司义务，让您的公司及时了解不断变化的合规要求。' },
  { title: 'Fund Administration', zh: '基金行政管理', image: 'story-02.webp', description: 'One team for fund accounting, investor reporting and administration, supporting your fund throughout its lifecycle.', descriptionZh: '由同一团队统筹基金会计、投资者报告与行政管理，支持基金的整个生命周期。' },
  { title: 'Family Office Support', zh: '家族办公室支持', image: 'story-03.webp', description: 'Practical support for setting up and running a family office in Singapore or Hong Kong, with the company, accounting and compliance work connected.', descriptionZh: '为新加坡或香港家族办公室的设立与运营提供实际支持，统筹公司事务、会计与合规工作。' },
  { title: 'Accounting & Financial Reporting', zh: '会计与财务报告', image: 'story-06.webp', description: 'Clear books, timely financial reports and a team that understands your business, so you can make decisions with confidence.', descriptionZh: '清晰的账簿、及时的财务报告，以及了解您业务的团队，助您自信决策。' },
  { title: 'Executive Search & Human Resource Services', zh: '高管招聘与人力资源服务', image: 'story-07.webp', description: 'Recruitment, payroll, human resources and work pass support, coordinated with the rest of your company’s needs.', descriptionZh: '根据公司的整体需求，协调招聘、薪资、人力资源及工作准证服务。' },
  { title: 'Tax Compliance & Advisory', zh: '税务合规与咨询', image: 'story-08.webp', description: 'Tax filings and practical advice for your company in Singapore and Hong Kong, with people who already know your accounts.', descriptionZh: '由熟悉您账目的专业人士，提供新加坡和香港的税务申报与实用建议。' },
  { title: 'Insolvency, Restructuring & Investigation', zh: '破产、重组与调查', image: 'story-01.webp', description: 'Early advice when a business faces difficulties, support through restructuring, and an orderly process when it is time to close.', descriptionZh: '在企业面临困难时及早提供建议，支持重组，并在结业时协助有序完成程序。' },
];

export const offices = [
  { id: 'singapore', city: 'Singapore', zh: '新加坡', label: 'Singapore office', labelZh: '新加坡办公室', image: 'story-04.webp', alt: 'Warm timber hallway in the Singapore office', flag: 'sg', address: '182 Cecil Street, #23-02 Frasers Tower, Singapore 069547', phone: '+65 6228 0820', email: 'contact@finova.com.sg' },
  { id: 'hong-kong', city: 'Hong Kong', zh: '香港', label: 'Hong Kong office', labelZh: '香港办公室', image: 'slide-01-upscaled.webp', alt: 'Amber-lit lounge in the Hong Kong office', flag: 'hk', address: 'Units 02-04, 25/F, Alexandra House, 18 Chater Road, Central', phone: '+852 2731 5964', email: 'contacthk@finova-hk.com' },
];

export const guides = [
  { title: 'Single family office in Singapore: the 2026 guide', zh: '新加坡单一家族办公室：2026年指南', image: 'story-03.webp' },
  { title: 'Singapore or Hong Kong: where to set up in 2026', zh: '新加坡还是香港：2026年在哪里设立公司', image: 'story-05.webp' },
  { title: 'Singapore company compliance calendar 2027', zh: '2027年新加坡公司合规日历', image: 'story-07.webp' },
  { title: 'Strike off, MVL or CVL: closing a company properly', zh: '除名、MVL或CVL：妥善关闭公司', image: 'story-08.webp' },
];

export const directors = [
  { name: 'Michael Augier', role: 'Group Chief Executive Officer', zh: '集团首席执行官', image: 'michael', office: 'singapore' },
  { name: 'Sarah Zeng', role: 'Director, Corporate Secretarial', zh: '董事，公司秘书服务', image: 'sarah', office: 'singapore' },
  { name: 'G M Amrish', role: 'Director, Accounting & Financial Reporting', zh: '董事，会计与财务报告', image: 'amrish', office: 'singapore' },
  { name: 'Lam Hui Ling', role: 'Director, Accounting & Financial Reporting', zh: '董事，会计与财务报告', image: 'hui-ling', office: 'singapore' },
  { name: 'Arno Wiedijk', role: 'Chief Executive Officer', zh: '首席执行官', image: 'arno', office: 'hong-kong' },
  { name: 'Grace Lee', role: 'Director, Fund Services', zh: '董事，基金服务', image: 'grace', office: 'hong-kong' },
  { name: 'Ivy Siu', role: 'Director, Corporate Secretarial', zh: '董事，公司秘书服务', image: 'ivy', office: 'hong-kong' },
];

const translatedFields = (language: 'en' | 'zh') => Object.fromEntries([
  ...services.flatMap((s, i) => [[`serviceTitle${i}`, language === 'en' ? s.title : s.zh], [`serviceDescription${i}`, language === 'en' ? s.description : s.descriptionZh]]),
  ...offices.flatMap((o, i) => [[`officeCity${i}`, language === 'en' ? o.city : o.zh], [`officeLink${i}`, language === 'en' ? o.label : o.labelZh]]),
  ...guides.map((g, i) => [`guideTitle${i}`, language === 'en' ? g.title : g.zh]),
  ...directors.map((d, i) => [`directorRole${i}`, language === 'en' ? d.role : d.zh]),
]);

export const homeTranslations = {
  en: {
    ...translatedFields('en'), bookConsultation: 'Book a consultation', exploreServices: 'Explore services', contactUs: 'Contact us', readOurStory: 'Read our story', ourServices: 'Our services',
    officesHeading: 'Two cities, one firm', officesDescription: 'Set up in Singapore, Hong Kong or both without changing firm or starting over.',
    guidesHeading: 'Guides for 2026', eventType: 'Event', seeMore: 'See more',
    teamHeading: 'The directors who lead each practice, in both offices.', teamDescription: 'With more than 15 years of proven track record, serving more than 1,500 clients',
    contactHeading: 'Tell us where your company is today', contactDescription: 'A director will review your situation and tell you plainly what it needs.',
    footerTagline: 'A trusted partner dedicated to your growth.', company: 'Company', resources: 'Resources', ourServicesFooter: 'Our Services', terms: 'Terms & Conditions', privacy: 'Privacy Policy', copyright: '© 2026 Finova Group. All Rights Reserved.',
  },
  zh: {
    ...translatedFields('zh'), bookConsultation: '预约咨询', exploreServices: '探索服务', contactUs: '联系我们', readOurStory: '了解我们的故事', ourServices: '我们的服务',
    officesHeading: '两座城市，同一家事务所', officesDescription: '在新加坡、香港或两地设立公司，无需更换服务商或重新开始。',
    guidesHeading: '2026年指南', eventType: '活动', seeMore: '查看更多',
    teamHeading: '在两地办公室领导各专业领域的董事。', teamDescription: '超过15年的丰富经验，已为逾1,500家客户提供服务',
    contactHeading: '告诉我们您的公司目前处于哪个阶段', contactDescription: '我们的董事将了解您的情况，并清楚说明您所需要的支持。',
    footerTagline: '值得信赖的伙伴，专注于您的成长。', company: '公司', resources: '资源', ourServicesFooter: '我们的服务', terms: '条款与条件', privacy: '隐私政策', copyright: '© 2026 Finova Group. 保留所有权利。',
  },
};
