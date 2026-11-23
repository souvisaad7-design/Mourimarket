// UI strings. Arabic is the default (RTL); French and English are LTR.
const ar = {
  brand: { tagline: 'سوقك الموريتاني في مكان واحد' },
  nav: {
    home: 'الرئيسية', products: 'كل الإعلانات', categories: 'التصنيفات', stores: 'المتاجر',
    post: 'أضف إعلاناً', login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج',
    dashboard: 'لوحة البائع', myListings: 'إعلاناتي', favorites: 'المفضلة', messages: 'الرسائل',
    notifications: 'الإشعارات', profile: 'الملف الشخصي', admin: 'لوحة الإدارة', myStore: 'متجري', menu: 'القائمة',
  },
  common: {
    search: 'بحث', searchPlaceholder: 'عن ماذا تبحث؟ سيارة، هاتف، شقة…', allCategories: 'كل التصنيفات',
    allCities: 'كل المدن', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', send: 'إرسال',
    loading: 'جارٍ التحميل…', viewAll: 'عرض الكل', back: 'رجوع', confirm: 'تأكيد', yes: 'نعم', no: 'لا',
    close: 'إغلاق', next: 'التالي', previous: 'السابق', results: '{n} نتيجة', error: 'حدث خطأ، حاول مجدداً.',
    empty: 'لا توجد عناصر.', saved: 'تم الحفظ بنجاح.', optional: 'اختياري', actions: 'إجراءات',
    new: 'جديد', used: 'مستعمل', sold: 'تم البيع', available: 'متاح', views: '{n} مشاهدة', apply: 'تطبيق',
    reset: 'إعادة ضبط', filters: 'التصفية', page: 'صفحة {p} من {n}', all: 'الكل', since: 'عضو منذ {d}',
  },
  home: {
    heroTitle: 'بِع واشترِ بسهولة في موريتانيا', heroSubtitle: 'آلاف الإعلانات من الأفراد والتجار: سيارات، هواتف، عقارات، أثاث وخدمات — تواصل مباشرة مع البائع.',
    browseCategories: 'تصفح حسب التصنيف', latest: 'أحدث الإعلانات', featuredStores: 'متاجر مميزة',
    ctaTitle: 'لديك شيء للبيع؟', ctaText: 'انشر إعلانك مجاناً في أقل من دقيقتين وابدأ في استقبال رسائل المشترين.',
    statsProducts: 'إعلان نشط', statsUsers: 'مستخدم', statsStores: 'متجر',
    howTitle: 'كيف يعمل {site}؟', how1: 'انشر إعلانك', how1Text: 'أضف الصور والسعر بالأوقية والمدينة.',
    how2: 'تواصل مع المشتري', how2Text: 'استقبل الرسائل وأجب عن الاستفسارات داخل المنصة.',
    how3: 'اتفقا وتمّ البيع', how3Text: 'اتفقا على السعر ومكان التسليم والدفع مباشرة بينكما.',
  },
  products: {
    title: 'كل الإعلانات', sort: 'الترتيب', sortNewest: 'الأحدث', sortOldest: 'الأقدم', sortPriceAsc: 'السعر: من الأقل',
    sortPriceDesc: 'السعر: من الأعلى', minPrice: 'أدنى سعر', maxPrice: 'أعلى سعر', city: 'المدينة', category: 'التصنيف',
    condition: 'الحالة', anyCondition: 'أي حالة', noResults: 'لا توجد إعلانات مطابقة لبحثك.', includeSold: 'إظهار المبيعة أيضاً',
    searchFor: 'نتائج البحث عن «{q}»',
  },
  product: {
    description: 'الوصف', details: 'التفاصيل', postedOn: 'نُشر في', location: 'الموقع', category: 'التصنيف',
    seller: 'البائع', contactSeller: 'راسل البائع', call: 'اتصال', whatsapp: 'واتساب', showPhone: 'إظهار الرقم',
    addFavorite: 'أضف للمفضلة', removeFavorite: 'إزالة من المفضلة', report: 'الإبلاغ عن الإعلان',
    messagePlaceholder: 'اكتب رسالتك للبائع…', defaultMessage: 'السلام عليكم، هل هذا الإعلان ما زال متوفراً؟',
    messageSent: 'تم إرسال رسالتك.', loginToContact: 'سجّل الدخول لمراسلة البائع', yourListing: 'هذا إعلانك',
    safety: 'نصائح للأمان: قابل البائع في مكان عام، افحص المنتج قبل الدفع، ولا ترسل أموالاً مقدماً.',
    paymentNote: 'الدفع والتسليم يتمان مباشرة بين المشتري والبائع خارج المنصة.',
    pendingNotice: 'هذا الإعلان قيد المراجعة ولن يظهر للعموم حتى يوافق عليه المدير.',
    rejectedNotice: 'تم رفض هذا الإعلان. السبب: {reason}', soldNotice: 'تم بيع هذا المنتج.',
    rateSeller: 'قيّم البائع', reviewThanks: 'شكراً على تقييمك!', yourReview: 'تقييمك', similar: 'إعلانات مشابهة',
    reviews: '{n} تقييم', noRating: 'لا توجد تقييمات بعد', viewProfile: 'عرض ملف البائع', visitStore: 'زيارة المتجر',
  },
  report: {
    title: 'الإبلاغ عن إعلان', reason: 'السبب', details: 'تفاصيل إضافية', submit: 'إرسال البلاغ', thanks: 'شكراً، سيراجع فريقنا البلاغ.',
    reasons: { scam: 'احتيال أو نصب', prohibited: 'منتج ممنوع', wrong_category: 'تصنيف خاطئ', duplicate: 'إعلان مكرر', offensive: 'محتوى مسيء', other: 'سبب آخر' },
  },
  auth: {
    loginTitle: 'مرحباً بعودتك', loginSubtitle: 'سجّل الدخول لإدارة إعلاناتك ورسائلك', registerTitle: 'أنشئ حسابك',
    registerSubtitle: 'انضم إلى {site} وابدأ البيع والشراء', name: 'الاسم الكامل', email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف', password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور', accountType: 'نوع الحساب',
    individual: 'فرد', individualText: 'لبيع وشراء الأغراض الشخصية', merchant: 'تاجر', merchantText: 'متجر خاص وعرض منتجات تجارية',
    forgot: 'نسيت كلمة المرور؟', noAccount: 'ليس لديك حساب؟', haveAccount: 'لديك حساب بالفعل؟',
    forgotTitle: 'استعادة كلمة المرور', forgotText: 'أدخل بريدك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
    sendLink: 'إرسال الرابط', linkSent: 'إذا كان البريد مسجلاً، فستصلك رسالة تحتوي على رابط الاستعادة.',
    devLink: 'وضع التطوير — رابط الاستعادة:', resetTitle: 'تعيين كلمة مرور جديدة', newPassword: 'كلمة المرور الجديدة',
    resetDone: 'تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.', passwordMismatch: 'كلمتا المرور غير متطابقتين',
    terms: 'بإنشاء حساب، فإنك توافق على شروط الاستخدام وسياسة النشر.',
  },
  profile: {
    title: 'الملف الشخصي', personal: 'المعلومات الشخصية', bio: 'نبذة', avatar: 'الصورة الشخصية',
    changePassword: 'تغيير كلمة المرور', currentPassword: 'كلمة المرور الحالية', passwordChanged: 'تم تغيير كلمة المرور.',
    becomeMerchant: 'التحويل إلى حساب تاجر لإنشاء متجر',
  },
  dashboard: {
    title: 'لوحة البائع', welcome: 'مرحباً، {name}', totalListings: 'إجمالي الإعلانات', live: 'منشورة', pending: 'قيد المراجعة',
    soldCount: 'مبيعة', totalViews: 'المشاهدات', myListings: 'إعلاناتي', noListings: 'لم تنشر أي إعلان بعد.',
    postFirst: 'انشر إعلانك الأول', markSold: 'تم البيع', markAvailable: 'إعادة للعرض', confirmDelete: 'هل تريد حذف هذا الإعلان نهائياً؟',
    soldTo: 'لمن بعت المنتج؟', soldToHelp: 'اختيار المشتري يوثّق البيع ويسمح له بتقييمك.', soldToNone: 'شخص من خارج المنصة',
    status: { pending: 'قيد المراجعة', approved: 'منشور', rejected: 'مرفوض' }, favoritesCount: '{n} في المفضلة', chats: '{n} محادثة',
  },
  form: {
    newTitle: 'إضافة إعلان جديد', editTitle: 'تعديل الإعلان', title: 'عنوان الإعلان', titlePh: 'مثال: تويوتا كورولا 2015',
    description: 'الوصف التفصيلي', descriptionPh: 'اذكر الحالة والمواصفات وأي معلومات تهم المشتري…', price: 'السعر (أوقية جديدة MRU)',
    category: 'التصنيف', choose: 'اختر…', city: 'المدينة / المنطقة', condition: 'حالة المنتج', images: 'الصور',
    imagesHelp: 'حتى {n} صور (JPG أو PNG أو WebP). يتم ضغط الصور تلقائياً. الصورة الأولى هي الغلاف.', addImages: 'إضافة صور',
    publish: 'نشر الإعلان', update: 'حفظ التعديلات', reviewNote: 'سيتم مراجعة الإعلان من طرف الإدارة قبل نشره.',
    created: 'تم إرسال إعلانك! سيظهر بعد المراجعة.', createdLive: 'تم نشر إعلانك!', updated: 'تم حفظ التعديلات.', cover: 'الغلاف',
  },
  favorites: { title: 'المفضلة', empty: 'لم تحفظ أي إعلان بعد. اضغط على ♥ لحفظ الإعلانات التي تعجبك.' },
  messages: {
    title: 'الرسائل', empty: 'لا توجد محادثات بعد.', select: 'اختر محادثة لعرضها', placeholder: 'اكتب رسالة…',
    about: 'بخصوص: {title}', deletedProduct: 'إعلان محذوف', you: 'أنت',
  },
  notifications: {
    title: 'الإشعارات', empty: 'لا توجد إشعارات.', markAll: 'تعليم الكل كمقروء',
    types: {
      new_message: '{from} أرسل لك رسالة بخصوص «{title}»', seller_reply: 'ردّ البائع {from} على رسالتك بخصوص «{title}»',
      product_approved: 'تمت الموافقة على إعلانك «{title}» وهو الآن منشور', product_rejected: 'تم رفض إعلانك «{title}»: {reason}',
      product_deleted: 'تم حذف إعلانك «{title}» من طرف الإدارة', sale_recorded: 'تم توثيق شرائك لـ«{title}». يمكنك الآن تقييم البائع.',
      new_review: 'حصلت على تقييم جديد ({rating}★) على «{title}»', store_enabled: 'تم تفعيل متجرك «{name}»', store_disabled: 'تم تعطيل متجرك «{name}»',
    },
  },
  store: {
    title: 'المتاجر', subtitle: 'متاجر التجار الموثوقين على {site}', empty: 'لا توجد متاجر بعد.', products: '{n} منتج',
    settings: 'إعدادات المتجر', name: 'اسم المتجر', logo: 'شعار المتجر', description: 'وصف النشاط التجاري', phone: 'الهاتف',
    whatsapp: 'واتساب', email: 'البريد الإلكتروني', city: 'المدينة', create: 'إنشاء المتجر', view: 'عرض المتجر',
    merchantOnly: 'المتاجر متاحة لحسابات التجار فقط. يمكنك تغيير نوع حسابك من الملف الشخصي.', contact: 'معلومات التواصل',
    listings: 'منتجات المتجر', owner: 'المالك',
  },
  seller: { listings: 'إعلانات البائع', reviews: 'التقييمات', noReviews: 'لا توجد تقييمات بعد.', sold: '{n} عملية بيع', merchant: 'تاجر' },
  review: { rating: 'التقييم', comment: 'تعليق', submit: 'إرسال التقييم', verified: 'شراء موثّق' },
  admin: {
    title: 'لوحة الإدارة', overview: 'نظرة عامة', users: 'المستخدمون', listings: 'الإعلانات', categories: 'التصنيفات',
    reports: 'البلاغات', stores: 'المتاجر', approve: 'موافقة', reject: 'رفض', rejectReason: 'سبب الرفض', disable: 'تعطيل',
    enable: 'تفعيل', makeAdmin: 'ترقية لمدير', removeAdmin: 'إزالة صلاحية المدير', resolve: 'تمت المعالجة', dismiss: 'تجاهل',
    reopen: 'إعادة فتح', pendingQueue: 'إعلانات بانتظار المراجعة', openReports: 'بلاغات مفتوحة', newUsers7d: 'مستخدمون جدد (7 أيام)',
    activity: 'النشاط خلال 14 يوماً', byCategory: 'الإعلانات حسب التصنيف', byCity: 'الإعلانات حسب المدينة', messagesCount: 'رسائل',
    totalViews: 'المشاهدات', merchants: 'تجار', role: 'الدور', active: 'نشط', disabled: 'معطّل', joined: 'تاريخ التسجيل',
    reporter: 'المُبلِّغ', reason: 'السبب', addCategory: 'إضافة تصنيف', slug: 'المعرّف (slug)', nameAr: 'الاسم بالعربية',
    nameFr: 'الاسم بالفرنسية', nameEn: 'الاسم بالإنجليزية', icon: 'أيقونة', order: 'الترتيب', owner: 'المالك',
    confirmDeleteCategory: 'حذف هذا التصنيف؟ لا يمكن حذف تصنيف يحتوي على إعلانات.', newListings: 'إعلانات جديدة', newUsers: 'مستخدمون جدد',
    adminRole: 'مدير', userRole: 'مستخدم', open: 'مفتوحة', resolved: 'معالجة', dismissed: 'متجاهلة', deleteListing: 'حذف الإعلان',
  },
  footer: {
    about: 'منصة موريتانية للبيع والشراء عبر الإنترنت تجمع الأفراد والتجار في مكان واحد.', links: 'الأقسام', help: 'المساعدة',
    safety: 'نصائح الأمان', guide: 'دليل الاستخدام', rights: 'جميع الحقوق محفوظة.',
  },
  errors: {
    not_found: 'العنصر غير موجود.', product_not_found: 'الإعلان غير موجود أو لم يعد متاحاً.', invalid_credentials: 'البريد أو كلمة المرور غير صحيحة.',
    email_taken: 'هذا البريد مستخدم بالفعل.', account_disabled: 'تم تعطيل هذا الحساب.', unauthorized: 'يجب تسجيل الدخول.',
    invalid_token: 'انتهت الجلسة، سجّل الدخول من جديد.', forbidden: 'ليست لديك صلاحية.', validation_error: 'تحقق من الحقول المطلوبة.',
    wrong_password: 'كلمة المرور الحالية غير صحيحة.', invalid_or_expired_token: 'الرابط غير صالح أو منتهي الصلاحية.',
    too_many_requests: 'طلبات كثيرة، انتظر قليلاً.', image_too_large: 'حجم الصورة أكبر من 5 ميغابايت.', too_many_images: 'عدد الصور كبير جداً.',
    invalid_image_type: 'نوع الصورة غير مدعوم.', cannot_message_self: 'لا يمكنك مراسلة نفسك.', already_reported: 'لقد أبلغت عن هذا الإعلان مسبقاً.',
    already_reviewed: 'تم تقييم هذه العملية مسبقاً.', review_requires_sale: 'التقييم متاح فقط بعد عملية بيع موثقة.', merchant_only: 'خاص بحسابات التجار.',
    category_in_use: 'لا يمكن حذف تصنيف يحتوي على إعلانات.', slug_taken: 'المعرّف مستخدم.', cannot_demote_self: 'لا يمكنك تعطيل حسابك أو إزالة صلاحيتك.',
    buyer_not_in_conversations: 'هذا المستخدم لم يراسلك بخصوص الإعلان.', server_error: 'خطأ في الخادم.', network: 'تعذر الاتصال بالخادم.',
  },
  fields: {
    required: 'حقل مطلوب', min_2: 'حرفان على الأقل', min_3: '3 أحرف على الأقل', min_8: '8 أحرف على الأقل', min_10: '10 أحرف على الأقل',
    min_0: 'يجب أن يكون صفراً أو أكثر', invalid_email: 'بريد إلكتروني غير صالح', invalid_phone: 'رقم هاتف غير صالح',
    invalid_number: 'رقم غير صالح', image_required: 'أضف صورة واحدة على الأقل', too_many_images: 'عدد الصور كبير جداً', too_long: 'النص طويل جداً',
    invalid_slug: 'أحرف لاتينية صغيرة وأرقام و- فقط',
  },
  notFound: { title: 'الصفحة غير موجودة', text: 'ربما تم نقل الصفحة أو حذفها.', home: 'العودة للرئيسية' },
};

