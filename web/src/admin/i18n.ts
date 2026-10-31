import type { InquiryType } from '@/content/types';

export type UILang = 'en' | 'ar';

// Dashboard interface strings — wording from design/Gheras Dashboard.dc.html (dict()).
const en = {
  overview: 'Overview', editor: 'Page editor', media: 'Media library', inbox: 'Inquiries', history: 'Change history',
  settings: 'Site settings', users: 'Users & roles', admin: 'Administrator', signOut: 'Sign out', otherLang: 'العربية',
  draftChip: (n: number) => `Draft · ${n} unpublished change${n === 1 ? '' : 's'}`, previewSite: 'Preview site', publish: 'Publish',
  greet: (h: number, name: string) => `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, ${name}`,
  greetSub: 'Here is what changed on the site since the last publish.',
  draftStatus: 'Draft status', unpub: 'changes waiting to be published', nothingPending: 'Everything is published.',
  reviewPublish: 'Review & publish', seeHistory: 'See history', health: 'Content health', newInq: 'New inquiries', openInbox: 'Open inbox',
  noInquiries: 'No inquiries yet.', recent: 'Recent changes',
  hMissingAr: 'Arabic missing', hMissingArD: 'Fields will not publish until both languages are filled',
  hPlaceholders: 'Placeholders left', hPlaceholdersD: 'Photos, figures and contact details still to supply',
  hAlt: 'Images without alt text', hAltD: 'Every photo needs English and Arabic alt text',
  hInq: 'Unread inquiries', hInqD: 'Messages from the contact form',
  sections: 'Sections', dragHint: 'Drag to reorder', left: 'left', right: 'right',
  lockedTitle: 'Locked wording.', lockedBody: 'This text comes word for word from the company profile. Changes need approval from management.',
  unlock: 'Unlock to edit', unlockConfirm: 'Unlock this section? Mission, vision and ICARE values are approved wording.',
  livePreview: 'Live preview — draft', desktop: 'Desktop', mobile: 'Mobile',
  pvNote: 'The preview jumps to the section you are editing. Draft changes show here before they are published.',
  replace: 'Replace image', chooseLibrary: 'Choose from library', uploading: 'Uploading…',
  maxChars: (n: number) => `Max ${n} characters`, tooLong: '✕ Too long for the layout',
  arMissing: '⚠ النص العربي مفقود — لن يُنشر هذا الحقل', arTooLong: '✕ النص أطول من المساحة',
  figureHint: 'Number · label EN · label AR', figurePh: 'e.g. 12,500',
  saveDraft: 'Save draft', saving: 'Saving…', saved: 'Saved to draft', discard: 'Discard', unsaved: 'Unsaved changes',
  moveUp: 'Move up', moveDown: 'Move down', showHide: (name: string) => `Show ${name} on the site`, lockedLabel: 'Locked', warnLabel: 'Needs attention',
  heroNote: 'The olive overlay is applied automatically to keep text readable.', circleNote: 'Shown inside the Pivot Circle.',
  ratioReq: (ratio: string, min: number) => `${ratio} required · min ${min} px`,
  imgOk: 'Size and ratio OK', imgSmall: (w: number, min: number) => `Too small: ${w} px wide (min ${min})`, imgRatio: 'Wrong ratio — crop needed', imgMissing: 'No photo yet',
  altEnPh: 'Alt text (English)', altArPh: 'النص البديل (عربي)',
  searchMedia: 'Search images', upload: 'Upload', dropHint: 'Drop JPG or WebP here · min. 2400 px wide for the hero, 1200 px for circles',
  all: 'All', missingAlt: 'Missing alt text', unused: 'Unused', cropCircle: 'Pivot circle 1:1', cropWide: 'Hero 16:9', cropSquare: 'Card 4:3',
  focal: 'Drag the gold dot to set the focal point. It stays centred in every crop.', altEn: 'Alt text — English', altAr: 'Alt text — Arabic',
  imgRules: 'Golden-hour light, real Libyan landscapes and people. No stock smiles, European farms or neon green. Text never sits on a photo without the olive overlay.',
  usedIn: 'Used in: ', notUsed: 'Not used', placeholderSlot: 'Placeholder', uploadFailed: 'Upload failed. Use a JPG or WebP under 40 MB.', saveDetails: 'Save details',
  noMedia: 'No images match.',
  email: 'Email', phone: 'Phone', sentFrom: 'Sent from', replyEmail: 'Reply by email', markReplied: 'Mark as replied', replied: 'Replied',
  archive: 'Archive', unarchive: 'Move back to inbox', archived: 'Archived', notes: 'Internal notes', notesPh: 'Only visible to the GHERAS team', saveNotes: 'Save notes',
  pageEn: 'English page', pageAr: 'Arabic page', noSelection: 'Select a message to read it.',
  password: 'Password', forgot: 'Forgot password?', signIn: 'Sign in', loginTitle: 'Content dashboard',
  loginSub: 'Manage the text, images, figures and contact details on the GHERAS website — in English and Arabic.',
  loginNote: 'Access is limited to GHERAS administrators. Two-step verification is required on first sign-in.',
  forgotNote: 'Password resets are done by the site developer (npm run admin:reset). Contact them to regain access.',
  errCredentials: '✕ Email or password is not correct.', errRate: '✕ Too many attempts. Wait a few minutes and try again.',
  errCode: '✕ That code is not valid. Check the time on your phone and try again.', errExpired: '✕ Your sign-in timed out. Start again.',
  noAdmin: 'No administrator is configured yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in the server environment.',
  twoStep: 'Two-step verification', enrollIntro: 'Scan this code with an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…), then enter the 6-digit code it shows.',
  manualKey: 'Or enter this key manually:', codeIntro: 'Enter the 6-digit code from your authenticator app.', code: 'Verification code', verify: 'Verify', startOver: 'Start again',
  restore: 'Restore this version', restoreConfirm: 'Copy this version into the draft? Your current draft changes will be replaced. Nothing goes live until you publish.',
  restored: 'Restored into the draft', before: 'BEFORE', after: 'AFTER', empty: '— (empty)', publishedTag: 'Published', draftTag: 'Draft',
  noDiffs: 'This version has no field changes to show.', moreDiffs: (n: number) => `+ ${n} more changes`,
  searchPreview: 'Search result preview', saveSettings: 'Save settings',
  contactTitle: 'Contact details', contactHint: 'Shown in Contact and footer · English | Arabic',
  socialTitle: 'Social links', socialHint: 'Empty links are hidden on the site', invalidUrl: '✕ Use a full https:// link', invalidEmail: '✕ Not a valid email address',
  seoTitle: 'Search engines (SEO)', seoHint: 'Title ≤ 60 · description ≤ 155 characters', pageTitle: 'Page title', description: 'Description',
  shareImage: 'Share image', shareNone: 'None — choose a 1200 × 630 image', endorseTitle: 'Endorsement line', endorseHint: 'Pending approval — hidden until switched on',
  text: 'Text', showOnSite: 'Show on site', on: 'On', off: 'Off', address: 'Address', replyTime: 'Reply time', replyDays: 'working days',
  futureRoles: 'Roles — coming later', invite: 'Invite user', later: 'Later', allPerms: 'Full access: edit, publish, settings, inquiries', twoFactorOn: 'Two-step verification on',
  pubTitle: 'Publish changes to the website?',
  pubBody: (n: number) => `${n} change${n === 1 ? '' : 's'} go live on both language pages. You can restore the previous version from Change history at any time.`,
  pubNote: 'Note for history (optional)', pubNotePh: 'e.g. Added figures from Q3 report', cancel: 'Cancel', publishNow: 'Publish now', publishing: 'Publishing…',
  published: 'Published. The website is updated.', nothingToPublish: 'There are no changes to publish.',
  c1ok: 'All text fits its layout limits', c1bad: (n: number) => `${n} field${n === 1 ? '' : 's'} too long for the layout — fix before publishing`,
  cEnBad: (n: number) => `${n} English field${n === 1 ? ' is' : 's are'} empty — fill before publishing`,
  cUrlBad: (n: number) => `${n} link or email address${n === 1 ? ' is' : 'es are'} not valid`,
  c2ok: 'Images meet ratio and size checks', c2bad: (n: number) => `${n} image${n === 1 ? '' : 's'} below the minimum size or at the wrong ratio`,
  c3: (n: number) => `${n} Arabic field${n === 1 ? ' is' : 's are'} empty — ${n === 1 ? 'it' : 'they'} will keep the published text`,
  c3ok: 'Arabic text is complete', c4: (n: number) => `${n} placeholder${n === 1 ? ' is' : 's are'} still visible on the site`,
  justNow: 'just now', by: 'by', you: 'you',
  inquiryTypes: { Investment: 'Investment', Partnership: 'Partnership', Supply: 'Supply', Careers: 'Careers', Other: 'Other' } as Record<InquiryType, string>,
  roles: [
    { name: 'Editor', d: 'Drafts text and images. An administrator publishes.', perms: [[true, 'Edit sections & media'], [false, 'Publish'], [false, 'Locked wording']] },
    { name: 'Inquiries', d: 'For the partnerships team: reads and answers form messages only.', perms: [[true, 'Inbox'], [false, 'Edit content'], [false, 'Settings']] },
    { name: 'Reviewer', d: 'Approves Arabic and English copy before publishing.', perms: [[true, 'Comment & approve'], [false, 'Edit'], [false, 'Publish']] },
  ] as { name: string; d: string; perms: [boolean, string][] }[],
};

