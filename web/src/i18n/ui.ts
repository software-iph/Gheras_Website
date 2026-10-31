import type { InquiryType, Lang } from '@/content/types';

// Interface strings that are part of the design rather than CMS content.
// Copy is taken word for word from the EN and AR prototypes.

export type NavId = 'about' | 'what-we-do' | 'values' | 'why' | 'contact';

type UI = {
  nav: Record<NavId, string>;
  navLabel: string;
  menuLabel: string;
  footerNavLabel: string;
  openMenu: string;
  closeMenu: string;
  backToTopLogo: string;
  backToTop: string;
  otherLang: { label: string; lang: Lang };
  thisLang: string;
  heroLabel: string;
  scroll: string;
  scrollLabel: string;
  figuresLabel: string;
  figuresNote: string;
  wheat: string;
  olive: string;
  missionVisionLabel: string;
  mission: string;
  vision: string;
  contactPlaceholders: { email: string; phone: string; address: string };
  follow: string;
  socialPlaceholder: string;
  social: Record<'linkedin' | 'instagram' | 'x' | 'facebook' | 'youtube', string>;
  form: {
    name: string; org: string; email: string; phone: string; optional: string; type: string; message: string;
    types: Record<InquiryType, string>;
    errName: string; errEmail: string; errMsg: string; errServer: string; errRate: string;
    required: string; submit: string; sending: string;
    thanks: (first: string) => string;
    replyBefore: (email: string) => string; replyAfter: string;
    another: string;
    honeypot: string;
  };
};

export const ui: Record<Lang, UI> = {
  en: {
    nav: { about: 'About', 'what-we-do': 'What we do', values: 'Values', why: 'Why GHERAS', contact: 'Contact' },
    navLabel: 'Main',
    menuLabel: 'Menu',
    footerNavLabel: 'Footer',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    backToTopLogo: 'GHERAS — back to top',
    backToTop: 'Back to top',
    otherLang: { label: 'العربية', lang: 'ar' },
    thisLang: 'English',
    heroLabel: 'Introduction',
    scroll: 'Scroll',
    scrollLabel: 'Scroll to the next section',
    figuresLabel: 'GHERAS in figures',
    figuresNote: 'ALL FIGURES — client to supply. Remove section if unavailable.',
    wheat: 'WHEAT',
    olive: 'OLIVE',
    missionVisionLabel: 'Mission and vision',
    mission: 'Our mission',
    vision: 'Our vision',
    contactPlaceholders: { email: '[email]', phone: '[phone]', address: '[address]' },
    follow: 'Follow',
    socialPlaceholder: '[social links]',
    social: { linkedin: 'LinkedIn', instagram: 'Instagram', x: 'X', facebook: 'Facebook', youtube: 'YouTube' },
    form: {
      name: 'Full name', org: 'Organisation', email: 'Email', phone: 'Phone', optional: '(optional)',
      type: 'Inquiry type', message: 'Message',
      types: { Investment: 'Investment', Partnership: 'Partnership', Supply: 'Supply', Careers: 'Careers', Other: 'Other' },
      errName: 'Please enter your full name.',
      errEmail: 'Please enter a valid email address.',
      errMsg: 'Please tell us briefly what you have in mind.',
      errServer: 'Your message could not be sent. Please try again in a moment.',
      errRate: 'Too many messages from this connection. Please try again later.',
      required: 'All fields are required unless marked optional.',
      submit: 'Send message',
      sending: 'Sending…',
      thanks: (first) => (first ? `Thank you, ${first}.` : 'Thank you for your message.'),
      replyBefore: (email) => `Your message has reached the GHERAS team. We will reply to ${email} within `,
      replyAfter: ' working days.',
      another: 'Send another message',
      honeypot: 'Leave this field empty',
    },
  },
  ar: {
    nav: { about: 'من نحن', 'what-we-do': 'ماذا نفعل', values: 'قيمنا', why: 'لماذا غراس', contact: 'تواصل' },
    navLabel: 'القائمة الرئيسية',
    menuLabel: 'القائمة',
    footerNavLabel: 'روابط التذييل',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    backToTopLogo: 'غراس — العودة إلى الأعلى',
    backToTop: 'العودة إلى الأعلى',
    otherLang: { label: 'English', lang: 'en' },
    thisLang: 'العربية',
    heroLabel: 'مقدمة',
    scroll: 'مرّر',
    scrollLabel: 'انتقل إلى القسم التالي',
    figuresLabel: 'غراس بالأرقام',
    figuresNote: 'جميع الأرقام يزوّدنا بها العميل — يُحذف القسم إن لم تتوفر',
    wheat: 'القمح',
    olive: 'الزيتون',
    missionVisionLabel: 'الرسالة والرؤية',
    mission: 'رسالتنا',
    vision: 'رؤيتنا',
    contactPlaceholders: { email: '[البريد الإلكتروني]', phone: '[الهاتف]', address: '[العنوان]' },
    follow: 'تابعنا',
    socialPlaceholder: '[روابط التواصل]',
    social: { linkedin: 'لينكدإن', instagram: 'إنستغرام', x: 'إكس', facebook: 'فيسبوك', youtube: 'يوتيوب' },
    form: {
      name: 'الاسم الكامل', org: 'المؤسسة', email: 'البريد الإلكتروني', phone: 'الهاتف', optional: '(اختياري)',
      type: 'نوع الاستفسار', message: 'الرسالة',
      types: { Investment: 'استثمار', Partnership: 'شراكة', Supply: 'توريد', Careers: 'وظائف', Other: 'أخرى' },
      errName: 'يرجى إدخال اسمك الكامل.',
      errEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
      errMsg: 'أخبرنا باختصار بما تفكر فيه.',
      errServer: 'تعذّر إرسال رسالتك. يرجى المحاولة مرة أخرى بعد قليل.',
      errRate: 'وصلتنا رسائل كثيرة من هذا الاتصال. يرجى المحاولة لاحقاً.',
      required: 'جميع الحقول مطلوبة ما لم يُذكر أنها اختيارية.',
      submit: 'أرسل الرسالة',
      sending: 'جارٍ الإرسال…',
      thanks: (first) => (first ? `شكراً لك، ${first}.` : 'شكراً لرسالتك.'),
      replyBefore: (email) => `وصلت رسالتك إلى فريق غراس. سنردّ على ${email} خلال `,
      replyAfter: ' أيام عمل.',
      another: 'أرسل رسالة أخرى',
      honeypot: 'اترك هذا الحقل فارغاً',
    },
  },
};