const fr = {
  brand: { tagline: 'Votre marché mauritanien en un seul lieu' },
  nav: {
    home: 'Accueil', products: 'Toutes les annonces', categories: 'Catégories', stores: 'Boutiques', post: 'Publier une annonce',
    login: 'Se connecter', register: 'Créer un compte', logout: 'Se déconnecter', dashboard: 'Espace vendeur', myListings: 'Mes annonces',
    favorites: 'Favoris', messages: 'Messages', notifications: 'Notifications', profile: 'Profil', admin: 'Administration', myStore: 'Ma boutique', menu: 'Menu',
  },
  common: {
    search: 'Rechercher', searchPlaceholder: 'Que cherchez-vous ? Voiture, téléphone, appartement…', allCategories: 'Toutes les catégories',
    allCities: 'Toutes les villes', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', send: 'Envoyer',
    loading: 'Chargement…', viewAll: 'Voir tout', back: 'Retour', confirm: 'Confirmer', yes: 'Oui', no: 'Non', close: 'Fermer',
    next: 'Suivant', previous: 'Précédent', results: '{n} résultat(s)', error: 'Une erreur est survenue, réessayez.', empty: 'Aucun élément.',
    saved: 'Enregistré avec succès.', optional: 'facultatif', actions: 'Actions', new: 'Neuf', used: 'Occasion', sold: 'Vendu',
    available: 'Disponible', views: '{n} vues', apply: 'Appliquer', reset: 'Réinitialiser', filters: 'Filtres', page: 'Page {p} sur {n}',
    all: 'Tous', since: 'Membre depuis {d}',
  },
  home: {
    heroTitle: 'Achetez et vendez facilement en Mauritanie', heroSubtitle: 'Des milliers d’annonces de particuliers et de commerçants : véhicules, téléphones, immobilier, meubles et services — contactez directement le vendeur.',
    browseCategories: 'Parcourir par catégorie', latest: 'Dernières annonces', featuredStores: 'Boutiques à la une',
    ctaTitle: 'Vous avez quelque chose à vendre ?', ctaText: 'Publiez votre annonce gratuitement en moins de deux minutes et recevez les messages des acheteurs.',
    statsProducts: 'annonces actives', statsUsers: 'utilisateurs', statsStores: 'boutiques', howTitle: 'Comment fonctionne {site} ?',
    how1: 'Publiez votre annonce', how1Text: 'Ajoutez photos, prix en MRU et ville.', how2: 'Échangez avec l’acheteur', how2Text: 'Recevez les messages et répondez sur la plateforme.',
    how3: 'Concluez la vente', how3Text: 'Convenez du prix, du lieu de remise et du paiement entre vous.',
  },
  products: {
    title: 'Toutes les annonces', sort: 'Trier', sortNewest: 'Plus récentes', sortOldest: 'Plus anciennes', sortPriceAsc: 'Prix croissant',
    sortPriceDesc: 'Prix décroissant', minPrice: 'Prix min', maxPrice: 'Prix max', city: 'Ville', category: 'Catégorie', condition: 'État',
    anyCondition: 'Tous états', noResults: 'Aucune annonce ne correspond à votre recherche.', includeSold: 'Afficher aussi les vendus', searchFor: 'Résultats pour « {q} »',
  },
  product: {
    description: 'Description', details: 'Détails', postedOn: 'Publiée le', location: 'Localisation', category: 'Catégorie', seller: 'Vendeur',
    contactSeller: 'Contacter le vendeur', call: 'Appeler', whatsapp: 'WhatsApp', showPhone: 'Afficher le numéro', addFavorite: 'Ajouter aux favoris',
    removeFavorite: 'Retirer des favoris', report: 'Signaler l’annonce', messagePlaceholder: 'Écrivez votre message au vendeur…',
    defaultMessage: 'Bonjour, cette annonce est-elle toujours disponible ?', messageSent: 'Message envoyé.', loginToContact: 'Connectez-vous pour contacter le vendeur',
    yourListing: 'C’est votre annonce', safety: 'Conseils de sécurité : rencontrez le vendeur dans un lieu public, vérifiez l’article avant de payer et n’envoyez jamais d’argent à l’avance.',
    paymentNote: 'Le paiement et la livraison se font directement entre acheteur et vendeur, hors plateforme.',
    pendingNotice: 'Cette annonce est en cours de validation et n’est pas encore visible publiquement.', rejectedNotice: 'Annonce refusée. Motif : {reason}',
    soldNotice: 'Cet article a été vendu.', rateSeller: 'Évaluer le vendeur', reviewThanks: 'Merci pour votre avis !', yourReview: 'Votre avis', similar: 'Annonces similaires',
    reviews: '{n} avis', noRating: 'Pas encore d’avis', viewProfile: 'Voir le profil', visitStore: 'Visiter la boutique',
  },
  report: {
    title: 'Signaler une annonce', reason: 'Motif', details: 'Détails', submit: 'Envoyer le signalement', thanks: 'Merci, notre équipe va examiner ce signalement.',
    reasons: { scam: 'Arnaque', prohibited: 'Article interdit', wrong_category: 'Mauvaise catégorie', duplicate: 'Annonce en double', offensive: 'Contenu offensant', other: 'Autre' },
  },
  auth: {
    loginTitle: 'Bon retour', loginSubtitle: 'Connectez-vous pour gérer vos annonces et messages', registerTitle: 'Créez votre compte',
    registerSubtitle: 'Rejoignez {site} pour acheter et vendre', name: 'Nom complet', email: 'E-mail', phone: 'Téléphone', password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe', accountType: 'Type de compte', individual: 'Particulier', individualText: 'Vendre et acheter des biens personnels',
    merchant: 'Commerçant', merchantText: 'Boutique dédiée et produits professionnels', forgot: 'Mot de passe oublié ?', noAccount: 'Pas encore de compte ?',
    haveAccount: 'Déjà un compte ?', forgotTitle: 'Mot de passe oublié', forgotText: 'Entrez votre e-mail, nous vous enverrons un lien de réinitialisation.',
    sendLink: 'Envoyer le lien', linkSent: 'Si cet e-mail est enregistré, vous recevrez un lien de réinitialisation.', devLink: 'Mode développement — lien :',
    resetTitle: 'Nouveau mot de passe', newPassword: 'Nouveau mot de passe', resetDone: 'Mot de passe modifié. Vous pouvez vous connecter.',
    passwordMismatch: 'Les mots de passe ne correspondent pas', terms: 'En créant un compte, vous acceptez les conditions d’utilisation.',
  },
  profile: {
    title: 'Profil', personal: 'Informations personnelles', bio: 'Bio', avatar: 'Photo de profil', changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel', passwordChanged: 'Mot de passe modifié.', becomeMerchant: 'Passer en compte commerçant pour créer une boutique',
  },
  dashboard: {
    title: 'Espace vendeur', welcome: 'Bonjour, {name}', totalListings: 'Total annonces', live: 'En ligne', pending: 'En validation', soldCount: 'Vendues',
    totalViews: 'Vues', myListings: 'Mes annonces', noListings: 'Vous n’avez encore publié aucune annonce.', postFirst: 'Publier ma première annonce',
    markSold: 'Marquer vendu', markAvailable: 'Remettre en vente', confirmDelete: 'Supprimer définitivement cette annonce ?', soldTo: 'À qui avez-vous vendu ?',
    soldToHelp: 'Choisir l’acheteur documente la vente et lui permet de vous évaluer.', soldToNone: 'Quelqu’un hors plateforme',
    status: { pending: 'En validation', approved: 'En ligne', rejected: 'Refusée' }, favoritesCount: '{n} favoris', chats: '{n} conversations',
  },
  form: {
    newTitle: 'Nouvelle annonce', editTitle: 'Modifier l’annonce', title: 'Titre', titlePh: 'Ex. : Toyota Corolla 2015', description: 'Description détaillée',
    descriptionPh: 'État, caractéristiques et toute information utile…', price: 'Prix (MRU)', category: 'Catégorie', choose: 'Choisir…', city: 'Ville / région',
    condition: 'État', images: 'Photos', imagesHelp: 'Jusqu’à {n} photos (JPG, PNG ou WebP), compressées automatiquement. La première est la couverture.',
    addImages: 'Ajouter des photos', publish: 'Publier', update: 'Enregistrer', reviewNote: 'L’annonce sera vérifiée par l’équipe avant publication.',
    created: 'Annonce envoyée ! Elle sera visible après validation.', createdLive: 'Annonce publiée !', updated: 'Modifications enregistrées.', cover: 'Couverture',
  },
  favorites: { title: 'Favoris', empty: 'Aucun favori. Touchez ♥ pour sauvegarder une annonce.' },
  messages: { title: 'Messages', empty: 'Aucune conversation.', select: 'Sélectionnez une conversation', placeholder: 'Écrire un message…', about: 'Annonce : {title}', deletedProduct: 'Annonce supprimée', you: 'Vous' },
  notifications: {
    title: 'Notifications', empty: 'Aucune notification.', markAll: 'Tout marquer comme lu',
    types: {
      new_message: '{from} vous a écrit à propos de « {title} »', seller_reply: 'Le vendeur {from} a répondu au sujet de « {title} »',
      product_approved: 'Votre annonce « {title} » a été validée et est en ligne', product_rejected: 'Votre annonce « {title} » a été refusée : {reason}',
      product_deleted: 'Votre annonce « {title} » a été supprimée par l’administration', sale_recorded: 'Votre achat de « {title} » est documenté. Vous pouvez évaluer le vendeur.',
      new_review: 'Nouvel avis ({rating}★) sur « {title} »', store_enabled: 'Votre boutique « {name} » est activée', store_disabled: 'Votre boutique « {name} » a été désactivée',
    },
  },
  store: {
    title: 'Boutiques', subtitle: 'Les boutiques des commerçants sur {site}', empty: 'Aucune boutique.', products: '{n} produits', settings: 'Paramètres de la boutique',
    name: 'Nom de la boutique', logo: 'Logo', description: 'Description de l’activité', phone: 'Téléphone', whatsapp: 'WhatsApp', email: 'E-mail', city: 'Ville',
    create: 'Créer la boutique', view: 'Voir la boutique', merchantOnly: 'Les boutiques sont réservées aux comptes commerçants. Changez votre type de compte dans votre profil.',
    contact: 'Contact', listings: 'Produits de la boutique', owner: 'Propriétaire',
  },
  seller: { listings: 'Annonces du vendeur', reviews: 'Avis', noReviews: 'Pas encore d’avis.', sold: '{n} ventes', merchant: 'Commerçant' },
  review: { rating: 'Note', comment: 'Commentaire', submit: 'Envoyer l’avis', verified: 'Achat vérifié' },
  admin: {
    title: 'Administration', overview: 'Vue d’ensemble', users: 'Utilisateurs', listings: 'Annonces', categories: 'Catégories', reports: 'Signalements',
    stores: 'Boutiques', approve: 'Valider', reject: 'Refuser', rejectReason: 'Motif du refus', disable: 'Désactiver', enable: 'Activer', makeAdmin: 'Rendre admin',
    removeAdmin: 'Retirer admin', resolve: 'Traité', dismiss: 'Ignorer', reopen: 'Rouvrir', pendingQueue: 'Annonces en attente', openReports: 'Signalements ouverts',
    newUsers7d: 'Nouveaux utilisateurs (7 j)', activity: 'Activité sur 14 jours', byCategory: 'Annonces par catégorie', byCity: 'Annonces par ville', messagesCount: 'Messages',
    totalViews: 'Vues', merchants: 'Commerçants', role: 'Rôle', active: 'Actif', disabled: 'Désactivé', joined: 'Inscription', reporter: 'Signalé par', reason: 'Motif',
    addCategory: 'Ajouter une catégorie', slug: 'Identifiant (slug)', nameAr: 'Nom (arabe)', nameFr: 'Nom (français)', nameEn: 'Nom (anglais)', icon: 'Icône', order: 'Ordre',
    owner: 'Propriétaire', confirmDeleteCategory: 'Supprimer cette catégorie ? Impossible si elle contient des annonces.', newListings: 'Nouvelles annonces', newUsers: 'Nouveaux utilisateurs',
    adminRole: 'Admin', userRole: 'Utilisateur', open: 'Ouverts', resolved: 'Traités', dismissed: 'Ignorés', deleteListing: 'Supprimer l’annonce',
  },
  footer: { about: 'Plateforme mauritanienne d’achat et de vente en ligne réunissant particuliers et commerçants.', links: 'Rubriques', help: 'Aide', safety: 'Conseils de sécurité', guide: 'Guide d’utilisation', rights: 'Tous droits réservés.' },
  errors: {
    not_found: 'Élément introuvable.', product_not_found: 'Annonce introuvable ou indisponible.', invalid_credentials: 'E-mail ou mot de passe incorrect.',
    email_taken: 'Cet e-mail est déjà utilisé.', account_disabled: 'Ce compte est désactivé.', unauthorized: 'Connexion requise.', invalid_token: 'Session expirée, reconnectez-vous.',
    forbidden: 'Accès refusé.', validation_error: 'Vérifiez les champs.', wrong_password: 'Mot de passe actuel incorrect.', invalid_or_expired_token: 'Lien invalide ou expiré.',
    too_many_requests: 'Trop de requêtes, patientez.', image_too_large: 'Image supérieure à 5 Mo.', too_many_images: 'Trop de photos.', invalid_image_type: 'Format d’image non supporté.',
    cannot_message_self: 'Vous ne pouvez pas vous écrire.', already_reported: 'Vous avez déjà signalé cette annonce.', already_reviewed: 'Cette vente a déjà été évaluée.',
    review_requires_sale: 'L’avis n’est possible qu’après une vente documentée.', merchant_only: 'Réservé aux commerçants.', category_in_use: 'Catégorie utilisée par des annonces.',
    slug_taken: 'Identifiant déjà utilisé.', cannot_demote_self: 'Vous ne pouvez pas vous désactiver vous-même.', buyer_not_in_conversations: 'Cet utilisateur ne vous a pas contacté pour cette annonce.',
    server_error: 'Erreur serveur.', network: 'Impossible de joindre le serveur.',
  },
  fields: {
    required: 'Champ requis', min_2: '2 caractères minimum', min_3: '3 caractères minimum', min_8: '8 caractères minimum', min_10: '10 caractères minimum',
    min_0: 'Doit être positif', invalid_email: 'E-mail invalide', invalid_phone: 'Numéro invalide', invalid_number: 'Nombre invalide',
    image_required: 'Ajoutez au moins une photo', too_many_images: 'Trop de photos', too_long: 'Texte trop long', invalid_slug: 'Minuscules, chiffres et - uniquement',
  },
  notFound: { title: 'Page introuvable', text: 'La page a peut-être été déplacée ou supprimée.', home: 'Retour à l’accueil' },
};

const en = {
  brand: { tagline: 'Your Mauritanian market in one place' },
  nav: {
    home: 'Home', products: 'All listings', categories: 'Categories', stores: 'Stores', post: 'Post an ad', login: 'Log in', register: 'Sign up',
    logout: 'Log out', dashboard: 'Seller dashboard', myListings: 'My listings', favorites: 'Favorites', messages: 'Messages', notifications: 'Notifications',
    profile: 'Profile', admin: 'Admin', myStore: 'My store', menu: 'Menu',
  },
  common: {
    search: 'Search', searchPlaceholder: 'What are you looking for? Car, phone, apartment…', allCategories: 'All categories', allCities: 'All cities',
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', send: 'Send', loading: 'Loading…', viewAll: 'View all', back: 'Back', confirm: 'Confirm',
    yes: 'Yes', no: 'No', close: 'Close', next: 'Next', previous: 'Previous', results: '{n} results', error: 'Something went wrong, please try again.',
    empty: 'Nothing here.', saved: 'Saved successfully.', optional: 'optional', actions: 'Actions', new: 'New', used: 'Used', sold: 'Sold', available: 'Available',
    views: '{n} views', apply: 'Apply', reset: 'Reset', filters: 'Filters', page: 'Page {p} of {n}', all: 'All', since: 'Member since {d}',
  },
  home: {
    heroTitle: 'Buy and sell easily in Mauritania', heroSubtitle: 'Thousands of listings from individuals and merchants: vehicles, phones, real estate, furniture and services — talk directly to the seller.',
    browseCategories: 'Browse by category', latest: 'Latest listings', featuredStores: 'Featured stores', ctaTitle: 'Got something to sell?',
    ctaText: 'Post your ad for free in under two minutes and start receiving messages from buyers.', statsProducts: 'active listings', statsUsers: 'users',
    statsStores: 'stores', howTitle: 'How {site} works', how1: 'Post your ad', how1Text: 'Add photos, a price in MRU and your city.',
    how2: 'Chat with buyers', how2Text: 'Receive messages and answer questions on the platform.', how3: 'Close the deal', how3Text: 'Agree on price, hand-over place and payment between you.',
  },
  products: {
    title: 'All listings', sort: 'Sort', sortNewest: 'Newest', sortOldest: 'Oldest', sortPriceAsc: 'Price: low to high', sortPriceDesc: 'Price: high to low',
    minPrice: 'Min price', maxPrice: 'Max price', city: 'City', category: 'Category', condition: 'Condition', anyCondition: 'Any condition',
    noResults: 'No listings match your search.', includeSold: 'Include sold items', searchFor: 'Results for “{q}”',
  },
  product: {
    description: 'Description', details: 'Details', postedOn: 'Posted on', location: 'Location', category: 'Category', seller: 'Seller', contactSeller: 'Message seller',
    call: 'Call', whatsapp: 'WhatsApp', showPhone: 'Show number', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites', report: 'Report listing',
    messagePlaceholder: 'Write your message to the seller…', defaultMessage: 'Hello, is this still available?', messageSent: 'Message sent.',
    loginToContact: 'Log in to message the seller', yourListing: 'This is your listing',
    safety: 'Safety tips: meet in a public place, inspect the item before paying, and never send money in advance.',
    paymentNote: 'Payment and delivery are arranged directly between buyer and seller, outside the platform.',
    pendingNotice: 'This listing is under review and is not public yet.', rejectedNotice: 'This listing was rejected. Reason: {reason}', soldNotice: 'This item has been sold.',
    rateSeller: 'Rate the seller', reviewThanks: 'Thanks for your review!', yourReview: 'Your review', similar: 'Similar listings', reviews: '{n} reviews',
    noRating: 'No reviews yet', viewProfile: 'View profile', visitStore: 'Visit store',
  },
  report: {
    title: 'Report a listing', reason: 'Reason', details: 'Details', submit: 'Submit report', thanks: 'Thanks, our team will review this report.',
    reasons: { scam: 'Scam or fraud', prohibited: 'Prohibited item', wrong_category: 'Wrong category', duplicate: 'Duplicate listing', offensive: 'Offensive content', other: 'Other' },
  },
  auth: {
    loginTitle: 'Welcome back', loginSubtitle: 'Log in to manage your listings and messages', registerTitle: 'Create your account', registerSubtitle: 'Join {site} to buy and sell',
    name: 'Full name', email: 'Email', phone: 'Phone number', password: 'Password', confirmPassword: 'Confirm password', accountType: 'Account type',
    individual: 'Individual', individualText: 'Buy and sell personal items', merchant: 'Merchant', merchantText: 'Your own store and business listings',
    forgot: 'Forgot password?', noAccount: 'No account yet?', haveAccount: 'Already have an account?', forgotTitle: 'Reset your password',
    forgotText: 'Enter your email and we will send you a reset link.', sendLink: 'Send link', linkSent: 'If that email is registered, a reset link is on its way.',
    devLink: 'Development mode — reset link:', resetTitle: 'Set a new password', newPassword: 'New password', resetDone: 'Password changed. You can log in now.',
    passwordMismatch: 'Passwords do not match', terms: 'By creating an account you agree to the terms of use.',
  },
  profile: {
    title: 'Profile', personal: 'Personal information', bio: 'Bio', avatar: 'Profile photo', changePassword: 'Change password', currentPassword: 'Current password',
    passwordChanged: 'Password changed.', becomeMerchant: 'Switch to a merchant account to open a store',
  },
  dashboard: {
    title: 'Seller dashboard', welcome: 'Hello, {name}', totalListings: 'Total listings', live: 'Live', pending: 'Under review', soldCount: 'Sold', totalViews: 'Views',
    myListings: 'My listings', noListings: 'You have not posted anything yet.', postFirst: 'Post your first ad', markSold: 'Mark sold', markAvailable: 'Relist',
    confirmDelete: 'Delete this listing permanently?', soldTo: 'Who did you sell to?', soldToHelp: 'Picking the buyer documents the sale and lets them review you.',
    soldToNone: 'Someone outside the platform', status: { pending: 'Under review', approved: 'Live', rejected: 'Rejected' }, favoritesCount: '{n} favorites', chats: '{n} chats',
  },
  form: {
    newTitle: 'Post a new ad', editTitle: 'Edit listing', title: 'Title', titlePh: 'e.g. Toyota Corolla 2015', description: 'Detailed description',
    descriptionPh: 'Condition, specs and anything a buyer should know…', price: 'Price (MRU)', category: 'Category', choose: 'Choose…', city: 'City / area',
    condition: 'Condition', images: 'Photos', imagesHelp: 'Up to {n} photos (JPG, PNG or WebP), compressed automatically. The first one is the cover.',
    addImages: 'Add photos', publish: 'Publish', update: 'Save changes', reviewNote: 'Your ad will be reviewed by our team before it goes live.',
    created: 'Ad submitted! It will appear after review.', createdLive: 'Your ad is live!', updated: 'Changes saved.', cover: 'Cover',
  },
  favorites: { title: 'Favorites', empty: 'No favorites yet. Tap ♥ to save listings you like.' },
  messages: { title: 'Messages', empty: 'No conversations yet.', select: 'Select a conversation', placeholder: 'Write a message…', about: 'About: {title}', deletedProduct: 'Deleted listing', you: 'You' },
  notifications: {
    title: 'Notifications', empty: 'No notifications.', markAll: 'Mark all as read',
    types: {
      new_message: '{from} sent you a message about “{title}”', seller_reply: 'Seller {from} replied about “{title}”',
      product_approved: 'Your listing “{title}” was approved and is live', product_rejected: 'Your listing “{title}” was rejected: {reason}',
      product_deleted: 'Your listing “{title}” was removed by an admin', sale_recorded: 'Your purchase of “{title}” was recorded. You can now review the seller.',
      new_review: 'New review ({rating}★) on “{title}”', store_enabled: 'Your store “{name}” was enabled', store_disabled: 'Your store “{name}” was disabled',
    },
  },
  store: {
    title: 'Stores', subtitle: 'Merchant stores on {site}', empty: 'No stores yet.', products: '{n} products', settings: 'Store settings', name: 'Store name',
    logo: 'Logo', description: 'Business description', phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email', city: 'City', create: 'Create store', view: 'View store',
    merchantOnly: 'Stores are for merchant accounts. You can change your account type in your profile.', contact: 'Contact', listings: 'Store products', owner: 'Owner',
  },
  seller: { listings: 'Seller listings', reviews: 'Reviews', noReviews: 'No reviews yet.', sold: '{n} sales', merchant: 'Merchant' },
  review: { rating: 'Rating', comment: 'Comment', submit: 'Submit review', verified: 'Verified purchase' },
  admin: {
    title: 'Admin', overview: 'Overview', users: 'Users', listings: 'Listings', categories: 'Categories', reports: 'Reports', stores: 'Stores', approve: 'Approve',
    reject: 'Reject', rejectReason: 'Rejection reason', disable: 'Disable', enable: 'Enable', makeAdmin: 'Make admin', removeAdmin: 'Remove admin', resolve: 'Resolved',
    dismiss: 'Dismiss', reopen: 'Reopen', pendingQueue: 'Listings awaiting review', openReports: 'Open reports', newUsers7d: 'New users (7 days)',
    activity: 'Activity, last 14 days', byCategory: 'Listings by category', byCity: 'Listings by city', messagesCount: 'Messages', totalViews: 'Views',
    merchants: 'Merchants', role: 'Role', active: 'Active', disabled: 'Disabled', joined: 'Joined', reporter: 'Reporter', reason: 'Reason', addCategory: 'Add category',
    slug: 'Slug', nameAr: 'Name (Arabic)', nameFr: 'Name (French)', nameEn: 'Name (English)', icon: 'Icon', order: 'Order', owner: 'Owner',
    confirmDeleteCategory: 'Delete this category? Categories with listings cannot be deleted.', newListings: 'New listings', newUsers: 'New users',
    adminRole: 'Admin', userRole: 'User', open: 'Open', resolved: 'Resolved', dismissed: 'Dismissed', deleteListing: 'Delete listing',
  },
  footer: { about: 'A Mauritanian online marketplace bringing individuals and merchants together in one place.', links: 'Sections', help: 'Help', safety: 'Safety tips', guide: 'User guide', rights: 'All rights reserved.' },
  errors: {
    not_found: 'Not found.', product_not_found: 'Listing not found or no longer available.', invalid_credentials: 'Wrong email or password.', email_taken: 'This email is already registered.',
    account_disabled: 'This account is disabled.', unauthorized: 'Please log in.', invalid_token: 'Session expired, please log in again.', forbidden: 'You are not allowed to do that.',
    validation_error: 'Please check the highlighted fields.', wrong_password: 'Current password is incorrect.', invalid_or_expired_token: 'This link is invalid or expired.',
    too_many_requests: 'Too many requests, please wait.', image_too_large: 'Image is larger than 5 MB.', too_many_images: 'Too many photos.', invalid_image_type: 'Unsupported image type.',
    cannot_message_self: 'You cannot message yourself.', already_reported: 'You already reported this listing.', already_reviewed: 'This sale was already reviewed.',
    review_requires_sale: 'Reviews are only possible after a documented sale.', merchant_only: 'Merchant accounts only.', category_in_use: 'Category has listings.',
    slug_taken: 'Slug already in use.', cannot_demote_self: 'You cannot disable or demote yourself.', buyer_not_in_conversations: 'This user has not contacted you about the listing.',
    server_error: 'Server error.', network: 'Cannot reach the server.',
  },
  fields: {
    required: 'Required', min_2: 'At least 2 characters', min_3: 'At least 3 characters', min_8: 'At least 8 characters', min_10: 'At least 10 characters',
    min_0: 'Must be zero or more', invalid_email: 'Invalid email', invalid_phone: 'Invalid phone number', invalid_number: 'Invalid number',
    image_required: 'Add at least one photo', too_many_images: 'Too many photos', too_long: 'Too long', invalid_slug: 'Lowercase letters, digits and - only',
  },
  notFound: { title: 'Page not found', text: 'The page may have moved or been deleted.', home: 'Back to home' },
};