export type Dict = typeof en;

const ar: Dict = {
  overview: 'نظرة عامة', editor: 'محرّر الصفحة', media: 'مكتبة الصور', inbox: 'الاستفسارات', history: 'سجل التغييرات',
  settings: 'إعدادات الموقع', users: 'المستخدمون والأدوار', admin: 'مسؤول النظام', signOut: 'تسجيل الخروج', otherLang: 'English',
  draftChip: (n) => `مسودة · ${n} تغييرات غير منشورة`, previewSite: 'معاينة الموقع', publish: 'نشر',
  greet: (h, name) => `${h < 12 ? 'صباح الخير' : 'مساء الخير'} يا ${name}`,
  greetSub: 'هذه التغييرات على الموقع منذ آخر نشر.',
  draftStatus: 'حالة المسودة', unpub: 'تغييرات بانتظار النشر', nothingPending: 'كل التغييرات منشورة.',
  reviewPublish: 'مراجعة ونشر', seeHistory: 'عرض السجل', health: 'سلامة المحتوى', newInq: 'استفسارات جديدة', openInbox: 'فتح الصندوق',
  noInquiries: 'لا توجد استفسارات بعد.', recent: 'آخر التغييرات',
  hMissingAr: 'نص عربي مفقود', hMissingArD: 'لن تُنشر الحقول حتى تكتمل اللغتان',
  hPlaceholders: 'عناصر مؤقتة متبقية', hPlaceholdersD: 'صور وأرقام وبيانات تواصل لم تُزوَّد بعد',
  hAlt: 'صور بلا نص بديل', hAltD: 'تحتاج كل صورة نصاً بديلاً بالعربية والإنجليزية',
  hInq: 'استفسارات غير مقروءة', hInqD: 'رسائل من نموذج التواصل',
  sections: 'الأقسام', dragHint: 'اسحب لإعادة الترتيب', left: 'يسار', right: 'يمين',
  lockedTitle: 'نص معتمد ومقفل.', lockedBody: 'هذا النص منقول حرفياً من الملف التعريفي للشركة، وتعديله يحتاج موافقة الإدارة.',
  unlock: 'فتح للتعديل', unlockConfirm: 'هل تريد فتح هذا القسم؟ الرسالة والرؤية والقيم نصوص معتمدة.',
  livePreview: 'معاينة مباشرة — مسودة', desktop: 'حاسوب', mobile: 'جوال',
  pvNote: 'تنتقل المعاينة إلى القسم الذي تحرّره، وتظهر تغييرات المسودة هنا قبل نشرها.',
  replace: 'استبدال الصورة', chooseLibrary: 'اختر من المكتبة', uploading: 'جارٍ الرفع…',
  maxChars: (n) => `الحد الأقصى ${n} حرفاً`, tooLong: '✕ Too long for the layout',
  arMissing: '⚠ النص العربي مفقود — لن يُنشر هذا الحقل', arTooLong: '✕ النص أطول من المساحة',
  figureHint: 'الرقم · التسمية بالإنجليزية · بالعربية', figurePh: 'e.g. 12,500',
  saveDraft: 'حفظ المسودة', saving: 'جارٍ الحفظ…', saved: 'حُفظ في المسودة', discard: 'تجاهل', unsaved: 'تغييرات غير محفوظة',
  moveUp: 'نقل للأعلى', moveDown: 'نقل للأسفل', showHide: (name) => `إظهار ${name} على الموقع`, lockedLabel: 'مقفل', warnLabel: 'يحتاج انتباهاً',
  heroNote: 'تُضاف الطبقة الزيتونية تلقائياً لتبقى النصوص مقروءة.', circleNote: 'تُعرض داخل الدائرة.',
  ratioReq: (ratio, min) => `نسبة ${ratio} · ${min} بكسل على الأقل`,
  imgOk: 'الحجم والنسبة مناسبان', imgSmall: (w, min) => `صغيرة جداً: ${w} بكسل (الحد ${min})`, imgRatio: 'نسبة غير صحيحة — تحتاج قصاً', imgMissing: 'لا توجد صورة بعد',
  altEnPh: 'Alt text (English)', altArPh: 'النص البديل (عربي)',
  searchMedia: 'ابحث في الصور', upload: 'رفع', dropHint: 'أفلت صور JPG أو WebP هنا · 2400 بكسل عرضاً على الأقل للواجهة، و1200 للدوائر',
  all: 'الكل', missingAlt: 'بلا نص بديل', unused: 'غير مستخدمة', cropCircle: 'دائرة 1:1', cropWide: 'واجهة 16:9', cropSquare: 'بطاقة 4:3',
  focal: 'اسحب النقطة الذهبية لتحديد مركز الصورة؛ يبقى في المنتصف في كل قصّ.', altEn: 'النص البديل — إنجليزي', altAr: 'النص البديل — عربي',
  imgRules: 'ضوء ساعة الغروب، ومشاهد وأشخاص حقيقيون من ليبيا. لا صور مخزنية ولا مزارع أوروبية ولا أخضر فاقع. لا يوضع نص على صورة دون الطبقة الزيتونية.',
  usedIn: 'مستخدمة في: ', notUsed: 'غير مستخدمة', placeholderSlot: 'عنصر مؤقت', uploadFailed: 'تعذّر الرفع. استخدم صورة JPG أو WebP أصغر من 40 ميغابايت.', saveDetails: 'حفظ التفاصيل',
  noMedia: 'لا توجد صور مطابقة.',
  email: 'البريد الإلكتروني', phone: 'الهاتف', sentFrom: 'أُرسل من', replyEmail: 'الرد بالبريد', markReplied: 'تمّ الرد', replied: 'تمّ الرد',
  archive: 'أرشفة', unarchive: 'إعادة إلى الصندوق', archived: 'مؤرشفة', notes: 'ملاحظات داخلية', notesPh: 'تظهر لفريق غراس فقط', saveNotes: 'حفظ الملاحظات',
  pageEn: 'الصفحة الإنجليزية', pageAr: 'الصفحة العربية', noSelection: 'اختر رسالة لقراءتها.',
  password: 'كلمة المرور', forgot: 'نسيت كلمة المرور؟', signIn: 'تسجيل الدخول', loginTitle: 'لوحة إدارة المحتوى',
  loginSub: 'أدِر النصوص والصور والأرقام وبيانات التواصل على موقع غراس — بالعربية والإنجليزية.',
  loginNote: 'الدخول مقصور على مسؤولي غراس، ويُطلب التحقق بخطوتين عند أول دخول.',
  forgotNote: 'يعيد مطوّر الموقع تعيين كلمة المرور (npm run admin:reset). تواصل معه لاستعادة الدخول.',
  errCredentials: '✕ البريد الإلكتروني أو كلمة المرور غير صحيحة.', errRate: '✕ محاولات كثيرة. انتظر بضع دقائق ثم حاول مجدداً.',
  errCode: '✕ الرمز غير صحيح. تحقّق من الوقت على هاتفك وحاول مجدداً.', errExpired: '✕ انتهت مهلة تسجيل الدخول. ابدأ من جديد.',
  noAdmin: 'لم يُضبط حساب مسؤول بعد. عيّن ADMIN_EMAIL وADMIN_PASSWORD في بيئة الخادم.',
  twoStep: 'التحقق بخطوتين', enrollIntro: 'امسح هذا الرمز بتطبيق مصادقة (Google Authenticator أو Microsoft Authenticator أو 1Password…) ثم أدخل الرمز المكوّن من 6 أرقام.',
  manualKey: 'أو أدخل هذا المفتاح يدوياً:', codeIntro: 'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.', code: 'رمز التحقق', verify: 'تحقّق', startOver: 'ابدأ من جديد',
  restore: 'استعادة هذه النسخة', restoreConfirm: 'نسخ هذه النسخة إلى المسودة؟ ستُستبدل تغييرات المسودة الحالية، ولن يظهر شيء على الموقع قبل النشر.',
  restored: 'استُعيدت إلى المسودة', before: 'قبل', after: 'بعد', empty: '— (فارغ)', publishedTag: 'منشور', draftTag: 'مسودة',
  noDiffs: 'لا توجد تغييرات حقول لعرضها في هذه النسخة.', moreDiffs: (n) => `+ ${n} تغييرات أخرى`,
  searchPreview: 'معاينة نتيجة البحث', saveSettings: 'حفظ الإعدادات',
  contactTitle: 'بيانات التواصل', contactHint: 'تظهر في التواصل والتذييل · إنجليزي | عربي',
  socialTitle: 'روابط التواصل الاجتماعي', socialHint: 'الروابط الفارغة لا تظهر على الموقع', invalidUrl: '✕ استخدم رابطاً كاملاً يبدأ بـ https://', invalidEmail: '✕ البريد الإلكتروني غير صحيح',
  seoTitle: 'محركات البحث', seoHint: 'العنوان ≤ 60 · الوصف ≤ 155 حرفاً', pageTitle: 'عنوان الصفحة', description: 'الوصف',
  shareImage: 'صورة المشاركة', shareNone: 'لا شيء — اختر صورة 1200 × 630', endorseTitle: 'سطر الانتماء', endorseHint: 'بانتظار الاعتماد — مخفي حتى التفعيل',
  text: 'النص', showOnSite: 'إظهار على الموقع', on: 'تشغيل', off: 'إيقاف', address: 'العنوان', replyTime: 'مدة الرد', replyDays: 'أيام عمل',
  futureRoles: 'الأدوار — لاحقاً', invite: 'دعوة مستخدم', later: 'لاحقاً', allPerms: 'صلاحيات كاملة: التحرير والنشر والإعدادات والاستفسارات', twoFactorOn: 'التحقق بخطوتين مفعّل',
  pubTitle: 'نشر التغييرات على الموقع؟',
  pubBody: (n) => `ستظهر ${n} تغييرات على الصفحتين العربية والإنجليزية. يمكنك استعادة النسخة السابقة من سجل التغييرات في أي وقت.`,
  pubNote: 'ملاحظة للسجل (اختياري)', pubNotePh: 'مثال: إضافة أرقام تقرير الربع الثالث', cancel: 'إلغاء', publishNow: 'انشر الآن', publishing: 'جارٍ النشر…',
  published: 'تمّ النشر وتحدّث الموقع.', nothingToPublish: 'لا توجد تغييرات للنشر.',
  c1ok: 'كل النصوص ضمن حدود التصميم', c1bad: (n) => `${n} حقول أطول من المساحة — صحّحها قبل النشر`,
  cEnBad: (n) => `${n} حقول إنجليزية فارغة — املأها قبل النشر`,
  cUrlBad: (n) => `${n} روابط أو عناوين بريد غير صحيحة`,
  c2ok: 'الصور تستوفي شروط النسبة والحجم', c2bad: (n) => `${n} صور أصغر من الحد أو بنسبة غير صحيحة`,
  c3: (n) => `${n} حقول عربية فارغة — سيبقى النص المنشور`,
  c3ok: 'النص العربي مكتمل', c4: (n) => `${n} عنصراً مؤقتاً ما زال ظاهراً على الموقع`,
  justNow: 'الآن', by: 'بواسطة', you: 'أنت',
  inquiryTypes: { Investment: 'استثمار', Partnership: 'شراكة', Supply: 'توريد', Careers: 'وظائف', Other: 'أخرى' },
  roles: [
    { name: 'محرّر', d: 'يكتب مسودات النصوص والصور، ويتولى المسؤول النشر.', perms: [[true, 'تحرير الأقسام والصور'], [false, 'النشر'], [false, 'النصوص المقفلة']] },
    { name: 'الاستفسارات', d: 'لفريق الشراكات: قراءة رسائل النموذج والرد عليها فقط.', perms: [[true, 'الصندوق'], [false, 'تحرير المحتوى'], [false, 'الإعدادات']] },
    { name: 'مراجع', d: 'يعتمد النصوص العربية والإنجليزية قبل النشر.', perms: [[true, 'التعليق والاعتماد'], [false, 'التحرير'], [false, 'النشر']] },
  ],
};

