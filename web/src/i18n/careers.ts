import type { Lang } from '@/content/types';
import type { Employment } from '@/lib/careers/types';

// Interface strings for the careers page (EN / AR). Job content itself comes from the dashboard.

type Careers = {
  nav: string;
  eyebrow: string;
  title: string;
  openRoles: string;
  noRoles: string;
  employment: Record<Employment, string>;
  details: string;
  hideDetails: string;
  apply: string;
  applyExternal: string;
  generalTitle: string;
  generalText: string;
  generalApply: string;
  formTitle: (job: string | null) => string;
  name: string; email: string; phone: string; link: string; linkHint: string; message: string; optional: string;
  cv: string; cvHint: string; chooseFile: string;
  errName: string; errEmail: string; errCv: string; errCvSize: string; errClosed: string; errRate: string; errServer: string;
  required: string; submit: string; sending: string; cancel: string;
  thanks: (first: string) => string;
  thanksText: string;
  close: string;
  honeypot: string;
  backHome: string;
};

export const careersUi: Record<Lang, Careers> = {
  en: {
    nav: 'Careers',
    eyebrow: 'Careers · GHERAS',
    title: 'Grow with us.',
    openRoles: 'Open positions',
    noRoles: 'There are no open positions right now.',
    employment: { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' },
    details: 'Show details',
    hideDetails: 'Hide details',
    apply: 'Apply',
    applyExternal: 'Apply (opens a new page)',
    generalTitle: 'Don’t see the right role?',
    generalText: 'Send us your CV and tell us how you would like to contribute. We will keep it for future openings.',
    generalApply: 'Send a general application',
    formTitle: (job) => (job ? `Apply for: ${job}` : 'General application'),
    name: 'Full name', email: 'Email', phone: 'Phone', link: 'LinkedIn or portfolio', linkHint: 'A link we can look at',
    message: 'Why you? (short note)', optional: '(optional)',
    cv: 'CV', cvHint: 'PDF or Word, up to 10 MB', chooseFile: 'Choose file',
    errName: 'Please enter your full name.',
    errEmail: 'Please enter a valid email address.',
    errCv: 'Please attach your CV as a PDF or Word file.',
    errCvSize: 'The file is larger than 10 MB. Please send a smaller file.',
    errClosed: 'This position is no longer open.',
    errRate: 'Too many applications from this connection. Please try again later.',
    errServer: 'Your application could not be sent. Please try again in a moment.',
    required: 'All fields are required unless marked optional.',
    submit: 'Send application', sending: 'Sending…', cancel: 'Cancel',
    thanks: (first) => (first ? `Thank you, ${first}.` : 'Thank you.'),
    thanksText: 'Your application has reached the GHERAS team. We will be in touch if your profile matches.',
    close: 'Close',
    honeypot: 'Leave this field empty',
    backHome: 'Back to the home page',
  },
  ar: {
    nav: 'الوظائف',
    eyebrow: 'الوظائف · غراس',
    title: 'انمُ معنا.',
    openRoles: 'الوظائف المتاحة',
    noRoles: 'لا توجد وظائف متاحة حالياً.',
    employment: { 'full-time': 'دوام كامل', 'part-time': 'دوام جزئي', contract: 'عقد', internship: 'تدريب' },
    details: 'عرض التفاصيل',
    hideDetails: 'إخفاء التفاصيل',
    apply: 'قدّم الآن',
    applyExternal: 'قدّم الآن (يفتح صفحة جديدة)',
    generalTitle: 'لم تجد الوظيفة المناسبة؟',
    generalText: 'أرسل لنا سيرتك الذاتية وأخبرنا كيف تودّ أن تساهم، وسنحتفظ بها للفرص القادمة.',
    generalApply: 'أرسل طلباً عاماً',
    formTitle: (job) => (job ? `التقديم على: ${job}` : 'طلب عام'),
    name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'الهاتف', link: 'لينكدإن أو معرض أعمال', linkHint: 'رابط يمكننا الاطلاع عليه',
    message: 'لماذا أنت؟ (نبذة قصيرة)', optional: '(اختياري)',
    cv: 'السيرة الذاتية', cvHint: 'PDF أو Word، حتى 10 ميغابايت', chooseFile: 'اختر ملفاً',
    errName: 'يرجى إدخال اسمك الكامل.',
    errEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
    errCv: 'يرجى إرفاق سيرتك الذاتية بصيغة PDF أو Word.',
    errCvSize: 'حجم الملف أكبر من 10 ميغابايت. يرجى إرسال ملف أصغر.',
    errClosed: 'هذه الوظيفة لم تعد متاحة.',
    errRate: 'وصلتنا طلبات كثيرة من هذا الاتصال. يرجى المحاولة لاحقاً.',
    errServer: 'تعذّر إرسال طلبك. يرجى المحاولة مرة أخرى بعد قليل.',
    required: 'جميع الحقول مطلوبة ما لم يُذكر أنها اختيارية.',
    submit: 'أرسل الطلب', sending: 'جارٍ الإرسال…', cancel: 'إلغاء',
    thanks: (first) => (first ? `شكراً لك، ${first}.` : 'شكراً لك.'),
    thanksText: 'وصل طلبك إلى فريق غراس، وسنتواصل معك إن كان ملفك مناسباً.',
    close: 'إغلاق',
    honeypot: 'اترك هذا الحقل فارغاً',
    backHome: 'العودة إلى الصفحة الرئيسية',
  },
};