// ---- v1.1: featured listings, verified sellers, smart search, sharing, PWA, theme ----
const v11 = {
  ar: {
    common: { featured: 'مميز', verified: 'بائع موثّق' },
    home: {
      featured: 'إعلانات مميزة', popularCities: 'تصفح حسب المدينة', listings: '{n} إعلان',
      trust1: 'بائعون موثّقون', trust1Text: 'علامة ✓ للبائعين الذين تحققنا منهم',
      trust2: 'مراجعة كل إعلان', trust2Text: 'فريقنا يراجع الإعلانات قبل نشرها',
      trust3: 'تقييمات حقيقية', trust3Text: 'التقييم فقط بعد عملية بيع موثقة',
    },
    products: { sortRelevance: 'الأكثر صلة' },
    search: { categories: 'التصنيفات', listings: 'إعلانات', seeAll: 'كل النتائج لـ «{q}»' },
    product: {
      share: 'مشاركة', copyLink: 'نسخ الرابط', linkCopied: 'تم نسخ الرابط', shareText: '{title} — {price} على {site}',
      photo: 'صورة {i} من {n}', zoom: 'تكبير الصورة', verifiedHint: 'تحققت الإدارة من هوية هذا البائع',
    },
    notifications: { types: {
      product_featured: 'أصبح إعلانك «{title}» مميزاً لمدة {days} يوماً ⭐',
      account_verified: 'تم توثيق حسابك! تظهر الآن علامة ✓ بجانب اسمك',
    } },
    admin: {
      feature: 'تمييز', unfeature: 'إلغاء التمييز', featureFor: 'تمييز الإعلان لمدة', days: '{n} أيام',
      featuredUntil: 'مميز حتى {d}', verify: 'توثيق', unverify: 'إلغاء التوثيق',
      featuredCount: 'إعلانات مميزة', verifiedCount: 'بائعون موثّقون', featuredTab: 'المميزة',
    },
    pwa: {
      install: 'ثبّت التطبيق', installText: 'أضف {site} إلى شاشتك الرئيسية وافتحه بلمسة واحدة كتطبيق.',
      iosHint: 'اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»', later: 'لاحقاً', offline: 'لا يوجد اتصال بالإنترنت',
    },
    theme: { label: 'المظهر', auto: 'تلقائي', light: 'فاتح', dark: 'داكن' },
  },
  fr: {
    common: { featured: 'À la une', verified: 'Vendeur vérifié' },
    home: {
      featured: 'Annonces à la une', popularCities: 'Parcourir par ville', listings: '{n} annonces',
      trust1: 'Vendeurs vérifiés', trust1Text: 'Badge ✓ pour les vendeurs contrôlés',
      trust2: 'Annonces vérifiées', trust2Text: 'Chaque annonce est validée avant publication',
      trust3: 'Avis authentiques', trust3Text: 'Avis uniquement après une vente documentée',
    },
    products: { sortRelevance: 'Pertinence' },
    search: { categories: 'Catégories', listings: 'Annonces', seeAll: 'Tous les résultats pour « {q} »' },
    product: {
      share: 'Partager', copyLink: 'Copier le lien', linkCopied: 'Lien copié', shareText: '{title} — {price} sur {site}',
      photo: 'Photo {i} sur {n}', zoom: 'Agrandir la photo', verifiedHint: 'L’identité de ce vendeur a été vérifiée',
    },
    notifications: { types: {
      product_featured: 'Votre annonce « {title} » est à la une pour {days} jours ⭐',
      account_verified: 'Votre compte est vérifié ! Le badge ✓ apparaît à côté de votre nom',
    } },
    admin: {
      feature: 'Mettre à la une', unfeature: 'Retirer de la une', featureFor: 'Mettre à la une pendant', days: '{n} jours',
      featuredUntil: 'À la une jusqu’au {d}', verify: 'Vérifier', unverify: 'Retirer la vérification',
      featuredCount: 'Annonces à la une', verifiedCount: 'Vendeurs vérifiés', featuredTab: 'À la une',
    },
    pwa: {
      install: 'Installer l’app', installText: 'Ajoutez {site} à votre écran d’accueil et ouvrez-le comme une application.',
      iosHint: 'Touchez Partager puis « Sur l’écran d’accueil »', later: 'Plus tard', offline: 'Pas de connexion Internet',
    },
    theme: { label: 'Thème', auto: 'Auto', light: 'Clair', dark: 'Sombre' },
  },
  en: {
    common: { featured: 'Featured', verified: 'Verified seller' },
    home: {
      featured: 'Featured listings', popularCities: 'Browse by city', listings: '{n} listings',
      trust1: 'Verified sellers', trust1Text: 'A ✓ badge for sellers we have checked',
      trust2: 'Reviewed listings', trust2Text: 'Every ad is checked before it goes live',
      trust3: 'Genuine reviews', trust3Text: 'Reviews only after a documented sale',
    },
    products: { sortRelevance: 'Most relevant' },
    search: { categories: 'Categories', listings: 'Listings', seeAll: 'All results for “{q}”' },
    product: {
      share: 'Share', copyLink: 'Copy link', linkCopied: 'Link copied', shareText: '{title} — {price} on {site}',
      photo: 'Photo {i} of {n}', zoom: 'Enlarge photo', verifiedHint: 'This seller’s identity has been verified',
    },
    notifications: { types: {
      product_featured: 'Your listing “{title}” is featured for {days} days ⭐',
      account_verified: 'Your account is verified! The ✓ badge now shows next to your name',
    } },
    admin: {
      feature: 'Feature', unfeature: 'Unfeature', featureFor: 'Feature this listing for', days: '{n} days',
      featuredUntil: 'Featured until {d}', verify: 'Verify', unverify: 'Remove verification',
      featuredCount: 'Featured listings', verifiedCount: 'Verified sellers', featuredTab: 'Featured',
    },
    pwa: {
      install: 'Install the app', installText: 'Add {site} to your home screen and open it like an app.',
      iosHint: 'Tap Share, then “Add to Home Screen”', later: 'Later', offline: 'No internet connection',
    },
    theme: { label: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' },
  },
};

function deepMerge(target, extra) {
  for (const [k, val] of Object.entries(extra)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      target[k] = target[k] || {};
      deepMerge(target[k], val);
    } else {
      target[k] = val;
    }
  }
  return target;
}
// ---- v1.2: new header/home design, special offers, about & help pages ----
const v12 = {
  ar: {
    brand: { topTagline: 'سوقك الموريتاني، كل شيء في مكان واحد' },
    nav: { loginShort: 'دخول', allProducts: 'جميع المنتجات', offers: 'العروض الخاصة', about: 'من نحن', help: 'مساعدة', contact: 'اتصل بنا' },
    search: { headerPlaceholder: 'ابحث عن منتج، تصنيف أو مدينة…' },
    hero: {
      country: 'موريتانيا',
      s1title: 'سوقك الموريتاني، كل شيء في مكان واحد', s1text: 'اشترِ • بِع • تصفّح بسهولة وأمان', s1cta: 'تصفح المنتجات',
      s2title: 'سيارات ومركبات من كل المدن', s2text: 'قارن العروض وتواصل مباشرة مع البائع', s2cta: 'تصفح السيارات',
      s3title: 'بِع هاتفك أو أي شيء لا تحتاجه', s3text: 'انشر إعلانك مجاناً في أقل من دقيقتين', s3cta: 'أضف إعلاناً',
      s4title: 'عروض وتخفيضات خاصة', s4text: 'أسعار مخفّضة من التجار والأفراد', s4cta: 'شاهد العروض',
    },
    home: {
      allCategories: 'عرض جميع التصنيفات',
      whyTitle: 'لماذا {site}؟', why1: 'منصة موثوقة وآمنة', why2: 'سهولة في البحث والتصفح', why3: 'تواصل مباشر مع البائعين', why4: 'مناسب لجميع مدن موريتانيا',
      promoTitle: 'أعلن عن منتجاتك', promoTitle2: 'بكل سهولة', promoCta: 'إضافة إعلان',
      stripPill: '{site} .. التسوق أسهل وأذكى',
      feat1: 'مجتمع كبير من المشترين والبائعين', feat2: 'تجربة سريعة وسهلة', feat3: 'حماية بياناتك الشخصية', feat4: 'مساعدة ونصائح للأمان',
    },
    product: { viewDetails: 'عرض التفاصيل', oldPrice: 'السعر قبل التخفيض' },
    form: { oldPrice: 'السعر قبل التخفيض (MRU)', oldPriceHelp: 'اختياري: يظهر إعلانك في «العروض الخاصة» مع نسبة التخفيض.' },
    fields: { old_price_higher: 'يجب أن يكون أعلى من السعر الحالي' },
    about: {
      title: 'من نحن', intro: '{site} منصة موريتانية للبيع والشراء عبر الإنترنت، تجمع الأفراد والتجار في مكان واحد لعرض منتجاتهم وخدماتهم، وتمكّن المشترين من البحث والتواصل مباشرة مع البائعين.',
      missionTitle: 'رسالتنا', mission: 'تسهيل التجارة الإلكترونية في موريتانيا عبر منصة بسيطة ومنظمة وآمنة، بالأوقية الموريتانية وباللغات العربية والفرنسية والإنجليزية.',
      valuesTitle: 'ما يميزنا', v1: 'مراجعة كل إعلان قبل نشره', v2: 'بائعون موثّقون بعلامة ✓', v3: 'تقييمات مرتبطة بعمليات بيع حقيقية', v4: 'تواصل مباشر دون وسطاء',
      contactTitle: 'اتصل بنا', contactText: 'لأي استفسار أو اقتراح أو شكوى، تواصل معنا:', contactSoon: 'سيتم إضافة معلومات التواصل قريباً. يمكنك حالياً الإبلاغ عن أي إعلان مخالف بزر «الإبلاغ عن الإعلان».',
      email: 'البريد الإلكتروني', whatsapp: 'واتساب',
    },
    help: {
      title: 'مساعدة', subtitle: 'أجوبة لأكثر الأسئلة شيوعاً',
      q1: 'كيف أنشر إعلاناً؟', a1: 'أنشئ حساباً، ثم اضغط «أضف إعلاناً»، وأضف الصور والسعر والمدينة والوصف. يراجع فريقنا الإعلان ثم ينشره.',
      q2: 'لماذا لا يظهر إعلاني؟', a2: 'كل إعلان جديد أو معدّل يمر بمراجعة الإدارة. ستصلك رسالة عند الموافقة أو الرفض مع السبب.',
      q3: 'كيف أتواصل مع البائع؟', a3: 'من صفحة الإعلان اضغط «راسل البائع»، أو «إظهار الرقم» للاتصال أو واتساب.',
      q4: 'هل الدفع داخل الموقع؟', a4: 'لا. الدفع والتسليم يتمّان مباشرة بين المشتري والبائع. قابل البائع في مكان عام وافحص المنتج قبل الدفع.',
      q5: 'كيف أضع تخفيضاً على منتجي؟', a5: 'عند إضافة الإعلان أو تعديله، اكتب «السعر قبل التخفيض». سيظهر الإعلان في «العروض الخاصة» مع النسبة.',
      q6: 'ما هي علامة ✓ الزرقاء؟', a6: 'تعني أن الإدارة تحققت من هوية البائع أو المتجر.',
      q7: 'كيف أنشئ متجراً؟', a7: 'اختر نوع الحساب «تاجر» من الملف الشخصي، ثم افتح «متجري» وأضف الاسم والشعار ومعلومات التواصل.',
      safetyLink: 'نصائح الأمان', more: 'لم تجد الجواب؟',
    },
  },
  fr: {
    brand: { topTagline: 'Votre marché mauritanien, tout en un seul lieu' },
    nav: { loginShort: 'Connexion', allProducts: 'Tous les produits', offers: 'Offres spéciales', about: 'À propos', help: 'Aide', contact: 'Contact' },
    search: { headerPlaceholder: 'Rechercher un produit, une catégorie ou une ville…' },
    hero: {
      country: 'Mauritanie',
      s1title: 'Votre marché mauritanien, tout en un seul lieu', s1text: 'Achetez • Vendez • Parcourez en toute simplicité', s1cta: 'Voir les produits',
      s2title: 'Véhicules de toutes les villes', s2text: 'Comparez les offres et contactez le vendeur', s2cta: 'Voir les véhicules',
      s3title: 'Vendez votre téléphone ou tout objet inutile', s3text: 'Publiez gratuitement en moins de deux minutes', s3cta: 'Publier une annonce',
      s4title: 'Offres et promotions', s4text: 'Des prix réduits par les commerçants et particuliers', s4cta: 'Voir les offres',
    },
    home: {
      allCategories: 'Toutes les catégories',
      whyTitle: 'Pourquoi {site} ?', why1: 'Plateforme fiable et sûre', why2: 'Recherche facile', why3: 'Contact direct avec les vendeurs', why4: 'Pour toutes les villes de Mauritanie',
      promoTitle: 'Publiez vos produits', promoTitle2: 'en toute simplicité', promoCta: 'Ajouter une annonce',
      stripPill: '{site} .. acheter plus simplement',
      feat1: 'Une grande communauté', feat2: 'Rapide et simple', feat3: 'Vos données protégées', feat4: 'Aide et conseils de sécurité',
    },
    product: { viewDetails: 'Voir les détails', oldPrice: 'Prix avant remise' },
    form: { oldPrice: 'Prix avant remise (MRU)', oldPriceHelp: 'Facultatif : votre annonce apparaît dans les « Offres spéciales » avec le pourcentage de remise.' },
    fields: { old_price_higher: 'Doit être supérieur au prix actuel' },
    about: {
      title: 'À propos', intro: '{site} est une plateforme mauritanienne d’achat et de vente en ligne qui réunit particuliers et commerçants et permet aux acheteurs de contacter directement les vendeurs.',
      missionTitle: 'Notre mission', mission: 'Faciliter le commerce en ligne en Mauritanie avec une plateforme simple, organisée et sûre, en MRU et en arabe, français et anglais.',
      valuesTitle: 'Nos atouts', v1: 'Chaque annonce est vérifiée', v2: 'Vendeurs vérifiés ✓', v3: 'Avis liés à de vraies ventes', v4: 'Contact direct, sans intermédiaire',
      contactTitle: 'Contact', contactText: 'Pour toute question, suggestion ou réclamation :', contactSoon: 'Les coordonnées seront ajoutées prochainement. Vous pouvez signaler une annonce avec le bouton « Signaler ».',
      email: 'E-mail', whatsapp: 'WhatsApp',
    },
    help: {
      title: 'Aide', subtitle: 'Réponses aux questions fréquentes',
      q1: 'Comment publier une annonce ?', a1: 'Créez un compte, touchez « Publier une annonce », ajoutez photos, prix, ville et description. Notre équipe la valide puis la publie.',
      q2: 'Pourquoi mon annonce n’apparaît pas ?', a2: 'Chaque annonce nouvelle ou modifiée est vérifiée. Vous recevez une notification en cas de validation ou de refus.',
      q3: 'Comment contacter le vendeur ?', a3: 'Sur la page de l’annonce, touchez « Contacter le vendeur » ou « Afficher le numéro ».',
      q4: 'Le paiement se fait-il sur le site ?', a4: 'Non. Paiement et remise se font directement entre acheteur et vendeur. Rencontrez-vous dans un lieu public.',
      q5: 'Comment mettre une remise ?', a5: 'Indiquez le « Prix avant remise » lors de la publication ou de la modification.',
      q6: 'Que signifie le badge ✓ bleu ?', a6: 'L’identité du vendeur ou de la boutique a été vérifiée par l’administration.',
      q7: 'Comment créer une boutique ?', a7: 'Choisissez le type « Commerçant » dans votre profil, puis ouvrez « Ma boutique ».',
      safetyLink: 'Conseils de sécurité', more: 'Vous n’avez pas trouvé la réponse ?',
    },
  },
  en: {
    brand: { topTagline: 'Your Mauritanian market, everything in one place' },
    nav: { loginShort: 'Log in', allProducts: 'All products', offers: 'Special offers', about: 'About us', help: 'Help', contact: 'Contact us' },
    search: { headerPlaceholder: 'Search for a product, category or city…' },
    hero: {
      country: 'Mauritania',
      s1title: 'Your Mauritanian market, everything in one place', s1text: 'Buy • Sell • Browse easily and safely', s1cta: 'Browse products',
      s2title: 'Vehicles from every city', s2text: 'Compare offers and contact the seller directly', s2cta: 'Browse vehicles',
      s3title: 'Sell your phone or anything you don’t need', s3text: 'Post for free in under two minutes', s3cta: 'Post an ad',
      s4title: 'Special offers and discounts', s4text: 'Reduced prices from merchants and individuals', s4cta: 'See offers',
    },
    home: {
      allCategories: 'All categories',
      whyTitle: 'Why {site}?', why1: 'Trusted and safe platform', why2: 'Easy search and browsing', why3: 'Direct contact with sellers', why4: 'For every city in Mauritania',
      promoTitle: 'Advertise your products', promoTitle2: 'with ease', promoCta: 'Post an ad',
      stripPill: '{site} .. easier, smarter shopping',
      feat1: 'A large community of buyers and sellers', feat2: 'Fast and easy', feat3: 'Your personal data protected', feat4: 'Help and safety tips',
    },
    product: { viewDetails: 'View details', oldPrice: 'Price before discount' },
    form: { oldPrice: 'Price before discount (MRU)', oldPriceHelp: 'Optional: your ad appears in “Special offers” with the discount percentage.' },
    fields: { old_price_higher: 'Must be higher than the current price' },
    about: {
      title: 'About us', intro: '{site} is a Mauritanian online marketplace that brings individuals and merchants together and lets buyers contact sellers directly.',
      missionTitle: 'Our mission', mission: 'Make online trade in Mauritania simple, organised and safe — in MRU, in Arabic, French and English.',
      valuesTitle: 'What makes us different', v1: 'Every ad is reviewed', v2: 'Verified sellers ✓', v3: 'Reviews tied to real sales', v4: 'Direct contact, no middlemen',
      contactTitle: 'Contact us', contactText: 'For questions, suggestions or complaints:', contactSoon: 'Contact details will be added soon. Meanwhile you can report any listing with the “Report” button.',
      email: 'Email', whatsapp: 'WhatsApp',
    },
    help: {
      title: 'Help', subtitle: 'Answers to common questions',
      q1: 'How do I post an ad?', a1: 'Create an account, tap “Post an ad”, add photos, price, city and description. Our team reviews it, then it goes live.',
      q2: 'Why isn’t my ad showing?', a2: 'Every new or edited ad is reviewed. You get a notification when it is approved or rejected.',
      q3: 'How do I contact a seller?', a3: 'On the listing page tap “Message seller”, or “Show number” to call or WhatsApp.',
      q4: 'Is payment made on the site?', a4: 'No. Payment and hand-over happen directly between buyer and seller. Meet in a public place.',
      q5: 'How do I add a discount?', a5: 'Fill in “Price before discount” when posting or editing your ad.',
      q6: 'What does the blue ✓ mean?', a6: 'The seller’s or store’s identity has been verified by an admin.',
      q7: 'How do I open a store?', a7: 'Choose the “Merchant” account type in your profile, then open “My store”.',
      safetyLink: 'Safety tips', more: 'Didn’t find your answer?',
    },
  },
};
const v13 = {
  ar: { form: {
    imagesHelp: 'حتى {n} صور. تُضغط كل صورة تلقائياً في متصفحك إلى WebP بعرض أقصى 1000 بكسل قبل الرفع. الصورة الأولى هي الغلاف.',
    compressing: 'جارٍ ضغط الصور…', imageError: 'تعذّر قراءة هذه الصورة',
    compressedSummary: 'تم ضغط {n} صورة (توفير {pct}٪):',
  } },
  fr: { form: {
    imagesHelp: 'Jusqu’à {n} photos. Chaque photo est compressée dans votre navigateur en WebP (1000 px de large max.) avant l’envoi. La première est la couverture.',
    compressing: 'Compression des photos…', imageError: 'Impossible de lire cette image',
    compressedSummary: '{n} photo(s) compressée(s) (−{pct} %) :',
  } },
  en: { form: {
    imagesHelp: 'Up to {n} photos. Each photo is compressed in your browser to WebP (max 1000px wide) before upload. The first one is the cover.',
    compressing: 'Compressing photos…', imageError: 'Could not read this image',
    compressedSummary: '{n} photo(s) compressed ({pct}% smaller):',
  } },
};
deepMerge(ar, v12.ar);
deepMerge(fr, v12.fr);
deepMerge(en, v12.en);

deepMerge(ar, v11.ar);
deepMerge(fr, v11.fr);
deepMerge(en, v11.en);
deepMerge(ar, v13.ar);
deepMerge(fr, v13.fr);
deepMerge(en, v13.en);

// ---- v1.4: buyers vs sellers, phone login, member card ----
const v14 = {
  ar: {
    roles: {
      buyer: 'مشتري', individual: 'بائع', merchant: 'تاجر',
      buyerText: 'يتصفح ويراسل البائعين ويحفظ المفضلة', individualText: 'ينشر إعلانات عن كل ما يبيعه', merchantText: 'بائع مع متجر خاص وشعار',
    },
    nav: { myAccount: 'حسابي' },
    auth: {
      loginSubtitle: 'ادخل برقم هاتفك وكلمة المرور', phoneHint: 'رقمك الموريتاني (8 أرقام). ستدخل به إلى حسابك.',
      useEmail: 'الدخول بالبريد الإلكتروني', usePhone: 'الدخول برقم الهاتف', phoneOrEmail: 'رقم الهاتف أو البريد الإلكتروني',
      forgotText: 'أدخل رقم هاتفك أو بريدك الإلكتروني.', linkSent: 'إذا كان لحسابك بريد إلكتروني، فستصلك رسالة فيها رابط الاستعادة.',
      phoneResetHelp: 'إذا سجّلت برقم الهاتف فقط، تواصل مع الإدارة لتعطيك كلمة مرور مؤقتة.',
    },
    profile: { phoneLogin: 'تدخل به إلى حسابك' },
    card: {
      title: 'بطاقة العضو', memberId: 'رقم العضوية', since: 'تاريخ الانضمام', scan: 'امسح لعرض الملف',
      share: 'مشاركة بطاقتي', viewPublic: 'ملفي العام', shareText: 'ملف {name} على {site}',
      live: 'إعلانات نشطة', sold: 'مبيعات', rating: 'التقييم', favorites: 'في المفضلة',
    },
    seller: {
      becomeTitle: 'هل تريد البيع على {site}؟', becomeText: 'حسابك حالياً حساب مشتري: يمكنك التصفح والمراسلة والحفظ في المفضلة. حوّله إلى حساب بائع لتنشر إعلانات عن كل ما تبيعه.',
      becomeAs: 'التحويل إلى {role}', switched: 'تم تحويل حسابك. يمكنك الآن نشر الإعلانات.', onlySellers: 'نشر الإعلانات متاح لحسابات البائعين والتجار فقط.',
    },
    admin: {
      resetPassword: 'كلمة مرور مؤقتة', resetConfirm: 'إنشاء كلمة مرور مؤقتة لـ {name}؟ ستتوقف كلمة مروره الحالية عن العمل.',
      tempPasswordFor: 'كلمة المرور المؤقتة لـ {name}', tempPasswordHelp: 'أعطها للمستخدم ليدخل بها، ثم يغيّرها من «الملف الشخصي». لن تظهر مرة أخرى.',
    },
    errors: { phone_taken: 'رقم الهاتف هذا مسجّل بالفعل.', sellers_only: 'نشر الإعلانات متاح للبائعين فقط. حوّل حسابك إلى بائع من الملف الشخصي.' },
  },
  fr: {
    roles: {
      buyer: 'Acheteur', individual: 'Vendeur', merchant: 'Commerçant',
      buyerText: 'Parcourt, contacte les vendeurs, garde ses favoris', individualText: 'Publie des annonces pour tout ce qu’il vend', merchantText: 'Vendeur avec sa propre boutique',
    },
    nav: { myAccount: 'Mon compte' },
    auth: {
      loginSubtitle: 'Connectez-vous avec votre numéro et votre mot de passe', phoneHint: 'Votre numéro mauritanien (8 chiffres), utilisé pour vous connecter.',
      useEmail: 'Se connecter avec un e-mail', usePhone: 'Se connecter avec un numéro', phoneOrEmail: 'Numéro de téléphone ou e-mail',
      forgotText: 'Saisissez votre numéro ou votre e-mail.', linkSent: 'Si votre compte a un e-mail, vous recevrez un lien de réinitialisation.',
      phoneResetHelp: 'Compte créé avec un numéro uniquement ? Contactez l’administration pour un mot de passe temporaire.',
    },
    profile: { phoneLogin: 'Sert à vous connecter' },
    card: {
      title: 'Carte de membre', memberId: 'N° de membre', since: 'Membre depuis', scan: 'Scannez pour voir le profil',
      share: 'Partager ma carte', viewPublic: 'Mon profil public', shareText: 'Profil de {name} sur {site}',
      live: 'Annonces actives', sold: 'Ventes', rating: 'Note', favorites: 'Favoris',
    },
    seller: {
      becomeTitle: 'Vous voulez vendre sur {site} ?', becomeText: 'Votre compte est un compte acheteur : vous pouvez parcourir, contacter et enregistrer des favoris. Passez en vendeur pour publier des annonces.',
      becomeAs: 'Devenir {role}', switched: 'Compte modifié. Vous pouvez publier des annonces.', onlySellers: 'La publication d’annonces est réservée aux vendeurs et commerçants.',
    },
    admin: {
      resetPassword: 'Mot de passe temporaire', resetConfirm: 'Créer un mot de passe temporaire pour {name} ? L’ancien ne fonctionnera plus.',
      tempPasswordFor: 'Mot de passe temporaire pour {name}', tempPasswordHelp: 'Transmettez-le à l’utilisateur ; il le changera dans son profil. Il ne sera plus affiché.',
    },
    errors: { phone_taken: 'Ce numéro est déjà utilisé.', sellers_only: 'Seuls les vendeurs peuvent publier. Passez en compte vendeur depuis votre profil.' },
  },
  en: {
    roles: {
      buyer: 'Buyer', individual: 'Seller', merchant: 'Merchant',
      buyerText: 'Browses, messages sellers, saves favorites', individualText: 'Posts ads for everything they sell', merchantText: 'Seller with their own store',
    },
    nav: { myAccount: 'My account' },
    auth: {
      loginSubtitle: 'Log in with your phone number and password', phoneHint: 'Your Mauritanian number (8 digits), used to log in.',
      useEmail: 'Log in with email', usePhone: 'Log in with phone number', phoneOrEmail: 'Phone number or email',
      forgotText: 'Enter your phone number or email.', linkSent: 'If your account has an email, a reset link is on its way.',
      phoneResetHelp: 'Signed up with a phone number only? Contact the admin for a temporary password.',
    },
    profile: { phoneLogin: 'Used to log in' },
    card: {
      title: 'Member card', memberId: 'Member ID', since: 'Member since', scan: 'Scan to view profile',
      share: 'Share my card', viewPublic: 'My public profile', shareText: '{name}’s profile on {site}',
      live: 'Active ads', sold: 'Sales', rating: 'Rating', favorites: 'Favorites',
    },
    seller: {
      becomeTitle: 'Want to sell on {site}?', becomeText: 'Your account is a buyer account: you can browse, message and save favorites. Switch to a seller account to post ads for everything you sell.',
      becomeAs: 'Become a {role}', switched: 'Account switched. You can post ads now.', onlySellers: 'Posting ads is only for seller and merchant accounts.',
    },
    admin: {
      resetPassword: 'Temporary password', resetConfirm: 'Create a temporary password for {name}? Their current password will stop working.',
      tempPasswordFor: 'Temporary password for {name}', tempPasswordHelp: 'Give it to the user; they change it in their profile. It will not be shown again.',
    },
    errors: { phone_taken: 'This phone number is already registered.', sellers_only: 'Only sellers can post ads. Switch to a seller account in your profile.' },
  },
};
deepMerge(ar, { home: { noListingsYet: 'لا توجد إعلانات بعد. كن أول من ينشر إعلاناً على {site}!' } });
deepMerge(fr, { home: { noListingsYet: 'Pas encore d’annonces. Soyez le premier à publier sur {site} !' } });
deepMerge(en, { home: { noListingsYet: 'No listings yet. Be the first to post on {site}!' } });
deepMerge(ar, { admin: { reviewNow: 'مراجعة الآن', recentActivity: 'آخر النشاطات', newListing: 'إعلان جديد', newUser: 'مستخدم جديد', by: 'بواسطة {name}', joinedThePlatform: 'انضم إلى المنصة', noActivity: 'لا توجد نشاطات بعد.' } });
deepMerge(fr, { admin: { reviewNow: 'Examiner maintenant', recentActivity: 'Activité récente', newListing: 'Nouvelle annonce', newUser: 'Nouvel utilisateur', by: 'par {name}', joinedThePlatform: 'A rejoint la plateforme', noActivity: 'Aucune activité pour le moment.' } });
deepMerge(en, { admin: { reviewNow: 'Review now', recentActivity: 'Latest activity', newListing: 'New listing', newUser: 'New user', by: 'by {name}', joinedThePlatform: 'Joined the platform', noActivity: 'No activity yet.' } });
deepMerge(ar, v14.ar);
deepMerge(fr, v14.fr);
deepMerge(en, v14.en);