export const dict = (l: UILang): Dict => (l === 'ar' ? ar : en);

/** Inquiry type pills (from the prototype's TYPES table). */
export const TYPE_COLORS: Record<InquiryType, [string, string]> = {
  Investment: ['#E6EBDA', '#3F5A2A'], Partnership: ['#DDEAEA', '#2F6F73'], Supply: ['#F6EBD2', '#86621E'],
  Careers: ['#EFE7D6', '#1F2A1C'], Other: ['#F3EFE6', '#6B675C'],
};

/** Western numerals in both languages. */
const locale = (l: UILang) => (l === 'ar' ? 'ar-LY-u-nu-latn' : 'en-GB');

export function relTime(iso: string, l: UILang, now = Date.now()): string {
  const d = new Date(iso).getTime();
  const s = Math.round((now - d) / 1000);
  if (s < 60) return dict(l).justNow;
  const rtf = new Intl.RelativeTimeFormat(locale(l), { numeric: 'auto', style: 'short' });
  if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  if (s < 7 * 86400) return rtf.format(-Math.round(s / 86400), 'day');
  return new Intl.DateTimeFormat(locale(l), { day: 'numeric', month: 'short', year: new Date(d).getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' }).format(d);
}

export const fullDate = (iso: string, l: UILang) =>
  new Intl.DateTimeFormat(locale(l), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const initials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