// ---------- v15: verification & featuring requests ----------
const v15 = {
  ar: {
    upgrades: {
      title: 'التوثيق والتمييز', subtitle: 'وثّق حسابك أو اجعل إعلاناتك في الواجهة، وادفع عبر الهاتف ثم أرسل صورة الإيصال.',
      verifyTitle: 'توثيق الحساب', verifyText: 'علامة ✓ بجانب اسمك تزيد ثقة المشترين بك.', verifyCta: 'اطلب التوثيق',
      verified: 'حسابك موثّق ✓', featureTitle: 'تمييز إعلان', featureText: 'يظهر إعلانك في أعلى النتائج وفي قسم «المميزة» بالرئيسية.',
      featureCta: 'ميّز إعلاناً', featureThis: 'ميّز', chooseListing: 'اختر الإعلان', noFeaturable: 'لا توجد إعلانات منشورة ومتاحة لتمييزها.',
      plan: 'المدة', planDays: '{days} يوماً', price: 'المبلغ', howToPay: 'طريقة الدفع',
      payStep1: 'حوّل المبلغ {amount} إلى أحد الحسابات أدناه.', payStep2: 'التقط صورة واضحة للإيصال (لقطة شاشة من التطبيق).', payStep3: 'أرسل الطلب، وسيراجعه فريق الإدارة ويُفعَّل خلال 24 ساعة.',
      accountName: 'باسم: {name}', askAdmin: 'اطلب الرقم من الإدارة',
      method: 'وسيلة الدفع', methods: { bankily: 'بنكيلي', masrvi: 'مصرفي', sedad: 'السداد', other: 'أخرى' },
      ref: 'رقم العملية', refHint: 'يظهر في رسالة التأكيد أو إيصال التطبيق', note: 'ملاحظة للإدارة',
      receipt: 'صورة إيصال الدفع', receiptPick: 'اختر صورة الإيصال', receiptChange: 'تغيير الصورة', receiptHint: 'صورة واضحة يظهر فيها المبلغ والتاريخ. لا يراها إلا فريق الإدارة.',
      submit: 'إرسال الطلب', sent: 'تم إرسال طلبك، سنراجعه قريباً.', pendingVerify: 'طلب التوثيق قيد المراجعة',
      pendingFeature: 'طلب تمييز قيد المراجعة', myRequests: 'طلباتي', kind: { verify: 'توثيق الحساب', feature: 'تمييز إعلان' },
      status: { pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض' }, reason: 'السبب: {reason}', featuredUntil: 'مميز حتى {date}',
    },
    admin: {
      requests: 'طلبات التوثيق والتمييز', pendingUpgrades: 'طلبات توثيق وتمييز', activeListings: 'إجمالي الإعلانات النشطة',
      activeListingsSub: 'منشورة ومتاحة للبيع · من أصل {total} إعلان', totalListings: 'كل الإعلانات',
      allKinds: 'الكل', approveActivate: 'قبول وتفعيل', rejectTitle: 'رفض الطلب', rejectReasonSeller: 'سبب الرفض (يصل إلى البائع)',
      viewReceipt: 'عرض الإيصال', receiptTitle: 'إيصال الدفع', openOriginal: 'فتح بالحجم الكامل', noReceipt: 'لا يوجد إيصال',
      confirmApproveVerify: 'تأكيد: هل وصل المبلغ؟ سيتم توثيق الحساب فوراً.', confirmApproveFeature: 'تأكيد: هل وصل المبلغ؟ سيتم تمييز الإعلان {days} يوماً.',
      reviewedBy: 'راجعه {name}', listingNotLive: 'الإعلان لم يعد منشوراً', alreadyVerified: 'موثّق مسبقاً', paidVia: 'عبر {method}',
    },
    notifications: { types: {
      upgrade_request_verify: '{name} أرسل طلب توثيق حساب مع إيصال دفع',
      upgrade_request_feature: '{name} طلب تمييز الإعلان «{title}»',
      upgrade_rejected_verify: 'رُفض طلب توثيق حسابك. السبب: {reason}',
      upgrade_rejected_feature: 'رُفض طلب تمييز «{title}». السبب: {reason}',
    } },
    errors: {
      already_verified: 'حسابك موثّق بالفعل.', request_pending: 'لديك طلب مماثل قيد المراجعة.',
      product_not_featurable: 'يمكن تمييز الإعلانات المنشورة والمتاحة فقط.', request_already_reviewed: 'تمت مراجعة هذا الطلب بالفعل.',
    },
  },
  fr: {
    upgrades: {
      title: 'Vérification & mise en avant', subtitle: 'Faites vérifier votre compte ou mettez vos annonces à la une : payez par mobile, puis envoyez la photo du reçu.',
      verifyTitle: 'Vérifier le compte', verifyText: 'Le badge ✓ à côté de votre nom rassure les acheteurs.', verifyCta: 'Demander la vérification',
      verified: 'Compte vérifié ✓', featureTitle: 'Mettre une annonce à la une', featureText: 'Votre annonce apparaît en tête des résultats et dans « À la une ».',
      featureCta: 'Mettre en avant', featureThis: 'À la une', chooseListing: 'Choisir l’annonce', noFeaturable: 'Aucune annonce publiée et disponible.',
      plan: 'Durée', planDays: '{days} jours', price: 'Montant', howToPay: 'Comment payer',
      payStep1: 'Transférez {amount} vers l’un des comptes ci-dessous.', payStep2: 'Prenez une photo nette du reçu (capture d’écran de l’application).', payStep3: 'Envoyez la demande : l’équipe la vérifie et l’active sous 24 h.',
      accountName: 'Au nom de : {name}', askAdmin: 'Demandez le numéro à l’administration',
      method: 'Moyen de paiement', methods: { bankily: 'Bankily', masrvi: 'Masrvi', sedad: 'Sedad', other: 'Autre' },
      ref: 'N° de transaction', refHint: 'Indiqué dans le SMS de confirmation ou le reçu', note: 'Note pour l’administration',
      receipt: 'Photo du reçu de paiement', receiptPick: 'Choisir la photo du reçu', receiptChange: 'Changer la photo', receiptHint: 'Montant et date lisibles. Seule l’administration la voit.',
      submit: 'Envoyer la demande', sent: 'Demande envoyée, nous l’examinons bientôt.', pendingVerify: 'Vérification en cours d’examen',
      pendingFeature: 'Mise en avant en cours d’examen', myRequests: 'Mes demandes', kind: { verify: 'Vérification', feature: 'Mise à la une' },
      status: { pending: 'En attente', approved: 'Acceptée', rejected: 'Refusée' }, reason: 'Motif : {reason}', featuredUntil: 'À la une jusqu’au {date}',
    },
    admin: {
      requests: 'Vérifications & mises en avant', pendingUpgrades: 'Demandes de vérification/mise en avant', activeListings: 'Total des annonces actives',
      activeListingsSub: 'Publiées et disponibles · sur {total} annonces', totalListings: 'Toutes les annonces',
      allKinds: 'Tout', approveActivate: 'Accepter et activer', rejectTitle: 'Refuser la demande', rejectReasonSeller: 'Motif du refus (envoyé au vendeur)',
      viewReceipt: 'Voir le reçu', receiptTitle: 'Reçu de paiement', openOriginal: 'Ouvrir en taille réelle', noReceipt: 'Aucun reçu',
      confirmApproveVerify: 'Le paiement est-il bien reçu ? Le compte sera vérifié immédiatement.', confirmApproveFeature: 'Le paiement est-il bien reçu ? L’annonce sera à la une {days} jours.',
      reviewedBy: 'Traitée par {name}', listingNotLive: 'L’annonce n’est plus en ligne', alreadyVerified: 'Déjà vérifié', paidVia: 'via {method}',
    },
    notifications: { types: {
      upgrade_request_verify: '{name} a demandé la vérification de son compte (reçu joint)',
      upgrade_request_feature: '{name} demande la mise en avant de « {title} »',
      upgrade_rejected_verify: 'Votre demande de vérification a été refusée. Motif : {reason}',
      upgrade_rejected_feature: 'La mise en avant de « {title} » a été refusée. Motif : {reason}',
    } },
    errors: {
      already_verified: 'Votre compte est déjà vérifié.', request_pending: 'Une demande similaire est déjà en attente.',
      product_not_featurable: 'Seules les annonces publiées et disponibles peuvent être mises en avant.', request_already_reviewed: 'Cette demande a déjà été traitée.',
    },
  },
  en: {
    upgrades: {
      title: 'Verification & featuring', subtitle: 'Get your account verified or feature your listings: pay by mobile money, then send a photo of the receipt.',
      verifyTitle: 'Verify your account', verifyText: 'A ✓ badge next to your name builds buyer trust.', verifyCta: 'Request verification',
      verified: 'Your account is verified ✓', featureTitle: 'Feature a listing', featureText: 'Your listing shows at the top of results and in “Featured” on the home page.',
      featureCta: 'Feature a listing', featureThis: 'Feature', chooseListing: 'Choose a listing', noFeaturable: 'No published, available listings to feature.',
      plan: 'Duration', planDays: '{days} days', price: 'Amount', howToPay: 'How to pay',
      payStep1: 'Transfer {amount} to one of the accounts below.', payStep2: 'Take a clear photo of the receipt (a screenshot from the app).', payStep3: 'Send the request; the team reviews and activates it within 24 hours.',
      accountName: 'Account name: {name}', askAdmin: 'Ask the admin for the number',
      method: 'Payment method', methods: { bankily: 'Bankily', masrvi: 'Masrvi', sedad: 'Sedad', other: 'Other' },
      ref: 'Transaction number', refHint: 'Shown in the confirmation SMS or the app receipt', note: 'Note for the admin',
      receipt: 'Payment receipt photo', receiptPick: 'Choose the receipt photo', receiptChange: 'Change photo', receiptHint: 'Amount and date must be readable. Only the admin team can see it.',
      submit: 'Send request', sent: 'Request sent, we will review it soon.', pendingVerify: 'Verification request under review',
      pendingFeature: 'Featuring request under review', myRequests: 'My requests', kind: { verify: 'Account verification', feature: 'Featured listing' },
      status: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }, reason: 'Reason: {reason}', featuredUntil: 'Featured until {date}',
    },
    admin: {
      requests: 'Verification & featuring', pendingUpgrades: 'Verification & featuring requests', activeListings: 'Total active listings',
      activeListingsSub: 'Published and available · out of {total} listings', totalListings: 'All listings',
      allKinds: 'All', approveActivate: 'Approve & activate', rejectTitle: 'Reject request', rejectReasonSeller: 'Reason (sent to the seller)',
      viewReceipt: 'View receipt', receiptTitle: 'Payment receipt', openOriginal: 'Open full size', noReceipt: 'No receipt',
      confirmApproveVerify: 'Has the payment arrived? The account will be verified right away.', confirmApproveFeature: 'Has the payment arrived? The listing will be featured for {days} days.',
      reviewedBy: 'Reviewed by {name}', listingNotLive: 'Listing is no longer live', alreadyVerified: 'Already verified', paidVia: 'via {method}',
    },
    notifications: { types: {
      upgrade_request_verify: '{name} requested account verification (receipt attached)',
      upgrade_request_feature: '{name} wants to feature “{title}”',
      upgrade_rejected_verify: 'Your verification request was rejected. Reason: {reason}',
      upgrade_rejected_feature: 'Featuring “{title}” was rejected. Reason: {reason}',
    } },
    errors: {
      already_verified: 'Your account is already verified.', request_pending: 'You already have a similar request under review.',
      product_not_featurable: 'Only published, available listings can be featured.', request_already_reviewed: 'This request was already reviewed.',
    },
  },
};
deepMerge(ar, v15.ar);
deepMerge(ar, { common: { copy: 'نسخ', copied: 'تم النسخ' } });
deepMerge(fr, v15.fr);
deepMerge(fr, { common: { copy: 'Copier', copied: 'Copié' } });
deepMerge(en, v15.en);
deepMerge(en, { common: { copy: 'Copy', copied: 'Copied' } });

// ---------- v16: merchant accounts reviewed by an admin ----------
const v16 = {
  ar: {
    merchant: {
      pendingTitle: 'طلب حساب التاجر قيد المراجعة', pendingText: 'ستراجع الإدارة طلبك قريباً. حتى ذلك الحين يمكنك نشر الإعلانات كبائع فردي، وسيصلك إشعار عند القبول.',
      rejectedTitle: 'لم تتم الموافقة على حساب التاجر', rejectedText: 'السبب: {reason}', reapply: 'يمكنك تعديل معلوماتك ثم إعادة الطلب من «الملف الشخصي».',
      approvedToast: 'تمت الموافقة! أصبح حسابك حساب تاجر.', requested: 'تم إرسال طلبك ليصبح حسابك حساب تاجر. ستراجعه الإدارة قريباً.',
      reviewNote: 'يخضع حساب التاجر لموافقة الإدارة', storeLocked: 'يمكنك إنشاء متجرك بعد موافقة الإدارة على حساب التاجر.',
      profileHint: 'اختيار «تاجر» يرسل طلباً للإدارة. تبقى بائعاً فردياً حتى الموافقة.', pendingBadge: 'طلب تاجر قيد المراجعة',
      completeProfile: 'أكمل ملفك (المدينة والنبذة) لتسريع المراجعة',
    },
    admin: {
      merchantsTab: 'طلبات التجار', merchantRequests: 'طلبات حساب تاجر', approveMerchant: 'قبول كتاجر', rejectMerchant: 'رفض',
      rejectMerchantTitle: 'رفض طلب حساب التاجر', confirmApproveMerchant: 'قبول «{name}» كتاجر؟ سيتمكن من إنشاء متجر.',
      requestedAt: 'طلب {time}', listingsCount: '{n} إعلان', approvedCount: '{n} منشور', reportsCount: '{n} بلاغ', joinedOn: 'مسجّل منذ {date}',
      noBio: 'لم يكتب نبذة عن نشاطه', viewProfile: 'عرض الملف', trustHint: 'تحقّق من رقم الهاتف والإعلانات والبلاغات قبل القبول.', storeName: 'المتجر: {name}',
    },
    notifications: { types: {
      merchant_request: '{name} طلب حساب تاجر، بانتظار موافقتك',
      merchant_approved: 'تمت الموافقة على حسابك كتاجر 🎉 يمكنك الآن إنشاء متجرك',
      merchant_rejected: 'لم تتم الموافقة على حساب التاجر. السبب: {reason}',
    } },
  },
  fr: {
    merchant: {
      pendingTitle: 'Demande de compte commerçant en cours d’examen', pendingText: 'L’équipe examinera votre demande bientôt. En attendant, vous pouvez publier en tant que particulier ; vous serez notifié de la décision.',
      rejectedTitle: 'Compte commerçant non approuvé', rejectedText: 'Motif : {reason}', reapply: 'Complétez votre profil puis refaites la demande depuis « Profil ».',
      approvedToast: 'Approuvé ! Votre compte est désormais commerçant.', requested: 'Votre demande de compte commerçant a été envoyée à l’administration.',
      reviewNote: 'Le compte commerçant est soumis à validation', storeLocked: 'Vous pourrez créer votre boutique une fois votre compte commerçant approuvé.',
      profileHint: 'Choisir « Commerçant » envoie une demande à l’administration. Vous restez particulier jusqu’à l’approbation.', pendingBadge: 'Demande commerçant en attente',
      completeProfile: 'Complétez votre profil (ville, présentation) pour accélérer l’examen',
    },
    admin: {
      merchantsTab: 'Demandes commerçants', merchantRequests: 'Demandes de compte commerçant', approveMerchant: 'Accepter comme commerçant', rejectMerchant: 'Refuser',
      rejectMerchantTitle: 'Refuser la demande de compte commerçant', confirmApproveMerchant: 'Accepter « {name} » comme commerçant ? Il pourra créer une boutique.',
      requestedAt: 'Demandé {time}', listingsCount: '{n} annonces', approvedCount: '{n} publiées', reportsCount: '{n} signalements', joinedOn: 'Inscrit depuis le {date}',
      noBio: 'Aucune présentation', viewProfile: 'Voir le profil', trustHint: 'Vérifiez le téléphone, les annonces et les signalements avant d’accepter.', storeName: 'Boutique : {name}',
    },
    notifications: { types: {
      merchant_request: '{name} demande un compte commerçant',
      merchant_approved: 'Votre compte commerçant est approuvé 🎉 Créez votre boutique',
      merchant_rejected: 'Compte commerçant non approuvé. Motif : {reason}',
    } },
  },
  en: {
    merchant: {
      pendingTitle: 'Merchant account request under review', pendingText: 'The team will review your request soon. Meanwhile you can post ads as an individual seller; you will be notified of the decision.',
      rejectedTitle: 'Merchant account not approved', rejectedText: 'Reason: {reason}', reapply: 'Update your profile, then apply again from “Profile”.',
      approvedToast: 'Approved! Your account is now a merchant account.', requested: 'Your merchant account request was sent to the admin team.',
      reviewNote: 'Merchant accounts are reviewed by the admin', storeLocked: 'You can create your store once your merchant account is approved.',
      profileHint: 'Choosing “Merchant” sends a request to the admin. You stay an individual seller until it is approved.', pendingBadge: 'Merchant request pending',
      completeProfile: 'Complete your profile (city, bio) to speed up the review',
    },
    admin: {
      merchantsTab: 'Merchant requests', merchantRequests: 'Merchant account requests', approveMerchant: 'Approve as merchant', rejectMerchant: 'Reject',
      rejectMerchantTitle: 'Reject merchant request', confirmApproveMerchant: 'Approve “{name}” as a merchant? They will be able to create a store.',
      requestedAt: 'Requested {time}', listingsCount: '{n} listings', approvedCount: '{n} published', reportsCount: '{n} reports', joinedOn: 'Joined {date}',
      noBio: 'No bio written', viewProfile: 'View profile', trustHint: 'Check the phone number, listings and reports before approving.', storeName: 'Store: {name}',
    },
    notifications: { types: {
      merchant_request: '{name} requested a merchant account',
      merchant_approved: 'Your merchant account is approved 🎉 You can create your store now',
      merchant_rejected: 'Merchant account not approved. Reason: {reason}',
    } },
  },
};
deepMerge(ar, v16.ar);
deepMerge(fr, v16.fr);
deepMerge(en, v16.en);

// ---------- v17: admin area with full control ----------
const v17 = {
  ar: {
    announcement: { text: '' },
    admin: {
      nav: { dashboard: 'لوحة التحكم', review: 'المراجعة', manage: 'الإدارة', site: 'الموقع', account: 'الحساب' },
      viewSite: 'عرض الموقع', loginTitle: 'دخول المدير', loginSubtitle: 'أدخل البريد الإلكتروني وكلمة المرور الخاصين بالمدير.', backToSite: '← العودة إلى الموقع',
      siteSettings: 'إعدادات الموقع', siteSettingsHint: 'معلومات التواصل، والإعلان العلوي، وروابط التواصل الاجتماعي، وخيارات التسجيل والنشر. تظهر التغييرات في الموقع فوراً.',
      set: {
        features: 'خيارات الموقع', registration: 'السماح بالتسجيل', registrationHint: 'عند الإيقاف لا يستطيع أحد إنشاء حساب جديد.',
        autoApprove: 'نشر الإعلانات تلقائياً', autoApproveHint: 'عند التفعيل تُنشر الإعلانات الجديدة دون مراجعة الإدارة.',
        announcement: 'شريط الإعلان العلوي', announcementHint: 'رسالة تظهر أعلى كل صفحات الموقع، مثل عرض أو تنبيه.', showAnnouncement: 'إظهار الشريط',
        announcementText: 'نص الإعلان', tone: 'اللون', tones: { gold: 'ذهبي', brand: 'أخضر', rose: 'أحمر' }, link: 'رابط عند الضغط', linkHint: 'مثال: /products?deals=1 أو رابط https',
        contact: 'معلومات التواصل', contactHint: 'تظهر في صفحة «من نحن» قسم «اتصل بنا».', address: 'العنوان',
        social: 'وسائل التواصل الاجتماعي', socialHint: 'تظهر في أسفل الموقع. اترك الحقل فارغاً لإخفائه.',
        payment: 'أرقام الدفع', paymentHint: 'تظهر للبائعين في نموذج التوثيق والتمييز المدفوع.', paymentOff: 'الدفع متوقف حالياً (الموقع مجاني). تُستخدم هذه الأرقام فقط إذا فُعّل الدفع.',
        accountName: 'اسم صاحب الحساب', lastChange: 'آخر تعديل بواسطة {name}',
      },
      siteTexts: 'نصوص الموقع', siteTextsHint: 'غيّر أي نص يظهر في الموقع بالعربية والفرنسية والإنجليزية. اترك الحقل فارغاً لاستخدام النص الأصلي.',
      saveTexts: 'حفظ النصوص', textGroup: 'القسم', searchTexts: 'ابحث في كل النصوص…', customTexts: '{n} نص معدّل', customised: 'معدّل',
      resetText: 'إرجاع النص الأصلي', defaultText: 'النص الأصلي', keepVars: 'انتبه: النص الأصلي يحتوي على {vars} — احتفظ بها ليظهر الاسم أو الرقم الصحيح.',
      textGroups: { brand: 'الشعار والعبارة', announcement: 'شريط الإعلان', hero: 'البنر الرئيسي', home: 'الصفحة الرئيسية', nav: 'القوائم والروابط', footer: 'أسفل الموقع', about: 'من نحن', help: 'المساعدة', products: 'قائمة الإعلانات', product: 'صفحة الإعلان', auth: 'الدخول والتسجيل', dashboard: 'لوحة البائع', form: 'نموذج الإعلان', store: 'المتاجر', seller: 'البائعون', roles: 'أنواع الحسابات', card: 'بطاقة العضو', notifications: 'الإشعارات', errors: 'رسائل الخطأ', common: 'عام' },
      adminAccount: 'حساب المدير', adminAccountHint: 'البريد الإلكتروني وكلمة المرور اللذان تدخل بهما إلى لوحة الإدارة.',
      loginEmail: 'بريد الدخول', loginEmailHint: 'ستدخل إلى لوحة الإدارة بهذا البريد.', newPassword: 'كلمة مرور جديدة', newPasswordHint: '8 أحرف على الأقل. اتركها فارغة إن لم ترد تغييرها.',
      currentPassword: 'كلمة المرور الحالية', currentPasswordHint: 'مطلوبة لتأكيد أي تغيير.', accountSavedPassword: 'تم الحفظ. استخدم كلمة المرور الجديدة في الدخول القادم.',
      reviews: 'التقييمات', reviewsHint: 'كل تقييمات المشترين للبائعين. احذف المسيء أو المزيّف.', deleteReviewConfirm: 'حذف هذا التقييم نهائياً؟',
      files: 'الملفات والصور', filesHint: 'كل الصور المرفوعة في الموقع (صور الإعلانات، الصور الشخصية، شعارات المتاجر).', filesTotal: '{n} ملف · {size}',
      unusedFiles: 'غير مستخدمة', unused: 'غير مستخدمة', viewFile: 'عرض الملف', usedBy: { listing: 'إعلان', avatar: 'صورة شخصية', store: 'شعار متجر' },
      deleteFileConfirm: 'حذف هذه الصورة نهائياً؟', deleteUsedFileConfirm: 'هذه الصورة مستخدمة في «{label}». حذفها سيزيلها من هناك أيضاً. متابعة؟',
      deleteUserConfirm: 'سيُحذف حساب «{name}» نهائياً مع كل إعلاناته ورسائله ومتجره. للتأكيد اكتب الاسم كما هو:',
      deleteStoreConfirm: 'حذف متجر «{name}» نهائياً؟ تبقى إعلانات صاحبه.', editUser: 'تعديل «{name}»', editStore: 'تعديل متجر «{name}»',
      sitemap: {
        title: 'خريطة الموقع', hint: 'كل صفحات الموقع وأقسامه في مكان واحد. اضغط على أي رابط لفتحه.', public: 'صفحات الزوار', account: 'صفحات الحساب',
        admin: 'أقسام لوحة الإدارة', categories: 'التصنيفات', stores: 'المتاجر', outside: 'خارج الموقع (للمطوّر)',
        repo: 'ملفات الموقع (GitHub)', repoHint: 'كل ملفات الكود المصدري للموقع.', vercelHint: 'الاستضافة والنشر.', supabaseHint: 'قاعدة البيانات.',
      },
    },
    errors: {
      registration_closed: 'التسجيل مغلق حالياً. حاول لاحقاً.', admin_only: 'هذا الحساب ليس حساب مدير.', cannot_delete_self: 'لا يمكنك حذف حسابك.',
      cannot_delete_admin: 'لا يمكن حذف حساب مدير. أزل صلاحية المدير أولاً.',
    },
  },
  fr: {
    announcement: { text: '' },
    admin: {
      nav: { dashboard: 'Tableau de bord', review: 'Modération', manage: 'Gestion', site: 'Site', account: 'Compte' },
      viewSite: 'Voir le site', loginTitle: 'Connexion administrateur', loginSubtitle: 'Saisissez l’e-mail et le mot de passe administrateur.', backToSite: '← Retour au site',
      siteSettings: 'Paramètres du site', siteSettingsHint: 'Coordonnées, bandeau d’annonce, réseaux sociaux, inscriptions et publication. Les changements sont visibles immédiatement.',
      set: {
        features: 'Options du site', registration: 'Autoriser les inscriptions', registrationHint: 'Désactivé : personne ne peut créer de compte.',
        autoApprove: 'Publier les annonces automatiquement', autoApproveHint: 'Activé : les nouvelles annonces sont publiées sans modération.',
        announcement: 'Bandeau d’annonce', announcementHint: 'Message affiché en haut de toutes les pages (offre, alerte…).', showAnnouncement: 'Afficher le bandeau',
        announcementText: 'Texte de l’annonce', tone: 'Couleur', tones: { gold: 'Doré', brand: 'Vert', rose: 'Rouge' }, link: 'Lien au clic', linkHint: 'Ex. : /products?deals=1 ou un lien https',
        contact: 'Coordonnées', contactHint: 'Affichées dans « À propos » → « Contact ».', address: 'Adresse',
        social: 'Réseaux sociaux', socialHint: 'Affichés en bas du site. Laissez vide pour masquer.',
        payment: 'Numéros de paiement', paymentHint: 'Affichés aux vendeurs dans le formulaire payant.', paymentOff: 'Paiement désactivé (site gratuit). Utilisés seulement si le paiement est activé.',
        accountName: 'Titulaire du compte', lastChange: 'Dernière modification par {name}',
      },
      siteTexts: 'Textes du site', siteTextsHint: 'Modifiez n’importe quel texte du site en arabe, français et anglais. Laissez vide pour le texte d’origine.',
      saveTexts: 'Enregistrer les textes', textGroup: 'Section', searchTexts: 'Rechercher dans tous les textes…', customTexts: '{n} textes modifiés', customised: 'Modifié',
      resetText: 'Revenir au texte d’origine', defaultText: 'Texte d’origine', keepVars: 'Attention : le texte d’origine contient {vars} — gardez-les.',
      textGroups: { brand: 'Logo et slogan', announcement: 'Bandeau', hero: 'Bannière', home: 'Accueil', nav: 'Menus', footer: 'Pied de page', about: 'À propos', help: 'Aide', products: 'Liste des annonces', product: 'Page annonce', auth: 'Connexion', dashboard: 'Espace vendeur', form: 'Formulaire', store: 'Boutiques', seller: 'Vendeurs', roles: 'Types de compte', card: 'Carte membre', notifications: 'Notifications', errors: 'Erreurs', common: 'Général' },
      adminAccount: 'Compte administrateur', adminAccountHint: 'L’e-mail et le mot de passe pour entrer dans l’administration.',
      loginEmail: 'E-mail de connexion', loginEmailHint: 'Vous vous connecterez avec cet e-mail.', newPassword: 'Nouveau mot de passe', newPasswordHint: '8 caractères min. Laissez vide pour ne pas changer.',
      currentPassword: 'Mot de passe actuel', currentPasswordHint: 'Requis pour confirmer.', accountSavedPassword: 'Enregistré. Utilisez le nouveau mot de passe à la prochaine connexion.',
      reviews: 'Avis', reviewsHint: 'Tous les avis des acheteurs. Supprimez les abusifs ou faux.', deleteReviewConfirm: 'Supprimer définitivement cet avis ?',
      files: 'Fichiers et images', filesHint: 'Toutes les images envoyées (annonces, photos de profil, logos).', filesTotal: '{n} fichiers · {size}',
      unusedFiles: 'Non utilisées', unused: 'Non utilisée', viewFile: 'Voir le fichier', usedBy: { listing: 'Annonce', avatar: 'Photo de profil', store: 'Logo' },
      deleteFileConfirm: 'Supprimer définitivement cette image ?', deleteUsedFileConfirm: 'Cette image est utilisée par « {label} ». Elle en sera retirée. Continuer ?',
      deleteUserConfirm: 'Le compte « {name} » sera supprimé avec ses annonces, messages et boutique. Tapez le nom pour confirmer :',
      deleteStoreConfirm: 'Supprimer la boutique « {name} » ? Les annonces restent.', editUser: 'Modifier « {name} »', editStore: 'Modifier la boutique « {name} »',
      sitemap: {
        title: 'Plan du site', hint: 'Toutes les pages et sections du site au même endroit.', public: 'Pages visiteurs', account: 'Pages du compte',
        admin: 'Sections admin', categories: 'Catégories', stores: 'Boutiques', outside: 'Hors du site (développeur)',
        repo: 'Fichiers du site (GitHub)', repoHint: 'Tout le code source du site.', vercelHint: 'Hébergement et déploiement.', supabaseHint: 'Base de données.',
      },
    },
    errors: {
      registration_closed: 'Les inscriptions sont fermées pour le moment.', admin_only: 'Ce compte n’est pas administrateur.', cannot_delete_self: 'Vous ne pouvez pas supprimer votre compte.',
      cannot_delete_admin: 'Impossible de supprimer un administrateur. Retirez d’abord ses droits.',
    },
  },
  en: {
    announcement: { text: '' },
    admin: {
      nav: { dashboard: 'Dashboard', review: 'Review', manage: 'Manage', site: 'Website', account: 'Account' },
      viewSite: 'View site', loginTitle: 'Admin sign-in', loginSubtitle: 'Enter the admin email and password.', backToSite: '← Back to the site',
      siteSettings: 'Site settings', siteSettingsHint: 'Contact details, announcement bar, social links, sign-up and posting options. Changes show on the site right away.',
      set: {
        features: 'Site options', registration: 'Allow sign-ups', registrationHint: 'When off, nobody can create a new account.',
        autoApprove: 'Publish listings automatically', autoApproveHint: 'When on, new listings go live without admin review.',
        announcement: 'Announcement bar', announcementHint: 'A message shown at the top of every page, such as an offer or notice.', showAnnouncement: 'Show the bar',
        announcementText: 'Announcement text', tone: 'Colour', tones: { gold: 'Gold', brand: 'Green', rose: 'Red' }, link: 'Link on click', linkHint: 'e.g. /products?deals=1 or an https link',
        contact: 'Contact details', contactHint: 'Shown on the About page, “Contact us”.', address: 'Address',
        social: 'Social media', socialHint: 'Shown in the footer. Leave empty to hide.',
        payment: 'Payment numbers', paymentHint: 'Shown to sellers in the paid verification/featuring form.', paymentOff: 'Payments are off (the site is free). Only used if payments are turned on.',
        accountName: 'Account holder', lastChange: 'Last changed by {name}',
      },
      siteTexts: 'Site texts', siteTextsHint: 'Change any text on the site, in Arabic, French and English. Leave empty to use the original text.',
      saveTexts: 'Save texts', textGroup: 'Section', searchTexts: 'Search all texts…', customTexts: '{n} texts changed', customised: 'Changed',
      resetText: 'Restore original', defaultText: 'Original', keepVars: 'Note: the original contains {vars} — keep them so names and numbers show.',
      textGroups: { brand: 'Logo & tagline', announcement: 'Announcement', hero: 'Hero banner', home: 'Home page', nav: 'Menus & links', footer: 'Footer', about: 'About', help: 'Help', products: 'Listings list', product: 'Listing page', auth: 'Sign-in', dashboard: 'Seller dashboard', form: 'Listing form', store: 'Stores', seller: 'Sellers', roles: 'Account types', card: 'Member card', notifications: 'Notifications', errors: 'Error messages', common: 'General' },
      adminAccount: 'Admin account', adminAccountHint: 'The email and password you use to enter the admin area.',
      loginEmail: 'Sign-in email', loginEmailHint: 'You will sign in to the admin area with this email.', newPassword: 'New password', newPasswordHint: 'At least 8 characters. Leave empty to keep the current one.',
      currentPassword: 'Current password', currentPasswordHint: 'Needed to confirm any change.', accountSavedPassword: 'Saved. Use the new password next time you sign in.',
      reviews: 'Reviews', reviewsHint: 'Every buyer review. Delete abusive or fake ones.', deleteReviewConfirm: 'Delete this review permanently?',
      files: 'Files & images', filesHint: 'Every uploaded image (listing photos, profile pictures, store logos).', filesTotal: '{n} files · {size}',
      unusedFiles: 'Unused', unused: 'Unused', viewFile: 'View file', usedBy: { listing: 'Listing', avatar: 'Profile picture', store: 'Store logo' },
      deleteFileConfirm: 'Delete this image permanently?', deleteUsedFileConfirm: 'This image is used by “{label}”. Deleting removes it there too. Continue?',
      deleteUserConfirm: 'The account “{name}” will be deleted with all its listings, messages and store. Type the name to confirm:',
      deleteStoreConfirm: 'Delete the store “{name}”? The owner’s listings stay.', editUser: 'Edit “{name}”', editStore: 'Edit store “{name}”',
      sitemap: {
        title: 'Site map', hint: 'Every page and section of the site in one place.', public: 'Visitor pages', account: 'Account pages',
        admin: 'Admin sections', categories: 'Categories', stores: 'Stores', outside: 'Outside the site (developer)',
        repo: 'Site files (GitHub)', repoHint: 'All of the site’s source code.', vercelHint: 'Hosting and deployment.', supabaseHint: 'Database.',
      },
    },
    errors: {
      registration_closed: 'Sign-ups are closed for now.', admin_only: 'This account is not an admin account.', cannot_delete_self: 'You cannot delete your own account.',
      cannot_delete_admin: 'An admin account cannot be deleted. Remove admin rights first.',
    },
  },
};
deepMerge(ar, v17.ar);
deepMerge(fr, v17.fr);
deepMerge(en, v17.en);

// ---------- v18: banner, menus, custom pages, adding users and listings ----------
const v18 = {
  ar: {
    admin: {
      changeImage: 'تغيير الصورة', uploadImage: 'رفع صورة', removeImage: 'إزالة', uploadImages: 'رفع صور', copyLink: 'نسخ الرابط',
      langFallback: 'إن تركت الفرنسية أو الإنجليزية فارغة يظهر النص العربي.', moveUp: 'تحريك للأعلى', moveDown: 'تحريك للأسفل',
      banner: 'البنر الرئيسي', bannerHint: 'الشرائح المتحركة أعلى الصفحة الرئيسية: الصورة، والعنوان، والنص، والزر ورابطه.',
      bannerBuiltin: 'يعرض الموقع الآن الشرائح الأصلية الأربع. يمكنك تعديلها أو إنشاء شرائحك الخاصة.',
      bannerEditCurrent: 'تعديل الشرائح الحالية', addSlide: 'إضافة شريحة', slideN: 'الشريحة {n}', slideVisible: 'ظاهرة',
      slideTitle: 'العنوان', slideText: 'النص', slideButton: 'نص الزر', slideImage: 'صورة الشريحة',
      bannerReset: 'الرجوع للشرائح الأصلية', bannerResetConfirm: 'حذف كل الشرائح والرجوع إلى الشرائح الأصلية؟ (اضغط «حفظ» بعدها)',
      menus: 'القوائم والروابط', menusHint: 'رتّب روابط القائمة العلوية وأسفل الموقع، وأضف روابط لصفحاتك، وأظهر أو أخفِ أقسام الصفحة الرئيسية.',
      headerMenu: 'القائمة العلوية', headerMenuHint: 'تظهر تحت الشعار على الكمبيوتر، وفي القائمة ☰ على الهاتف.',
      footerMenu: 'روابط أسفل الموقع', footerMenuHint: 'عمود «روابط» في أسفل كل صفحة.',
      linkLabel: 'اسم الرابط', addLink: 'إضافة رابط', builtinLinks: 'صفحات الموقع', customLink: 'رابط آخر (تكتبه بنفسك)',
      linkLabelLangHint: 'اسم الرابط يُحفظ للغة المعروضة حالياً. غيّر لغة اللوحة لكتابته بلغة أخرى.',
      homeSections: 'أقسام الصفحة الرئيسية', homeSectionsHint: 'ألغِ التحديد لإخفاء القسم من الصفحة الرئيسية.',
      homeSection: { hero: 'البنر الرئيسي', categories: 'التصنيفات', latest: 'أحدث الإعلانات', promo: 'لماذا نحن · المميزة · أضف إعلاناً', deals: 'العروض', cities: 'المدن الأكثر نشاطاً', stores: 'المتاجر المميزة', features: 'شريط المزايا' },
      menusReset: 'الرجوع للقوائم الأصلية', menusResetConfirm: 'إرجاع القوائم وأقسام الصفحة الرئيسية إلى الأصل؟',
      customPages: 'الصفحات', customPagesHint: 'أنشئ صفحات جديدة (الشروط، سياسة الخصوصية، العروض…) ثم أضفها إلى القوائم من «القوائم والروابط».',
      newPage: 'صفحة جديدة', editPage: 'تعديل الصفحة', noPages: 'لا توجد صفحات بعد.', published: 'منشورة', draft: 'مسودة', view: 'عرض',
      pageTitle: 'عنوان الصفحة', pageSlug: 'رابط الصفحة', pageSlugHint: 'أحرف إنجليزية صغيرة وأرقام و-. ستكون الصفحة على {url}',
      pageCover: 'صورة الغلاف', pageBody: 'محتوى الصفحة', preview: 'معاينة', pagePublished: 'منشورة (يراها الزوار)',
      fmtHeading: 'عنوان', fmtList: 'قائمة', fmtBold: 'غامق', fmtLink: 'رابط', fmtImage: 'صورة',
      pageBodyHint: 'اترك سطراً فارغاً بين الفقرات. ## للعنوان، - للقائمة، **نص** للغامق، [نص](/رابط) للروابط.',
      deletePageConfirm: 'حذف صفحة «{title}» نهائياً؟ احذف روابطها من القوائم أيضاً.',
      addListing: 'إضافة إعلان', pickSellerHint: 'اختر صاحب الإعلان. سيُنشر الإعلان باسمه مباشرة دون مراجعة.', searchUser: 'ابحث بالاسم أو رقم الهاتف…',
      noSellerYet: 'صاحب الإعلان غير مسجّل؟', addUser: 'إضافة مستخدم', postingAs: 'تنشر هذا الإعلان باسم «{name}»', changeSeller: 'تغيير',
      userCreated: 'تمت إضافة «{name}». أعطه رقم الهاتف وكلمة المرور ليدخل.', addUserPhoneHint: 'سيدخل المستخدم بهذا الرقم.', addUserPasswordHint: '8 أحرف على الأقل. أعطها للمستخدم ليدخل بها.',
    },
    errors: { slug_taken: 'هذا الرابط مستخدم لصفحة أخرى.', page_not_found: 'الصفحة غير موجودة.' },
  },
  fr: {
    admin: {
      changeImage: 'Changer l’image', uploadImage: 'Envoyer une image', removeImage: 'Retirer', uploadImages: 'Envoyer des images', copyLink: 'Copier le lien',
      langFallback: 'Si le français ou l’anglais est vide, le texte arabe s’affiche.', moveUp: 'Monter', moveDown: 'Descendre',
      banner: 'Bannière', bannerHint: 'Les diapositives en haut de l’accueil : image, titre, texte, bouton et lien.',
      bannerBuiltin: 'Le site affiche les 4 diapositives d’origine. Modifiez-les ou créez les vôtres.',
      bannerEditCurrent: 'Modifier les diapositives actuelles', addSlide: 'Ajouter une diapositive', slideN: 'Diapositive {n}', slideVisible: 'Visible',
      slideTitle: 'Titre', slideText: 'Texte', slideButton: 'Texte du bouton', slideImage: 'Image',
      bannerReset: 'Revenir aux diapositives d’origine', bannerResetConfirm: 'Supprimer toutes les diapositives et revenir à l’origine ? (puis « Enregistrer »)',
      menus: 'Menus et liens', menusHint: 'Ordonnez les liens du menu et du pied de page, ajoutez vos pages, affichez ou masquez les sections de l’accueil.',
      headerMenu: 'Menu du haut', headerMenuHint: 'Sous le logo sur ordinateur, dans le menu ☰ sur téléphone.',
      footerMenu: 'Liens du pied de page', footerMenuHint: 'La colonne « Liens » en bas de chaque page.',
      linkLabel: 'Nom du lien', addLink: 'Ajouter un lien', builtinLinks: 'Pages du site', customLink: 'Autre lien (à saisir)',
      linkLabelLangHint: 'Le nom est enregistré pour la langue affichée. Changez la langue pour l’écrire dans une autre.',
      homeSections: 'Sections de l’accueil', homeSectionsHint: 'Décochez pour masquer une section.',
      homeSection: { hero: 'Bannière', categories: 'Catégories', latest: 'Dernières annonces', promo: 'Pourquoi nous · À la une · Publier', deals: 'Bonnes affaires', cities: 'Villes actives', stores: 'Boutiques', features: 'Bandeau d’avantages' },
      menusReset: 'Revenir aux menus d’origine', menusResetConfirm: 'Remettre les menus et sections de l’accueil d’origine ?',
      customPages: 'Pages', customPagesHint: 'Créez des pages (conditions, confidentialité, offres…) puis ajoutez-les aux menus.',
      newPage: 'Nouvelle page', editPage: 'Modifier la page', noPages: 'Aucune page pour le moment.', published: 'Publiée', draft: 'Brouillon', view: 'Voir',
      pageTitle: 'Titre de la page', pageSlug: 'Adresse de la page', pageSlugHint: 'Minuscules, chiffres et -. La page sera sur {url}',
      pageCover: 'Image de couverture', pageBody: 'Contenu', preview: 'Aperçu', pagePublished: 'Publiée (visible par les visiteurs)',
      fmtHeading: 'Titre', fmtList: 'Liste', fmtBold: 'Gras', fmtLink: 'Lien', fmtImage: 'Image',
      pageBodyHint: 'Ligne vide entre les paragraphes. ## titre, - liste, **texte** gras, [texte](/lien) lien.',
      deletePageConfirm: 'Supprimer définitivement la page « {title} » ? Retirez aussi ses liens des menus.',
      addListing: 'Ajouter une annonce', pickSellerHint: 'Choisissez le propriétaire. L’annonce est publiée à son nom, sans modération.', searchUser: 'Rechercher par nom ou téléphone…',
      noSellerYet: 'Le vendeur n’a pas de compte ?', addUser: 'Ajouter un utilisateur', postingAs: 'Vous publiez au nom de « {name} »', changeSeller: 'Changer',
      userCreated: '« {name} » ajouté. Donnez-lui le téléphone et le mot de passe.', addUserPhoneHint: 'L’utilisateur se connectera avec ce numéro.', addUserPasswordHint: '8 caractères min. À donner à l’utilisateur.',
    },
    errors: { slug_taken: 'Cette adresse est déjà utilisée.', page_not_found: 'Page introuvable.' },
  },
  en: {
    admin: {
      changeImage: 'Change image', uploadImage: 'Upload image', removeImage: 'Remove', uploadImages: 'Upload images', copyLink: 'Copy link',
      langFallback: 'If French or English is empty, the Arabic text is shown.', moveUp: 'Move up', moveDown: 'Move down',
      banner: 'Hero banner', bannerHint: 'The slides at the top of the home page: image, title, text, button and link.',
      bannerBuiltin: 'The site shows the 4 original slides. Edit them or make your own.',
      bannerEditCurrent: 'Edit the current slides', addSlide: 'Add slide', slideN: 'Slide {n}', slideVisible: 'Visible',
      slideTitle: 'Title', slideText: 'Text', slideButton: 'Button text', slideImage: 'Slide image',
      bannerReset: 'Back to the original slides', bannerResetConfirm: 'Remove all slides and go back to the original ones? (then press “Save”)',
      menus: 'Menus & links', menusHint: 'Order the top menu and footer links, add links to your pages, and show or hide home page sections.',
      headerMenu: 'Top menu', headerMenuHint: 'Under the logo on computers, in the ☰ menu on phones.',
      footerMenu: 'Footer links', footerMenuHint: 'The “Links” column at the bottom of every page.',
      linkLabel: 'Link name', addLink: 'Add link', builtinLinks: 'Site pages', customLink: 'Other link (type it)',
      linkLabelLangHint: 'The name is saved for the language shown now. Switch the panel language to write it in another.',
      homeSections: 'Home page sections', homeSectionsHint: 'Untick to hide a section from the home page.',
      homeSection: { hero: 'Hero banner', categories: 'Categories', latest: 'Latest listings', promo: 'Why us · Featured · Post an ad', deals: 'Deals', cities: 'Popular cities', stores: 'Featured stores', features: 'Features strip' },
      menusReset: 'Back to the original menus', menusResetConfirm: 'Restore the original menus and home sections?',
      customPages: 'Pages', customPagesHint: 'Create pages (terms, privacy, offers…) then add them to the menus.',
      newPage: 'New page', editPage: 'Edit page', noPages: 'No pages yet.', published: 'Published', draft: 'Draft', view: 'View',
      pageTitle: 'Page title', pageSlug: 'Page address', pageSlugHint: 'Lower-case letters, digits and -. The page will be at {url}',
      pageCover: 'Cover image', pageBody: 'Content', preview: 'Preview', pagePublished: 'Published (visible to visitors)',
      fmtHeading: 'Heading', fmtList: 'List', fmtBold: 'Bold', fmtLink: 'Link', fmtImage: 'Image',
      pageBodyHint: 'Leave a blank line between paragraphs. ## heading, - list, **text** bold, [text](/link) link.',
      deletePageConfirm: 'Delete the page “{title}” permanently? Remove its links from the menus too.',
      addListing: 'Add listing', pickSellerHint: 'Choose who the listing belongs to. It goes live in their name, without review.', searchUser: 'Search by name or phone…',
      noSellerYet: 'Seller has no account?', addUser: 'Add user', postingAs: 'You are posting as “{name}”', changeSeller: 'Change',
      userCreated: '“{name}” added. Give them the phone number and password to sign in.', addUserPhoneHint: 'The user signs in with this number.', addUserPasswordHint: 'At least 8 characters. Give it to the user.',
    },
    errors: { slug_taken: 'This address is already used by another page.', page_not_found: 'Page not found.' },
  },
};
deepMerge(ar, v18.ar);
deepMerge(fr, v18.fr);
deepMerge(en, v18.en);

// ---------- v19: identity, maintenance, cities, payments, alert bar ----------
const v19 = {
  ar: {
    common: { saveChanges: 'حفظ التغييرات', changesSaved: 'تم حفظ التغييرات ✓' },
    hero: { label: 'العروض الرئيسية' },
    maintenance: {
      title: 'الموقع تحت الصيانة', text: 'نقوم ببعض التحسينات وسنعود قريباً. شكراً لصبركم!', adminLink: 'دخول المدير',
      adminNotice: 'وضع الصيانة مفعّل: الزوار يرون صفحة الصيانة، وأنت ترى الموقع لأنك مدير.', turnOff: 'إيقافه',
    },
    admin: {
      siteSettings: 'إعدادات عامة', generalHint: 'خيارات التسجيل ونشر الإعلانات.',
      appearance: 'الهوية والمظهر', appearanceHint: 'اسم الموقع، والشعار، والألوان، ووضع الصيانة. يظهر كل تغيير للزوار فوراً.',
      identity: 'هوية الموقع', siteName: 'اسم الموقع', siteNameHint: 'يظهر بجانب الشعار وفي عنوان المتصفح وفي كل نصوص الموقع. اتركه فارغاً لـ «سوق شنقيط».',
      logo: 'الشعار (Logo)', logoHint: 'صورة مربعة بخلفية شفافة (PNG) أفضل. تظهر أيضاً كأيقونة المتصفح.', useDefaultLogo: 'الشعار الأصلي',
      primaryColor: 'اللون الأساسي', secondaryColor: 'اللون الثانوي', colorHint: 'اضغط على المربع لاختيار اللون.', resetColor: 'الأصلي',
      colorsApplyHint: 'الأساسي: الأزرار والروابط والعناوين. الثانوي: زر «أضف إعلاناً» والنجوم والتمييز.',
      maintenance: 'وضع الصيانة', maintenanceHint: 'أغلق الموقع مؤقتاً أمام الزوار. تبقى أنت قادراً على تصفحه وإدارته.',
      maintenanceOn: 'تفعيل وضع الصيانة', maintenanceOnHint: 'يرى الزوار رسالتك فقط، ولا يستطيعون التسجيل أو النشر.', maintenanceMessage: 'رسالة للزوار',
      alerts: 'شريط التنبيهات', alertStyle: 'طريقة العرض', alertStatic: 'ثابت', alertMarquee: 'متحرك',
      payments: 'الدفع والتمييز والتواصل', paymentsHint: 'أسعار التمييز (VIP) والتوثيق، وأرقام حسابات الدفع، وواتساب الدعم، وروابط التواصل.',
      pricing: 'الأسعار والتمييز (VIP)', pricingHint: 'المبالغ بالأوقية (MRU). تظهر للبائعين في نموذج الطلب.',
      paidOn: 'تفعيل الخدمات المدفوعة', paidOnHint: 'عند الإيقاف يبقى الموقع مجانياً بالكامل وتختفي نماذج الدفع.',
      verifyPrice: 'سعر توثيق الحساب', vipPlans: 'باقات تمييز الإعلانات', addPlan: 'إضافة باقة', daysUnit: 'يوماً',
      contactHint2: 'واتساب الدعم يظهر في «اتصل بنا»، وكذلك البريد والهاتف والعنوان.', supportWhatsapp: 'واتساب الدعم الفني',
      cities: 'المدن والمقاطعات', citiesHint: 'المدن التي تظهر في الفلاتر ونماذج الإعلانات والتسجيل. أخفِ المدينة بدل حذفها إن كانت مستخدمة.',
      addCity: 'إضافة مدينة', editCity: 'تعديل المدينة', cityUsed: 'مستخدمة {n} مرة', hidden: 'مخفية', hide: 'إخفاء', show: 'إظهار',
      cityNameAr: 'الاسم بالعربية', cityNameFr: 'الاسم بالفرنسية', cityNameEn: 'الاسم بالإنجليزية', cityKey: 'المعرّف',
      cityKeyHint: 'أحرف إنجليزية صغيرة و- (مثال: tevragh-zeina).', cityKeyLocked: 'لا يتغير بعد الإنشاء.', sortOrder: 'الترتيب', cityActive: 'ظاهرة في الموقع',
      deleteCityConfirm: 'حذف مدينة «{name}»؟',
    },
    errors: { city_in_use: 'لا يمكن حذف مدينة مستخدمة في إعلانات أو حسابات. أخفِها بدلاً من ذلك.', city_exists: 'هذا المعرّف مستخدم لمدينة أخرى.', maintenance: 'الموقع تحت الصيانة حالياً. حاول لاحقاً.' },
  },
  fr: {
    common: { saveChanges: 'Enregistrer les modifications', changesSaved: 'Modifications enregistrées ✓' },
    hero: { label: 'Offres principales' },
    maintenance: {
      title: 'Site en maintenance', text: 'Nous faisons quelques améliorations et revenons très vite. Merci de votre patience !', adminLink: 'Connexion admin',
      adminNotice: 'Mode maintenance actif : les visiteurs voient la page de maintenance, vous voyez le site car vous êtes admin.', turnOff: 'Désactiver',
    },
    admin: {
      siteSettings: 'Paramètres généraux', generalHint: 'Inscriptions et publication des annonces.',
      appearance: 'Identité et apparence', appearanceHint: 'Nom, logo, couleurs et mode maintenance. Visible immédiatement par les visiteurs.',
      identity: 'Identité du site', siteName: 'Nom du site', siteNameHint: 'À côté du logo, dans l’onglet et dans tous les textes. Vide = « Souk Chinguetti ».',
      logo: 'Logo', logoHint: 'Image carrée, idéalement PNG transparent. Sert aussi d’icône d’onglet.', useDefaultLogo: 'Logo d’origine',
      primaryColor: 'Couleur principale', secondaryColor: 'Couleur secondaire', colorHint: 'Cliquez sur le carré pour choisir.', resetColor: 'D’origine',
      colorsApplyHint: 'Principale : boutons, liens, titres. Secondaire : « Publier », étoiles, mises en avant.',
      maintenance: 'Mode maintenance', maintenanceHint: 'Fermez le site aux visiteurs le temps d’une intervention. Vous gardez l’accès.',
      maintenanceOn: 'Activer le mode maintenance', maintenanceOnHint: 'Les visiteurs ne voient que votre message et ne peuvent rien publier.', maintenanceMessage: 'Message aux visiteurs',
      alerts: 'Bandeau d’alerte', alertStyle: 'Affichage', alertStatic: 'Fixe', alertMarquee: 'Défilant',
      payments: 'Paiement, VIP et contact', paymentsHint: 'Prix VIP et vérification, numéros de paiement, WhatsApp du support, réseaux sociaux.',
      pricing: 'Prix et mise en avant (VIP)', pricingHint: 'Montants en MRU, affichés aux vendeurs.',
      paidOn: 'Activer les services payants', paidOnHint: 'Désactivé : le site reste entièrement gratuit.',
      verifyPrice: 'Prix de la vérification', vipPlans: 'Formules de mise en avant', addPlan: 'Ajouter une formule', daysUnit: 'jours',
      contactHint2: 'Le WhatsApp du support s’affiche dans « Contact », avec l’e-mail, le téléphone et l’adresse.', supportWhatsapp: 'WhatsApp du support',
      cities: 'Villes et wilayas', citiesHint: 'Villes des filtres et formulaires. Masquez une ville utilisée au lieu de la supprimer.',
      addCity: 'Ajouter une ville', editCity: 'Modifier la ville', cityUsed: 'utilisée {n} fois', hidden: 'masquée', hide: 'Masquer', show: 'Afficher',
      cityNameAr: 'Nom en arabe', cityNameFr: 'Nom en français', cityNameEn: 'Nom en anglais', cityKey: 'Identifiant',
      cityKeyHint: 'Minuscules et - (ex. tevragh-zeina).', cityKeyLocked: 'Ne change plus après création.', sortOrder: 'Ordre', cityActive: 'Visible sur le site',
      deleteCityConfirm: 'Supprimer la ville « {name} » ?',
    },
    errors: { city_in_use: 'Ville utilisée par des annonces ou comptes : masquez-la plutôt.', city_exists: 'Identifiant déjà utilisé.', maintenance: 'Le site est en maintenance. Réessayez plus tard.' },
  },
  en: {
    common: { saveChanges: 'Save changes', changesSaved: 'Changes saved ✓' },
    hero: { label: 'Main offers' },
    maintenance: {
      title: 'Down for maintenance', text: 'We are making some improvements and will be back soon. Thank you for your patience!', adminLink: 'Admin sign-in',
      adminNotice: 'Maintenance mode is on: visitors see the maintenance page; you see the site because you are an admin.', turnOff: 'Turn off',
    },
    admin: {
      siteSettings: 'General settings', generalHint: 'Sign-ups and listing publication.',
      appearance: 'Identity & appearance', appearanceHint: 'Site name, logo, colours and maintenance mode. Visitors see changes right away.',
      identity: 'Site identity', siteName: 'Site name', siteNameHint: 'Next to the logo, in the browser tab and in every text. Empty = “Souk Chinguetti”.',
      logo: 'Logo', logoHint: 'A square image, ideally a transparent PNG. Also used as the tab icon.', useDefaultLogo: 'Original logo',
      primaryColor: 'Primary colour', secondaryColor: 'Secondary colour', colorHint: 'Click the square to pick a colour.', resetColor: 'Original',
      colorsApplyHint: 'Primary: buttons, links, headings. Secondary: “Post an ad”, stars and featured badges.',
      maintenance: 'Maintenance mode', maintenanceHint: 'Close the site to visitors for a while. You keep full access.',
      maintenanceOn: 'Turn on maintenance mode', maintenanceOnHint: 'Visitors only see your message and cannot sign up or post.', maintenanceMessage: 'Message to visitors',
      alerts: 'Alert bar', alertStyle: 'Display', alertStatic: 'Still', alertMarquee: 'Scrolling',
      payments: 'Payments, VIP & contact', paymentsHint: 'VIP and verification prices, payment numbers, support WhatsApp and social links.',
      pricing: 'Prices & featuring (VIP)', pricingHint: 'Amounts in MRU, shown to sellers in the request form.',
      paidOn: 'Turn on paid services', paidOnHint: 'When off, the site stays completely free and payment forms are hidden.',
      verifyPrice: 'Verification price', vipPlans: 'Featuring plans', addPlan: 'Add plan', daysUnit: 'days',
      contactHint2: 'The support WhatsApp shows in “Contact us”, with the email, phone and address.', supportWhatsapp: 'Support WhatsApp',
      cities: 'Cities & wilayas', citiesHint: 'Cities shown in filters and forms. Hide a city that is in use instead of deleting it.',
      addCity: 'Add city', editCity: 'Edit city', cityUsed: 'used {n} times', hidden: 'hidden', hide: 'Hide', show: 'Show',
      cityNameAr: 'Arabic name', cityNameFr: 'French name', cityNameEn: 'English name', cityKey: 'Identifier',
      cityKeyHint: 'Lower-case letters and - (e.g. tevragh-zeina).', cityKeyLocked: 'Cannot change after creation.', sortOrder: 'Order', cityActive: 'Visible on the site',
      deleteCityConfirm: 'Delete the city “{name}”?',
    },
    errors: { city_in_use: 'This city is used by listings or accounts. Hide it instead.', city_exists: 'This identifier is already used.', maintenance: 'The site is under maintenance. Please try again later.' },
  },
};
deepMerge(ar, v19.ar);
deepMerge(fr, v19.fr);
deepMerge(en, v19.en);

// ---------- v21: geolocation (near me, maps, distances) ----------
const v21 = {
  ar: {
    geo: {
      title: 'موقعي', prompt: 'حدّد موقعك لترى الإعلانات القريبة منك والمسافة إليها.', locateMe: 'تحديد موقعي', locating: 'جارٍ تحديد موقعك…',
      updateLocation: 'تحديث موقعي', chooseManually: 'اختيار المدينة يدوياً', forget: 'مسح موقعي', youAreIn: 'موقعك الحالي', yourChoice: 'المكان الذي اخترته', located: 'تم تحديد موقعك',
      chooseCity: 'اختر المدينة', chooseArea: 'المقاطعة', anyArea: 'كل المقاطعات', noAreas: 'المقاطعة (غير متاحة لهذه المدينة)', useThisPlace: 'استخدام هذا المكان',
      privacy: 'موقعك يبقى على جهازك فقط، ولا نحفظه ولا نعرضه لأحد. نستخدمه تقريبياً (حوالي 1 كم) لحساب المسافات.',
      error: {
        denied: 'لم تسمح بالوصول إلى موقعك. يمكنك اختيار مدينتك ومقاطعتك يدوياً.', unavailable: 'تعذّر تحديد موقعك الآن (ضعف الإشارة أو انتهاء الوقت). حاول مرة أخرى أو اختر المدينة يدوياً.',
        unsupported: 'متصفحك لا يدعم تحديد الموقع. اختر المدينة يدوياً.', outside: 'يبدو أنك خارج موريتانيا، لذلك لم نستخدم موقعك. يمكنك اختيار مدينة يدوياً.',
      },
      nearMe: 'الإعلانات القريبة مني', anyDistance: 'كل المسافات', withinKm: 'حتى {km} كم', locateFirst: 'حدّد موقعك أولاً لتفعيل هذا الفلتر.',
      nearTitle: 'إعلانات قريبة منك (حتى {km} كم)', noneNearby: 'لا توجد إعلانات في حدود {km} كم منك.', widen: 'توسيع المسافة',
      sortDistance: 'الأقرب أولاً', view: 'طريقة العرض', listView: 'قائمة', mapView: 'خريطة', openListing: 'فتح الإعلان', you: 'أنت هنا',
      km: '{km} كم', kmFromYou: '{km} كم منك', distanceHint: 'المسافة التقريبية بينك وبين مكان الإعلان', locateForDistance: 'حدّد موقعك لمعرفة المسافة',
      mapApproxNote: '{n} إعلان على الخريطة. الأماكن تقريبية إلا إذا اختار البائع إظهار موقعه الدقيق.',
      itemLocation: 'موقع الإعلان', exactShown: 'اختار البائع إظهار الموقع الدقيق.', approxShown: 'الموقع تقريبي (حوالي 1 كم) لحماية خصوصية البائع.', cityOnly: 'لم يحدد البائع مكاناً على الخريطة: نعرض المدينة فقط.',
      formHint: 'حدّد مكان المنتج أو الخدمة ليظهر إعلانك لمن هم قريبون منك. اضغط على الخريطة لوضع الدبوس، ويمكنك سحبه.',
      useMyLocation: 'استخدم موقعي الحالي', removePin: 'إزالة الدبوس', pickOnMap: 'اضغط على الخريطة لتحديد المكان.', pinSet: 'تم تحديد المكان. اسحب الدبوس لتعديله.',
      outOfArea: 'المكان يجب أن يكون داخل موريتانيا.', area: 'المقاطعة', district: 'الحي',
      showExact: 'إظهار الموقع الدقيق للمشترين', showExactHint: 'إن لم تحدده، يرى المشترون منطقة تقريبية (حوالي 1 كم) فقط، والمسافة بخطوات نصف كيلومتر.',
    },
    admin: { cityCentre: 'مركز المدينة على الخريطة', latitude: 'خط العرض', longitude: 'خط الطول', cityCentreHint: 'يُستخدم لحساب المسافة للإعلانات التي لا تحمل دبوساً. اضغط على الخريطة لتحديده.' },
  },
  fr: {
    geo: {
      title: 'Ma position', prompt: 'Indiquez votre position pour voir les annonces proches et leur distance.', locateMe: 'Me localiser', locating: 'Localisation…',
      updateLocation: 'Actualiser ma position', chooseManually: 'Choisir la ville', forget: 'Effacer ma position', youAreIn: 'Votre position', yourChoice: 'Le lieu choisi', located: 'Position trouvée',
      chooseCity: 'Choisir la ville', chooseArea: 'Moughataa', anyArea: 'Toutes les moughataas', noAreas: 'Moughataa (non disponible ici)', useThisPlace: 'Utiliser ce lieu',
      privacy: 'Votre position reste sur votre appareil : nous ne l’enregistrons ni ne la montrons. Elle sert, arrondie à ~1 km, à calculer les distances.',
      error: {
        denied: 'Accès à la position refusé. Vous pouvez choisir votre ville et votre moughataa.', unavailable: 'Position introuvable pour le moment. Réessayez ou choisissez la ville.',
        unsupported: 'Votre navigateur ne permet pas la localisation. Choisissez la ville.', outside: 'Vous semblez hors de Mauritanie : position non utilisée. Choisissez une ville.',
      },
      nearMe: 'Annonces près de moi', anyDistance: 'Toutes distances', withinKm: 'Jusqu’à {km} km', locateFirst: 'Indiquez d’abord votre position.',
      nearTitle: 'Près de vous (jusqu’à {km} km)', noneNearby: 'Aucune annonce à moins de {km} km.', widen: 'Élargir',
      sortDistance: 'Les plus proches', view: 'Affichage', listView: 'Liste', mapView: 'Carte', openListing: 'Voir l’annonce', you: 'Vous êtes ici',
      km: '{km} km', kmFromYou: 'à {km} km', distanceHint: 'Distance approximative entre vous et l’annonce', locateForDistance: 'Localisez-vous pour voir la distance',
      mapApproxNote: '{n} annonces sur la carte. Les lieux sont approximatifs sauf si le vendeur montre le lieu exact.',
      itemLocation: 'Emplacement', exactShown: 'Le vendeur montre le lieu exact.', approxShown: 'Lieu approximatif (~1 km) pour protéger le vendeur.', cityOnly: 'Pas de point sur la carte : seule la ville est indiquée.',
      formHint: 'Indiquez où se trouve le produit ou le service pour apparaître aux acheteurs proches. Touchez la carte pour poser le repère, déplacez-le si besoin.',
      useMyLocation: 'Utiliser ma position', removePin: 'Retirer le repère', pickOnMap: 'Touchez la carte pour choisir le lieu.', pinSet: 'Lieu défini. Déplacez le repère pour l’ajuster.',
      outOfArea: 'Le lieu doit être en Mauritanie.', area: 'Moughataa', district: 'Quartier',
      showExact: 'Montrer le lieu exact aux acheteurs', showExactHint: 'Sinon, les acheteurs voient une zone d’environ 1 km et une distance arrondie au demi-kilomètre.',
    },
    admin: { cityCentre: 'Centre de la ville', latitude: 'Latitude', longitude: 'Longitude', cityCentreHint: 'Sert aux distances des annonces sans repère. Touchez la carte pour le placer.' },
  },
  en: {
    geo: {
      title: 'My location', prompt: 'Share your location to see listings near you and how far they are.', locateMe: 'Locate me', locating: 'Locating…',
      updateLocation: 'Update my location', chooseManually: 'Choose city manually', forget: 'Forget my location', youAreIn: 'You are in', yourChoice: 'Your chosen place', located: 'Location found',
      chooseCity: 'Choose city', chooseArea: 'Moughataa', anyArea: 'All moughataas', noAreas: 'Moughataa (not available here)', useThisPlace: 'Use this place',
      privacy: 'Your location stays on your device: we never store or show it. Rounded to ~1 km, it is only used to work out distances.',
      error: {
        denied: 'Location access was refused. You can choose your city and moughataa instead.', unavailable: 'Could not find your location right now. Try again or choose a city.',
        unsupported: 'Your browser cannot share a location. Choose a city instead.', outside: 'You seem to be outside Mauritania, so your location was not used. Choose a city instead.',
      },
      nearMe: 'Listings near me', anyDistance: 'Any distance', withinKm: 'Within {km} km', locateFirst: 'Share your location first to use this filter.',
      nearTitle: 'Near you (within {km} km)', noneNearby: 'No listings within {km} km of you.', widen: 'Search wider',
      sortDistance: 'Nearest first', view: 'View', listView: 'List', mapView: 'Map', openListing: 'Open listing', you: 'You are here',
      km: '{km} km', kmFromYou: '{km} km from you', distanceHint: 'Approximate distance between you and the listing', locateForDistance: 'Share your location to see the distance',
      mapApproxNote: '{n} listings on the map. Places are approximate unless the seller shows the exact spot.',
      itemLocation: 'Item location', exactShown: 'The seller shows the exact place.', approxShown: 'Approximate place (~1 km) to protect the seller’s privacy.', cityOnly: 'No map pin: only the city is shown.',
      formHint: 'Mark where the item or service is so nearby buyers find it. Tap the map to drop the pin; drag it to adjust.',
      useMyLocation: 'Use my current location', removePin: 'Remove pin', pickOnMap: 'Tap the map to choose the place.', pinSet: 'Place set. Drag the pin to adjust it.',
      outOfArea: 'The place must be in Mauritania.', area: 'Moughataa', district: 'Neighbourhood',
      showExact: 'Show the exact place to buyers', showExactHint: 'Otherwise buyers only see a ~1 km zone, and the distance in half-kilometre steps.',
    },
    admin: { cityCentre: 'City centre on the map', latitude: 'Latitude', longitude: 'Longitude', cityCentreHint: 'Used for the distance of listings without a pin. Tap the map to set it.' },
  },
};
deepMerge(ar, v21.ar);
deepMerge(fr, v21.fr);
deepMerge(en, v21.en);

// ---------- v20: the site's name (Souk Chinguetti / سوق شنقيط) ----------
// Texts say {site}; t() fills it with the admin's name (Admin → Identity) or this default.
deepMerge(ar, { brand: { name: 'سوق شنقيط', nameA: 'سوق', nameB: 'شنقيط' } });
deepMerge(fr, { brand: { name: 'Souk Chinguetti', nameA: 'Souk', nameB: 'Chinguetti' } });
deepMerge(en, { brand: { name: 'Souk Chinguetti', nameA: 'Souk', nameB: 'Chinguetti' } });

// ---------- v22: delivery service (cash on delivery, couriers, tracking) ----------
const v22 = {
  ar: {
    delivery: {
      nav: { orders: 'طلباتي والتوصيل', courier: 'شركاء التوصيل', join: 'انضم كشريك توصيل' },
      cta: { title: 'اطلب التوصيل', text: 'نوصل المنتج إلى باب منزلك، والدفع نقداً عند الاستلام.', button: 'اطلب التوصيل الآن', short: 'توصيل' },
      status: { pending: 'في انتظار التأكيد', accepted: 'تم قبول الطلب', preparing: 'جاري تجهيز الطلب', picked_up: 'تم استلام الطلب من البائع', on_the_way: 'في الطريق إلى المشتري', delivered: 'تم التسليم', cancelled: 'تم إلغاء الطلب' },
      event: { pending: 'تم إنشاء الطلب', accepted: 'قبل البائع الطلب', preparing: 'بدأ تجهيز الطلب', picked_up: 'استلم المندوب الطلب من البائع', on_the_way: 'المندوب في الطريق إليك', delivered: 'تم التسليم', cancelled: 'تم إلغاء الطلب', courier_assigned: 'تم تعيين مندوب التوصيل', courier_removed: 'تم سحب المندوب من الطلب' },
      action: { accepted: 'قبول الطلب', preparing: 'بدء التجهيز', picked_up: 'استلمت الطلب من البائع', on_the_way: 'انطلقت نحو المشتري', delivered: 'تم التسليم واستلام المبلغ', cancelled: 'إلغاء الطلب' },
      role: { buyer: 'المشتري', seller: 'البائع', courier: 'مندوب التوصيل', admin: 'الإدارة' },
      vehicle: { motorbike: 'دراجة نارية', car: 'سيارة', tricycle: 'تريبورتور', bicycle: 'دراجة هوائية', foot: 'سيراً على الأقدام' },
      fields: { city: 'المدينة', area: 'المقاطعة', chooseArea: 'اختر المقاطعة', district: 'الحي', districtPh: 'مثال: حي النصر، كرفور مدريد…', phone: 'رقم الهاتف للتواصل', phoneHint: 'يراه المندوب فقط للتواصل معك عند التوصيل.', address: 'العنوان بالتفصيل', addressHint: 'معلم قريب، لون الباب، الطابق…', note: 'ملاحظة للمندوب', notePh: 'مثال: اتصل قبل الوصول بربع ساعة' },
      checkout: {
        title: 'طلب التوصيل', subtitle: 'حدد عنوان التسليم وراجع التكلفة قبل التأكيد. الدفع نقداً عند الاستلام.', where: 'عنوان التسليم',
        pinTitle: 'موقع التسليم على الخريطة', pinHint: 'المس الخريطة لوضع الدبوس على موقعك بدقة (اختياري لكنه يحسّب التكلفة بدقة أكبر).',
        privacy: 'عنوانك ورقم هاتفك وموقعك لا يراها إلا مندوب التوصيل المعيّن والإدارة. البائع يرى المدينة والمقاطعة والحي فقط.',
        confirm: 'تأكيد الطلب', afterConfirm: 'سيتلقى البائع طلبك فوراً، وستصلك إشعارات عند كل تحديث.', placed: 'تم إرسال طلبك ✔',
      },
      cost: { item: 'سعر المنتج', delivery: 'تكلفة التوصيل', total: 'الإجمالي', distance: 'حوالي {km} كم', interCity: 'بين مدينتين' },
      cod: { title: 'الدفع عند الاستلام', text: 'لا تدفع أي شيء الآن. تدفع المبلغ الإجمالي نقداً للمندوب عند استلام المنتج.', short: 'الدفع نقداً عند الاستلام' },
      orders: {
        title: 'طلباتي', as: { buyer: 'مشترياتي', seller: 'طلبات على منتجاتي', courier: 'توصيلاتي' }, open: 'طلبات جارية', history: 'السجل',
        empty: { buyer: 'لم تطلب أي توصيل بعد.', seller: 'لا توجد طلبات على منتجاتك بعد.', courier: 'لا توجد توصيلات بعد.' }, browse: 'تصفح الإعلانات',
      },
      order: {
        title: 'الطلب', progress: 'مراحل الطلب', costs: 'التكلفة', deliverTo: 'التسليم إلى', people: 'أطراف الطلب', timeline: 'سجل الطلب',
        noCourier: 'لم يُعيَّن بعد', call: 'اتصال', openMap: 'افتح الموقع في الخريطة', addressHidden: 'العنوان التفصيلي ورقم المشتري يظهران للمندوب والإدارة فقط.',
        cancelReason: 'سبب الإلغاء', confirmCancel: 'تأكيد الإلغاء', cancelledBy: 'ألغى الطلبَ: {who}', updated: 'تم تحديث حالة الطلب',
        sellerPending: 'طلب جديد: اقبله ليبدأ التجهيز ويُعرض على مندوبي التوصيل.', waitingCourier: 'بانتظار مندوب توصيل يتكفّل بالطلب.',
      },
      track: {
        title: 'تتبع المندوب', destination: 'نقطة التسليم', courier: 'المندوب', updated: 'آخر تحديث {ago}', legend: 'الدبوس الذهبي: نقطة التسليم',
        notShared: 'المندوب لم يفعّل مشاركة موقعه. يمكنك الاتصال به مباشرة.',
      },
      rate: { title: 'قيّم خدمة التوصيل', placeholder: 'كيف كانت تجربتك مع المندوب؟ (اختياري)', submit: 'إرسال التقييم', yours: 'تقييمك للتوصيل:' },
      join: {
        kicker: 'شركاء التوصيل', title: 'انضم إلى شركاء التوصيل', subtitle: 'اربح من توصيل طلبات {site} في مدينتك، بأوقاتك ووسيلتك.',
        steps: { apply: 'قدّم طلبك', applyText: 'رقمك ومدينتك ووسيلة النقل.', review: 'مراجعة الإدارة', reviewText: 'نتحقق من الطلب ونرد عليك.', deliver: 'استلم وأوصل', deliverText: 'اختر الطلبات المتاحة في مدينتك.', earn: 'اربح', earnText: 'تكلفة التوصيل تُدفع لك عند التسليم.' },
        formTitle: 'طلب الانضمام', city: 'مدينة العمل', vehicle: 'وسيلة النقل', note: 'نبذة عنك', notePh: 'خبرتك، الأحياء التي تعرفها، أوقات عملك…',
        privacy: 'يُستخدم رقمك للتواصل في الطلبات فقط. موقعك لا يُشارك إلا إذا فعّلت ذلك بنفسك أثناء التوصيل.',
        submit: 'إرسال الطلب', pendingTitle: 'طلبك قيد المراجعة', pendingText: 'ستراجع الإدارة طلبك قريباً، وستصلك إشعار بالقرار.',
        rejectedTitle: 'لم يُقبل طلب الانضمام', suspendedTitle: 'حسابك كمندوب موقوف مؤقتاً', reapply: 'تقديم طلب جديد',
      },
      courier: {
        title: 'لوحة المندوب', subtitle: 'الطلبات المتاحة في مدينتك وتوصيلاتك الجارية.', active: 'توصيلات جارية', delivered: 'تم تسليمها', earned: 'أرباح التوصيل', rating: 'التقييم',
        availableTitle: 'متاح لاستقبال الطلبات', availableHint: 'عند التفعيل تصلك إشعارات بالطلبات الجديدة في مدينتك.',
        shareTitle: 'مشاركة موقعي أثناء التوصيل', shareHint: 'بموافقتك فقط: يرى المشتري موقعك على الخريطة أثناء التوصيل فقط، ويُحذف عند الإيقاف. أبقِ هذه الصفحة مفتوحة.',
        live: { off: '', waiting: 'جارٍ تحديد موقعك…', live: '🟢 موقعك يُشارك الآن مع المشتري', idle: 'لا توجد توصيلة جارية: لا يُحفظ موقعك.', denied: 'رفض المتصفح الوصول إلى الموقع.', unsupported: 'المتصفح لا يدعم تحديد الموقع.', error: 'تعذّر إرسال الموقع، سنحاول مجدداً.' },
        myDeliveries: 'توصيلاتي الجارية', noActive: 'لا توجد توصيلات جارية.', availableOrders: 'طلبات متاحة في مدينتك', noneAvailable: 'لا توجد طلبات متاحة الآن.', refresh: 'تحديث',
        from: 'من', to: 'إلى', yourFee: 'أجرة التوصيل', take: 'أتكفّل بهذا الطلب', claimed: 'الطلب لك الآن، توجّه إلى البائع.',
      },
      courierStatus: { pending: 'بانتظار المراجعة', approved: 'مقبولون', suspended: 'موقوفون', rejected: 'مرفوضون', all: 'الكل' },
      admin: {
        orders: 'طلبات التوصيل', ordersHint: 'تابع كل الطلبات ومراحلها، عيّن المندوبين، وغيّر الحالة عند الحاجة.', open: 'الجارية', all: 'الكل', search: 'ابحث برقم الطلب أو المنتج أو الاسم أو الهاتف',
        noOrders: 'لا توجد طلبات هنا.', col: { product: 'المنتج', people: 'الأطراف', place: 'الوجهة', total: 'المبلغ', status: 'الحالة', date: 'التاريخ' },
        assign: 'تعيين مندوب التوصيل', noCourier: 'بدون مندوب', busy: 'غير متاح', noCouriers: 'لا يوجد مندوبون مقبولون بعد.', availableNow: 'متاح',
        couriers: 'شركاء التوصيل', couriersHint: 'راجع طلبات الانضمام، واقبل المندوبين أو ارفضهم أو أوقفهم.', noCouriersHere: 'لا يوجد أحد هنا.',
        approve: 'قبول', reject: 'رفض', suspend: 'إيقاف', reactivate: 'إعادة التفعيل', reason: 'السبب (يُرسل للمندوب)',
        pricing: 'أسعار التوصيل', pricingHint: 'تُحسب تكلفة التوصيل تلقائياً حسب المسافة بين البائع ونقطة التسليم.',
        enabled: 'تفعيل خدمة التوصيل', enabledHint: 'عند الإيقاف يختفي زر «اطلب التوصيل» ولا تُقبل طلبات جديدة.',
        f: { baseFee: 'رسوم ثابتة', baseFeeHint: 'تُضاف لكل توصيلة.', perKm: 'سعر الكيلومتر', perKmHint: 'يُضرب في المسافة التقديرية على الطرق.', minFee: 'الحد الأدنى', minFeeHint: 'أقل تكلفة لأي توصيلة.', interCityFee: 'رسوم بين المدن', interCityFeeHint: 'تُضاف عندما تكون مدينة التسليم مختلفة.', maxKm: 'أقصى مسافة', maxKmHint: 'لا تُقبل الطلبات الأبعد من ذلك.' },
        examples: 'أمثلة بالأسعار الحالية', formula: 'التكلفة = الأكبر بين (الحد الأدنى) و(الرسوم الثابتة + سعر الكيلومتر × المسافة)، + رسوم بين المدن، مقرّبة لأعلى 10 أوقية.',
      },
    },
    admin: {
      nav: { delivery: 'التوصيل' }, deliveryOrders: 'طلبات التوصيل', deliveryCouriers: 'شركاء التوصيل', deliveryPricing: 'أسعار التوصيل',
      pendingOrders: 'طلبات توصيل بانتظار البائع', pendingCouriers: 'طلبات انضمام مندوبين', openOrders: 'طلبات توصيل جارية', deliveredOrders: 'طلبات تم تسليمها',
    },
    errors: {
      order_exists: 'لديك طلب جارٍ على هذا المنتج بالفعل.', product_sold: 'هذا المنتج لم يعد متاحاً.', own_product: 'لا يمكنك طلب منتجك.', too_far: 'العنوان أبعد من أقصى مسافة للتوصيل.',
      delivery_disabled: 'خدمة التوصيل متوقفة حالياً.', invalid_transition: 'لا يمكن نقل الطلب إلى هذه المرحلة الآن.', not_allowed: 'هذا الإجراء ليس من صلاحيتك.',
      no_courier: 'يجب تعيين مندوب أولاً.', order_taken: 'تكفّل مندوب آخر بهذا الطلب.', already_applied: 'لديك طلب انضمام بالفعل.', already_rated: 'سبق أن قيّمت هذا التوصيل.',
      cannot_rate: 'يمكن التقييم بعد التسليم فقط.', not_a_courier: 'هذه الصفحة لمندوبي التوصيل المقبولين.', location_sharing_off: 'فعّل مشاركة الموقع أولاً.',
      cannot_reassign: 'لا يمكن تغيير المندوب بعد استلام الطلب.', courier_not_available: 'هذا المندوب غير متاح.', courier_is_party: 'لا يمكن تعيين البائع أو المشتري مندوباً.',
      order_not_found: 'الطلب غير موجود.', courier_not_found: 'المندوب غير موجود.', outside_mauritania: 'موقعك خارج موريتانيا، حدّد العنوان يدوياً.',
    },
    notifications: { types: {
      order_new: 'طلب توصيل جديد على «{title}» — اقبله للبدء', order_status: 'طلبك #{id} «{title}»: {status}', order_courier: 'تم تعيين المندوب {name} لطلب «{title}»',
      order_available: 'طلب توصيل متاح في مدينتك: «{title}»', order_assigned: 'أُسند إليك توصيل «{title}»', order_unassigned: 'سُحب منك توصيل «{title}»',
      delivery_rated: 'حصلت على تقييم {rating}★ لتوصيل الطلب #{id}', courier_application: 'طلب انضمام جديد لشركاء التوصيل من {name}',
      courier_approved: 'تم قبولك شريكاً للتوصيل 🎉 ابدأ باستقبال الطلبات', courier_rejected: 'لم يُقبل طلب انضمامك للتوصيل. السبب: {reason}', courier_suspended: 'تم إيقاف حسابك كمندوب. السبب: {reason}',
    } },
  },
  fr: {
    delivery: {
      nav: { orders: 'Mes commandes', courier: 'Livreurs partenaires', join: 'Devenir livreur partenaire' },
      cta: { title: 'Se faire livrer', text: 'Nous livrons le produit à votre porte. Paiement en espèces à la livraison.', button: 'Commander avec livraison', short: 'Livraison' },
      status: { pending: 'En attente de confirmation', accepted: 'Commande acceptée', preparing: 'En préparation', picked_up: 'Récupérée chez le vendeur', on_the_way: 'En route vers l’acheteur', delivered: 'Livrée', cancelled: 'Annulée' },
      event: { pending: 'Commande créée', accepted: 'Le vendeur a accepté', preparing: 'Préparation commencée', picked_up: 'Le livreur a récupéré la commande', on_the_way: 'Le livreur est en route', delivered: 'Livrée', cancelled: 'Commande annulée', courier_assigned: 'Livreur assigné', courier_removed: 'Livreur retiré' },
      action: { accepted: 'Accepter la commande', preparing: 'Commencer la préparation', picked_up: 'J’ai récupéré la commande', on_the_way: 'Je suis en route', delivered: 'Livrée et payée', cancelled: 'Annuler la commande' },
      role: { buyer: 'Acheteur', seller: 'Vendeur', courier: 'Livreur', admin: 'Administration' },
      vehicle: { motorbike: 'Moto', car: 'Voiture', tricycle: 'Tricycle', bicycle: 'Vélo', foot: 'À pied' },
      fields: { city: 'Ville', area: 'Moughataa', chooseArea: 'Choisir la moughataa', district: 'Quartier', districtPh: 'Ex. : Ksar, Carrefour Madrid…', phone: 'Téléphone de contact', phoneHint: 'Visible seulement par le livreur.', address: 'Adresse détaillée', addressHint: 'Repère proche, couleur de la porte, étage…', note: 'Note pour le livreur', notePh: 'Ex. : appelez 15 min avant' },
      checkout: {
        title: 'Commande avec livraison', subtitle: 'Indiquez l’adresse et vérifiez le coût avant de confirmer. Paiement à la livraison.', where: 'Adresse de livraison',
        pinTitle: 'Point de livraison sur la carte', pinHint: 'Touchez la carte pour placer le repère (facultatif, mais le prix est plus précis).',
        privacy: 'Votre adresse, téléphone et position ne sont visibles que par le livreur assigné et l’administration. Le vendeur voit seulement ville, moughataa et quartier.',
        confirm: 'Confirmer la commande', afterConfirm: 'Le vendeur reçoit votre commande immédiatement ; vous êtes notifié à chaque étape.', placed: 'Commande envoyée ✔',
      },
      cost: { item: 'Prix du produit', delivery: 'Livraison', total: 'Total', distance: 'environ {km} km', interCity: 'entre deux villes' },
      cod: { title: 'Paiement à la livraison', text: 'Rien à payer maintenant : vous réglez le total en espèces au livreur à la réception.', short: 'Paiement en espèces à la livraison' },
      orders: {
        title: 'Mes commandes', as: { buyer: 'Mes achats', seller: 'Commandes reçues', courier: 'Mes livraisons' }, open: 'En cours', history: 'Historique',
        empty: { buyer: 'Aucune commande pour l’instant.', seller: 'Aucune commande sur vos produits.', courier: 'Aucune livraison.' }, browse: 'Voir les annonces',
      },
      order: {
        title: 'Commande', progress: 'Étapes', costs: 'Coût', deliverTo: 'Livrer à', people: 'Intervenants', timeline: 'Historique',
        noCourier: 'Pas encore assigné', call: 'Appeler', openMap: 'Ouvrir sur la carte', addressHidden: 'L’adresse et le téléphone de l’acheteur ne sont visibles que par le livreur et l’administration.',
        cancelReason: 'Motif de l’annulation', confirmCancel: 'Confirmer l’annulation', cancelledBy: 'Annulée par : {who}', updated: 'Statut mis à jour',
        sellerPending: 'Nouvelle commande : acceptez-la pour lancer la préparation et la proposer aux livreurs.', waitingCourier: 'En attente d’un livreur.',
      },
      track: { title: 'Suivre le livreur', destination: 'Point de livraison', courier: 'Livreur', updated: 'Mis à jour {ago}', legend: 'Repère doré : point de livraison', notShared: 'Le livreur ne partage pas sa position. Vous pouvez l’appeler.' },
      rate: { title: 'Notez la livraison', placeholder: 'Comment s’est passée la livraison ? (facultatif)', submit: 'Envoyer', yours: 'Votre note :' },
      join: {
        kicker: 'Livreurs partenaires', title: 'Devenez livreur partenaire', subtitle: 'Gagnez de l’argent en livrant les commandes {site} dans votre ville, à votre rythme.',
        steps: { apply: 'Postulez', applyText: 'Téléphone, ville, véhicule.', review: 'Validation', reviewText: 'L’équipe examine votre demande.', deliver: 'Livrez', deliverText: 'Choisissez les commandes de votre ville.', earn: 'Gagnez', earnText: 'Les frais de livraison vous sont payés à la remise.' },
        formTitle: 'Candidature', city: 'Ville de travail', vehicle: 'Véhicule', note: 'À propos de vous', notePh: 'Expérience, quartiers connus, horaires…',
        privacy: 'Votre numéro sert uniquement aux livraisons. Votre position n’est partagée que si vous l’activez pendant une livraison.',
        submit: 'Envoyer la candidature', pendingTitle: 'Candidature en cours d’examen', pendingText: 'L’administration vous répondra bientôt par notification.',
        rejectedTitle: 'Candidature refusée', suspendedTitle: 'Compte livreur suspendu', reapply: 'Postuler à nouveau',
      },
      courier: {
        title: 'Espace livreur', subtitle: 'Commandes disponibles dans votre ville et vos livraisons en cours.', active: 'En cours', delivered: 'Livrées', earned: 'Gains', rating: 'Note',
        availableTitle: 'Disponible pour des livraisons', availableHint: 'Vous recevez une notification pour chaque nouvelle commande de votre ville.',
        shareTitle: 'Partager ma position pendant la livraison', shareHint: 'Avec votre accord seulement : l’acheteur voit votre position pendant la livraison, effacée dès l’arrêt. Gardez cette page ouverte.',
        live: { off: '', waiting: 'Localisation…', live: '🟢 Position partagée avec l’acheteur', idle: 'Aucune livraison en cours : position non conservée.', denied: 'Accès à la position refusé.', unsupported: 'Localisation non prise en charge.', error: 'Échec de l’envoi, nouvel essai bientôt.' },
        myDeliveries: 'Mes livraisons en cours', noActive: 'Aucune livraison en cours.', availableOrders: 'Commandes disponibles dans votre ville', noneAvailable: 'Aucune commande disponible.', refresh: 'Actualiser',
        from: 'De', to: 'à', yourFee: 'Votre rémunération', take: 'Je prends cette livraison', claimed: 'La commande est à vous : rendez-vous chez le vendeur.',
      },
      courierStatus: { pending: 'À examiner', approved: 'Acceptés', suspended: 'Suspendus', rejected: 'Refusés', all: 'Tous' },
      admin: {
        orders: 'Commandes livrées', ordersHint: 'Suivez toutes les commandes, assignez les livreurs et changez le statut si besoin.', open: 'En cours', all: 'Toutes', search: 'N° de commande, produit, nom ou téléphone',
        noOrders: 'Aucune commande ici.', col: { product: 'Produit', people: 'Intervenants', place: 'Destination', total: 'Montant', status: 'Statut', date: 'Date' },
        assign: 'Assigner un livreur', noCourier: 'Sans livreur', busy: 'Indisponible', noCouriers: 'Aucun livreur accepté pour l’instant.', availableNow: 'Disponible',
        couriers: 'Livreurs partenaires', couriersHint: 'Examinez les candidatures ; acceptez, refusez ou suspendez les livreurs.', noCouriersHere: 'Personne ici.',
        approve: 'Accepter', reject: 'Refuser', suspend: 'Suspendre', reactivate: 'Réactiver', reason: 'Motif (envoyé au livreur)',
        pricing: 'Tarifs de livraison', pricingHint: 'Le coût est calculé automatiquement selon la distance entre le vendeur et le point de livraison.',
        enabled: 'Activer la livraison', enabledHint: 'Désactivée : le bouton « Se faire livrer » disparaît et aucune commande n’est acceptée.',
        f: { baseFee: 'Frais fixes', baseFeeHint: 'Ajoutés à chaque livraison.', perKm: 'Prix du km', perKmHint: 'Multiplié par la distance estimée par la route.', minFee: 'Minimum', minFeeHint: 'Coût minimal d’une livraison.', interCityFee: 'Supplément interurbain', interCityFeeHint: 'Si la ville de livraison est différente.', maxKm: 'Distance maximale', maxKmHint: 'Au-delà, la commande est refusée.' },
        examples: 'Exemples avec les tarifs actuels', formula: 'Coût = max(minimum, frais fixes + prix du km × distance) + supplément interurbain, arrondi aux 10 MRU supérieurs.',
      },
    },
    admin: {
      nav: { delivery: 'Livraison' }, deliveryOrders: 'Commandes', deliveryCouriers: 'Livreurs', deliveryPricing: 'Tarifs de livraison',
      pendingOrders: 'Commandes en attente du vendeur', pendingCouriers: 'Candidatures de livreurs', openOrders: 'Livraisons en cours', deliveredOrders: 'Commandes livrées',
    },
    errors: {
      order_exists: 'Vous avez déjà une commande en cours pour ce produit.', product_sold: 'Ce produit n’est plus disponible.', own_product: 'Vous ne pouvez pas commander votre propre produit.', too_far: 'L’adresse dépasse la distance maximale de livraison.',
      delivery_disabled: 'La livraison est suspendue pour le moment.', invalid_transition: 'Cette étape n’est pas possible maintenant.', not_allowed: 'Action non autorisée.',
      no_courier: 'Assignez d’abord un livreur.', order_taken: 'Un autre livreur a pris cette commande.', already_applied: 'Vous avez déjà postulé.', already_rated: 'Déjà noté.',
      cannot_rate: 'Notation possible après la livraison.', not_a_courier: 'Réservé aux livreurs acceptés.', location_sharing_off: 'Activez d’abord le partage de position.',
      cannot_reassign: 'Impossible de changer de livreur après la récupération.', courier_not_available: 'Ce livreur n’est pas disponible.', courier_is_party: 'Le vendeur ou l’acheteur ne peut pas être livreur.',
      order_not_found: 'Commande introuvable.', courier_not_found: 'Livreur introuvable.', outside_mauritania: 'Position hors de Mauritanie : saisissez l’adresse.',
    },
    notifications: { types: {
      order_new: 'Nouvelle commande avec livraison pour « {title} » — acceptez-la', order_status: 'Commande #{id} « {title} » : {status}', order_courier: 'Le livreur {name} est assigné à « {title} »',
      order_available: 'Livraison disponible dans votre ville : « {title} »', order_assigned: 'On vous a confié la livraison de « {title} »', order_unassigned: 'La livraison de « {title} » vous a été retirée',
      delivery_rated: 'Vous avez reçu {rating}★ pour la commande #{id}', courier_application: 'Nouvelle candidature de livreur : {name}',
      courier_approved: 'Vous êtes livreur partenaire 🎉', courier_rejected: 'Candidature de livreur refusée. Motif : {reason}', courier_suspended: 'Compte livreur suspendu. Motif : {reason}',
    } },
  },
  en: {
    delivery: {
      nav: { orders: 'My orders', courier: 'Delivery partners', join: 'Become a delivery partner' },
      cta: { title: 'Get it delivered', text: 'We bring the item to your door. Pay cash on delivery.', button: 'Order with delivery', short: 'Delivery' },
      status: { pending: 'Awaiting confirmation', accepted: 'Order accepted', preparing: 'Being prepared', picked_up: 'Picked up from seller', on_the_way: 'On the way to buyer', delivered: 'Delivered', cancelled: 'Cancelled' },
      event: { pending: 'Order placed', accepted: 'Seller accepted the order', preparing: 'Preparation started', picked_up: 'Courier picked up the order', on_the_way: 'Courier is on the way', delivered: 'Delivered', cancelled: 'Order cancelled', courier_assigned: 'Courier assigned', courier_removed: 'Courier removed' },
      action: { accepted: 'Accept order', preparing: 'Start preparing', picked_up: 'I picked up the order', on_the_way: 'I’m on my way', delivered: 'Delivered & paid', cancelled: 'Cancel order' },
      role: { buyer: 'Buyer', seller: 'Seller', courier: 'Courier', admin: 'Admin' },
      vehicle: { motorbike: 'Motorbike', car: 'Car', tricycle: 'Tricycle', bicycle: 'Bicycle', foot: 'On foot' },
      fields: { city: 'City', area: 'Moughataa', chooseArea: 'Choose the moughataa', district: 'Neighbourhood', districtPh: 'e.g. Ksar, Carrefour Madrid…', phone: 'Contact phone', phoneHint: 'Only the courier sees it, to reach you.', address: 'Detailed address', addressHint: 'Nearby landmark, door colour, floor…', note: 'Note for the courier', notePh: 'e.g. call 15 minutes before arriving' },
      checkout: {
        title: 'Order with delivery', subtitle: 'Set the delivery address and check the cost before confirming. Pay cash on delivery.', where: 'Delivery address',
        pinTitle: 'Delivery point on the map', pinHint: 'Tap the map to drop a pin on your exact place (optional, but the price is more accurate).',
        privacy: 'Your address, phone and location are only visible to the assigned courier and the admins. The seller only sees the city, moughataa and neighbourhood.',
        confirm: 'Confirm order', afterConfirm: 'The seller gets your order right away; you’ll be notified at every step.', placed: 'Order sent ✔',
      },
      cost: { item: 'Item price', delivery: 'Delivery', total: 'Total', distance: 'about {km} km', interCity: 'between cities' },
      cod: { title: 'Cash on delivery', text: 'Nothing to pay now: you pay the total in cash to the courier when you receive the item.', short: 'Cash on delivery' },
      orders: {
        title: 'My orders', as: { buyer: 'My purchases', seller: 'Orders for my items', courier: 'My deliveries' }, open: 'In progress', history: 'History',
        empty: { buyer: 'You haven’t ordered a delivery yet.', seller: 'No orders on your items yet.', courier: 'No deliveries yet.' }, browse: 'Browse listings',
      },
      order: {
        title: 'Order', progress: 'Order progress', costs: 'Cost', deliverTo: 'Deliver to', people: 'People', timeline: 'Timeline',
        noCourier: 'Not assigned yet', call: 'Call', openMap: 'Open the place on the map', addressHidden: 'The detailed address and buyer’s phone are visible to the courier and admins only.',
        cancelReason: 'Reason for cancelling', confirmCancel: 'Confirm cancellation', cancelledBy: 'Cancelled by: {who}', updated: 'Order status updated',
        sellerPending: 'New order: accept it to start preparing and offer it to couriers.', waitingCourier: 'Waiting for a courier to take the order.',
      },
      track: { title: 'Track the courier', destination: 'Delivery point', courier: 'Courier', updated: 'Updated {ago}', legend: 'Gold pin: delivery point', notShared: 'The courier isn’t sharing their location. You can call them directly.' },
      rate: { title: 'Rate the delivery', placeholder: 'How was the courier? (optional)', submit: 'Send rating', yours: 'Your rating:' },
      join: {
        kicker: 'Delivery partners', title: 'Become a delivery partner', subtitle: 'Earn by delivering {site} orders in your city, on your own schedule.',
        steps: { apply: 'Apply', applyText: 'Phone, city and vehicle.', review: 'Admin review', reviewText: 'We check your request and reply.', deliver: 'Pick up & deliver', deliverText: 'Choose open orders in your city.', earn: 'Earn', earnText: 'The delivery fee is paid to you on delivery.' },
        formTitle: 'Application', city: 'City you work in', vehicle: 'Vehicle', note: 'About you', notePh: 'Experience, neighbourhoods you know, hours…',
        privacy: 'Your number is only used for deliveries. Your location is shared only if you switch it on during a delivery.',
        submit: 'Send application', pendingTitle: 'Your application is under review', pendingText: 'The admins will review it soon; you’ll get a notification.',
        rejectedTitle: 'Application not accepted', suspendedTitle: 'Your courier account is suspended', reapply: 'Apply again',
      },
      courier: {
        title: 'Courier dashboard', subtitle: 'Open orders in your city and your ongoing deliveries.', active: 'Ongoing', delivered: 'Delivered', earned: 'Earnings', rating: 'Rating',
        availableTitle: 'Available for deliveries', availableHint: 'When on, you are notified of every new order in your city.',
        shareTitle: 'Share my location while delivering', shareHint: 'Only with your consent: the buyer sees your position during the delivery only; it is erased when you stop. Keep this page open.',
        live: { off: '', waiting: 'Finding your location…', live: '🟢 Your location is being shared with the buyer', idle: 'No delivery in progress: your location is not kept.', denied: 'Location access was refused.', unsupported: 'Your browser cannot share a location.', error: 'Could not send your location; retrying.' },
        myDeliveries: 'My ongoing deliveries', noActive: 'No ongoing deliveries.', availableOrders: 'Open orders in your city', noneAvailable: 'No open orders right now.', refresh: 'Refresh',
        from: 'From', to: 'to', yourFee: 'Your fee', take: 'Take this delivery', claimed: 'The order is yours: head to the seller.',
      },
      courierStatus: { pending: 'To review', approved: 'Approved', suspended: 'Suspended', rejected: 'Rejected', all: 'All' },
      admin: {
        orders: 'Delivery orders', ordersHint: 'Follow every order and its stages, assign couriers, and change the status when needed.', open: 'In progress', all: 'All', search: 'Order number, item, name or phone',
        noOrders: 'No orders here.', col: { product: 'Item', people: 'People', place: 'Destination', total: 'Amount', status: 'Status', date: 'Date' },
        assign: 'Assign a courier', noCourier: 'No courier', busy: 'Unavailable', noCouriers: 'No approved couriers yet.', availableNow: 'Available',
        couriers: 'Delivery partners', couriersHint: 'Review applications; approve, reject or suspend couriers.', noCouriersHere: 'Nobody here.',
        approve: 'Approve', reject: 'Reject', suspend: 'Suspend', reactivate: 'Reactivate', reason: 'Reason (sent to the courier)',
        pricing: 'Delivery prices', pricingHint: 'The delivery cost is computed automatically from the distance between the seller and the delivery point.',
        enabled: 'Delivery service on', enabledHint: 'When off, the “Order with delivery” button disappears and no new orders are accepted.',
        f: { baseFee: 'Base fee', baseFeeHint: 'Added to every delivery.', perKm: 'Price per km', perKmHint: 'Multiplied by the estimated road distance.', minFee: 'Minimum fee', minFeeHint: 'The lowest cost of any delivery.', interCityFee: 'Inter-city surcharge', interCityFeeHint: 'Added when the delivery city is different.', maxKm: 'Maximum distance', maxKmHint: 'Orders further away are refused.' },
        examples: 'Examples at current prices', formula: 'Cost = max(minimum, base fee + price per km × distance) + inter-city surcharge, rounded up to 10 MRU.',
      },
    },
    admin: {
      nav: { delivery: 'Delivery' }, deliveryOrders: 'Orders', deliveryCouriers: 'Couriers', deliveryPricing: 'Delivery prices',
      pendingOrders: 'Orders awaiting the seller', pendingCouriers: 'Courier applications', openOrders: 'Ongoing deliveries', deliveredOrders: 'Delivered orders',
    },
    errors: {
      order_exists: 'You already have an open order for this item.', product_sold: 'This item is no longer available.', own_product: 'You can’t order your own item.', too_far: 'The address is beyond the maximum delivery distance.',
      delivery_disabled: 'Delivery is paused for now.', invalid_transition: 'The order can’t move to that stage now.', not_allowed: 'You’re not allowed to do this.',
      no_courier: 'Assign a courier first.', order_taken: 'Another courier already took this order.', already_applied: 'You already applied.', already_rated: 'Already rated.',
      cannot_rate: 'You can rate after delivery only.', not_a_courier: 'For approved couriers only.', location_sharing_off: 'Turn on location sharing first.',
      cannot_reassign: 'The courier can’t be changed after pick-up.', courier_not_available: 'This courier isn’t available.', courier_is_party: 'The buyer or seller can’t be the courier.',
      order_not_found: 'Order not found.', courier_not_found: 'Courier not found.', outside_mauritania: 'You seem to be outside Mauritania: enter the address by hand.',
    },
    notifications: { types: {
      order_new: 'New delivery order for “{title}” — accept it to start', order_status: 'Order #{id} “{title}”: {status}', order_courier: 'Courier {name} was assigned to “{title}”',
      order_available: 'Delivery available in your city: “{title}”', order_assigned: 'You were assigned the delivery of “{title}”', order_unassigned: 'The delivery of “{title}” was taken off you',
      delivery_rated: 'You got {rating}★ for order #{id}', courier_application: 'New delivery partner application from {name}',
      courier_approved: 'You’re now a delivery partner 🎉 Start taking orders', courier_rejected: 'Courier application not accepted. Reason: {reason}', courier_suspended: 'Courier account suspended. Reason: {reason}',
    } },
  },
};
deepMerge(ar, v22.ar);
deepMerge(fr, v22.fr);
deepMerge(en, v22.en);

// ---------- v23: notifications on the phone (Web Push) ----------
deepMerge(ar, {
  push: {
    title: 'التنبيهات على هاتفك', text: 'اعرف فوراً عندما يراسلك مشترٍ أو يتغيّر طلبك، حتى والموقع مغلق.',
    onText: 'مفعّلة على هذا الجهاز: ستصلك الرسائل والطلبات فوراً.', enable: 'تفعيل', disable: 'إيقاف', test: 'تجربة', testSent: 'أرسلنا تنبيهاً تجريبياً إلى أجهزتك',
    enabled: 'تم تفعيل التنبيهات على هذا الجهاز 🔔', denied: 'رفضتَ التنبيهات لهذا الموقع. فعّلها من إعدادات المتصفح ثم أعد المحاولة.',
    unsupported: 'هذا المتصفح لا يدعم التنبيهات. جرّب Chrome على أندرويد أو الكمبيوتر.',
    iosHint: 'على آيفون: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»، وافتح الموقع من الأيقونة لتفعيل التنبيهات.',
    bannerTitle: 'لا تفوّت أي مشترٍ', bannerText: 'فعّل التنبيهات لتصلك الرسائل على هاتفك فوراً.', later: 'لاحقاً',
  },
  notifications: { types: { push_test: 'هذا تنبيه تجريبي من {site} ✅' } },
});
deepMerge(fr, {
  push: {
    title: 'Notifications sur votre téléphone', text: 'Sachez tout de suite quand un acheteur vous écrit ou qu’une commande avance, même site fermé.',
    onText: 'Activées sur cet appareil : messages et commandes arrivent immédiatement.', enable: 'Activer', disable: 'Désactiver', test: 'Tester', testSent: 'Notification de test envoyée à vos appareils',
    enabled: 'Notifications activées sur cet appareil 🔔', denied: 'Vous avez bloqué les notifications pour ce site. Autorisez-les dans les réglages du navigateur.',
    unsupported: 'Ce navigateur ne gère pas les notifications. Essayez Chrome sur Android ou ordinateur.',
    iosHint: 'Sur iPhone : touchez Partager puis « Sur l’écran d’accueil », et ouvrez le site depuis l’icône pour activer les notifications.',
    bannerTitle: 'Ne ratez aucun acheteur', bannerText: 'Activez les notifications pour recevoir vos messages tout de suite.', later: 'Plus tard',
  },
  notifications: { types: { push_test: 'Ceci est une notification de test de {site} ✅' } },
});
deepMerge(en, {
  push: {
    title: 'Notifications on your phone', text: 'Know right away when a buyer messages you or an order moves, even with the site closed.',
    onText: 'On for this device: messages and orders arrive instantly.', enable: 'Turn on', disable: 'Turn off', test: 'Test', testSent: 'Test notification sent to your devices',
    enabled: 'Notifications are on for this device 🔔', denied: 'Notifications are blocked for this site. Allow them in your browser settings and try again.',
    unsupported: 'This browser cannot show notifications. Try Chrome on Android or a computer.',
    iosHint: 'On iPhone: tap Share, then “Add to Home Screen”, and open the site from that icon to turn on notifications.',
    bannerTitle: 'Never miss a buyer', bannerText: 'Turn on notifications to get your messages on your phone right away.', later: 'Later',
  },
  notifications: { types: { push_test: 'This is a test notification from {site} ✅' } },
});

// ---------- v24: saved searches and price-drop alerts ----------
deepMerge(ar, {
  alerts: {
    title: 'تنبيهات البحث', notifyMe: 'أعلمني بالجديد', on: 'التنبيه مفعّل', saved: 'سنعلمك بكل إعلان جديد يطابق هذا البحث 🔔', search: 'بحث محفوظ',
    intro: 'نرسل لك تنبيهاً (وعلى هاتفك إن فعّلت التنبيهات) عند نشر إعلان جديد يطابق بحثك.',
    empty: 'لا توجد عمليات بحث محفوظة', start: 'ابحث ثم اضغط «أعلمني بالجديد»', active: 'مفعّل', paused: 'متوقف', hits: '{n} إعلان مطابق حتى الآن',
    view: 'عرض النتائج', pause: 'إيقاف', resume: 'تفعيل', priceDropHint: 'سنعلمك عندما ينخفض سعر أي إعلان في مفضلتك.',
  },
  errors: { too_many_saved_searches: 'وصلت للحد الأقصى (20 بحثاً محفوظاً). احذف بعضها أولاً.' },
  notifications: { types: {
    saved_search_match: 'إعلان جديد يطابق بحثك «{name}»: {title}',
    price_drop: 'نزل سعر «{title}» من {old} إلى {price} أوقية 🔻',
  } },
});
deepMerge(fr, {
  alerts: {
    title: 'Alertes de recherche', notifyMe: 'M’alerter', on: 'Alerte activée', saved: 'Nous vous préviendrons de chaque nouvelle annonce correspondante 🔔', search: 'Recherche enregistrée',
    intro: 'Vous recevez une notification (aussi sur votre téléphone si activé) dès qu’une nouvelle annonce correspond à votre recherche.',
    empty: 'Aucune recherche enregistrée', start: 'Lancez une recherche puis touchez « M’alerter »', active: 'Active', paused: 'En pause', hits: '{n} annonce(s) trouvée(s)',
    view: 'Voir les résultats', pause: 'Pause', resume: 'Réactiver', priceDropHint: 'Nous vous prévenons quand le prix d’une annonce de vos favoris baisse.',
  },
  errors: { too_many_saved_searches: 'Limite atteinte (20 recherches). Supprimez-en d’abord.' },
  notifications: { types: {
    saved_search_match: 'Nouvelle annonce pour « {name} » : {title}',
    price_drop: 'Baisse de prix : « {title} » passe de {old} à {price} MRU 🔻',
  } },
});
deepMerge(en, {
  alerts: {
    title: 'Search alerts', notifyMe: 'Notify me', on: 'Alert on', saved: 'We’ll tell you about every new listing that matches 🔔', search: 'Saved search',
    intro: 'You get a notification (on your phone too, if turned on) as soon as a new listing matches your search.',
    empty: 'No saved searches yet', start: 'Search, then tap “Notify me”', active: 'Active', paused: 'Paused', hits: '{n} matching listing(s) so far',
    view: 'See results', pause: 'Pause', resume: 'Resume', priceDropHint: 'We’ll tell you when the price of a listing in your favourites drops.',
  },
  errors: { too_many_saved_searches: 'Limit reached (20 saved searches). Delete some first.' },
  notifications: { types: {
    saved_search_match: 'New listing for “{name}”: {title}',
    price_drop: 'Price drop: “{title}” went from {old} to {price} MRU 🔻',
  } },
});

// ---------- v25: phone number confirmed by SMS code ----------
deepMerge(ar, {
  common: { continue: 'متابعة' },
  phone: {
    title: 'تأكيد رقم الهاتف', why: 'لحماية الجميع من الحسابات الوهمية والنصب، نرسل رمزاً من 6 أرقام إلى رقمك.',
    send: 'أرسل الرمز', resend: 'إعادة إرسال الرمز', resendIn: 'إعادة الإرسال بعد {s} ثانية', enterCode: 'أدخل الرمز الذي وصلك',
    confirm: 'تأكيد', done: 'تم تأكيد رقمك ✓', already: 'رقمك مؤكَّد.', notNeeded: 'تأكيد الرقم غير مطلوب حالياً.',
    wrongNumber: 'الرقم خطأ؟', change: 'غيّره من الملف الشخصي', addPhone: 'أضف رقم هاتفك أولاً',
    devCode: 'وضع التجربة: الرمز هو {code}', verifyNow: 'أكّد رقمك الآن', notVerified: 'رقمك غير مؤكَّد بعد', badge: 'رقم مؤكَّد',
    adminLabel: 'تأكيد رقم الهاتف برسالة SMS', adminHint: 'لا يستطيع الحساب نشر إعلان أو مراسلة أو الطلب قبل تأكيد رقمه برمز.',
    adminNoProvider: 'لم تُضَف مفاتيح Twilio بعد، لذلك التأكيد متوقف الآن. أضف TWILIO_ACCOUNT_SID وTWILIO_AUTH_TOKEN وTWILIO_VERIFY_SERVICE_SID في Vercel ← Settings ← Environment Variables.',
  },
  errors: {
    phone_unverified: 'أكّد رقم هاتفك أولاً برمز SMS.', wrong_code: 'الرمز غير صحيح أو انتهت صلاحيته.', sms_failed: 'تعذّر إرسال الرسالة الآن، حاول بعد قليل.',
    verification_off: 'تأكيد الرقم غير مفعّل.', invalid_phone: 'رقم الهاتف غير صالح.',
  },
});
deepMerge(fr, {
  common: { continue: 'Continuer' },
  phone: {
    title: 'Confirmer votre numéro', why: 'Pour protéger tout le monde des faux comptes et des arnaques, nous envoyons un code à 6 chiffres à votre numéro.',
    send: 'Envoyer le code', resend: 'Renvoyer le code', resendIn: 'Renvoyer dans {s} s', enterCode: 'Saisissez le code reçu',
    confirm: 'Confirmer', done: 'Numéro confirmé ✓', already: 'Votre numéro est confirmé.', notNeeded: 'La confirmation n’est pas requise pour le moment.',
    wrongNumber: 'Mauvais numéro ?', change: 'Modifiez-le dans votre profil', addPhone: 'Ajoutez d’abord votre numéro',
    devCode: 'Mode test : le code est {code}', verifyNow: 'Confirmer mon numéro', notVerified: 'Numéro non confirmé', badge: 'Numéro confirmé',
    adminLabel: 'Confirmation du numéro par SMS', adminHint: 'Un compte ne peut publier, écrire ou commander qu’après avoir confirmé son numéro.',
    adminNoProvider: 'Les clés Twilio ne sont pas encore ajoutées : la confirmation est désactivée. Ajoutez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_VERIFY_SERVICE_SID dans Vercel → Settings → Environment Variables.',
  },
  errors: {
    phone_unverified: 'Confirmez d’abord votre numéro par SMS.', wrong_code: 'Code incorrect ou expiré.', sms_failed: 'Envoi impossible pour le moment, réessayez.',
    verification_off: 'La confirmation n’est pas activée.', invalid_phone: 'Numéro invalide.',
  },
});
deepMerge(en, {
  common: { continue: 'Continue' },
  phone: {
    title: 'Confirm your phone number', why: 'To protect everyone from fake accounts and scams, we text a 6-digit code to your number.',
    send: 'Send code', resend: 'Send again', resendIn: 'Send again in {s}s', enterCode: 'Enter the code you received',
    confirm: 'Confirm', done: 'Number confirmed ✓', already: 'Your number is confirmed.', notNeeded: 'Confirmation is not required right now.',
    wrongNumber: 'Wrong number?', change: 'Change it in your profile', addPhone: 'Add your phone number first',
    devCode: 'Test mode: the code is {code}', verifyNow: 'Confirm my number', notVerified: 'Number not confirmed yet', badge: 'Confirmed number',
    adminLabel: 'Phone confirmation by SMS', adminHint: 'An account can only post, message or order after confirming its number with a code.',
    adminNoProvider: 'Twilio keys are not added yet, so confirmation is off. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID in Vercel → Settings → Environment Variables.',
  },
  errors: {
    phone_unverified: 'Confirm your phone number by SMS first.', wrong_code: 'Wrong or expired code.', sms_failed: 'Could not send the text right now, try again shortly.',
    verification_off: 'Phone confirmation is off.', invalid_phone: 'Invalid phone number.',
  },
});

export const messages = { ar, fr, en };
export const LANGS = [
  { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar-MR' },
  { code: 'fr', label: 'Français', dir: 'ltr', locale: 'fr-FR' },
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
];
