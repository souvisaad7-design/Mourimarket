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

// ---------- v26: chat — price offers, photos, voice notes ----------
deepMerge(ar, {
  chat: {
    makeOffer: 'قدّم عرض سعر', photo: 'صورة', voice: 'رسالة صوتية', recording: 'جارٍ التسجيل…', voiceNote: 'رسالة صوتية',
    youOffered: 'عرضك', theyOffered: 'عرض سعر', accept: 'قبول', decline: 'رفض', counter: 'عرض مقابل', withdraw: 'سحب العرض',
    askedPrice: 'السعر المطلوب', yourPrice: 'السعر الذي تقترحه', sendOffer: 'إرسال العرض',
    offerStatus: { pending: 'بانتظار الرد', accepted: 'تم القبول ✓', declined: 'مرفوض', countered: 'رُدّ عليه بعرض آخر', withdrawn: 'مسحوب', superseded: 'استُبدل بعرض أحدث' },
    preview: { offer: '💰 عرض سعر', image: '📷 صورة', audio: '🎤 رسالة صوتية' },
  },
  errors: { mic_denied: 'لم يُسمح باستخدام الميكروفون. فعّله من إعدادات المتصفح.', offer_closed: 'تمت الإجابة على هذا العرض من قبل.', invalid_file_type: 'نوع الملف غير مدعوم.', offer_not_found: 'العرض غير موجود.' },
  notifications: { types: {
    offer_new: '{from} قدّم عرض سعر {amount} أوقية على «{title}»',
    offer_accepted: 'قبل {from} عرضك {amount} أوقية على «{title}» 🎉',
    offer_declined: 'رفض {from} عرضك {amount} أوقية على «{title}»',
  } },
});
deepMerge(fr, {
  chat: {
    makeOffer: 'Faire une offre', photo: 'Photo', voice: 'Vocal', recording: 'Enregistrement…', voiceNote: 'Message vocal',
    youOffered: 'Votre offre', theyOffered: 'Offre de prix', accept: 'Accepter', decline: 'Refuser', counter: 'Contre-offre', withdraw: 'Retirer l’offre',
    askedPrice: 'Prix demandé', yourPrice: 'Votre prix', sendOffer: 'Envoyer l’offre',
    offerStatus: { pending: 'En attente', accepted: 'Acceptée ✓', declined: 'Refusée', countered: 'Contre-offre faite', withdrawn: 'Retirée', superseded: 'Remplacée' },
    preview: { offer: '💰 Offre de prix', image: '📷 Photo', audio: '🎤 Message vocal' },
  },
  errors: { mic_denied: 'Micro non autorisé. Autorisez-le dans les réglages du navigateur.', offer_closed: 'Cette offre a déjà reçu une réponse.', invalid_file_type: 'Type de fichier non pris en charge.', offer_not_found: 'Offre introuvable.' },
  notifications: { types: {
    offer_new: '{from} propose {amount} MRU pour « {title} »',
    offer_accepted: '{from} a accepté votre offre de {amount} MRU pour « {title} » 🎉',
    offer_declined: '{from} a refusé votre offre de {amount} MRU pour « {title} »',
  } },
});
deepMerge(en, {
  chat: {
    makeOffer: 'Make an offer', photo: 'Photo', voice: 'Voice', recording: 'Recording…', voiceNote: 'Voice note',
    youOffered: 'Your offer', theyOffered: 'Price offer', accept: 'Accept', decline: 'Decline', counter: 'Counter', withdraw: 'Withdraw offer',
    askedPrice: 'Asking price', yourPrice: 'Your price', sendOffer: 'Send offer',
    offerStatus: { pending: 'Awaiting reply', accepted: 'Accepted ✓', declined: 'Declined', countered: 'Countered', withdrawn: 'Withdrawn', superseded: 'Replaced' },
    preview: { offer: '💰 Price offer', image: '📷 Photo', audio: '🎤 Voice note' },
  },
  errors: { mic_denied: 'Microphone not allowed. Allow it in your browser settings.', offer_closed: 'This offer was already answered.', invalid_file_type: 'This file type is not supported.', offer_not_found: 'Offer not found.' },
  notifications: { types: {
    offer_new: '{from} offered {amount} MRU for “{title}”',
    offer_accepted: '{from} accepted your offer of {amount} MRU for “{title}” 🎉',
    offer_declined: '{from} declined your offer of {amount} MRU for “{title}”',
  } },
});

// ---------- v27: category details (cars, real estate, phones, computers) ----------
deepMerge(ar, { fields: { invalid: 'قيمة غير صالحة', out_of_range: 'القيمة خارج المجال المسموح' } });
deepMerge(fr, { fields: { invalid: 'Valeur invalide', out_of_range: 'Valeur hors limites' } });
deepMerge(en, { fields: { invalid: 'Invalid value', out_of_range: 'Value out of range' } });
deepMerge(ar, { attrs: {
  details: 'تفاصيل إضافية', any: 'الكل', min: 'من', max: 'إلى', upTo: 'حتى',
  brand: 'الماركة', model: 'الموديل', year: 'سنة الصنع', mileage: 'الكيلومترات', gearbox: 'ناقل الحركة', fuel: 'الوقود',
  deal: 'نوع العرض', propertyType: 'نوع العقار', rooms: 'عدد الغرف', surface: 'المساحة', storage: 'السعة', ram: 'الذاكرة (RAM)',
  opts: { other: 'أخرى', gearbox: { manual: 'عادي', automatic: 'أوتوماتيك' }, fuel: { diesel: 'ديزل', petrol: 'بنزين', hybrid: 'هجين', electric: 'كهربائي' },
    deal: { sale: 'للبيع', rent: 'للإيجار' }, propertyType: { house: 'منزل', apartment: 'شقة', land: 'قطعة أرضية', shop: 'محل تجاري', office: 'مكتب', room: 'غرفة' } },
} });
deepMerge(fr, { attrs: {
  details: 'Détails', any: 'Tous', min: 'Min', max: 'Max', upTo: 'Jusqu’à',
  brand: 'Marque', model: 'Modèle', year: 'Année', mileage: 'Kilométrage', gearbox: 'Boîte de vitesses', fuel: 'Carburant',
  deal: 'Type d’offre', propertyType: 'Type de bien', rooms: 'Pièces', surface: 'Surface', storage: 'Stockage', ram: 'Mémoire (RAM)',
  opts: { other: 'Autre', gearbox: { manual: 'Manuelle', automatic: 'Automatique' }, fuel: { diesel: 'Diesel', petrol: 'Essence', hybrid: 'Hybride', electric: 'Électrique' },
    deal: { sale: 'À vendre', rent: 'À louer' }, propertyType: { house: 'Maison', apartment: 'Appartement', land: 'Terrain', shop: 'Local commercial', office: 'Bureau', room: 'Chambre' } },
} });
deepMerge(en, { attrs: {
  details: 'Details', any: 'Any', min: 'Min', max: 'Max', upTo: 'Up to',
  brand: 'Make / brand', model: 'Model', year: 'Year', mileage: 'Mileage', gearbox: 'Transmission', fuel: 'Fuel',
  deal: 'Offer type', propertyType: 'Property type', rooms: 'Rooms', surface: 'Area', storage: 'Storage', ram: 'Memory (RAM)',
  opts: { other: 'Other', gearbox: { manual: 'Manual', automatic: 'Automatic' }, fuel: { diesel: 'Diesel', petrol: 'Petrol', hybrid: 'Hybrid', electric: 'Electric' },
    deal: { sale: 'For sale', rent: 'For rent' }, propertyType: { house: 'House', apartment: 'Apartment', land: 'Land', shop: 'Shop', office: 'Office', room: 'Room' } },
} });

// ---------- v28: short video on listings ----------
deepMerge(ar, {
  video: { title: 'فيديو قصير', hint: 'حتى 60 ثانية (50 ميغابايت تقريباً). مفيد جداً للسيارات والعقارات.', add: 'أضف فيديو', remove: 'حذف الفيديو', uploading: 'جارٍ رفع الفيديو…',
    badType: 'صيغة الفيديو غير مدعومة (MP4 أو MOV أو WebM).', tooBig: 'الفيديو أكبر من 60 ميغابايت.', tooLong: 'الفيديو أطول من 60 ثانية. قصّه ثم أعد المحاولة.', failed: 'تعذّر رفع الفيديو، حاول مرة أخرى.', badge: 'فيديو' },
  errors: { video_disabled: 'رفع الفيديو غير مفعّل حالياً.' },
});
deepMerge(fr, {
  video: { title: 'Courte vidéo', hint: 'Jusqu’à 60 secondes (~50 Mo). Très utile pour les voitures et l’immobilier.', add: 'Ajouter une vidéo', remove: 'Supprimer la vidéo', uploading: 'Envoi de la vidéo…',
    badType: 'Format non pris en charge (MP4, MOV ou WebM).', tooBig: 'La vidéo dépasse 60 Mo.', tooLong: 'La vidéo dépasse 60 secondes. Coupez-la puis réessayez.', failed: 'Échec de l’envoi, réessayez.', badge: 'Vidéo' },
  errors: { video_disabled: 'L’envoi de vidéos est désactivé.' },
});
deepMerge(en, {
  video: { title: 'Short video', hint: 'Up to 60 seconds (~50 MB). Very useful for cars and property.', add: 'Add a video', remove: 'Remove video', uploading: 'Uploading video…',
    badType: 'Unsupported video format (MP4, MOV or WebM).', tooBig: 'The video is larger than 60 MB.', tooLong: 'The video is longer than 60 seconds. Trim it and try again.', failed: 'Upload failed, please try again.', badge: 'Video' },
  errors: { video_disabled: 'Video uploads are off.' },
});

// ---------- v29: "wanted" ads ----------
deepMerge(ar, {
  wanted: {
    nav: 'مطلوب', title: 'مطلوب', intro: 'لم تجد ما تبحث عنه؟ اكتب طلبك، ويراسلك من يملكه. الطلب يبقى منشوراً 30 يوماً.',
    new: 'أضف طلباً', what: 'ماذا تبحث عنه؟', whatPh: 'مثال: مطلوب هايلكس 2015 أو أحدث', budget: 'الميزانية القصوى', details: 'تفاصيل', detailsPh: 'الحالة، اللون، الحي…',
    publish: 'انشر الطلب', publishHint: 'يظهر طلبك فوراً، ويمكنك إغلاقه عندما تجد ما تريد.', all: 'كل الطلبات', mine: 'طلباتي',
    iHaveIt: 'عندي هذا', replyPh: 'صف ما عندك وسعره…', replies: '{n} رد', found: 'وجدته', renew: 'إعادة النشر',
    empty: 'لا توجد طلبات حالياً', emptyMine: 'لم تنشر أي طلب بعد', about: 'بخصوص طلب: {title}', safety: 'نصائح الأمان: لا تدفع مقدماً قبل رؤية المنتج',
  },
  errors: { wanted_not_found: 'الطلب غير موجود أو أُغلق.' },
  notifications: { types: { wanted_reply: '{from} يملك ما تبحث عنه: «{title}»' } },
});
deepMerge(fr, {
  wanted: {
    nav: 'Recherché', title: 'Recherché', intro: 'Vous ne trouvez pas ? Publiez votre demande, ceux qui l’ont vous écrivent. Elle reste en ligne 30 jours.',
    new: 'Publier une demande', what: 'Que recherchez-vous ?', whatPh: 'Ex. : Hilux 2015 ou plus récente', budget: 'Budget maximum', details: 'Détails', detailsPh: 'État, couleur, quartier…',
    publish: 'Publier la demande', publishHint: 'Votre demande paraît tout de suite ; fermez-la quand vous avez trouvé.', all: 'Toutes les demandes', mine: 'Mes demandes',
    iHaveIt: 'Je l’ai', replyPh: 'Décrivez ce que vous avez et le prix…', replies: '{n} réponse(s)', found: 'Trouvé', renew: 'Republier',
    empty: 'Aucune demande pour le moment', emptyMine: 'Vous n’avez publié aucune demande', about: 'Au sujet de la demande : {title}', safety: 'Conseil : ne payez jamais d’avance sans voir l’article',
  },
  errors: { wanted_not_found: 'Demande introuvable ou fermée.' },
  notifications: { types: { wanted_reply: '{from} a ce que vous recherchez : « {title} »' } },
});
deepMerge(en, {
  wanted: {
    nav: 'Wanted', title: 'Wanted', intro: 'Can’t find it? Post what you are looking for and people who have it will message you. It stays up for 30 days.',
    new: 'Post a request', what: 'What are you looking for?', whatPh: 'e.g. Hilux 2015 or newer', budget: 'Maximum budget', details: 'Details', detailsPh: 'Condition, colour, neighbourhood…',
    publish: 'Post request', publishHint: 'Your request is visible right away; close it once you have found it.', all: 'All requests', mine: 'My requests',
    iHaveIt: 'I have it', replyPh: 'Describe what you have and the price…', replies: '{n} replies', found: 'Found it', renew: 'Post again',
    empty: 'No requests right now', emptyMine: 'You have not posted any request yet', about: 'About the request: {title}', safety: 'Safety tip: never pay in advance before seeing the item',
  },
  errors: { wanted_not_found: 'Request not found or closed.' },
  notifications: { types: { wanted_reply: '{from} has what you are looking for: “{title}”' } },
});

// ---------- v30: seller statistics ----------
deepMerge(ar, { stats: {
  title: 'إحصائياتي', period: 'الفترة', lastDays: 'آخر {n} يوماً', views: 'المشاهدات', viewsUnit: 'مشاهدة', chats: 'محادثات جديدة', replyRate: 'معدل الرد',
  replySpeed: 'سرعة الرد: {v}', favorites: 'في المفضلة', live: '{n} إعلان منشور', daily: 'المشاهدات حسب اليوم', asTable: 'عرض كجدول', sources: 'من أين جاء الزوار',
  sourcesHint: 'روابط المشاركة عبر زر واتساب في صفحة الإعلان تُحسب «واتساب».', top: 'أفضل إعلاناتك', listing: 'الإعلان', noViews: 'لا توجد مشاهدات في هذه الفترة.',
  noListings: 'لا توجد إعلانات بعد.', minutes: '{n} دقيقة', hours: '{n} ساعة', daysN: '{n} يوم',
  tip: 'الرد السريع يزيد فرص البيع: فعّل التنبيهات على هاتفك لتعرف فوراً بكل رسالة.',
  source: { site: 'من داخل الموقع', direct: 'مباشر / تطبيقات', whatsapp: 'واتساب', facebook: 'فيسبوك', google: 'جوجل', instagram: 'إنستغرام', tiktok: 'تيك توك', qr: 'رمز QR', other: 'مواقع أخرى' },
} });
deepMerge(fr, { stats: {
  title: 'Mes statistiques', period: 'Période', lastDays: '{n} derniers jours', views: 'Vues', viewsUnit: 'vues', chats: 'Nouvelles conversations', replyRate: 'Taux de réponse',
  replySpeed: 'Délai de réponse : {v}', favorites: 'En favoris', live: '{n} annonce(s) en ligne', daily: 'Vues par jour', asTable: 'Voir en tableau', sources: 'D’où viennent les visiteurs',
  sourcesHint: 'Les liens partagés avec le bouton WhatsApp de l’annonce comptent comme « WhatsApp ».', top: 'Vos meilleures annonces', listing: 'Annonce', noViews: 'Aucune vue sur cette période.',
  noListings: 'Aucune annonce pour l’instant.', minutes: '{n} min', hours: '{n} h', daysN: '{n} j',
  tip: 'Répondre vite aide à vendre : activez les notifications sur votre téléphone pour voir chaque message tout de suite.',
  source: { site: 'Depuis le site', direct: 'Direct / applis', whatsapp: 'WhatsApp', facebook: 'Facebook', google: 'Google', instagram: 'Instagram', tiktok: 'TikTok', qr: 'QR code', other: 'Autres sites' },
} });
deepMerge(en, { stats: {
  title: 'My statistics', period: 'Period', lastDays: 'Last {n} days', views: 'Views', viewsUnit: 'views', chats: 'New conversations', replyRate: 'Reply rate',
  replySpeed: 'Reply time: {v}', favorites: 'In favourites', live: '{n} live listing(s)', daily: 'Views per day', asTable: 'Show as a table', sources: 'Where visitors come from',
  sourcesHint: 'Links shared with the WhatsApp button on a listing count as “WhatsApp”.', top: 'Your best listings', listing: 'Listing', noViews: 'No views in this period.',
  noListings: 'No listings yet.', minutes: '{n} min', hours: '{n} h', daysN: '{n} d',
  tip: 'Answering fast sells more: turn on phone notifications to see every message right away.',
  source: { site: 'Within the site', direct: 'Direct / apps', whatsapp: 'WhatsApp', facebook: 'Facebook', google: 'Google', instagram: 'Instagram', tiktok: 'TikTok', qr: 'QR code', other: 'Other sites' },
} });

// ---------- v31: bump a listing back to the top ----------
deepMerge(ar, {
  bump: { adminFreeDays: 'الرفع المجاني: مرة كل (أيام)', adminFreeDaysHint: 'كم يوماً ينتظر البائع بين رفعتين مجانيتين.', adminPrice: 'سعر الرفع الإضافي (MRU)', adminPriceHint: 'عند تفعيل الخدمات المدفوعة: لرفع الإعلان قبل انتهاء المدة.', cta: 'رفع للأعلى', hint: 'يعيد الإعلان إلى أعلى «الأحدث» مجاناً مرة كل {n} أيام', done: 'تم رفع إعلانك إلى الأعلى ⬆', tooSoon: 'رفعتَ هذا الإعلان مؤخراً. يمكنك رفعه مجاناً مرة أخرى في {date}.', buyNow: 'ارفعه الآن مقابل {price}', paidTitle: 'رفع «{title}» إلى الأعلى' },
  upgrades: { kind: { bump: 'رفع للأعلى' } },
  notifications: { types: { product_bumped: 'تم رفع إعلانك «{title}» إلى الأعلى ⬆', upgrade_rejected_bump: 'لم يُقبل طلب رفع «{title}». السبب: {reason}', upgrade_request_bump: '{name} طلب رفع إعلان «{title}»' } },
  errors: { bump_too_soon: 'رفعتَ هذا الإعلان مؤخراً.' },
});
deepMerge(fr, {
  bump: { adminFreeDays: 'Remontée gratuite : tous les (jours)', adminFreeDaysHint: 'Délai entre deux remontées gratuites.', adminPrice: 'Prix d’une remontée en plus (MRU)', adminPriceHint: 'Si les services payants sont activés : pour remonter avant la fin du délai.', cta: 'Remonter', hint: 'Remet l’annonce en tête des « plus récentes », gratuitement une fois tous les {n} jours', done: 'Votre annonce est remontée en tête ⬆', tooSoon: 'Vous avez remonté cette annonce récemment. Prochaine remontée gratuite le {date}.', buyNow: 'Remonter maintenant pour {price}', paidTitle: 'Remonter « {title} »' },
  upgrades: { kind: { bump: 'Remontée' } },
  notifications: { types: { product_bumped: 'Votre annonce « {title} » est remontée en tête ⬆', upgrade_rejected_bump: 'Remontée de « {title} » refusée. Motif : {reason}', upgrade_request_bump: '{name} demande la remontée de « {title} »' } },
  errors: { bump_too_soon: 'Annonce remontée récemment.' },
});
deepMerge(en, {
  bump: { adminFreeDays: 'Free bump: once every (days)', adminFreeDaysHint: 'How long a seller waits between two free bumps.', adminPrice: 'Price of an extra bump (MRU)', adminPriceHint: 'With paid services on: to bump before the wait is over.', cta: 'Bump to top', hint: 'Puts the listing back at the top of “newest”, free once every {n} days', done: 'Your listing is back at the top ⬆', tooSoon: 'You bumped this listing recently. Next free bump on {date}.', buyNow: 'Bump now for {price}', paidTitle: 'Bump “{title}” to the top' },
  upgrades: { kind: { bump: 'Bump' } },
  notifications: { types: { product_bumped: 'Your listing “{title}” is back at the top ⬆', upgrade_rejected_bump: 'Bump of “{title}” declined. Reason: {reason}', upgrade_request_bump: '{name} asked to bump “{title}”' } },
  errors: { bump_too_soon: 'Bumped recently.' },
});

// ---------- v32: car inspection reports ----------
deepMerge(ar, {
  admin: { inspections: 'فحص السيارات' },
  inspection: {
    title: 'تقرير فحص السيارة', ask: 'اطلب فحصاً', askText: 'ستتواصل معك الإدارة لتحديد موعد مع الورشة الشريكة. بعد الفحص يظهر التقرير في إعلانك مع علامة «مفحوصة».',
    availability: 'متى تكون متاحاً؟', availabilityPh: 'مثال: السبت صباحاً في تفرغ زينة', send: 'أرسل الطلب', requested: 'وصل طلب الفحص، سنتواصل معك قريباً',
    original: 'صورة التقرير الأصلي', disclaimer: 'التقرير من الورشة الشريكة بتاريخ الفحص، وقد تتغير حالة السيارة بعده.',
    overall: { excellent: 'ممتازة', good: 'جيدة', fair: 'مقبولة', poor: 'ضعيفة' }, overallLabel: 'التقييم العام',
    values: { ok: 'سليم', attention: 'يحتاج انتباهاً', problem: 'عطل' },
    items: { engine: 'المحرك', gearbox: 'ناقل الحركة', brakes: 'المكابح', suspension: 'نظام التعليق', steering: 'التوجيه', body: 'الهيكل والطلاء', electrical: 'الكهرباء', ac: 'المكيّف', tires: 'الإطارات', interior: 'المقصورة' },
    adminTitle: 'فحص السيارات', adminHint: 'طلبات فحص من البائعين: نسّق مع الورشة، ثم أدخل نتيجة الفحص وانشرها في الإعلان.', none: 'لا توجد طلبات فحص.',
    status: { requested: 'طلب جديد', scheduled: 'موعد محدد', published: 'منشور', cancelled: 'ملغى' }, enterReport: 'إدخال التقرير',
    workshop: 'الورشة', date: 'تاريخ الفحص', mileage: 'العداد عند الفحص (كم)', checklist: 'نقاط الفحص', summary: 'ملاحظات الفاحص', reportPhoto: 'صورة التقرير الورقي',
    publish: 'نشر التقرير', schedule: 'تم تحديد موعد', cancel: 'إلغاء الطلب',
  },
  errors: { vehicles_only: 'الفحص متاح لإعلانات السيارات فقط.', inspection_pending: 'لديك طلب فحص قيد المعالجة لهذا الإعلان.' },
  notifications: { types: { inspection_request: '{name} يطلب فحص سيارته «{title}»', inspection_published: 'نُشر تقرير فحص سيارتك «{title}» ✅', inspection_cancelled: 'أُلغي طلب فحص «{title}»' } },
});
deepMerge(fr, {
  admin: { inspections: 'Inspections auto' },
  inspection: {
    title: 'Rapport d’inspection', ask: 'Demander une inspection', askText: 'L’équipe vous contactera pour fixer un rendez-vous au garage partenaire. Le rapport apparaîtra ensuite sur l’annonce avec le badge « Inspectée ».',
    availability: 'Quand êtes-vous disponible ?', availabilityPh: 'Ex. : samedi matin à Tevragh Zeina', send: 'Envoyer la demande', requested: 'Demande reçue, nous vous contactons bientôt',
    original: 'Photo du rapport original', disclaimer: 'Rapport du garage partenaire à la date de l’inspection ; l’état peut changer ensuite.',
    overall: { excellent: 'Excellent', good: 'Bon', fair: 'Correct', poor: 'Médiocre' }, overallLabel: 'Note globale',
    values: { ok: 'OK', attention: 'À surveiller', problem: 'Défaut' },
    items: { engine: 'Moteur', gearbox: 'Boîte de vitesses', brakes: 'Freins', suspension: 'Suspension', steering: 'Direction', body: 'Carrosserie', electrical: 'Électricité', ac: 'Climatisation', tires: 'Pneus', interior: 'Intérieur' },
    adminTitle: 'Inspections auto', adminHint: 'Demandes des vendeurs : organisez le rendez-vous avec le garage, puis saisissez et publiez le rapport.', none: 'Aucune demande.',
    status: { requested: 'Nouvelle', scheduled: 'RDV fixé', published: 'Publiée', cancelled: 'Annulée' }, enterReport: 'Saisir le rapport',
    workshop: 'Garage', date: 'Date', mileage: 'Compteur (km)', checklist: 'Points de contrôle', summary: 'Remarques', reportPhoto: 'Photo du rapport papier',
    publish: 'Publier le rapport', schedule: 'RDV fixé', cancel: 'Annuler',
  },
  errors: { vehicles_only: 'Réservé aux annonces de véhicules.', inspection_pending: 'Une demande est déjà en cours pour cette annonce.' },
  notifications: { types: { inspection_request: '{name} demande l’inspection de « {title} »', inspection_published: 'Rapport d’inspection publié pour « {title} » ✅', inspection_cancelled: 'Inspection de « {title} » annulée' } },
});
deepMerge(en, {
  admin: { inspections: 'Car inspections' },
  inspection: {
    title: 'Inspection report', ask: 'Ask for an inspection', askText: 'The team will contact you to book the partner workshop. The report then appears on your listing with an “Inspected” badge.',
    availability: 'When are you available?', availabilityPh: 'e.g. Saturday morning in Tevragh Zeina', send: 'Send request', requested: 'Request received, we will contact you soon',
    original: 'Photo of the original report', disclaimer: 'Report by the partner workshop on the inspection date; the car may change afterwards.',
    overall: { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' }, overallLabel: 'Overall rating',
    values: { ok: 'OK', attention: 'Needs attention', problem: 'Fault' },
    items: { engine: 'Engine', gearbox: 'Transmission', brakes: 'Brakes', suspension: 'Suspension', steering: 'Steering', body: 'Body & paint', electrical: 'Electrics', ac: 'Air conditioning', tires: 'Tyres', interior: 'Interior' },
    adminTitle: 'Car inspections', adminHint: 'Requests from sellers: book the workshop, then enter and publish the report on the listing.', none: 'No inspection requests.',
    status: { requested: 'New', scheduled: 'Booked', published: 'Published', cancelled: 'Cancelled' }, enterReport: 'Enter report',
    workshop: 'Workshop', date: 'Inspection date', mileage: 'Odometer (km)', checklist: 'Checkpoints', summary: 'Inspector’s notes', reportPhoto: 'Photo of the paper report',
    publish: 'Publish report', schedule: 'Booked', cancel: 'Cancel request',
  },
  errors: { vehicles_only: 'Inspections are for car listings only.', inspection_pending: 'There is already an open request for this listing.' },
  notifications: { types: { inspection_request: '{name} asks to inspect “{title}”', inspection_published: 'Inspection report published for “{title}” ✅', inspection_cancelled: 'Inspection of “{title}” cancelled' } },
});

// ---------- v33: bulk upload from Excel ----------
deepMerge(ar, {
  bulk: {
    title: 'رفع إعلانات بالجملة من Excel', short: 'رفع من Excel', step1: 'حمّل النموذج', step1Text: 'املأ سطراً لكل منتج. التصنيف والمدينة بالاسم أو الرمز (مثل vehicles وnouakchott).', template: 'تحميل النموذج',
    step2: 'اختر ملف Excel أو CSV', step2Text: 'حتى 200 سطر في المرة. السطر الأول هو أسماء الأعمدة.', pickFile: 'اختيار الملف',
    step3: 'اختر الصور', step3Text: 'اختر كل الصور مرة واحدة. في عمود photos اكتب أسماء صور كل منتج مفصولة بفواصل.', pickPhotos: 'اختيار الصور ({n} محددة)',
    summary: '{total} سطر، منها {ok} جاهز للنشر', import: 'انشر {n} إعلاناً', progress: 'تم إرسال {done} من {total} ({ok} بنجاح)', finished: 'انتهى: الإعلانات المرسلة تنتظر مراجعة الإدارة كالمعتاد.',
    col: { title: 'الإعلان', category: 'التصنيف', photos: 'الصور', status: 'الحالة' }, missing: 'صور غير موجودة: {names}', sent: 'أُرسل', readyRow: 'جاهز',
    note: 'كل إعلان يمرّ بنفس الفحص ومراجعة الإدارة مثل النشر العادي. الحد: 200 إعلان في الساعة للتجار، و20 لغيرهم.',
    p: { title: 'العنوان قصير', description: 'الوصف قصير (10 أحرف على الأقل)', price: 'السعر غير صالح', category: 'تصنيف غير معروف', city: 'مدينة غير معروفة', photos: 'لا توجد صورة' },
  },
  errors: { bulk_unreadable: 'تعذّرت قراءة الملف. استخدم النموذج بصيغة Excel أو CSV.', bulk_no_title: 'لم نجد عمود title في السطر الأول.' },
});
deepMerge(fr, {
  bulk: {
    title: 'Import en masse depuis Excel', short: 'Import Excel', step1: 'Téléchargez le modèle', step1Text: 'Une ligne par produit. Catégorie et ville par nom ou code (ex. vehicles, nouakchott).', template: 'Télécharger le modèle',
    step2: 'Choisissez le fichier Excel ou CSV', step2Text: 'Jusqu’à 200 lignes à la fois. La 1re ligne contient les noms des colonnes.', pickFile: 'Choisir le fichier',
    step3: 'Choisissez les photos', step3Text: 'Sélectionnez toutes les photos d’un coup. Dans la colonne photos, indiquez les noms de fichiers séparés par des virgules.', pickPhotos: 'Choisir les photos ({n} sélectionnées)',
    summary: '{total} lignes, dont {ok} prêtes', import: 'Publier {n} annonces', progress: '{done}/{total} envoyées ({ok} réussies)', finished: 'Terminé : les annonces envoyées attendent la validation habituelle.',
    col: { title: 'Annonce', category: 'Catégorie', photos: 'Photos', status: 'État' }, missing: 'Photos introuvables : {names}', sent: 'Envoyée', readyRow: 'Prête',
    note: 'Chaque annonce passe les mêmes contrôles et la même validation qu’une publication normale. Limite : 200 par heure pour les commerçants, 20 sinon.',
    p: { title: 'Titre trop court', description: 'Description trop courte (10 caractères min.)', price: 'Prix invalide', category: 'Catégorie inconnue', city: 'Ville inconnue', photos: 'Aucune photo' },
  },
  errors: { bulk_unreadable: 'Fichier illisible. Utilisez le modèle au format Excel ou CSV.', bulk_no_title: 'Colonne title introuvable en 1re ligne.' },
});
deepMerge(en, {
  bulk: {
    title: 'Bulk upload from Excel', short: 'Excel import', step1: 'Download the template', step1Text: 'One row per product. Category and city by name or code (e.g. vehicles, nouakchott).', template: 'Download template',
    step2: 'Pick the Excel or CSV file', step2Text: 'Up to 200 rows at a time. The first row holds the column names.', pickFile: 'Choose file',
    step3: 'Pick the photos', step3Text: 'Select all photos at once. In the photos column, write each product’s file names separated by commas.', pickPhotos: 'Choose photos ({n} selected)',
    summary: '{total} rows, {ok} ready', import: 'Publish {n} listings', progress: '{done} of {total} sent ({ok} succeeded)', finished: 'Done: the listings sent await the usual review.',
    col: { title: 'Listing', category: 'Category', photos: 'Photos', status: 'Status' }, missing: 'Photos not found: {names}', sent: 'Sent', readyRow: 'Ready',
    note: 'Each listing goes through the same checks and admin review as a normal post. Limit: 200 per hour for merchants, 20 otherwise.',
    p: { title: 'Title too short', description: 'Description too short (10+ characters)', price: 'Invalid price', category: 'Unknown category', city: 'Unknown city', photos: 'No photo' },
  },
  errors: { bulk_unreadable: 'Could not read the file. Use the template as Excel or CSV.', bulk_no_title: 'No “title” column in the first row.' },
});

// ---------- v34: monthly store plans ----------
deepMerge(ar, {
  plans: {
    title: 'باقات المتجر الشهرية', until: 'حتى {date}', credits: 'رصيدك: {n} تمييز لإعلاناتك (7 أيام لكل تمييز). استخدمه من لوحة البائع.',
    month: 'شهر', featured: '{n} إعلانات مميزة كل شهر', badge: 'شارة «متجر محترف»', priority: 'أولوية في صفحة المتاجر', subscribe: 'اشترك', renew: 'تجديد',
    buyTitle: 'الاشتراك في باقة «{name}»', months: 'المدة', monthsN: '{n} شهر', useCredit: 'ميّز برصيدك ({n})', featuredDone: 'تم تمييز الإعلان لمدة 7 أيام ⭐',
  },
  upgrades: { kind: { plan: 'باقة متجر' } },
  errors: { no_feature_credits: 'لا يوجد رصيد تمييز. اشترك في باقة أو جدّدها.', store_required: 'يجب إنشاء المتجر أولاً.', merchants_only: 'الباقات متاحة لحسابات التجار.' },
  notifications: { types: { plan_active: 'تم تفعيل باقة متجرك لمدة {months} شهر ⭐', upgrade_rejected_plan: 'لم يُقبل طلب الباقة. السبب: {reason}', upgrade_request_plan: '{name} طلب الاشتراك في باقة «{title}»' } },
});
deepMerge(fr, {
  plans: {
    title: 'Abonnements boutique', until: 'jusqu’au {date}', credits: 'Votre crédit : {n} mise(s) en avant (7 jours chacune). Utilisez-le depuis l’espace vendeur.',
    month: 'mois', featured: '{n} annonces à la une par mois', badge: 'Badge « Boutique Pro »', priority: 'Priorité dans la page Boutiques', subscribe: 'S’abonner', renew: 'Renouveler',
    buyTitle: 'Abonnement « {name} »', months: 'Durée', monthsN: '{n} mois', useCredit: 'Mettre à la une ({n})', featuredDone: 'Annonce à la une pour 7 jours ⭐',
  },
  upgrades: { kind: { plan: 'Abonnement' } },
  errors: { no_feature_credits: 'Plus de crédit. Abonnez-vous ou renouvelez.', store_required: 'Créez d’abord la boutique.', merchants_only: 'Réservé aux comptes commerçants.' },
  notifications: { types: { plan_active: 'Abonnement de votre boutique activé pour {months} mois ⭐', upgrade_rejected_plan: 'Abonnement refusé. Motif : {reason}', upgrade_request_plan: '{name} demande l’abonnement « {title} »' } },
});
deepMerge(en, {
  plans: {
    title: 'Monthly store plans', until: 'until {date}', credits: 'Your balance: {n} featured listing(s) (7 days each). Use it from your seller dashboard.',
    month: 'month', featured: '{n} featured listings per month', badge: '“Pro store” badge', priority: 'Priority on the Stores page', subscribe: 'Subscribe', renew: 'Renew',
    buyTitle: 'Subscribe to “{name}”', months: 'Duration', monthsN: '{n} mo', useCredit: 'Feature with credit ({n})', featuredDone: 'Listing featured for 7 days ⭐',
  },
  upgrades: { kind: { plan: 'Store plan' } },
  errors: { no_feature_credits: 'No credits left. Subscribe or renew.', store_required: 'Create your store first.', merchants_only: 'Plans are for merchant accounts.' },
  notifications: { types: { plan_active: 'Your store plan is active for {months} month(s) ⭐', upgrade_rejected_plan: 'Plan request declined. Reason: {reason}', upgrade_request_plan: '{name} asked for the “{title}” plan' } },
});

// ---------- v35: secure payment (manual escrow) ----------
deepMerge(ar, {
  admin: { escrow: 'الدفع الآمن' },
  escrow: {
    title: 'الدفع الآمن', choose: 'طريقة الدفع', checkoutText: 'ادفع للمنصة عبر بنكيلي أو مصرفي أو السداد. نحتفظ بالمبلغ ولا يصل للبائع إلا بعد أن تؤكد استلام المنتج.',
    paidOnline: 'مدفوع عبر الدفع الآمن', payTo: 'حوّل {amount} إلى أحد الأرقام التالية ثم أرسل صورة الإيصال:', accountName: 'باسم', ref: 'رقم العملية', receipt: 'صورة الإيصال',
    send: 'إرسال الإيصال', resend: 'إرسال إيصال آخر', receiptSent: 'وصل الإيصال، ستؤكده الإدارة قريباً', confirm: 'استلمت المنتج', thanks: 'شكراً! سيُحوَّل المبلغ للبائع.',
    problem: 'عندي مشكلة', disputeText: 'صف المشكلة: يبقى المبلغ محجوزاً حتى تراجع الإدارة الحالة وتقرر.', openDispute: 'فتح نزاع', disputeSent: 'وصل بلاغك، ستتواصل معك الإدارة',
    status: { awaiting_payment: 'بانتظار الدفع', submitted: 'الإيصال قيد التحقق', held: 'المبلغ محجوز', release_due: 'جاهز للتحويل للبائع', released: 'حُوِّل للبائع', disputed: 'نزاع', refund_due: 'بانتظار الاسترجاع', refunded: 'أُعيد للمشتري' },
    explain: {
      buyer: { awaiting_payment: 'ادفع {amount} ثم أرسل الإيصال. لن يبدأ البائع التجهيز قبل تأكيد الدفع.', submitted: 'نتحقق من إيصالك.', held: 'المبلغ محجوز بأمان لدى المنصة. عند الاستلام اضغط «استلمت المنتج».', release_due: 'أكّدتَ الاستلام، سيُحوَّل المبلغ للبائع.', released: 'اكتملت العملية.', disputed: 'النزاع قيد المراجعة، المبلغ محجوز.', refund_due: 'سيُعاد المبلغ إليك.', refunded: 'أُعيد المبلغ إليك.' },
      other: { awaiting_payment: 'بانتظار دفع المشتري للمنصة. لا تجهّز الطلب قبل تأكيد الدفع.', submitted: 'المشتري أرسل الإيصال، الإدارة تتحقق.', held: 'المبلغ محجوز لدى المنصة: جهّز الطلب بأمان.', release_due: 'المشتري أكّد الاستلام، ستحوّل الإدارة المبلغ إليك.', released: 'حُوِّل المبلغ إليك.', disputed: 'فتح المشتري نزاعاً، ستتواصل معك الإدارة.', refund_due: 'أُلغي الطلب، يُعاد المبلغ للمشتري.', refunded: 'أُعيد المبلغ للمشتري.' },
    },
    adminTitle: 'الدفع الآمن', adminHint: 'تحقق من الإيصالات، حوّل للبائع بعد التسليم وتأكيد المشتري، وأعد المبلغ في حال الإلغاء أو النزاع.', none: 'لا توجد مدفوعات.',
    total: 'المبلغ', toSeller: 'للبائع', toCourier: 'للمندوب', transferRef: 'رقم عملية التحويل', rejectReason: 'سبب الرفض', review: 'مراجعة', details: 'التفاصيل',
    action: { confirm: 'تأكيد استلام المبلغ', reject: 'رفض الإيصال', release: 'تحويل للبائع', refund: 'إعادة للمشتري' },
    adminToggle: 'الدفع الآمن (وسيط)', adminToggleHint: 'يدفع المشتري للمنصة ويُحجز المبلغ حتى الاستلام. أضف أرقام الدفع في صفحة الدفع أولاً.',
  },
  errors: { escrow_disabled: 'الدفع الآمن غير مفعّل.', payment_not_confirmed: 'لم يُؤكَّد دفع المشتري بعد.', payment_closed: 'لا يمكن هذا الإجراء في حالة الدفع الحالية.', not_delivered: 'لم يُسلَّم الطلب بعد.' },
  notifications: { types: {
    escrow_submitted: 'إيصال دفع جديد للطلب #{id} ({amount} أوقية)', escrow_held: 'تأكّد دفع الطلب #{id}: المبلغ محجوز لدى المنصة', escrow_rejected: 'لم يُقبل إيصال الطلب #{id}: {reason}',
    escrow_release_due: 'المشتري أكّد استلام الطلب #{id}', escrow_released: 'تم تحويل {amount} أوقية للطلب #{id} ✅', escrow_refunded: 'أُعيد مبلغ الطلب #{id}', escrow_disputed: 'نزاع على الطلب #{id}',
  } },
});
deepMerge(fr, {
  admin: { escrow: 'Paiement sécurisé' },
  escrow: {
    title: 'Paiement sécurisé', choose: 'Mode de paiement', checkoutText: 'Payez la plateforme par Bankily, Masrvi ou Sedad. Le vendeur n’est payé qu’après votre confirmation de réception.',
    paidOnline: 'Payé par paiement sécurisé', payTo: 'Envoyez {amount} à l’un de ces numéros puis la photo du reçu :', accountName: 'Au nom de', ref: 'N° de transaction', receipt: 'Photo du reçu',
    send: 'Envoyer le reçu', resend: 'Envoyer un autre reçu', receiptSent: 'Reçu envoyé, vérification en cours', confirm: 'J’ai reçu l’article', thanks: 'Merci ! Le vendeur sera payé.',
    problem: 'J’ai un problème', disputeText: 'Décrivez le problème : l’argent reste bloqué jusqu’à la décision de l’équipe.', openDispute: 'Ouvrir un litige', disputeSent: 'Litige reçu, l’équipe vous contacte',
    status: { awaiting_payment: 'En attente du paiement', submitted: 'Reçu en vérification', held: 'Montant bloqué', release_due: 'À verser au vendeur', released: 'Versé au vendeur', disputed: 'Litige', refund_due: 'À rembourser', refunded: 'Remboursé' },
    explain: {
      buyer: { awaiting_payment: 'Payez {amount} puis envoyez le reçu. Le vendeur ne prépare rien avant la confirmation.', submitted: 'Nous vérifions votre reçu.', held: 'Montant bloqué par la plateforme. À la réception, touchez « J’ai reçu l’article ».', release_due: 'Réception confirmée, le vendeur va être payé.', released: 'Transaction terminée.', disputed: 'Litige en cours, montant bloqué.', refund_due: 'Vous allez être remboursé.', refunded: 'Vous avez été remboursé.' },
      other: { awaiting_payment: 'En attente du paiement de l’acheteur. Ne préparez rien avant la confirmation.', submitted: 'Reçu envoyé, vérification en cours.', held: 'Montant bloqué : préparez la commande en confiance.', release_due: 'Réception confirmée, l’équipe va vous payer.', released: 'Vous avez été payé.', disputed: 'L’acheteur a ouvert un litige.', refund_due: 'Commande annulée, l’acheteur est remboursé.', refunded: 'L’acheteur a été remboursé.' },
    },
    adminTitle: 'Paiement sécurisé', adminHint: 'Vérifiez les reçus, payez le vendeur après livraison et confirmation, remboursez en cas d’annulation ou de litige.', none: 'Aucun paiement.',
    total: 'Montant', toSeller: 'vendeur', toCourier: 'livreur', transferRef: 'Référence du virement', rejectReason: 'Motif du refus', review: 'Traiter', details: 'Détails',
    action: { confirm: 'Confirmer la réception', reject: 'Refuser le reçu', release: 'Payer le vendeur', refund: 'Rembourser l’acheteur' },
    adminToggle: 'Paiement sécurisé (tiers de confiance)', adminToggleHint: 'L’acheteur paie la plateforme, l’argent est bloqué jusqu’à la réception. Ajoutez d’abord les numéros de paiement.',
  },
  errors: { escrow_disabled: 'Paiement sécurisé désactivé.', payment_not_confirmed: 'Paiement de l’acheteur pas encore confirmé.', payment_closed: 'Action impossible à cette étape du paiement.', not_delivered: 'Commande pas encore livrée.' },
  notifications: { types: {
    escrow_submitted: 'Nouveau reçu pour la commande #{id} ({amount} MRU)', escrow_held: 'Paiement confirmé pour la commande #{id} : montant bloqué', escrow_rejected: 'Reçu refusé pour la commande #{id} : {reason}',
    escrow_release_due: 'L’acheteur a confirmé la réception de #{id}', escrow_released: '{amount} MRU versés pour la commande #{id} ✅', escrow_refunded: 'Commande #{id} remboursée', escrow_disputed: 'Litige sur la commande #{id}',
  } },
});
deepMerge(en, {
  admin: { escrow: 'Secure payment' },
  escrow: {
    title: 'Secure payment', choose: 'Payment method', checkoutText: 'Pay the platform by Bankily, Masrvi or Sedad. The seller is only paid after you confirm you received the item.',
    paidOnline: 'Paid with secure payment', payTo: 'Send {amount} to one of these numbers, then the photo of the receipt:', accountName: 'Account name', ref: 'Transaction number', receipt: 'Receipt photo',
    send: 'Send receipt', resend: 'Send another receipt', receiptSent: 'Receipt sent, being checked', confirm: 'I received the item', thanks: 'Thank you! The seller will be paid.',
    problem: 'I have a problem', disputeText: 'Describe the problem: the money stays held until the team decides.', openDispute: 'Open a dispute', disputeSent: 'Dispute received, the team will contact you',
    status: { awaiting_payment: 'Awaiting payment', submitted: 'Receipt being checked', held: 'Money held', release_due: 'Ready to pay the seller', released: 'Paid to seller', disputed: 'Dispute', refund_due: 'Refund due', refunded: 'Refunded' },
    explain: {
      buyer: { awaiting_payment: 'Pay {amount}, then send the receipt. The seller prepares nothing before the payment is confirmed.', submitted: 'We are checking your receipt.', held: 'The money is held safely by the platform. When you receive the item, tap “I received the item”.', release_due: 'You confirmed receipt; the seller will be paid.', released: 'All done.', disputed: 'Dispute under review; the money stays held.', refund_due: 'You will be refunded.', refunded: 'You were refunded.' },
      other: { awaiting_payment: 'Waiting for the buyer to pay the platform. Do not prepare the order before the payment is confirmed.', submitted: 'The buyer sent a receipt; it is being checked.', held: 'The money is held by the platform: prepare the order safely.', release_due: 'The buyer confirmed receipt; the team will pay you.', released: 'You were paid.', disputed: 'The buyer opened a dispute.', refund_due: 'Order cancelled; the buyer is refunded.', refunded: 'The buyer was refunded.' },
    },
    adminTitle: 'Secure payment', adminHint: 'Check receipts, pay the seller after delivery and the buyer’s confirmation, refund on cancellation or dispute.', none: 'No payments.',
    total: 'Amount', toSeller: 'to seller', toCourier: 'to courier', transferRef: 'Transfer reference', rejectReason: 'Reason for refusing', review: 'Review', details: 'Details',
    action: { confirm: 'Confirm money received', reject: 'Refuse receipt', release: 'Pay the seller', refund: 'Refund the buyer' },
    adminToggle: 'Secure payment (escrow)', adminToggleHint: 'The buyer pays the platform and the money is held until delivery. Add the payment numbers first.',
  },
  errors: { escrow_disabled: 'Secure payment is off.', payment_not_confirmed: 'The buyer’s payment is not confirmed yet.', payment_closed: 'Not possible at this payment stage.', not_delivered: 'The order is not delivered yet.' },
  notifications: { types: {
    escrow_submitted: 'New payment receipt for order #{id} ({amount} MRU)', escrow_held: 'Payment confirmed for order #{id}: money held', escrow_rejected: 'Receipt refused for order #{id}: {reason}',
    escrow_release_due: 'The buyer confirmed receipt of #{id}', escrow_released: '{amount} MRU paid for order #{id} ✅', escrow_refunded: 'Order #{id} refunded', escrow_disputed: 'Dispute on order #{id}',
  } },
});

// v36: manual phone verification by the admin (no SMS provider)
deepMerge(ar, {
  common: { noResultsShort: 'لا توجد نتائج.' },
  admin: {
    verifyPhone: 'توثيق الرقم', unverifyPhone: 'إلغاء توثيق الرقم', phoneAll: 'الكل', phoneUnverifiedTab: 'أرقام غير موثّقة', phoneVerifiedTab: 'أرقام موثّقة',
    whatsappUser: 'راسله على واتساب', verifyPhoneConfirm: 'هل تأكدت أن الرقم {phone} يخص {name}؟ (اتصلت به أو راسلته وردّ عليك)',
    whatsappMsg: 'مرحباً {name}، معك إدارة {site}. نتواصل معك لتوثيق رقم هاتفك على الموقع. هل هذا رقمك؟',
    phoneHint: 'للتوثيق: اتصل بصاحب الحساب أو راسله على واتساب، وإذا ردّ عليك من نفس الرقم اضغط «توثيق الرقم». تظهر عندها علامة «📱 رقم مؤكَّد» على حسابه وإعلاناته.',
  },
  notifications: { types: { phone_verified: 'تم توثيق رقم هاتفك 📱 تظهر الآن علامة «رقم مؤكَّد» على حسابك وإعلاناتك' } },
  errors: { no_phone: 'لا يوجد رقم هاتف في هذا الحساب.' },
});
deepMerge(fr, {
  common: { noResultsShort: 'Aucun résultat.' },
  admin: {
    verifyPhone: 'Vérifier le numéro', unverifyPhone: 'Retirer la vérification du numéro', phoneAll: 'Tous', phoneUnverifiedTab: 'Numéros non vérifiés', phoneVerifiedTab: 'Numéros vérifiés',
    whatsappUser: 'Écrire sur WhatsApp', verifyPhoneConfirm: 'Avez-vous confirmé que le {phone} appartient à {name} ? (appel ou message avec réponse)',
    whatsappMsg: 'Bonjour {name}, ici l’équipe de {site}. Nous vous contactons pour vérifier votre numéro sur le site. Est-ce bien votre numéro ?',
    phoneHint: 'Pour vérifier : appelez le titulaire du compte ou écrivez-lui sur WhatsApp ; s’il répond depuis ce numéro, cliquez « Vérifier le numéro ». Le badge « 📱 Numéro confirmé » apparaît alors sur son compte et ses annonces.',
  },
  notifications: { types: { phone_verified: 'Votre numéro est vérifié 📱 Le badge « Numéro confirmé » apparaît sur votre compte et vos annonces' } },
  errors: { no_phone: 'Ce compte n’a pas de numéro de téléphone.' },
});
deepMerge(en, {
  common: { noResultsShort: 'No results.' },
  admin: {
    verifyPhone: 'Verify number', unverifyPhone: 'Remove number verification', phoneAll: 'All', phoneUnverifiedTab: 'Unverified numbers', phoneVerifiedTab: 'Verified numbers',
    whatsappUser: 'Message on WhatsApp', verifyPhoneConfirm: 'Did you confirm that {phone} belongs to {name}? (you called or messaged and they replied)',
    whatsappMsg: 'Hello {name}, this is the {site} team. We are contacting you to verify your phone number on the site. Is this your number?',
    phoneHint: 'To verify: call the account holder or message them on WhatsApp; if they reply from this number, press “Verify number”. The “📱 Confirmed number” badge then shows on their account and listings.',
  },
  notifications: { types: { phone_verified: 'Your phone number is verified 📱 The “Confirmed number” badge now shows on your account and listings' } },
  errors: { no_phone: 'This account has no phone number.' },
});

// v37: Souk AI
deepMerge(ar, {
  admin: { soukAi: 'Souk AI' },
  errors: {
    ai_disabled: 'Souk AI غير مفعّل حالياً.', ai_quota: 'وصلت إلى الحد اليومي لطلبات Souk AI. حاول غداً.',
    ai_budget: 'Souk AI متوقف مؤقتاً، حاول لاحقاً.', ai_failed: 'تعذّر الاتصال بـ Souk AI، حاول مرة أخرى.',
    ai_refused: 'لا يستطيع Souk AI الإجابة على هذا الطلب.', login_required: 'سجّل الدخول لاستخدام هذه الميزة.',
  },
  ai: {
    title: 'مساعدك الذكي في سوق شنقيط', subtitle: 'اسأل عمّا تبحث عنه، ابحث بصورة، اكتشف ما يناسبك، واعرف السعر العادل. كل النتائج من إعلانات حقيقية في الموقع.',
    tabs: { assistant: 'مساعد التسوق', photo: 'البحث بالصورة', foryou: 'مقترح لك', price: 'تقدير السعر' },
    off: 'هذه الميزة من Souk AI غير مفعّلة حالياً.', loginFirst: 'سجّل الدخول لاستخدام Souk AI.',
    assistantHello: 'مرحباً 👋 ماذا تبحث عنه اليوم؟', assistantIntro: 'صف ما تريد بكلماتك (المنتج، الميزانية، المدينة) وسأبحث لك في الإعلانات الموجودة.',
    examples: 'هاتف سامسونج بأقل من 20 ألف|سيارة تويوتا في نواكشوط|ثلاجة مستعملة بحالة جيدة|لابتوب للدراسة',
    noReply: 'لم أتمكن من الإجابة، حاول بصيغة أخرى.', nothingShown: 'لم أجد إعلاناً مطابقاً الآن.', postWanted: 'أضف طلب «مطلوب»',
    thinking: 'أبحث في الإعلانات…', askPlaceholder: 'اكتب ما تبحث عنه…', send: 'إرسال', newChat: 'محادثة جديدة',
    disclaimer: 'يعتمد Souk AI على الإعلانات الموجودة فعلاً وقد يخطئ. عاين المنتج قبل الدفع.', remaining: 'متبقٍ اليوم: {n}',
    photoTitle: 'صوّر المنتج أو اختر صورة', photoHint: 'سنتعرّف على المنتج ونبحث عن إعلانات مشابهة.', photoPick: 'اختر صورة', photoAnother: 'صورة أخرى',
    photoFound: 'إعلانات مطابقة ({n})', photoNoMatch: 'لم نجد نفس المنتج في الإعلانات حالياً.', photoRelated: 'إعلانات قريبة قد تهمك',
    forYou: 'مقترح لك', seeAll: 'عرض الكل', forYouHint: 'نقترح عليك إعلانات حسب ما شاهدته ومفضلتك. سجل المشاهدة محفوظ على جهازك فقط.',
    forYouOff: 'الاقتراحات الشخصية متوقفة: نعرض الأكثر مشاهدة.', personalize: 'اقتراحات شخصية', clearHistory: 'امسح سجل المشاهدة',
    forYouTitle: 'اخترناها لك', popularTitle: 'الأكثر مشاهدة الآن', noRecs: 'لا توجد اقتراحات بعد. تصفّح بعض الإعلانات أولاً.',
    priceIntro: 'اعرف السعر المعتاد لمنتج حسب الإعلانات المشابهة في آخر 12 شهراً.', priceWhat: 'ما المنتج؟', priceWhatPh: 'مثال: آيفون 13', priceRun: 'احسب السعر',
    priceNone: 'لا توجد إعلانات مشابهة كافية لتقدير السعر.', priceRange: 'السعر المعتاد: {low} – {high} أوقية', priceMedian: 'الوسط: {median}',
    priceBasisSimilar: 'من {n} إعلاناً مشابهاً', priceBasisCategory: 'من {n} إعلاناً في نفس التصنيف', priceLowConfidence: 'تقدير تقريبي',
    fabTitle: 'Souk AI – مساعدك الذكي', promoTitle: 'جرّب Souk AI: اسأل، صوّر، واعثر على ما تريد', promoText: 'مساعد ذكي يبحث لك في الإعلانات الحقيقية ويقترح الأنسب لك.',
    writerTitle: 'اكتب إعلاني بالذكاء الاصطناعي', writerHint: 'أضف الصور (وملاحظاتك إن شئت) وسيكتب Souk AI العنوان والوصف ويقترح التصنيف. راجع النص قبل النشر.',
    writerNotesPh: 'ملاحظات اختيارية: الماركة، السنة، العيوب، ما يأتي معه…', writerRun: 'اكتب الإعلان', writing: 'يكتب…',
    writerNeedPhoto: 'أضف صورة أولاً.', writerDone: 'تم ملء العنوان والوصف والتصنيف. يمكنك تعديلها.', writerMissing: 'أضف هذه التفاصيل ليثق بك المشترون:',
    translate: 'ترجم', translating: 'يترجم…', showOriginal: 'النص الأصلي', translatedBy: 'ترجمة آلية من Souk AI',
    admin: {
      intro: 'تحكّم في ميزات الذكاء الاصطناعي، راقب الاستهلاك والتكلفة، وراجع الإعلانات المشبوهة.',
      noKey: 'مفتاح الذكاء الاصطناعي غير مضاف بعد', noKeyHelp: 'أضف ANTHROPIC_API_KEY في Vercel ← Settings ← Environment Variables (نوع Sensitive) ثم أعد النشر. حتى ذلك الحين تعمل فقط الاقتراحات وتقدير السعر وقواعد كشف الاحتيال.',
      settings: 'الإعدادات', enabled: 'تشغيل Souk AI', enabledHint: 'يوقف كل الميزات المدفوعة دفعة واحدة.',
      feature: { assistant: 'مساعد التسوق', describe: 'كتابة الإعلانات', visual: 'البحث بالصورة', translate: 'الترجمة', fraud: 'مراجعة الاحتيال بالذكاء الاصطناعي' },
      freeFeatures: 'الاقتراحات الشخصية وتقدير السعر وقواعد كشف الاحتيال مجانية وتعمل دائماً.',
      model: 'النموذج', modelHint: 'Opus الأدق، Haiku الأرخص بكثير.',
      models: { 'claude-opus-5-5': 'Claude Opus 5.5 (الأدق)', 'claude-sonnet-5-5': 'Claude Sonnet 5.5 (متوازن)', 'claude-haiku-5-5': 'Claude Haiku 5.5 (الأرخص)' },
      userDaily: 'طلبات لكل مستخدم يومياً', userDailyHint: 'سؤال واحد للمساعد = طلب واحد.', dailyBudget: 'الحد اليومي للإنفاق ($)', monthlyBudget: 'الحد الشهري للإنفاق ($)',
      budgetHint: 'عند بلوغه يتوقف Souk AI تلقائياً حتى اليوم التالي.',
      usage: 'الاستهلاك والتكلفة', todayCost: 'تكلفة اليوم', monthCost: 'تكلفة 30 يوماً', ofBudget: 'من {b}', todayCalls: 'طلبات اليوم', errors: '{n} أخطاء',
      monthUsers: 'مستخدمون (30 يوماً)', last14: 'التكلفة اليومية (14 يوماً)',
      featureCol: 'الميزة', callsCol: 'الطلبات', errorsCol: 'الأخطاء', tokensCol: 'الرموز', costCol: 'التكلفة',
      fraud: 'كشف الاحتيال', fraudHint: 'تُفحص كل الإعلانات الجديدة والمعدّلة تلقائياً. لا يُحذف شيء تلقائياً: القرار لك.',
      flagStatus: { open: 'بانتظار المراجعة', actioned: 'تم الإجراء', dismissed: 'متجاهَلة' }, noFlags: 'لا توجد إعلانات مشبوهة.',
      risk: { high: 'خطر مرتفع', medium: 'خطر متوسط', low: 'خطر منخفض' }, rules: 'القواعد', userDisabled: 'الحساب معطّل',
      rejectListing: 'رفض الإعلان', disableUser: 'تعطيل الحساب', dismiss: 'تجاهل', disableConfirm: 'تعطيل حساب {name}؟',
      reason: {
        price_too_low: 'سعر أقل بكثير من السوق', advance_payment: 'يطلب الدفع مسبقاً', external_link: 'روابط خارجية', burst_new_account: 'حساب جديد ينشر كثيراً',
        duplicate_other_account: 'نفس العنوان من حساب آخر', reported_seller: 'بلاغات احتيال على البائع', unverified_seller: 'بائع غير موثّق',
      },
    },
  },
});
deepMerge(fr, {
  admin: { soukAi: 'Souk AI' },
  errors: {
    ai_disabled: 'Souk AI n’est pas activé pour le moment.', ai_quota: 'Limite quotidienne de Souk AI atteinte. Réessayez demain.',
    ai_budget: 'Souk AI est momentanément indisponible, réessayez plus tard.', ai_failed: 'Impossible de joindre Souk AI, réessayez.',
    ai_refused: 'Souk AI ne peut pas répondre à cette demande.', login_required: 'Connectez-vous pour utiliser cette fonction.',
  },
  ai: {
    title: 'Votre assistant intelligent sur Souk Chinguetti', subtitle: 'Décrivez ce que vous cherchez, cherchez avec une photo, découvrez des suggestions et le juste prix. Tous les résultats viennent de vraies annonces du site.',
    tabs: { assistant: 'Assistant shopping', photo: 'Recherche par photo', foryou: 'Pour vous', price: 'Estimation de prix' },
    off: 'Cette fonction de Souk AI n’est pas activée pour le moment.', loginFirst: 'Connectez-vous pour utiliser Souk AI.',
    assistantHello: 'Bonjour 👋 Que cherchez-vous aujourd’hui ?', assistantIntro: 'Décrivez ce que vous voulez (article, budget, ville) et je cherche dans les annonces en ligne.',
    examples: 'Téléphone Samsung à moins de 20 000|Toyota à Nouakchott|Réfrigérateur d’occasion en bon état|Ordinateur portable pour étudiant',
    noReply: 'Je n’ai pas pu répondre, reformulez votre demande.', nothingShown: 'Aucune annonce correspondante pour le moment.', postWanted: 'Publier une demande « Recherche »',
    thinking: 'Je cherche dans les annonces…', askPlaceholder: 'Écrivez ce que vous cherchez…', send: 'Envoyer', newChat: 'Nouvelle conversation',
    disclaimer: 'Souk AI s’appuie sur les annonces réelles et peut se tromper. Voyez l’article avant de payer.', remaining: 'Restant aujourd’hui : {n}',
    photoTitle: 'Photographiez l’article ou choisissez une photo', photoHint: 'Nous reconnaissons l’article et cherchons des annonces similaires.', photoPick: 'Choisir une photo', photoAnother: 'Autre photo',
    photoFound: 'Annonces correspondantes ({n})', photoNoMatch: 'Ce même article n’est pas en vente actuellement.', photoRelated: 'Annonces proches qui pourraient vous intéresser',
    forYou: 'Pour vous', seeAll: 'Tout voir', forYouHint: 'Suggestions selon les annonces vues et vos favoris. L’historique reste sur votre appareil.',
    forYouOff: 'Suggestions personnalisées désactivées : annonces les plus vues.', personalize: 'Suggestions personnalisées', clearHistory: 'Effacer l’historique',
    forYouTitle: 'Sélectionné pour vous', popularTitle: 'Les plus vues en ce moment', noRecs: 'Pas encore de suggestions. Parcourez quelques annonces d’abord.',
    priceIntro: 'Connaître le prix habituel d’un article d’après les annonces similaires des 12 derniers mois.', priceWhat: 'Quel article ?', priceWhatPh: 'Ex. : iPhone 13', priceRun: 'Estimer le prix',
    priceNone: 'Pas assez d’annonces similaires pour estimer le prix.', priceRange: 'Prix habituel : {low} – {high} MRU', priceMedian: 'Médiane : {median}',
    priceBasisSimilar: 'd’après {n} annonces similaires', priceBasisCategory: 'd’après {n} annonces de la catégorie', priceLowConfidence: 'estimation approximative',
    fabTitle: 'Souk AI – votre assistant', promoTitle: 'Essayez Souk AI : demandez, photographiez, trouvez', promoText: 'Un assistant qui cherche pour vous dans les vraies annonces et propose les meilleures.',
    writerTitle: 'Rédiger mon annonce avec l’IA', writerHint: 'Ajoutez les photos (et vos notes si vous voulez) : Souk AI rédige le titre et la description et propose la catégorie. Relisez avant de publier.',
    writerNotesPh: 'Notes facultatives : marque, année, défauts, accessoires…', writerRun: 'Rédiger l’annonce', writing: 'Rédaction…',
    writerNeedPhoto: 'Ajoutez d’abord une photo.', writerDone: 'Titre, description et catégorie remplis. Vous pouvez les modifier.', writerMissing: 'Ajoutez ces détails pour rassurer les acheteurs :',
    translate: 'Traduire', translating: 'Traduction…', showOriginal: 'Texte original', translatedBy: 'Traduction automatique par Souk AI',
    admin: {
      intro: 'Contrôlez les fonctions IA, suivez la consommation et le coût, et examinez les annonces suspectes.',
      noKey: 'La clé IA n’est pas encore ajoutée', noKeyHelp: 'Ajoutez ANTHROPIC_API_KEY dans Vercel → Settings → Environment Variables (type Sensitive), puis redéployez. En attendant, seules les suggestions, l’estimation de prix et les règles anti-fraude fonctionnent.',
      settings: 'Réglages', enabled: 'Activer Souk AI', enabledHint: 'Coupe toutes les fonctions payantes d’un coup.',
      feature: { assistant: 'Assistant shopping', describe: 'Rédaction d’annonces', visual: 'Recherche par photo', translate: 'Traduction', fraud: 'Analyse anti-fraude par IA' },
      freeFeatures: 'Suggestions, estimation de prix et règles anti-fraude sont gratuites et toujours actives.',
      model: 'Modèle', modelHint: 'Opus est le plus précis, Haiku bien moins cher.',
      models: { 'claude-opus-5-5': 'Claude Opus 5.5 (le plus précis)', 'claude-sonnet-5-5': 'Claude Sonnet 5.5 (équilibré)', 'claude-haiku-5-5': 'Claude Haiku 5.5 (le moins cher)' },
      userDaily: 'Demandes par utilisateur et par jour', userDailyHint: 'Une question à l’assistant = une demande.', dailyBudget: 'Plafond de dépense quotidien ($)', monthlyBudget: 'Plafond de dépense mensuel ($)',
      budgetHint: 'Une fois atteint, Souk AI s’arrête jusqu’au lendemain.',
      usage: 'Consommation et coût', todayCost: 'Coût du jour', monthCost: 'Coût sur 30 jours', ofBudget: 'sur {b}', todayCalls: 'Demandes du jour', errors: '{n} erreurs',
      monthUsers: 'Utilisateurs (30 j)', last14: 'Coût quotidien (14 jours)',
      featureCol: 'Fonction', callsCol: 'Appels', errorsCol: 'Erreurs', tokensCol: 'Jetons', costCol: 'Coût',
      fraud: 'Détection de fraude', fraudHint: 'Chaque annonce nouvelle ou modifiée est vérifiée automatiquement. Rien n’est supprimé automatiquement : vous décidez.',
      flagStatus: { open: 'À examiner', actioned: 'Traitées', dismissed: 'Ignorées' }, noFlags: 'Aucune annonce suspecte.',
      risk: { high: 'Risque élevé', medium: 'Risque moyen', low: 'Risque faible' }, rules: 'Règles', userDisabled: 'compte désactivé',
      rejectListing: 'Refuser l’annonce', disableUser: 'Désactiver le compte', dismiss: 'Ignorer', disableConfirm: 'Désactiver le compte de {name} ?',
      reason: {
        price_too_low: 'Prix très inférieur au marché', advance_payment: 'Demande un paiement d’avance', external_link: 'Liens externes', burst_new_account: 'Nouveau compte, beaucoup d’annonces',
        duplicate_other_account: 'Même titre sur un autre compte', reported_seller: 'Vendeur signalé pour arnaque', unverified_seller: 'Vendeur non vérifié',
      },
    },
  },
});
deepMerge(en, {
  admin: { soukAi: 'Souk AI' },
  errors: {
    ai_disabled: 'Souk AI is not switched on right now.', ai_quota: 'You reached today’s Souk AI limit. Try again tomorrow.',
    ai_budget: 'Souk AI is paused for now, try again later.', ai_failed: 'Could not reach Souk AI, please try again.',
    ai_refused: 'Souk AI can’t answer this request.', login_required: 'Sign in to use this feature.',
  },
  ai: {
    title: 'Your smart assistant on Souk Chinguetti', subtitle: 'Describe what you want, search with a photo, get suggestions and the fair price. Every result comes from real listings on the site.',
    tabs: { assistant: 'Shopping assistant', photo: 'Search by photo', foryou: 'For you', price: 'Price check' },
    off: 'This Souk AI feature is not switched on right now.', loginFirst: 'Sign in to use Souk AI.',
    assistantHello: 'Hello 👋 What are you looking for today?', assistantIntro: 'Describe what you want (item, budget, city) and I’ll search the live listings.',
    examples: 'Samsung phone under 20,000|Toyota in Nouakchott|Used fridge in good condition|Laptop for studying',
    noReply: 'I couldn’t answer, try rephrasing.', nothingShown: 'No matching listing right now.', postWanted: 'Post a “wanted” ad',
    thinking: 'Searching the listings…', askPlaceholder: 'Type what you’re looking for…', send: 'Send', newChat: 'New chat',
    disclaimer: 'Souk AI uses real listings and can make mistakes. See the item before paying.', remaining: 'Left today: {n}',
    photoTitle: 'Take a photo of the item or pick one', photoHint: 'We recognise the item and look for similar listings.', photoPick: 'Pick a photo', photoAnother: 'Another photo',
    photoFound: 'Matching listings ({n})', photoNoMatch: 'This item isn’t for sale on the site right now.', photoRelated: 'Related listings you may like',
    forYou: 'For you', seeAll: 'See all', forYouHint: 'Suggestions from the listings you viewed and your favourites. Your viewing history stays on your device.',
    forYouOff: 'Personal suggestions are off: showing the most viewed.', personalize: 'Personal suggestions', clearHistory: 'Clear history',
    forYouTitle: 'Picked for you', popularTitle: 'Most viewed right now', noRecs: 'No suggestions yet. Browse a few listings first.',
    priceIntro: 'See the usual price of an item from similar listings in the last 12 months.', priceWhat: 'Which item?', priceWhatPh: 'e.g. iPhone 13', priceRun: 'Check the price',
    priceNone: 'Not enough similar listings to estimate a price.', priceRange: 'Usual price: {low} – {high} MRU', priceMedian: 'Median: {median}',
    priceBasisSimilar: 'from {n} similar listings', priceBasisCategory: 'from {n} listings in this category', priceLowConfidence: 'rough estimate',
    fabTitle: 'Souk AI – your assistant', promoTitle: 'Try Souk AI: ask, snap a photo, find it', promoText: 'A smart assistant that searches real listings for you and suggests the best ones.',
    writerTitle: 'Write my ad with AI', writerHint: 'Add the photos (and notes if you like): Souk AI writes the title and description and picks the category. Check the text before publishing.',
    writerNotesPh: 'Optional notes: brand, year, defects, what’s included…', writerRun: 'Write the ad', writing: 'Writing…',
    writerNeedPhoto: 'Add a photo first.', writerDone: 'Title, description and category filled in. You can edit them.', writerMissing: 'Add these details so buyers trust you:',
    translate: 'Translate', translating: 'Translating…', showOriginal: 'Original text', translatedBy: 'Machine translation by Souk AI',
    admin: {
      intro: 'Control the AI features, watch usage and cost, and review suspicious listings.',
      noKey: 'The AI key has not been added yet', noKeyHelp: 'Add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables (type Sensitive), then redeploy. Until then only suggestions, price checks and the fraud rules work.',
      settings: 'Settings', enabled: 'Switch Souk AI on', enabledHint: 'Turns every paid feature off at once.',
      feature: { assistant: 'Shopping assistant', describe: 'Ad writing', visual: 'Search by photo', translate: 'Translation', fraud: 'AI fraud review' },
      freeFeatures: 'Suggestions, price checks and the fraud rules are free and always on.',
      model: 'Model', modelHint: 'Opus is the most accurate, Haiku far cheaper.',
      models: { 'claude-opus-5-5': 'Claude Opus 5.5 (most accurate)', 'claude-sonnet-5-5': 'Claude Sonnet 5.5 (balanced)', 'claude-haiku-5-5': 'Claude Haiku 5.5 (cheapest)' },
      userDaily: 'Requests per user per day', userDailyHint: 'One question to the assistant = one request.', dailyBudget: 'Daily spending cap ($)', monthlyBudget: 'Monthly spending cap ($)',
      budgetHint: 'When reached, Souk AI pauses until the next day.',
      usage: 'Usage and cost', todayCost: 'Cost today', monthCost: 'Cost, 30 days', ofBudget: 'of {b}', todayCalls: 'Requests today', errors: '{n} errors',
      monthUsers: 'Users (30 days)', last14: 'Daily cost (14 days)',
      featureCol: 'Feature', callsCol: 'Calls', errorsCol: 'Errors', tokensCol: 'Tokens', costCol: 'Cost',
      fraud: 'Fraud detection', fraudHint: 'Every new or edited listing is checked automatically. Nothing is removed automatically: you decide.',
      flagStatus: { open: 'To review', actioned: 'Handled', dismissed: 'Dismissed' }, noFlags: 'No suspicious listings.',
      risk: { high: 'High risk', medium: 'Medium risk', low: 'Low risk' }, rules: 'Rules', userDisabled: 'account disabled',
      rejectListing: 'Reject listing', disableUser: 'Disable account', dismiss: 'Dismiss', disableConfirm: 'Disable {name}’s account?',
      reason: {
        price_too_low: 'Price far below the market', advance_payment: 'Asks for payment in advance', external_link: 'External links', burst_new_account: 'New account posting a lot',
        duplicate_other_account: 'Same title on another account', reported_seller: 'Seller reported for scams', unverified_seller: 'Unverified seller',
      },
    },
  },
});

// v38: Souk Social & Souk Live
deepMerge(ar, {
  admin: { community: 'Social و Live' },
  errors: {
    social_disabled: 'Souk Social متوقف حالياً.', live_disabled: 'Souk Live متوقف حالياً.', social_banned: 'حسابك ممنوع مؤقتاً من النشر والتعليق.',
    live_verified_merchants_only: 'البث المباشر متاح للتجار الموثّقين فقط.', not_your_product: 'يمكنك النشر عن إعلاناتك فقط.',
    inappropriate_text: 'النص يحتوي كلمات غير لائقة.', links_not_allowed: 'الروابط الخارجية غير مسموحة.',
    comments_off: 'التعليقات مغلقة.', comments_followers_only: 'التعليقات للمتابعين فقط.', blocked: 'لا يمكن ذلك: يوجد حظر بينكما.',
    cannot_follow_self: 'لا يمكنك متابعة نفسك.', cannot_block_self: 'لا يمكنك حظر نفسك.', cannot_report_own: 'لا يمكنك الإبلاغ عن محتواك.',
    already_reported: 'أبلغت عن هذا من قبل، شكراً.', already_live: 'لديك بث مباشر قائم بالفعل.', live_full: 'البث ممتلئ حالياً، حاول بعد قليل.',
    host_offline: 'صاحب البث غير متصل الآن.', not_live: 'البث غير مباشر الآن.', muted: 'تم كتم تعليقاتك في هذا البث.', live_closed: 'انتهى هذا البث.',
    recording_not_allowed: 'لم يُسمح بتسجيل هذا البث.', end_live_first: 'أنهِ البث أولاً.', camera_denied: 'لم يُسمح بالوصول إلى الكاميرا والميكروفون. فعّله من إعدادات المتصفح.',
    live_not_found: 'البث غير موجود.', post_not_found: 'المنشور غير موجود أو غير متاح لك.',
  },
  fields: { product_not_live: 'اختر إعلاناً منشوراً', own_live_products_only: 'اختر من إعلاناتك المنشورة فقط' },
  notifications: { types: {
    new_follower: '{name} بدأ بمتابعتك 👋', post_like: '{name} أعجبه منشورك ❤️', post_comment: '{name} علّق على منشورك: {text}',
    followed_post: '{name} نشر عن «{title}»', live_scheduled: '{name} حدّد موعد بث مباشر: «{title}» 🗓',
    live_reminder: 'بث «{title}» من {name} يبدأ بعد قليل ⏰', live_started: '🔴 {name} يبث الآن مباشرة: «{title}»',
    content_removed: 'أزالت الإدارة محتوى لك لمخالفته القواعد. {reason}',
  } },
  social: {
    nav: 'Social', subtitle: 'منشورات التجار عن منتجاتهم الحقيقية: تابع، أعجب، علّق واشترِ.', postsTitle: 'المنشورات', noPostsYet: 'لا توجد منشورات بعد.',
    tabs: { foryou: 'لك', following: 'المتابَعون' }, empty: 'لا توجد منشورات بعد.', followingEmpty: 'تابع تجاراً لترى منشوراتهم هنا.',
    composePrompt: 'انشر عن أحد منتجاتك…', whichProduct: 'عن أي إعلان؟', needProduct: 'كل منشور مرتبط بإعلان منشور. أضف إعلاناً أولاً.',
    bodyPh: 'اكتب شيئاً عن المنتج: عرض، وصول جديد، تفاصيل…', addPhotos: 'صور', addVideo: 'فيديو', publish: 'نشر',
    whoSees: 'من يرى المنشور', whoComments: 'من يعلّق', public: 'الجميع', followersOnly: 'المتابعون فقط',
    commentsEveryone: 'الكل يعلّق', commentsFollowers: 'المتابعون فقط', commentsOff: 'بدون تعليقات',
    follow: 'متابعة', following: 'تتابعه', followers: '{n} متابع', buy: 'اشترِ', more: 'المزيد',
    comments: 'التعليقات', noComments: 'لا تعليقات بعد. كن أول من يعلّق.', commentPh: 'اكتب تعليقاً…', commentsOffNote: 'أغلق صاحب المنشور التعليقات.',
    report: 'إبلاغ', reportTitle: 'الإبلاغ عن محتوى', reportDetails: 'تفاصيل إضافية (اختياري)', sendReport: 'إرسال البلاغ', reported: 'شكراً، وصل بلاغك وسيراجعه فريقنا.',
    reasons: { scam: 'احتيال', prohibited: 'منتج ممنوع', offensive: 'مسيء أو كراهية', nudity: 'محتوى فاضح', violence: 'عنف', spam: 'إزعاج / سبام', other: 'أخرى' },
    block: 'حظر', blockConfirm: 'حظر {name}؟ لن يرى منشوراتك للمتابعين ولن يعلّق أو يتابعك.', blocked: 'تم الحظر.',
    deleteConfirm: 'حذف هذا المنشور؟', deleted: 'تم حذف المنشور.',
  },
  live: {
    nav: 'Live', subtitle: 'شاهد التجار يعرضون منتجاتهم مباشرة، اسأل في الدردشة واطلب بضغطة.',
    nowTitle: 'مباشر الآن', upcoming: 'قريباً', replays: 'تسجيلات', myLives: 'بثوثي', noneNow: 'لا يوجد بث مباشر الآن.', noneSoon: 'لا يوجد بث مجدول.', noneReplays: 'لا توجد تسجيلات.',
    onAir: 'مباشر', replay: 'إعادة', status: { scheduled: 'مجدول', live: 'مباشر', ended: 'انتهى', cancelled: 'ملغى', removed: 'أوقفته الإدارة' },
    create: 'بث مباشر جديد', hostRule: 'البث المباشر متاح للتجار الموثّقين. وثّق حسابك التجاري لتبدأ البث.',
    titleLabel: 'عنوان البث', titlePh: 'مثال: تخفيضات الهواتف لهذا الأسبوع', when: { now: 'الآن', later: 'جدولة لوقت لاحق' },
    date: 'الموعد', dateHint: 'نرسل إشعاراً لمتابعيك الآن وتذكيراً قبل البث بـ 15 دقيقة.', products: 'المنتجات المعروضة', productsHint: 'اختر حتى 20 من إعلاناتك ليظهر زر الطلب أثناء البث.',
    recordConsent: 'أوافق على حفظ تسجيل البث ليشاهده الناس لاحقاً', allowComments: 'السماح بالتعليقات المباشرة', followersOnly: 'للمتابعين فقط',
    schedule: 'جدولة البث', prepare: 'متابعة إلى الاستوديو', goLive: 'ابدأ البث', end: 'إنهاء البث', endConfirm: 'إنهاء البث المباشر الآن؟',
    switchCamera: 'تبديل الكاميرا', viewersNow: '{n} يشاهدون الآن', peak: 'الذروة {n}', recording: 'يُسجَّل', uploading: 'رفع التسجيل…', uploadFailed: 'تعذّر رفع التسجيل.',
    ended: 'انتهى البث. شكراً!', endedShort: 'انتهى البث.', removedShort: 'أوقفت الإدارة هذا البث.', startsAt: 'يبدأ البث', hostTips: 'اسمح بالكاميرا والميكروفون، ويفضّل الاتصال بالواي فاي. يمكن لعدد كبير المشاهدة لأن المشاهدين يتشاركون نقل البث.',
    connecting: 'جارٍ الاتصال بالبث…', reconnecting: 'إعادة الاتصال…', full: 'البث ممتلئ الآن، حاول بعد قليل.', hostOffline: 'صاحب البث غير متصل مؤقتاً…', cantConnect: 'تعذّر الاتصال بالبث.',
    chat: 'الدردشة المباشرة', chatEmpty: 'لا رسائل بعد.', chatPh: 'اكتب سؤالك…', chatOff: 'الدردشة مغلقة', loginToChat: 'سجّل الدخول للمشاركة في الدردشة',
    mute: 'كتم', muteConfirm: 'كتم {name} في هذا البث؟', pin: 'تثبيت', unpin: 'إلغاء التثبيت', pinned: 'معروض الآن', order: 'اطلب الآن',
    delete: 'حذف البث', deleteConfirm: 'حذف هذا البث نهائياً؟', deleteRecording: 'حذف التسجيل',
  },
  community: {
    intro: 'راجع البلاغات، أوقف البث المخالف، واضبط إعدادات البث المجاني.', settings: 'الإعدادات', enabled: 'تشغيل Souk Social', liveEnabled: 'تشغيل Souk Live',
    hostFanout: 'مشاهدون مباشرون لصاحب البث', hostFanoutHint: 'كل مشاهد إضافي يستهلك رفعاً من هاتف البائع.', relayFanout: 'مشاهدون يمرَّر لهم من كل مشاهد', relayFanoutHint: '0 يوقف التمرير بين المشاهدين.',
    maxDepth: 'أقصى عمق للشجرة', autoHide: 'إخفاء المنشور تلقائياً بعد عدد بلاغات', autoHideHint: 'يُخفى حتى يراجعه المشرف.', capacity: 'السعة التقريبية لكل بث: {n} مشاهد.',
    reports: 'البلاغات', reportStatus: { open: 'بانتظار المراجعة', resolved: 'تمت إزالتها', dismissed: 'متجاهلة' }, noReports: 'لا توجد بلاغات.',
    target: { post: 'منشور', comment: 'تعليق', live: 'بث مباشر', live_comment: 'رسالة في بث' }, nReports: '{n} بلاغات', open: 'فتح',
    remove: 'إزالة', removeBan: 'إزالة + منع 7 أيام', restore: 'إعادة نشر', dismiss: 'تجاهل', banConfirm: 'منع {name} من النشر والبث لمدة {n} أيام؟',
    lives: 'البثوث', stopLive: 'إيقاف البث', stopReason: 'سبب الإيقاف (يظهر لصاحب البث):',
    stat: { posts: 'منشورات', postsToday: 'منشورات اليوم', openReports: 'بلاغات مفتوحة', liveNow: 'بث مباشر الآن', scheduled: 'بثوث مجدولة', hidden: 'منشورات مخفية', follows: 'متابعات', banned: 'حسابات ممنوعة' },
  },
});
deepMerge(fr, {
  admin: { community: 'Social & Live' },
  errors: {
    social_disabled: 'Souk Social est désactivé.', live_disabled: 'Souk Live est désactivé.', social_banned: 'Votre compte ne peut temporairement ni publier ni commenter.',
    live_verified_merchants_only: 'Le direct est réservé aux commerçants vérifiés.', not_your_product: 'Vous ne pouvez publier que sur vos annonces.',
    inappropriate_text: 'Le texte contient des mots inappropriés.', links_not_allowed: 'Les liens externes ne sont pas autorisés.',
    comments_off: 'Commentaires fermés.', comments_followers_only: 'Commentaires réservés aux abonnés.', blocked: 'Impossible : un blocage existe entre vous.',
    cannot_follow_self: 'Vous ne pouvez pas vous suivre.', cannot_block_self: 'Vous ne pouvez pas vous bloquer.', cannot_report_own: 'Vous ne pouvez pas signaler votre contenu.',
    already_reported: 'Déjà signalé, merci.', already_live: 'Vous avez déjà un direct en cours.', live_full: 'Le direct est complet, réessayez dans un instant.',
    host_offline: 'L’animateur n’est pas connecté.', not_live: 'Ce direct n’est pas en cours.', muted: 'Vos messages sont masqués dans ce direct.', live_closed: 'Ce direct est terminé.',
    recording_not_allowed: 'L’enregistrement de ce direct n’est pas autorisé.', end_live_first: 'Terminez d’abord le direct.', camera_denied: 'Accès à la caméra et au micro refusé. Autorisez-le dans le navigateur.',
    live_not_found: 'Direct introuvable.', post_not_found: 'Publication introuvable ou non accessible.',
  },
  fields: { product_not_live: 'Choisissez une annonce publiée', own_live_products_only: 'Uniquement vos annonces publiées' },
  notifications: { types: {
    new_follower: '{name} vous suit désormais 👋', post_like: '{name} aime votre publication ❤️', post_comment: '{name} a commenté : {text}',
    followed_post: '{name} a publié sur « {title} »', live_scheduled: '{name} a programmé un direct : « {title} » 🗓',
    live_reminder: 'Le direct « {title} » de {name} commence bientôt ⏰', live_started: '🔴 {name} est en direct : « {title} »',
    content_removed: 'L’équipe a retiré un de vos contenus non conforme. {reason}',
  } },
  social: {
    nav: 'Social', subtitle: 'Les commerçants publient sur leurs vrais produits : suivez, aimez, commentez et achetez.', postsTitle: 'Publications', noPostsYet: 'Aucune publication pour le moment.',
    tabs: { foryou: 'Pour vous', following: 'Abonnements' }, empty: 'Aucune publication pour le moment.', followingEmpty: 'Suivez des commerçants pour voir leurs publications ici.',
    composePrompt: 'Publier sur un de vos produits…', whichProduct: 'Quelle annonce ?', needProduct: 'Chaque publication est liée à une annonce publiée. Ajoutez d’abord une annonce.',
    bodyPh: 'Parlez du produit : offre, arrivage, détails…', addPhotos: 'Photos', addVideo: 'Vidéo', publish: 'Publier',
    whoSees: 'Qui voit', whoComments: 'Qui commente', public: 'Tout le monde', followersOnly: 'Abonnés uniquement',
    commentsEveryone: 'Tous commentent', commentsFollowers: 'Abonnés uniquement', commentsOff: 'Sans commentaires',
    follow: 'Suivre', following: 'Abonné', followers: '{n} abonnés', buy: 'Acheter', more: 'Plus',
    comments: 'Commentaires', noComments: 'Aucun commentaire. Soyez le premier.', commentPh: 'Écrire un commentaire…', commentsOffNote: 'L’auteur a fermé les commentaires.',
    report: 'Signaler', reportTitle: 'Signaler un contenu', reportDetails: 'Détails (facultatif)', sendReport: 'Envoyer', reported: 'Merci, notre équipe va examiner le signalement.',
    reasons: { scam: 'Arnaque', prohibited: 'Produit interdit', offensive: 'Offensant / haine', nudity: 'Contenu explicite', violence: 'Violence', spam: 'Spam', other: 'Autre' },
    block: 'Bloquer', blockConfirm: 'Bloquer {name} ? Il ne verra plus vos publications réservées et ne pourra ni commenter ni vous suivre.', blocked: 'Utilisateur bloqué.',
    deleteConfirm: 'Supprimer cette publication ?', deleted: 'Publication supprimée.',
  },
  live: {
    nav: 'Live', subtitle: 'Regardez les commerçants présenter leurs produits en direct, posez vos questions et commandez en un clic.',
    nowTitle: 'En direct', upcoming: 'À venir', replays: 'Rediffusions', myLives: 'Mes directs', noneNow: 'Aucun direct en ce moment.', noneSoon: 'Aucun direct programmé.', noneReplays: 'Aucune rediffusion.',
    onAir: 'Direct', replay: 'Revoir', status: { scheduled: 'Programmé', live: 'En direct', ended: 'Terminé', cancelled: 'Annulé', removed: 'Arrêté par l’équipe' },
    create: 'Nouveau direct', hostRule: 'Le direct est réservé aux commerçants vérifiés. Faites vérifier votre compte pro pour commencer.',
    titleLabel: 'Titre du direct', titlePh: 'Ex. : promos téléphones de la semaine', when: { now: 'Maintenant', later: 'Programmer' },
    date: 'Date et heure', dateHint: 'Vos abonnés sont prévenus maintenant et 15 minutes avant.', products: 'Produits présentés', productsHint: 'Jusqu’à 20 de vos annonces, avec un bouton commander pendant le direct.',
    recordConsent: 'J’accepte que l’enregistrement du direct soit conservé et visible ensuite', allowComments: 'Autoriser les commentaires en direct', followersOnly: 'Abonnés uniquement',
    schedule: 'Programmer le direct', prepare: 'Aller au studio', goLive: 'Lancer le direct', end: 'Terminer le direct', endConfirm: 'Terminer le direct maintenant ?',
    switchCamera: 'Changer de caméra', viewersNow: '{n} spectateurs', peak: 'pic {n}', recording: 'Enregistrement', uploading: 'Envoi de l’enregistrement…', uploadFailed: 'Échec de l’envoi de l’enregistrement.',
    ended: 'Direct terminé. Merci !', endedShort: 'Direct terminé.', removedShort: 'Direct arrêté par l’équipe.', startsAt: 'Début du direct', hostTips: 'Autorisez caméra et micro, de préférence en Wi-Fi. Beaucoup de spectateurs peuvent suivre car ils se relaient la vidéo.',
    connecting: 'Connexion au direct…', reconnecting: 'Reconnexion…', full: 'Direct complet, réessayez dans un instant.', hostOffline: 'L’animateur est momentanément déconnecté…', cantConnect: 'Connexion au direct impossible.',
    chat: 'Chat en direct', chatEmpty: 'Aucun message.', chatPh: 'Posez votre question…', chatOff: 'Chat fermé', loginToChat: 'Connectez-vous pour participer',
    mute: 'Masquer', muteConfirm: 'Masquer {name} dans ce direct ?', pin: 'Épingler', unpin: 'Désépingler', pinned: 'Présenté maintenant', order: 'Commander',
    delete: 'Supprimer le direct', deleteConfirm: 'Supprimer définitivement ce direct ?', deleteRecording: 'Supprimer l’enregistrement',
  },
  community: {
    intro: 'Examinez les signalements, arrêtez les directs non conformes et réglez le direct gratuit.', settings: 'Réglages', enabled: 'Activer Souk Social', liveEnabled: 'Activer Souk Live',
    hostFanout: 'Spectateurs servis par l’animateur', hostFanoutHint: 'Chaque spectateur direct consomme l’envoi du téléphone du vendeur.', relayFanout: 'Spectateurs relayés par chaque spectateur', relayFanoutHint: '0 désactive le relais entre spectateurs.',
    maxDepth: 'Profondeur maximale de l’arbre', autoHide: 'Masquer une publication après N signalements', autoHideHint: 'Masquée jusqu’à l’examen.', capacity: 'Capacité approximative par direct : {n} spectateurs.',
    reports: 'Signalements', reportStatus: { open: 'À examiner', resolved: 'Retirés', dismissed: 'Ignorés' }, noReports: 'Aucun signalement.',
    target: { post: 'Publication', comment: 'Commentaire', live: 'Direct', live_comment: 'Message de direct' }, nReports: '{n} signalements', open: 'Ouvrir',
    remove: 'Retirer', removeBan: 'Retirer + bannir 7 j', restore: 'Republier', dismiss: 'Ignorer', banConfirm: 'Interdire à {name} de publier et diffuser pendant {n} jours ?',
    lives: 'Directs', stopLive: 'Arrêter le direct', stopReason: 'Motif de l’arrêt (montré à l’animateur) :',
    stat: { posts: 'Publications', postsToday: 'Publications du jour', openReports: 'Signalements ouverts', liveNow: 'Directs en cours', scheduled: 'Directs programmés', hidden: 'Publications masquées', follows: 'Abonnements', banned: 'Comptes bannis' },
  },
});
deepMerge(en, {
  admin: { community: 'Social & Live' },
  errors: {
    social_disabled: 'Souk Social is switched off.', live_disabled: 'Souk Live is switched off.', social_banned: 'Your account is temporarily blocked from posting and commenting.',
    live_verified_merchants_only: 'Live video is for verified merchants only.', not_your_product: 'You can only post about your own listings.',
    inappropriate_text: 'The text contains inappropriate words.', links_not_allowed: 'External links are not allowed.',
    comments_off: 'Comments are closed.', comments_followers_only: 'Only followers can comment.', blocked: 'Not possible: one of you blocked the other.',
    cannot_follow_self: 'You can’t follow yourself.', cannot_block_self: 'You can’t block yourself.', cannot_report_own: 'You can’t report your own content.',
    already_reported: 'Already reported, thank you.', already_live: 'You already have a live on air.', live_full: 'The live is full right now, try again shortly.',
    host_offline: 'The host is not connected right now.', not_live: 'This live is not on air.', muted: 'Your messages are muted in this live.', live_closed: 'This live is over.',
    recording_not_allowed: 'Recording this live was not allowed.', end_live_first: 'End the live first.', camera_denied: 'Camera and microphone access was refused. Allow it in your browser.',
    live_not_found: 'Live not found.', post_not_found: 'Post not found or not visible to you.',
  },
  fields: { product_not_live: 'Choose a published listing', own_live_products_only: 'Only your own published listings' },
  notifications: { types: {
    new_follower: '{name} started following you 👋', post_like: '{name} liked your post ❤️', post_comment: '{name} commented: {text}',
    followed_post: '{name} posted about “{title}”', live_scheduled: '{name} scheduled a live: “{title}” 🗓',
    live_reminder: '“{title}” by {name} starts soon ⏰', live_started: '🔴 {name} is live now: “{title}”',
    content_removed: 'The team removed some of your content for breaking the rules. {reason}',
  } },
  social: {
    nav: 'Social', subtitle: 'Merchants post about their real products: follow, like, comment and buy.', postsTitle: 'Posts', noPostsYet: 'No posts yet.',
    tabs: { foryou: 'For you', following: 'Following' }, empty: 'No posts yet.', followingEmpty: 'Follow merchants to see their posts here.',
    composePrompt: 'Post about one of your products…', whichProduct: 'Which listing?', needProduct: 'Every post is linked to a published listing. Add a listing first.',
    bodyPh: 'Say something about the product: offer, new arrival, details…', addPhotos: 'Photos', addVideo: 'Video', publish: 'Publish',
    whoSees: 'Who can see', whoComments: 'Who can comment', public: 'Everyone', followersOnly: 'Followers only',
    commentsEveryone: 'Everyone comments', commentsFollowers: 'Followers only', commentsOff: 'No comments',
    follow: 'Follow', following: 'Following', followers: '{n} followers', buy: 'Buy', more: 'More',
    comments: 'Comments', noComments: 'No comments yet. Be the first.', commentPh: 'Write a comment…', commentsOffNote: 'The author turned comments off.',
    report: 'Report', reportTitle: 'Report content', reportDetails: 'Details (optional)', sendReport: 'Send report', reported: 'Thanks, our team will review your report.',
    reasons: { scam: 'Scam', prohibited: 'Prohibited item', offensive: 'Offensive / hate', nudity: 'Explicit content', violence: 'Violence', spam: 'Spam', other: 'Other' },
    block: 'Block', blockConfirm: 'Block {name}? They won’t see your followers-only posts, comment or follow you.', blocked: 'User blocked.',
    deleteConfirm: 'Delete this post?', deleted: 'Post deleted.',
  },
  live: {
    nav: 'Live', subtitle: 'Watch merchants show their products live, ask in the chat and order in one tap.',
    nowTitle: 'Live now', upcoming: 'Coming up', replays: 'Replays', myLives: 'My lives', noneNow: 'Nobody is live right now.', noneSoon: 'No lives scheduled.', noneReplays: 'No replays.',
    onAir: 'Live', replay: 'Replay', status: { scheduled: 'Scheduled', live: 'Live', ended: 'Ended', cancelled: 'Cancelled', removed: 'Stopped by the team' },
    create: 'New live', hostRule: 'Live video is for verified merchants. Get your business account verified to start.',
    titleLabel: 'Live title', titlePh: 'e.g. This week’s phone deals', when: { now: 'Now', later: 'Schedule for later' },
    date: 'Date and time', dateHint: 'Your followers are notified now and reminded 15 minutes before.', products: 'Products shown', productsHint: 'Up to 20 of your listings, with an order button during the live.',
    recordConsent: 'I agree to keep the recording so people can watch it later', allowComments: 'Allow live comments', followersOnly: 'Followers only',
    schedule: 'Schedule the live', prepare: 'Go to the studio', goLive: 'Go live', end: 'End live', endConfirm: 'End the live now?',
    switchCamera: 'Switch camera', viewersNow: '{n} watching now', peak: 'peak {n}', recording: 'Recording', uploading: 'Uploading the recording…', uploadFailed: 'Could not upload the recording.',
    ended: 'Live ended. Thank you!', endedShort: 'The live has ended.', removedShort: 'This live was stopped by the team.', startsAt: 'The live starts', hostTips: 'Allow the camera and microphone, ideally on Wi-Fi. Many people can watch because viewers share the video between them.',
    connecting: 'Connecting to the live…', reconnecting: 'Reconnecting…', full: 'The live is full right now, try again shortly.', hostOffline: 'The host is briefly disconnected…', cantConnect: 'Could not connect to the live.',
    chat: 'Live chat', chatEmpty: 'No messages yet.', chatPh: 'Ask a question…', chatOff: 'Chat is closed', loginToChat: 'Sign in to join the chat',
    mute: 'Mute', muteConfirm: 'Mute {name} in this live?', pin: 'Pin', unpin: 'Unpin', pinned: 'Showing now', order: 'Order now',
    delete: 'Delete live', deleteConfirm: 'Delete this live for good?', deleteRecording: 'Delete recording',
  },
  community: {
    intro: 'Review reports, stop lives that break the rules, and tune the free live video.', settings: 'Settings', enabled: 'Switch Souk Social on', liveEnabled: 'Switch Souk Live on',
    hostFanout: 'Viewers fed by the host', hostFanoutHint: 'Each direct viewer uses upload from the seller’s phone.', relayFanout: 'Viewers relayed by each viewer', relayFanoutHint: '0 turns relaying between viewers off.',
    maxDepth: 'Maximum tree depth', autoHide: 'Hide a post after this many reports', autoHideHint: 'Hidden until a moderator checks it.', capacity: 'Approximate capacity per live: {n} viewers.',
    reports: 'Reports', reportStatus: { open: 'To review', resolved: 'Removed', dismissed: 'Dismissed' }, noReports: 'No reports.',
    target: { post: 'Post', comment: 'Comment', live: 'Live', live_comment: 'Live chat message' }, nReports: '{n} reports', open: 'Open',
    remove: 'Remove', removeBan: 'Remove + ban 7 days', restore: 'Restore', dismiss: 'Dismiss', banConfirm: 'Ban {name} from posting and going live for {n} days?',
    lives: 'Lives', stopLive: 'Stop live', stopReason: 'Reason (shown to the host):',
    stat: { posts: 'Posts', postsToday: 'Posts today', openReports: 'Open reports', liveNow: 'Live now', scheduled: 'Scheduled lives', hidden: 'Hidden posts', follows: 'Follows', banned: 'Banned accounts' },
  },
});

// v39: old / new ouguiya
deepMerge(ar, { ouguiya: {
  millions: '{n} مليون قديمة', thousands: '{n} ألف قديمة', units: '{n} أوقية قديمة', hint: 'الأوقية الجديدة = 10 أوقيات قديمة',
  priceOld: 'السعر (أوقية قديمة)', wasPriceOld: 'السعر قبل التخفيض (أوقية قديمة)',
  unit: 'عملة السعر', new: 'أوقية جديدة (MRU)', old: 'أوقية قديمة', savedAs: 'بالجديدة (هكذا سيظهر)',
  looksOld: 'هذا السعر أعلى بنحو 10 مرات من أسعار المنتجات المشابهة. هل كتبته بالأوقية القديمة؟', fixOld: 'نعم، هذا السعر بالقديمة',
} });
deepMerge(fr, { ouguiya: {
  millions: '{n} millions d’anciens ouguiyas', thousands: '{n} mille anciens ouguiyas', units: '{n} anciens ouguiyas', hint: '1 nouvel ouguiya = 10 anciens ouguiyas',
  priceOld: 'Prix (anciens ouguiyas)', wasPriceOld: 'Prix avant remise (anciens ouguiyas)',
  unit: 'Devise du prix', new: 'Nouvel ouguiya (MRU)', old: 'Ancien ouguiya', savedAs: 'en nouveaux ouguiyas (affiché ainsi)',
  looksOld: 'Ce prix est environ 10 fois plus élevé que celui d’articles similaires. L’avez-vous écrit en anciens ouguiyas ?', fixOld: 'Oui, ce prix est en anciens ouguiyas',
} });
deepMerge(en, { ouguiya: {
  millions: '{n} million old ouguiya', thousands: '{n} thousand old ouguiya', units: '{n} old ouguiya', hint: '1 new ouguiya = 10 old ouguiya',
  priceOld: 'Price (old ouguiya)', wasPriceOld: 'Price before discount (old ouguiya)',
  unit: 'Price currency', new: 'New ouguiya (MRU)', old: 'Old ouguiya', savedAs: 'in new ouguiya (shown like this)',
  looksOld: 'This price is about 10 times what similar items sell for. Did you type it in old ouguiya?', fixOld: 'Yes, this price is in old ouguiya',
} });

// v40: WhatsApp status image
deepMerge(ar, { status: { button: 'صورة لحالة واتساب', title: 'صورة جاهزة لحالة واتساب', making: 'جارٍ تجهيز الصورة…', hint: 'انشرها في حالتك: من يمسح الرمز يفتح الإعلان مباشرة.', share: 'مشاركة', download: 'تحميل الصورة', scan: 'امسح الرمز لفتح الإعلان' } });
deepMerge(fr, { status: { button: 'Image pour statut WhatsApp', title: 'Image prête pour votre statut', making: 'Préparation de l’image…', hint: 'Publiez-la en statut : le QR code ouvre directement l’annonce.', share: 'Partager', download: 'Télécharger', scan: 'Scannez pour voir l’annonce' } });
deepMerge(en, { status: { button: 'WhatsApp status image', title: 'Ready-made status image', making: 'Preparing the image…', hint: 'Post it as your status: scanning the code opens the listing.', share: 'Share', download: 'Download image', scan: 'Scan to open the listing' } });

// v41: livestock details + Eid sheep market
deepMerge(ar, {
  attrs: {
    animal: 'نوع الحيوان', sex: 'الجنس', breed: 'السلالة', ageMonths: 'العمر (بالأشهر)', weightKg: 'الوزن التقريبي (كغ)', heads: 'عدد الرؤوس', eidReady: 'مناسب للأضحية',
    opts: {
      animal: { sheep: 'خروف / كبش', goat: 'ماعز', camel: 'إبل', cow: 'بقر', other: 'أخرى' }, sex: { male: 'ذكر', female: 'أنثى' },
      breed: { touabire: 'توابير', peul: 'فلاني (بول)', ladoum: 'لادوم', local: 'محلي', mixed: 'مهجّن', other: 'أخرى' }, eidReady: { yes: 'نعم', no: 'لا' },
    },
  },
  eid: {
    nav: 'سوق الأضاحي', title: 'سوق الأضاحي', subtitle: 'كباش وأضاحي من مربّين وتجار في كل المدن، مرتّبة من الأرخص.', browse: 'تصفّح',
    daysLeft: 'العيد بعد {n} يوماً', today: 'عيد مبارك! 🎉', sell: 'بِع أضحيتك', allAnimals: 'الكل',
    maxPrice: 'أقصى سعر (MRU)', minWeight: 'أقل وزن (كغ)', reset: 'إعادة ضبط', count: '{n} إعلاناً', none: 'لا توجد أضاحي بهذه المواصفات الآن.', postWanted: 'اطلب أضحية بمواصفاتك',
    guideTitle: 'كيف تختار أضحيتك', guide: 'السن: الضأن ما أتمّ ستة أشهر عند كثير من أهل العلم، والماعز سنة، والبقر سنتان، والإبل خمس سنوات.|السلامة من العيوب البيّنة: العوراء والمريضة والعرجاء والهزيلة.|اطلب صوراً واضحة من عدة زوايا، واسأل عن العمر والوزن قبل الذهاب.|احجز التوصيل مبكراً: الطلب يزيد قبل العيد بأيام.',
    guideNote: 'معلومات عامة للتسهيل، ارجع لأهل العلم في أحكام الأضحية.',
    safetyTitle: 'اشترِ بأمان', safety: 'عاين الأضحية بنفسك قبل الدفع.|لا ترسل عربوناً لبائع لا تعرفه.|قابل البائع في مكان عام أو في السوق.|بلّغ عن أي إعلان مشبوه من صفحة الإعلان.',
    adminTitle: 'سوق الأضاحي (موسمي)', adminToggle: 'إظهار سوق الأضاحي', adminHint: 'يظهر شريط في الصفحة الرئيسية ورابط في القائمة، ويختفي تلقائياً بعد العيد.', adminDate: 'تاريخ العيد', adminDateHint: 'لعرض العدّ التنازلي. اتركه فارغاً إن لم يُحدَّد بعد.',
  },
});
deepMerge(fr, {
  attrs: {
    animal: 'Animal', sex: 'Sexe', breed: 'Race', ageMonths: 'Âge (mois)', weightKg: 'Poids approximatif (kg)', heads: 'Nombre de têtes', eidReady: 'Convient pour la Tabaski',
    opts: {
      animal: { sheep: 'Mouton / bélier', goat: 'Chèvre', camel: 'Chameau', cow: 'Bovin', other: 'Autre' }, sex: { male: 'Mâle', female: 'Femelle' },
      breed: { touabire: 'Touabire', peul: 'Peul-peul', ladoum: 'Ladoum', local: 'Local', mixed: 'Croisé', other: 'Autre' }, eidReady: { yes: 'Oui', no: 'Non' },
    },
  },
  eid: {
    nav: 'Marché de la Tabaski', title: 'Marché de la Tabaski', subtitle: 'Moutons et béliers d’éleveurs et de commerçants dans toutes les villes, du moins cher au plus cher.', browse: 'Voir',
    daysLeft: 'Tabaski dans {n} jours', today: 'Bonne fête ! 🎉', sell: 'Vendre un mouton', allAnimals: 'Tous',
    maxPrice: 'Prix max (MRU)', minWeight: 'Poids min (kg)', reset: 'Réinitialiser', count: '{n} annonces', none: 'Aucun animal avec ces critères pour le moment.', postWanted: 'Publier une demande',
    guideTitle: 'Bien choisir son mouton', guide: 'Âge : mouton d’au moins six mois selon de nombreux savants, chèvre un an, bovin deux ans, chameau cinq ans.|Sans défaut apparent : borgne, malade, boiteux ou trop maigre.|Demandez des photos sous plusieurs angles, l’âge et le poids avant de vous déplacer.|Réservez la livraison tôt : la demande monte juste avant la fête.',
    guideNote: 'Informations générales : référez-vous aux savants pour les règles du sacrifice.',
    safetyTitle: 'Acheter en sécurité', safety: 'Voyez l’animal avant de payer.|N’envoyez pas d’acompte à un vendeur inconnu.|Rencontrez le vendeur dans un lieu public ou au marché.|Signalez toute annonce suspecte depuis sa page.',
    adminTitle: 'Marché de la Tabaski (saisonnier)', adminToggle: 'Afficher le marché de la Tabaski', adminHint: 'Bandeau sur l’accueil et lien dans le menu ; disparaît seul après la fête.', adminDate: 'Date de la fête', adminDateHint: 'Pour le compte à rebours. Laissez vide si elle n’est pas encore fixée.',
  },
});
deepMerge(en, {
  attrs: {
    animal: 'Animal', sex: 'Sex', breed: 'Breed', ageMonths: 'Age (months)', weightKg: 'Approx. weight (kg)', heads: 'Number of head', eidReady: 'Fit for Eid sacrifice',
    opts: {
      animal: { sheep: 'Sheep / ram', goat: 'Goat', camel: 'Camel', cow: 'Cattle', other: 'Other' }, sex: { male: 'Male', female: 'Female' },
      breed: { touabire: 'Touabire', peul: 'Peul-peul', ladoum: 'Ladoum', local: 'Local', mixed: 'Crossbred', other: 'Other' }, eidReady: { yes: 'Yes', no: 'No' },
    },
  },
  eid: {
    nav: 'Eid sheep market', title: 'Eid sheep market', subtitle: 'Sheep and rams from breeders and traders in every city, cheapest first.', browse: 'Browse',
    daysLeft: 'Eid in {n} days', today: 'Eid Mubarak! 🎉', sell: 'Sell an animal', allAnimals: 'All',
    maxPrice: 'Max price (MRU)', minWeight: 'Min weight (kg)', reset: 'Reset', count: '{n} listings', none: 'No animals match these filters right now.', postWanted: 'Post what you need',
    guideTitle: 'Choosing your animal', guide: 'Age: sheep at least six months according to many scholars, goats one year, cattle two years, camels five years.|No obvious defect: one-eyed, sick, lame or emaciated.|Ask for clear photos from several angles, the age and weight before you travel.|Book delivery early: demand peaks in the days before Eid.',
    guideNote: 'General information only: refer to scholars for the rules of the sacrifice.',
    safetyTitle: 'Buy safely', safety: 'See the animal before paying.|Never send a deposit to a seller you don’t know.|Meet in a public place or at the market.|Report any suspicious listing from its page.',
    adminTitle: 'Eid sheep market (seasonal)', adminToggle: 'Show the Eid sheep market', adminHint: 'Adds a banner on the home page and a menu link; disappears by itself after Eid.', adminDate: 'Date of Eid', adminDateHint: 'For the countdown. Leave empty if not fixed yet.',
  },
});

// v42: barter
deepMerge(ar, {
  swap: {
    accepts: 'يقبل المقايضة', short: 'مقايضة', filter: 'يقبل المقايضة', propose: 'اعرض مقايضة', chatButton: 'مقايضة',
    formLabel: 'أقبل المقايضة (التبادل بمنتج آخر)', wantedPh: 'بماذا تقبل المبادلة؟ مثال: هاتف سامسونج حديث، أو سيارة صغيرة',
    opening: 'السلام عليكم، أرغب في مقايضة «{title}».', dialogTitle: 'اقتراح مقايضة', pickListing: 'اختر أحد إعلاناتك لتعرضه مقابل هذا المنتج:',
    noListings: 'لكي تقايض، أضف أولاً إعلاناً بالمنتج الذي تعرضه.', cash: { none: 'بدون فرق', add: 'أضيف مبلغاً', ask: 'أطلب مبلغاً' },
    amountPh: 'المبلغ (MRU)', send: 'إرسال الاقتراح', youProposed: 'اقترحتَ مقايضة', theyProposed: 'يقترح مقايضة',
    plusCash: '+ {amount} نقداً', minusCash: 'ويطلب {amount} نقداً', gone: 'الإعلان المعروض لم يعد متاحاً',
  },
  errors: { swap_not_accepted: 'صاحب هذا الإعلان لا يقبل المقايضة.' },
  chat: { preview: { swap: '🔄 اقتراح مقايضة' } },
  notifications: { types: {
    swap_new: '🔄 {from} يقترح مقايضة «{title}» بـ «{offered}»', swap_accepted: '🔄 {from} قبل اقتراح المقايضة على «{title}»', swap_declined: '{from} رفض اقتراح المقايضة على «{title}»',
  } },
});
deepMerge(fr, {
  swap: {
    accepts: 'Accepte l’échange', short: 'Échange', filter: 'Accepte l’échange', propose: 'Proposer un échange', chatButton: 'Échange',
    formLabel: 'J’accepte l’échange (troc contre un autre article)', wantedPh: 'Contre quoi ? Ex. : un Samsung récent, une petite voiture',
    opening: 'Bonjour, je souhaite échanger « {title} ».', dialogTitle: 'Proposer un échange', pickListing: 'Choisissez une de vos annonces à proposer en échange :',
    noListings: 'Pour échanger, publiez d’abord une annonce de l’article que vous proposez.', cash: { none: 'Sans soulte', add: 'J’ajoute', ask: 'Je demande' },
    amountPh: 'Montant (MRU)', send: 'Envoyer la proposition', youProposed: 'Vous proposez un échange', theyProposed: 'Propose un échange',
    plusCash: '+ {amount} en espèces', minusCash: 'et demande {amount}', gone: 'L’annonce proposée n’est plus disponible',
  },
  errors: { swap_not_accepted: 'Ce vendeur n’accepte pas l’échange.' },
  chat: { preview: { swap: '🔄 Proposition d’échange' } },
  notifications: { types: {
    swap_new: '🔄 {from} propose d’échanger « {title} » contre « {offered} »', swap_accepted: '🔄 {from} a accepté votre échange pour « {title} »', swap_declined: '{from} a refusé votre échange pour « {title} »',
  } },
});
deepMerge(en, {
  swap: {
    accepts: 'Open to swaps', short: 'Swap', filter: 'Open to swaps', propose: 'Propose a swap', chatButton: 'Swap',
    formLabel: 'I accept swaps (trade for another item)', wantedPh: 'For what? e.g. a recent Samsung, a small car',
    opening: 'Hello, I would like to swap for “{title}”.', dialogTitle: 'Propose a swap', pickListing: 'Choose one of your listings to offer in exchange:',
    noListings: 'To swap, first post a listing for the item you are offering.', cash: { none: 'No difference', add: 'I add cash', ask: 'I ask cash' },
    amountPh: 'Amount (MRU)', send: 'Send proposal', youProposed: 'You proposed a swap', theyProposed: 'Proposes a swap',
    plusCash: '+ {amount} in cash', minusCash: 'and asks {amount}', gone: 'The offered listing is no longer available',
  },
  errors: { swap_not_accepted: 'This seller does not accept swaps.' },
  chat: { preview: { swap: '🔄 Swap proposal' } },
  notifications: { types: {
    swap_new: '🔄 {from} offers to swap “{title}” for “{offered}”', swap_accepted: '🔄 {from} accepted your swap for “{title}”', swap_declined: '{from} declined your swap for “{title}”',
  } },
});

// v43: spoken listing description
deepMerge(ar, { voice: { title: 'وصف صوتي (اختياري)', hint: 'تكلّم عن منتجك بالحسانية أو بأي لغة، حتى دقيقة ونصف. مفيد لمن لا يحب الكتابة.', record: 'سجّل وصفاً صوتياً', stop: 'إنهاء', again: 'أعد التسجيل', listen: 'اسمع وصف البائع', badge: 'وصف صوتي' } });
deepMerge(fr, { voice: { title: 'Description vocale (facultatif)', hint: 'Présentez votre article à l’oral, en hassanya ou toute autre langue, jusqu’à 1 min 30.', record: 'Enregistrer une description', stop: 'Terminer', again: 'Recommencer', listen: 'Écouter le vendeur', badge: 'Description vocale' } });
deepMerge(en, { voice: { title: 'Spoken description (optional)', hint: 'Describe your item out loud, in Hassaniya or any language, up to 1 min 30.', record: 'Record a description', stop: 'Finish', again: 'Record again', listen: 'Listen to the seller', badge: 'Voice description' } });

// v44: safe meeting places
deepMerge(ar, {
  admin: { meetingPlaces: 'أماكن التسليم الآمنة' },
  places: {
    button: 'مكان آمن', title: 'اقترح مكاناً آمناً للتسليم', intro: 'اختر مكاناً عاماً لتلتقيا فيه، فيُرسَل للطرف الآخر مع رابط الخريطة.',
    openMap: 'فتح الخريطة', none: 'لم تُضف الإدارة أماكن لهذه المدينة بعد.', allCities: 'عرض كل المدن', message: 'أقترح أن نلتقي في',
    tips: 'التقِيا نهاراً في مكان عام ومزدحم.|خذ معك شخصاً تثق به للمبالغ الكبيرة.|افحص المنتج جيداً قبل الدفع.',
    adminTitle: 'أماكن التسليم الآمنة', adminHint: 'أماكن عامة حقيقية في كل مدينة (مراكز تجارية، مراكز شرطة، محطات وقود كبيرة…) تُقترح في المحادثات للتسليم الآمن.',
    kind: 'النوع', kinds: { mall: 'مركز تجاري', police: 'مركز شرطة', station: 'محطة وقود', market: 'سوق', bank: 'بنك', other: 'آخر' },
    nameAr: 'الاسم بالعربية', nameFr: 'الاسم بالفرنسية', address: 'العنوان / الحي', lat: 'خط العرض', lng: 'خط الطول', active: 'ظاهر للمستخدمين',
    add: 'إضافة مكان', empty: 'لا توجد أماكن بعد. أضف أماكن عامة حقيقية تعرفها في كل مدينة.', deleteConfirm: 'حذف «{name}»؟',
  },
});
deepMerge(fr, {
  admin: { meetingPlaces: 'Lieux de remise sûrs' },
  places: {
    button: 'Lieu sûr', title: 'Proposer un lieu de remise sûr', intro: 'Choisissez un lieu public : il est envoyé à l’autre personne avec un lien de carte.',
    openMap: 'Ouvrir la carte', none: 'Aucun lieu n’a encore été ajouté pour cette ville.', allCities: 'Voir toutes les villes', message: 'Je propose de nous retrouver à',
    tips: 'Retrouvez-vous de jour dans un lieu public et fréquenté.|Venez accompagné pour les gros montants.|Vérifiez bien l’article avant de payer.',
    adminTitle: 'Lieux de remise sûrs', adminHint: 'De vrais lieux publics par ville (centres commerciaux, commissariats, grandes stations…) proposés dans les conversations.',
    kind: 'Type', kinds: { mall: 'Centre commercial', police: 'Commissariat', station: 'Station-service', market: 'Marché', bank: 'Banque', other: 'Autre' },
    nameAr: 'Nom en arabe', nameFr: 'Nom en français', address: 'Adresse / quartier', lat: 'Latitude', lng: 'Longitude', active: 'Visible',
    add: 'Ajouter un lieu', empty: 'Aucun lieu. Ajoutez de vrais lieux publics que vous connaissez.', deleteConfirm: 'Supprimer « {name} » ?',
  },
});
deepMerge(en, {
  admin: { meetingPlaces: 'Safe meeting places' },
  places: {
    button: 'Safe place', title: 'Suggest a safe place to meet', intro: 'Pick a public place: it is sent to the other person with a map link.',
    openMap: 'Open the map', none: 'No places have been added for this city yet.', allCities: 'Show all cities', message: 'Let’s meet at',
    tips: 'Meet in daylight in a busy public place.|Bring someone along for large amounts.|Check the item carefully before paying.',
    adminTitle: 'Safe meeting places', adminHint: 'Real public places in each city (malls, police stations, big fuel stations…) suggested in chats for safe hand-overs.',
    kind: 'Type', kinds: { mall: 'Mall', police: 'Police station', station: 'Fuel station', market: 'Market', bank: 'Bank', other: 'Other' },
    nameAr: 'Name in Arabic', nameFr: 'Name in French', address: 'Address / area', lat: 'Latitude', lng: 'Longitude', active: 'Visible',
    add: 'Add a place', empty: 'No places yet. Add real public places you know in each city.', deleteConfirm: 'Delete “{name}”?',
  },
});

// v45: data saver
deepMerge(ar, { lite: { title: 'وضع توفير البيانات', on: 'توفير البيانات: مفعّل', off: 'توفير البيانات', showMap: 'اضغط لعرض الخريطة (يستهلك بيانات)' } });
deepMerge(fr, { lite: { title: 'Mode économie de données', on: 'Économie de données : activée', off: 'Économie de données', showMap: 'Afficher la carte (consomme des données)' } });
deepMerge(en, { lite: { title: 'Data saver mode', on: 'Data saver: on', off: 'Data saver', showMap: 'Tap to show the map (uses data)' } });

// v46: permanent livestock market
deepMerge(ar, { livestock: { nav: 'سوق المواشي', title: 'سوق المواشي', subtitle: 'إبل وبقر وغنم وماعز من المربّين في كل المدن، طوال السنة.', sell: 'بِع ماشيتك', none: 'لا توجد مواشٍ بهذه المواصفات الآن.', postWanted: 'اطلب ما تبحث عنه', safety: 'عاين الحيوان بنفسك قبل الدفع.|لا ترسل عربوناً لبائع لا تعرفه.|اسأل عن العمر والصحة والتلقيحات.|بلّغ عن أي إعلان مشبوه من صفحة الإعلان.', marketsTitle: 'أيام الأسواق الأسبوعية', today: 'اليوم' },
  admin: { livestockMarkets: 'أسواق المواشي الأسبوعية' },
  markets: { hint: 'الأسواق الأسبوعية للمواشي وأيامها في كل مدينة، تظهر في صفحة «سوق المواشي».', days: 'أيام السوق', notes: 'ملاحظات (اختياري)', add: 'إضافة سوق', empty: 'لا توجد أسواق بعد. أضف الأسواق التي تعرف أيامها.' } });
deepMerge(fr, { livestock: { nav: 'Marché du bétail', title: 'Marché du bétail', subtitle: 'Chameaux, bovins, moutons et chèvres d’éleveurs de toutes les villes, toute l’année.', sell: 'Vendre du bétail', none: 'Aucun animal avec ces critères pour le moment.', postWanted: 'Publier une demande', safety: 'Voyez l’animal avant de payer.|N’envoyez pas d’acompte à un inconnu.|Demandez l’âge, la santé et les vaccins.|Signalez toute annonce suspecte.', marketsTitle: 'Jours de marché hebdomadaires', today: 'Aujourd’hui' },
  admin: { livestockMarkets: 'Marchés à bétail' },
  markets: { hint: 'Les marchés à bétail hebdomadaires et leurs jours, affichés sur la page « Marché du bétail ».', days: 'Jours de marché', notes: 'Notes (facultatif)', add: 'Ajouter un marché', empty: 'Aucun marché. Ajoutez ceux dont vous connaissez les jours.' } });
deepMerge(en, { livestock: { nav: 'Livestock market', title: 'Livestock market', subtitle: 'Camels, cattle, sheep and goats from breeders in every city, all year round.', sell: 'Sell livestock', none: 'No animals match these filters right now.', postWanted: 'Post what you need', safety: 'See the animal before paying.|Never send a deposit to a stranger.|Ask about age, health and vaccinations.|Report any suspicious listing.', marketsTitle: 'Weekly market days', today: 'Today' },
  admin: { livestockMarkets: 'Livestock markets' },
  markets: { hint: 'Weekly livestock markets and their days in each city, shown on the “Livestock market” page.', days: 'Market days', notes: 'Notes (optional)', add: 'Add a market', empty: 'No markets yet. Add the ones whose days you know.' } });

// v48: auctions (المزادات)
deepMerge(ar, {
  auction: {
    nav: 'المزادات', badge: 'مزاد', title: 'مزاد جارٍ', ended: 'انتهى المزاد', daysShort: 'ي',
    pageTitle: 'المزادات', pageSubtitle: 'زايد على سلع حقيقية من بائعين في كل المدن. أعلى مزايد عند انتهاء الوقت يتواصل مع البائع ويدفع نقداً عند الاستلام.',
    tabActive: 'جارية الآن', tabEnded: 'انتهت', tabBidding: 'أزايد عليها', tabMine: 'مزاداتي',
    count: '{n} مزاد', none: 'لا توجد مزادات هنا الآن.', howToStart: 'لبدء مزاد: افتح أحد إعلاناتك واضغط «ابدأ مزاداً».', myListings: 'إعلاناتي', off: 'المزادات متوقفة حالياً.',
    start: 'ابدأ مزاداً على هذا الإعلان', startNow: 'ابدأ المزاد', again: 'ابدأ مزاداً جديداً',
    howSeller: 'يزايد المشترون على سلعتك حتى ينتهي الوقت. لا دفع عبر الموقع: تفتح محادثة بينك وبين أعلى مزايد لتتفقا على التسليم والدفع نقداً.',
    startPrice: 'سعر البداية (أوقية)', step: 'أقل زيادة لكل مزايدة', stepHint: 'إن تركته فارغاً يُحسب تلقائياً (نحو 2٪ من سعر البداية).',
    reserve: 'أقل سعر تقبل البيع به (سري)', reserveHint: 'لا يراه أحد غيرك. إن لم يصل إليه المزاد فلست ملزماً بالبيع.', length: 'مدة المزاد',
    hours: '{n} ساعة', days: '{n} يوم',
    current: 'أعلى مزايدة', startsAt: 'يبدأ من', bidsCount: '{n} مزايدة', reserveReached: 'تجاوز الحد الأدنى ✓', reserveNotReached: 'لم يبلغ الحد الأدنى بعد',
    yourReserve: 'حدّك الأدنى السري: {amount}', leading: 'أنت صاحب أعلى مزايدة الآن.', loginToBid: 'سجّل الدخول لتزايد',
    yourBid: 'مبلغ مزايدتك', bid: 'زايد', confirmBig: 'تأكيد المبلغ', bigWarning: 'تأكد: ستزايد بمبلغ {amount}. اضغط «تأكيد المبلغ».',
    bidNote: 'المزايدة التزام بالشراء إن فزت. المزايدة في آخر الدقائق تمدد الوقت قليلاً حتى يتمكن الآخرون من الرد.',
    history: 'سجل المزايدات', you: 'أنت', cancel: 'إلغاء المزاد', cancelConfirm: 'إلغاء هذا المزاد؟',
    youWon: 'مبروك! فزت بالمزاد بمبلغ {amount}. تواصل مع البائع لترتيب التسليم.', noBids: 'انتهى المزاد دون مزايدات.',
    soldFor: 'انتهى المزاد بمبلغ {amount}.', reserveUnmet: 'انتهى المزاد عند {amount} دون بلوغ الحد الأدنى الذي حدده البائع.',
    chatWinner: 'تواصل مع الفائز', chatSeller: 'تواصل مع البائع',
    chatTitle: 'نتيجة المزاد', chatMet: 'فاز المشتري بالمزاد. اتفقا على مكان آمن للتسليم، والدفع نقداً عند الاستلام بعد فحص السلعة.',
    chatUnmet: 'هذا أعلى مبلغ في المزاد لكنه أقل من الحد الأدنى للبائع. يمكنكما الاتفاق على سعر هنا.',
    rulesTitle: 'كيف تعمل المزادات؟',
    rules: 'كل مزايدة يجب أن تتجاوز السابقة بالزيادة الدنيا على الأقل.|مزايدة في آخر 3 دقائق تمدد الوقت 3 دقائق، فلا فائدة من المزايدة في اللحظة الأخيرة.|عند انتهاء الوقت تُفتح محادثة بين البائع وأعلى مزايد.|لا دفع عبر الموقع: عاين السلعة وادفع نقداً عند الاستلام في مكان آمن.|قد يضع البائع حداً أدنى سرياً؛ إن لم يُبلغ فلا يلزمه البيع.|لا يمكن للبائع إلغاء المزاد بعد أول مزايدة.',
  },
  chat: { preview: { auction: '🔨 نتيجة مزاد' } },
  errors: {
    bid_too_low: 'مزايدتك أقل من المطلوب. أقل مبلغ الآن: {min}', bid_too_high: 'المبلغ كبير جداً مقارنة بالمزاد، تأكد من عدد الأصفار.',
    already_leading: 'أنت صاحب أعلى مزايدة بالفعل.', auction_closed: 'انتهى هذا المزاد.', auction_exists: 'يوجد مزاد جارٍ على هذا الإعلان.',
    auction_has_bids: 'لا يمكن إلغاء مزاد بعد أن بدأت المزايدات.', auctions_disabled: 'المزادات متوقفة حالياً.', cannot_bid_own: 'لا يمكنك المزايدة على إعلانك.',
    too_many_auctions: 'لديك 10 مزادات جارية، انتظر انتهاء بعضها.', auction_not_found: 'المزاد غير موجود.', product_not_approved: 'يجب أن يُقبل الإعلان أولاً.',
  },
  notifications: { types: {
    auction_bid: '🔨 {from} زايد بـ {amount} أوقية على «{title}»', auction_outbid: '🔨 تجاوز أحدهم مزايدتك على «{title}»: {amount} أوقية. زايد من جديد!',
    auction_won: '🎉 فزت بمزاد «{title}» بـ {amount} أوقية. تواصل مع البائع', auction_sold: '🔨 انتهى مزاد «{title}» بـ {amount} أوقية. تواصل مع الفائز',
    auction_lost: 'انتهى مزاد «{title}» بـ {amount} أوقية، ولم تفز هذه المرة', auction_no_bids: 'انتهى مزاد «{title}» دون مزايدات',
    auction_reserve_unmet: 'انتهى مزاد «{title}» عند {amount} أوقية دون بلوغ حد البائع، ويمكنكما التفاوض',
    auction_reserve_unmet_seller: 'انتهى مزاد «{title}» عند {amount} أوقية، أقل من حدك الأدنى. يمكنك التفاوض مع أعلى مزايد',
    auction_cancelled: 'أُلغي مزاد «{title}»',
  } },
  adminAuctions: { title: 'المزادات', enabled: 'تفعيل المزادات', minHours: 'أقل مدة (ساعات)', maxDays: 'أطول مدة (أيام)', extendMinutes: 'تمديد عند المزايدة في آخر الدقائق (دقائق)' },
});
deepMerge(fr, {
  auction: {
    nav: 'Enchères', badge: 'Enchère', title: 'Enchère en cours', ended: 'Enchère terminée', daysShort: 'j',
    pageTitle: 'Enchères', pageSubtitle: 'Enchérissez sur de vrais articles de vendeurs de toutes les villes. Le meilleur enchérisseur contacte le vendeur et paie en espèces à la remise.',
    tabActive: 'En cours', tabEnded: 'Terminées', tabBidding: 'Mes enchères', tabMine: 'Mes ventes',
    count: '{n} enchère(s)', none: 'Aucune enchère ici pour le moment.', howToStart: 'Pour lancer une enchère : ouvrez une de vos annonces et touchez « Lancer une enchère ».', myListings: 'Mes annonces', off: 'Les enchères sont désactivées.',
    start: 'Lancer une enchère sur cette annonce', startNow: 'Lancer l’enchère', again: 'Relancer une enchère',
    howSeller: 'Les acheteurs enchérissent jusqu’à la fin. Aucun paiement sur le site : une discussion s’ouvre avec le meilleur enchérisseur pour convenir de la remise et du paiement en espèces.',
    startPrice: 'Prix de départ (MRU)', step: 'Pas minimum', stepHint: 'Vide = calculé automatiquement (environ 2 % du prix de départ).',
    reserve: 'Prix de réserve (secret)', reserveHint: 'Vous seul le voyez. S’il n’est pas atteint, vous n’êtes pas obligé de vendre.', length: 'Durée',
    hours: '{n} h', days: '{n} jour(s)',
    current: 'Meilleure offre', startsAt: 'À partir de', bidsCount: '{n} offre(s)', reserveReached: 'Réserve atteinte ✓', reserveNotReached: 'Réserve non atteinte',
    yourReserve: 'Votre réserve secrète : {amount}', leading: 'Vous êtes le meilleur enchérisseur.', loginToBid: 'Connectez-vous pour enchérir',
    yourBid: 'Votre offre', bid: 'Enchérir', confirmBig: 'Confirmer', bigWarning: 'Attention : vous enchérissez {amount}. Touchez « Confirmer ».',
    bidNote: 'Une offre vous engage à acheter si vous gagnez. Une offre dans les dernières minutes prolonge un peu la fin.',
    history: 'Historique', you: 'Vous', cancel: 'Annuler l’enchère', cancelConfirm: 'Annuler cette enchère ?',
    youWon: 'Bravo ! Vous avez gagné à {amount}. Contactez le vendeur pour la remise.', noBids: 'Terminée sans offre.',
    soldFor: 'Terminée à {amount}.', reserveUnmet: 'Terminée à {amount}, sous la réserve du vendeur.',
    chatWinner: 'Contacter le gagnant', chatSeller: 'Contacter le vendeur',
    chatTitle: 'Résultat de l’enchère', chatMet: 'L’acheteur a gagné. Convenez d’un lieu sûr ; paiement en espèces à la remise après vérification.',
    chatUnmet: 'Meilleure offre, mais sous la réserve du vendeur. Vous pouvez vous mettre d’accord ici.',
    rulesTitle: 'Comment ça marche ?',
    rules: 'Chaque offre doit dépasser la précédente d’au moins le pas minimum.|Une offre dans les 3 dernières minutes prolonge de 3 minutes.|À la fin, une discussion s’ouvre entre le vendeur et le meilleur enchérisseur.|Aucun paiement sur le site : voyez l’article et payez en espèces dans un lieu sûr.|Le vendeur peut fixer une réserve secrète ; non atteinte, il n’est pas obligé de vendre.|Le vendeur ne peut plus annuler après la première offre.',
  },
  chat: { preview: { auction: '🔨 Résultat d’enchère' } },
  errors: {
    bid_too_low: 'Offre trop basse. Minimum actuel : {min}', bid_too_high: 'Montant très élevé : vérifiez le nombre de zéros.',
    already_leading: 'Vous êtes déjà le meilleur enchérisseur.', auction_closed: 'Cette enchère est terminée.', auction_exists: 'Une enchère est déjà en cours sur cette annonce.',
    auction_has_bids: 'Impossible d’annuler après les premières offres.', auctions_disabled: 'Les enchères sont désactivées.', cannot_bid_own: 'Vous ne pouvez pas enchérir sur votre annonce.',
    too_many_auctions: 'Vous avez déjà 10 enchères en cours.', auction_not_found: 'Enchère introuvable.', product_not_approved: 'L’annonce doit d’abord être validée.',
  },
  notifications: { types: {
    auction_bid: '🔨 {from} offre {amount} MRU pour « {title} »', auction_outbid: '🔨 Votre offre pour « {title} » a été dépassée : {amount} MRU',
    auction_won: '🎉 Vous avez gagné « {title} » à {amount} MRU. Contactez le vendeur', auction_sold: '🔨 « {title} » adjugé à {amount} MRU. Contactez le gagnant',
    auction_lost: 'Enchère « {title} » terminée à {amount} MRU, vous n’avez pas gagné', auction_no_bids: 'Enchère « {title} » terminée sans offre',
    auction_reserve_unmet: 'Enchère « {title} » terminée à {amount} MRU sous la réserve : vous pouvez négocier',
    auction_reserve_unmet_seller: 'Enchère « {title} » terminée à {amount} MRU, sous votre réserve. Vous pouvez négocier',
    auction_cancelled: 'Enchère « {title} » annulée',
  } },
  adminAuctions: { title: 'Enchères', enabled: 'Activer les enchères', minHours: 'Durée minimum (heures)', maxDays: 'Durée maximum (jours)', extendMinutes: 'Prolongation sur offre tardive (minutes)' },
});
deepMerge(en, {
  auction: {
    nav: 'Auctions', badge: 'Auction', title: 'Live auction', ended: 'Auction ended', daysShort: 'd',
    pageTitle: 'Auctions', pageSubtitle: 'Bid on real items from sellers in every city. The top bidder when time runs out contacts the seller and pays cash on hand-over.',
    tabActive: 'Running', tabEnded: 'Ended', tabBidding: 'My bids', tabMine: 'My auctions',
    count: '{n} auction(s)', none: 'No auctions here right now.', howToStart: 'To start one: open one of your listings and tap “Start an auction”.', myListings: 'My listings', off: 'Auctions are switched off.',
    start: 'Start an auction on this listing', startNow: 'Start the auction', again: 'Start a new auction',
    howSeller: 'Buyers bid until time runs out. No payment through the site: a chat opens with the top bidder to arrange hand-over and cash payment.',
    startPrice: 'Starting price (MRU)', step: 'Minimum raise', stepHint: 'Leave empty to set it automatically (about 2% of the start price).',
    reserve: 'Reserve price (secret)', reserveHint: 'Only you see it. If bids do not reach it, you do not have to sell.', length: 'Length',
    hours: '{n} h', days: '{n} day(s)',
    current: 'Top bid', startsAt: 'Starts at', bidsCount: '{n} bid(s)', reserveReached: 'Reserve met ✓', reserveNotReached: 'Reserve not met yet',
    yourReserve: 'Your secret reserve: {amount}', leading: 'You are the top bidder.', loginToBid: 'Log in to bid',
    yourBid: 'Your bid', bid: 'Bid', confirmBig: 'Confirm', bigWarning: 'Check: you are bidding {amount}. Tap “Confirm”.',
    bidNote: 'A bid is a promise to buy if you win. A bid in the last minutes extends the end a little.',
    history: 'Bid history', you: 'You', cancel: 'Cancel auction', cancelConfirm: 'Cancel this auction?',
    youWon: 'Congratulations! You won at {amount}. Contact the seller to arrange hand-over.', noBids: 'Ended with no bids.',
    soldFor: 'Ended at {amount}.', reserveUnmet: 'Ended at {amount}, below the seller’s reserve.',
    chatWinner: 'Contact the winner', chatSeller: 'Contact the seller',
    chatTitle: 'Auction result', chatMet: 'The buyer won. Agree on a safe place; pay cash on hand-over after checking the item.',
    chatUnmet: 'This was the top bid, but below the seller’s reserve. You can still agree on a price here.',
    rulesTitle: 'How do auctions work?',
    rules: 'Each bid must beat the last one by at least the minimum raise.|A bid in the last 3 minutes adds 3 minutes, so last-second sniping does not work.|When time runs out, a chat opens between the seller and the top bidder.|No payment through the site: see the item and pay cash in a safe place.|A seller may set a secret reserve; if it is not met, they do not have to sell.|Sellers cannot cancel once bidding has started.',
  },
  chat: { preview: { auction: '🔨 Auction result' } },
  errors: {
    bid_too_low: 'Your bid is too low. Current minimum: {min}', bid_too_high: 'That is far above the auction: check the number of zeros.',
    already_leading: 'You are already the top bidder.', auction_closed: 'This auction has ended.', auction_exists: 'This listing already has a running auction.',
    auction_has_bids: 'An auction cannot be cancelled once bidding has started.', auctions_disabled: 'Auctions are switched off.', cannot_bid_own: 'You cannot bid on your own listing.',
    too_many_auctions: 'You already have 10 running auctions.', auction_not_found: 'Auction not found.', product_not_approved: 'The listing must be approved first.',
  },
  notifications: { types: {
    auction_bid: '🔨 {from} bid {amount} MRU on “{title}”', auction_outbid: '🔨 You were outbid on “{title}”: {amount} MRU. Bid again!',
    auction_won: '🎉 You won “{title}” at {amount} MRU. Contact the seller', auction_sold: '🔨 “{title}” sold at auction for {amount} MRU. Contact the winner',
    auction_lost: 'The auction for “{title}” ended at {amount} MRU; you did not win this time', auction_no_bids: 'Your auction for “{title}” ended with no bids',
    auction_reserve_unmet: 'The auction for “{title}” ended at {amount} MRU below the reserve: you can negotiate',
    auction_reserve_unmet_seller: 'Your auction for “{title}” ended at {amount} MRU, below your reserve. You can negotiate with the top bidder',
    auction_cancelled: 'The auction for “{title}” was cancelled',
  } },
  adminAuctions: { title: 'Auctions', enabled: 'Turn auctions on', minHours: 'Shortest length (hours)', maxDays: 'Longest length (days)', extendMinutes: 'Extension for last-minute bids (minutes)' },
});

// v49: Souk Pay (wallet, cash hand-over, admin ledger)
deepMerge(ar, {
  admin: { soukPay: 'سوق باي (الحسابات)' },
  pay: {
    nav: 'محفظتي', title: 'محفظتي · سوق باي', subtitle: 'ما لك من مبيعاتك، والنقد الذي معك من التوصيلات، وكل حركة مال تخصك.',
    sellerDue: 'لك ولم تستلمه بعد', sellerDueHint: 'مبيعات سُلّمت للمشتري وما زال مبلغها عند الموصّل أو المنصة.', sellerReceived: 'استلمته', sellerTotal: 'مجموع مبيعاتك', courierEarned: 'أجرتك من التوصيل',
    courierCash: 'نقد معك لغيرك', courierCashHint: 'ما جمعته من المشترين بعد خصم أجرتك. سلّمه للبائعين (وحصة المنصة إن وُجدت).', courierLink: 'النقد الذي معك وتسليمه للبائعين',
    toConfirm: 'لديك {n} مبلغ سلّمه لك موصّل بانتظار تأكيدك.',
    tabSales: 'مبيعاتي', tabDeliveries: 'توصيلاتي', tabHistory: 'كل الحركات',
    afterCommission: 'بعد عمولة {amount}', confirmQuestion: 'يقول الموصّل {name} إنه سلّمك {amount}. هل استلمته؟',
    received: 'نعم، استلمته', notReceived: 'لم أستلمه', disputePrompt: 'ما المشكلة؟ (مثلاً: لم أستلم شيئاً، أو المبلغ ناقص)',
    saleState: { with_courier: 'المبلغ عند الموصّل', pending: 'بانتظار تأكيدك', confirmed: 'استلمته ✓', disputed: 'قيد المراجعة', escrow: 'عند المنصة (الدفع الآمن)', paid: 'حُوّل لك ✓' },
    sellerIs: 'البائع: {name}', collected: 'جمعت', yourFee: 'أجرتك',
    handover: 'سلّمت {amount} للبائع', handoverConfirm: 'هل سلّمت فعلاً {amount} للبائع {name}؟ سيُطلب منه التأكيد.',
    handoverState: { pending: 'سلّمت {amount}، بانتظار تأكيد البائع', confirmed: 'أكّد البائع الاستلام ✓', disputed: 'البائع يقول إنه لم يستلم، والإدارة تراجع الأمر.' },
    undo: 'تراجع', platformShare: 'حصة المنصة {amount} تُسلَّم للإدارة.',
    noSales: 'لا توجد مبيعات مُسلّمة بعد.', noSalesHint: 'تظهر هنا طلبات التوصيل بعد تسليمها للمشتري.', noDeliveries: 'لا توجد توصيلات مكتملة بعد.', noHistory: 'لا توجد حركات بعد.',
    howTitle: 'كيف يعمل سوق باي؟',
    how: 'عند تسليم الطلب نقداً يجمع الموصّل المبلغ كاملاً من المشتري ويحتفظ بأجرة التوصيل.|يسلّم الموصّل ثمن السلعة للبائع ويضغط «سلّمت»، ثم يؤكد البائع الاستلام من هنا.|إن لم يصلك المبلغ اضغط «لم أستلمه» فتراجع الإدارة الأمر.|في الدفع الآمن تبقى الأموال عند المنصة حتى يؤكد المشتري الاستلام، ثم تُحوَّل للبائع.|لا يمر أي رقم بطاقة بنكية عبر الموقع.',
    kind: { cod_collected: 'نقد عند الاستلام', handover: 'تسليم للبائع', remittance: 'تسليم نقد للمنصة', escrow_in: 'دفع آمن (إيداع)', payout: 'تحويل مستحقات', refund: 'استرجاع', adjustment: 'تصحيح' },
    account: { buyer: 'المشتري', courier: 'الموصّل', seller: 'البائع', platform: 'المنصة', escrow: 'حساب الدفع الآمن' },
    status: { pending: 'بانتظار التأكيد', confirmed: 'مؤكَّد', disputed: 'متنازع عليه', cancelled: 'ملغى' },
    method: { cash: 'نقداً', bankily: 'بنكيلي', masrvi: 'مصرفي', sedad: 'سداد', other: 'أخرى' },
    admin: {
      title: 'سوق باي: الحسابات', intro: 'كل طلب يُسلَّم يُقسَّم بين البائع والموصّل والمنصة، وكل حركة مال حقيقية تُسجَّل هنا: من أعطى من، وكم، وكيف، ومن أكّد.',
      export: 'تصدير CSV', volume: 'قيمة الطلبات المسلّمة ({n})', couriersCash: 'نقد عند الموصّلين', sellersDue: 'مستحقات البائعين', escrowHeld: 'في حساب الدفع الآمن',
      platformEntitled: 'عمولات المنصة', platformHeld: 'استلمته المنصة', platformDue: 'عمولات لم تُستلم', disputed: 'خلافات مفتوحة',
      couriers: 'النقد عند الموصّلين', noneCouriers: 'لا يحمل أي موصّل نقداً لغيره.', receiveCash: 'استلمت منه',
      sellers: 'ما يستحقه البائعون', noneSellers: 'لا مستحقات معلّقة.', paySeller: 'سجّل تحويلاً',
      sellersHint: 'في الدفع نقداً يدفع الموصّل للبائع مباشرة. سجّل تحويلاً من المنصة فقط إن كانت المنصة هي من استلمت المال.',
      recordTitle: 'تسجيل حركة مال', record: 'تسجيل حركة', from: 'من', to: 'إلى', userId: 'رقم المستخدم (#)', amount: 'المبلغ',
      kind: 'النوع', method: 'الطريقة', ref: 'رقم العملية / الإيصال', note: 'ملاحظة',
      ledger: 'سجل الحركات', filter: 'تصفية', all: 'الكل', confirm: 'تأكيد', cancel: 'إلغاء', notePrompt: 'ملاحظة القرار (اختياري):',
      col: { '#': '#', date: 'التاريخ', kind: 'النوع', from: 'من', to: 'إلى', amount: 'المبلغ', state: 'الحالة' },
      commission: 'العمولة', commissionHint: 'نسبة تأخذها المنصة من ثمن السلعة ومن أجرة التوصيل. 0٪ تعني أن الموقع مجاني. تُطبَّق على الطلبات التي تُسلَّم بعد الحفظ.',
      commissionPct: 'عمولة على ثمن السلعة (%)', deliveryPct: 'عمولة على أجرة التوصيل (%)',
      providers: 'طرق الدفع', active: 'مفعّلة', off: 'متوقفة', needsContract: 'تحتاج عقد تاجر',
      providersHint: 'الدفع عند الاستلام والتحويل اليدوي بإيصال يعملان الآن مجاناً. الربط الآلي مع بنكيلي ومصرفي وسداد جاهز في البنية، لكنه يحتاج عقد تاجر ومفاتيح من كل مزوّد، فهو متوقف حتى توافق على ذلك.',
    },
  },
  errors: { handover_exists: 'سجّلت هذا التسليم من قبل.', nothing_to_hand_over: 'لا يوجد مبلغ لتسليمه في هذا الطلب.', transfer_closed: 'تمت معالجة هذه الحركة من قبل.', transfer_not_found: 'الحركة غير موجودة.', provider_disabled: 'طريقة الدفع هذه غير مفعّلة.' },
  notifications: { types: {
    pay_handover: '💵 {from} يقول إنه سلّمك {amount} أوقية عن «{title}». أكّد الاستلام',
    pay_confirmed: '✓ {from} أكّد استلام {amount} أوقية عن «{title}»',
    pay_disputed: '⚠️ {from} يقول إنه لم يستلم {amount} أوقية عن «{title}»',
    pay_resolved: 'قرار الإدارة في حركة {amount} أوقية عن «{title}»',
    pay_recorded_in: '💳 سُجّل لك استلام {amount} أوقية', pay_recorded_out: '💳 سُجّل عليك تسليم {amount} أوقية',
  } },
});
deepMerge(fr, {
  admin: { soukPay: 'Souk Pay (comptes)' },
  pay: {
    nav: 'Mon portefeuille', title: 'Portefeuille · Souk Pay', subtitle: 'Ce qui vous est dû pour vos ventes, l’argent que vous portez en tant que livreur, et chaque mouvement vous concernant.',
    sellerDue: 'Dû, pas encore reçu', sellerDueHint: 'Ventes livrées dont l’argent est encore chez le livreur ou la plateforme.', sellerReceived: 'Reçu', sellerTotal: 'Total de vos ventes', courierEarned: 'Vos frais de livraison',
    courierCash: 'Argent d’autrui sur vous', courierCashHint: 'Encaissé chez les acheteurs, moins vos frais. À remettre aux vendeurs (et la part de la plateforme).', courierLink: 'L’argent que vous portez et sa remise aux vendeurs',
    toConfirm: '{n} remise(s) d’argent attendent votre confirmation.',
    tabSales: 'Mes ventes', tabDeliveries: 'Mes livraisons', tabHistory: 'Mouvements',
    afterCommission: 'après commission de {amount}', confirmQuestion: 'Le livreur {name} dit vous avoir remis {amount}. L’avez-vous reçu ?',
    received: 'Oui, reçu', notReceived: 'Pas reçu', disputePrompt: 'Quel est le problème ? (ex. rien reçu, montant incomplet)',
    saleState: { with_courier: 'Chez le livreur', pending: 'À confirmer', confirmed: 'Reçu ✓', disputed: 'En vérification', escrow: 'Chez la plateforme (paiement sécurisé)', paid: 'Versé ✓' },
    sellerIs: 'Vendeur : {name}', collected: 'Encaissé', yourFee: 'Vos frais',
    handover: 'J’ai remis {amount} au vendeur', handoverConfirm: 'Avez-vous vraiment remis {amount} à {name} ? Il devra confirmer.',
    handoverState: { pending: 'Remis {amount}, en attente du vendeur', confirmed: 'Le vendeur a confirmé ✓', disputed: 'Le vendeur dit ne rien avoir reçu ; l’équipe vérifie.' },
    undo: 'Annuler', platformShare: 'Part de la plateforme {amount}, à remettre à l’équipe.',
    noSales: 'Aucune vente livrée pour l’instant.', noSalesHint: 'Les commandes apparaissent ici une fois livrées.', noDeliveries: 'Aucune livraison terminée.', noHistory: 'Aucun mouvement.',
    howTitle: 'Comment marche Souk Pay ?',
    how: 'À la livraison, le livreur encaisse le total et garde ses frais.|Il remet le prix de l’article au vendeur et touche « J’ai remis » ; le vendeur confirme ici.|Rien reçu ? Touchez « Pas reçu » et l’équipe vérifie.|En paiement sécurisé, l’argent reste à la plateforme jusqu’à la confirmation de l’acheteur.|Aucune donnée de carte ne passe par le site.',
    kind: { cod_collected: 'Encaissement à la livraison', handover: 'Remise au vendeur', remittance: 'Versement à la plateforme', escrow_in: 'Paiement sécurisé (dépôt)', payout: 'Versement', refund: 'Remboursement', adjustment: 'Correction' },
    account: { buyer: 'Acheteur', courier: 'Livreur', seller: 'Vendeur', platform: 'Plateforme', escrow: 'Compte sécurisé' },
    status: { pending: 'À confirmer', confirmed: 'Confirmé', disputed: 'Contesté', cancelled: 'Annulé' },
    method: { cash: 'Espèces', bankily: 'Bankily', masrvi: 'Masrvi', sedad: 'Sedad', other: 'Autre' },
    admin: {
      title: 'Souk Pay : comptes', intro: 'Chaque commande livrée est répartie entre vendeur, livreur et plateforme ; chaque mouvement réel d’argent est enregistré ici.',
      export: 'Exporter CSV', volume: 'Commandes livrées ({n})', couriersCash: 'Espèces chez les livreurs', sellersDue: 'Dû aux vendeurs', escrowHeld: 'Compte sécurisé',
      platformEntitled: 'Commissions', platformHeld: 'Reçu par la plateforme', platformDue: 'Commissions à encaisser', disputed: 'Litiges ouverts',
      couriers: 'Espèces chez les livreurs', noneCouriers: 'Aucun livreur ne porte d’argent d’autrui.', receiveCash: 'Reçu de lui',
      sellers: 'Dû aux vendeurs', noneSellers: 'Rien en attente.', paySeller: 'Enregistrer un versement',
      sellersHint: 'En paiement à la livraison, le livreur paie le vendeur directement. N’enregistrez un versement que si la plateforme a reçu l’argent.',
      recordTitle: 'Enregistrer un mouvement', record: 'Enregistrer', from: 'De', to: 'À', userId: 'N° utilisateur (#)', amount: 'Montant',
      kind: 'Type', method: 'Moyen', ref: 'Référence / reçu', note: 'Note',
      ledger: 'Journal', filter: 'Filtrer', all: 'Tout', confirm: 'Confirmer', cancel: 'Annuler', notePrompt: 'Note de décision (facultatif) :',
      col: { '#': '#', date: 'Date', kind: 'Type', from: 'De', to: 'À', amount: 'Montant', state: 'État' },
      commission: 'Commission', commissionHint: 'Part prise par la plateforme sur le prix et sur les frais de livraison. 0 % = gratuit. S’applique aux commandes livrées après l’enregistrement.',
      commissionPct: 'Commission sur le prix (%)', deliveryPct: 'Commission sur la livraison (%)',
      providers: 'Moyens de paiement', active: 'Actif', off: 'Désactivé', needsContract: 'Contrat marchand requis',
      providersHint: 'Le paiement à la livraison et le virement manuel avec reçu fonctionnent gratuitement. La connexion automatique Bankily, Masrvi et Sedad est prête dans la structure mais exige un contrat marchand et des clés : elle reste désactivée sans votre accord.',
    },
  },
  errors: { handover_exists: 'Remise déjà enregistrée.', nothing_to_hand_over: 'Rien à remettre pour cette commande.', transfer_closed: 'Mouvement déjà traité.', transfer_not_found: 'Mouvement introuvable.', provider_disabled: 'Ce moyen de paiement n’est pas actif.' },
  notifications: { types: {
    pay_handover: '💵 {from} dit vous avoir remis {amount} MRU pour « {title} ». Confirmez',
    pay_confirmed: '✓ {from} a confirmé avoir reçu {amount} MRU pour « {title} »',
    pay_disputed: '⚠️ {from} dit ne pas avoir reçu {amount} MRU pour « {title} »',
    pay_resolved: 'Décision de l’équipe sur {amount} MRU pour « {title} »',
    pay_recorded_in: '💳 Réception de {amount} MRU enregistrée', pay_recorded_out: '💳 Remise de {amount} MRU enregistrée',
  } },
});
deepMerge(en, {
  admin: { soukPay: 'Souk Pay (accounts)' },
  pay: {
    nav: 'My wallet', title: 'My wallet · Souk Pay', subtitle: 'What you are owed for your sales, the cash you carry as a courier, and every money movement that involves you.',
    sellerDue: 'Owed, not received yet', sellerDueHint: 'Delivered sales whose money is still with the courier or the platform.', sellerReceived: 'Received', sellerTotal: 'Total sales', courierEarned: 'Your delivery fees',
    courierCash: 'Others’ cash you carry', courierCashHint: 'What you collected from buyers minus your fee. Hand it to the sellers (and any platform share).', courierLink: 'The cash you carry and handing it to sellers',
    toConfirm: '{n} cash hand-over(s) waiting for your confirmation.',
    tabSales: 'My sales', tabDeliveries: 'My deliveries', tabHistory: 'All movements',
    afterCommission: 'after {amount} commission', confirmQuestion: 'Courier {name} says they handed you {amount}. Did you receive it?',
    received: 'Yes, received', notReceived: 'Not received', disputePrompt: 'What is wrong? (e.g. nothing received, amount short)',
    saleState: { with_courier: 'With the courier', pending: 'Waiting for you', confirmed: 'Received ✓', disputed: 'Under review', escrow: 'With the platform (secure payment)', paid: 'Paid out ✓' },
    sellerIs: 'Seller: {name}', collected: 'Collected', yourFee: 'Your fee',
    handover: 'I handed {amount} to the seller', handoverConfirm: 'Did you really hand {amount} to {name}? They will be asked to confirm.',
    handoverState: { pending: 'Handed {amount}, waiting for the seller', confirmed: 'The seller confirmed ✓', disputed: 'The seller says they got nothing; the team is checking.' },
    undo: 'Undo', platformShare: 'Platform share {amount}, to hand to the team.',
    noSales: 'No delivered sales yet.', noSalesHint: 'Delivery orders appear here once delivered.', noDeliveries: 'No completed deliveries yet.', noHistory: 'No movements yet.',
    howTitle: 'How does Souk Pay work?',
    how: 'On delivery, the courier collects the full amount and keeps the delivery fee.|They hand the item price to the seller and tap “I handed”; the seller confirms here.|Did not get it? Tap “Not received” and the team checks.|With secure payment, the money stays with the platform until the buyer confirms.|No card details ever go through the site.',
    kind: { cod_collected: 'Cash on delivery', handover: 'Hand-over to seller', remittance: 'Cash handed to platform', escrow_in: 'Secure payment (deposit)', payout: 'Payout', refund: 'Refund', adjustment: 'Correction' },
    account: { buyer: 'Buyer', courier: 'Courier', seller: 'Seller', platform: 'Platform', escrow: 'Secure-payment account' },
    status: { pending: 'Waiting', confirmed: 'Confirmed', disputed: 'Disputed', cancelled: 'Cancelled' },
    method: { cash: 'Cash', bankily: 'Bankily', masrvi: 'Masrvi', sedad: 'Sedad', other: 'Other' },
    admin: {
      title: 'Souk Pay: accounts', intro: 'Every delivered order is split between seller, courier and platform, and every real movement of money is recorded here: who gave whom, how much, how, and who confirmed.',
      export: 'Export CSV', volume: 'Delivered orders ({n})', couriersCash: 'Cash with couriers', sellersDue: 'Owed to sellers', escrowHeld: 'Secure-payment account',
      platformEntitled: 'Platform commissions', platformHeld: 'Received by platform', platformDue: 'Commissions not collected', disputed: 'Open disputes',
      couriers: 'Cash with couriers', noneCouriers: 'No courier carries anyone else’s money.', receiveCash: 'Received from them',
      sellers: 'Owed to sellers', noneSellers: 'Nothing outstanding.', paySeller: 'Record a payout',
      sellersHint: 'With cash on delivery the courier pays the seller directly. Only record a payout if the platform received the money.',
      recordTitle: 'Record a money movement', record: 'Record', from: 'From', to: 'To', userId: 'User number (#)', amount: 'Amount',
      kind: 'Type', method: 'Method', ref: 'Reference / receipt', note: 'Note',
      ledger: 'Ledger', filter: 'Filter', all: 'All', confirm: 'Confirm', cancel: 'Cancel', notePrompt: 'Decision note (optional):',
      col: { '#': '#', date: 'Date', kind: 'Type', from: 'From', to: 'To', amount: 'Amount', state: 'State' },
      commission: 'Commission', commissionHint: 'The platform’s share of the item price and of delivery fees. 0% means free. Applies to orders delivered after saving.',
      commissionPct: 'Commission on item price (%)', deliveryPct: 'Commission on delivery fee (%)',
      providers: 'Payment methods', active: 'On', off: 'Off', needsContract: 'Needs a merchant contract',
      providersHint: 'Cash on delivery and manual transfer with a receipt work now, free. Automatic Bankily, Masrvi and Sedad connections are ready in the structure but need a merchant contract and keys from each provider, so they stay off until you agree.',
    },
  },
  errors: { handover_exists: 'You already recorded this hand-over.', nothing_to_hand_over: 'Nothing to hand over for this order.', transfer_closed: 'This movement was already handled.', transfer_not_found: 'Movement not found.', provider_disabled: 'This payment method is not active.' },
  notifications: { types: {
    pay_handover: '💵 {from} says they handed you {amount} MRU for “{title}”. Please confirm',
    pay_confirmed: '✓ {from} confirmed receiving {amount} MRU for “{title}”',
    pay_disputed: '⚠️ {from} says they did not receive {amount} MRU for “{title}”',
    pay_resolved: 'The team decided on the {amount} MRU movement for “{title}”',
    pay_recorded_in: '💳 A receipt of {amount} MRU was recorded for you', pay_recorded_out: '💳 A hand-over of {amount} MRU was recorded for you',
  } },
});

// v50: Souk Pro (inventory, coupons, invoices, reports, store look)
deepMerge(ar, {
  pro: {
    nav: 'سوق برو', title: 'سوق برو: أدوات التاجر', subtitle: 'المخزون، كوبونات الخصم، تقارير المبيعات وواجهة متجرك. كلها مجانية.',
    tabs: { stock: '📦 المخزون', coupons: '🏷️ الكوبونات', reports: '📊 التقارير', look: '🎨 واجهة المتجر' },
    stock: {
      intro: 'حدّد عدد القطع المتوفرة من كل إعلان. يُنقص العدد تلقائياً عند تسليم كل طلب، ويصبح الإعلان «مباعاً» عند نفاد آخر قطعة. اترك الخانة فارغة لقطعة واحدة دون تتبّع.',
      lowWarning: '{n} إعلان أوشك مخزونه على النفاد.', none: 'لا توجد إعلانات بعد.', reserved: '{n} محجوزة لطلبات مفتوحة', sold: '{n} بيعت بالتوصيل', units: 'عدد القطع',
      formLabel: 'الكمية المتوفرة', formHint: 'اختياري. للتجار الذين لديهم عدة قطع من نفس السلعة.', onlyLeft: 'باقي {n} فقط!', inStock: 'متوفر',
    },
    coupon: {
      intro: 'أنشئ رمز خصم يكتبه المشتري عند طلب التوصيل. الخصم يُطبَّق على ثمن السلعة فقط ويُنقص من مستحقاتك.',
      code: 'الرمز', kind: 'النوع', percent: 'نسبة مئوية', amount: 'مبلغ ثابت', valuePct: 'النسبة (%)', valueMru: 'المبلغ (أوقية)',
      minTotal: 'أقل ثمن للسلعة', maxUses: 'عدد مرات الاستعمال', expires: 'ينتهي في', public: 'اعرضه في صفحة متجري', create: 'إنشاء الكوبون',
      used: 'استُعمل {n}', from: 'من {amount}', until: 'حتى {d}', active: 'مفعّل', onStore: 'ظاهر في المتجر', deleteConfirm: 'حذف الكوبون {code}؟', none: 'لا توجد كوبونات بعد.',
      discount: 'خصم الكوبون {code}', have: 'عندك كوبون خصم؟', apply: 'تطبيق', copied: 'نُسخ الرمز. اكتبه عند طلب التوصيل.', onDelivery: 'عند طلب التوصيل',
    },
    report: {
      days: 'آخر {n} يوم', revenue: 'المبيعات', orders: 'طلبات مُسلّمة', average: 'متوسط الطلب', buyers: 'مشترون', discounts: 'خصومات الكوبونات',
      cancelRate: 'نسبة الإلغاء', open: 'طلبات جارية', manual: 'مبيعات مسجّلة يدوياً', empty: 'لا توجد طلبات مُسلّمة في هذه الفترة.',
      top: 'الأكثر مبيعاً', coupons: 'الكوبونات المستعملة', manualHint: 'إضافةً إلى ذلك علّمتَ {n} إعلاناً «مباعاً» بنفسك (قيمتها {amount}) دون طلب توصيل.',
    },
    look: {
      noStore: 'أنشئ متجرك أولاً لتخصيص واجهته.', banner: 'صورة الغلاف', tagline: 'شعار قصير', hours: 'أوقات العمل', hoursPh: 'مثلاً: كل يوم من 9 صباحاً إلى 10 ليلاً',
      color: 'لون المتجر', defaultColor: 'اللون الافتراضي', pinned: 'إعلانات مثبّتة في الأعلى', pinnedHint: 'اختر حتى 4 إعلانات تظهر أولاً في صفحة متجرك.',
      view: 'عرض صفحة المتجر', pinnedTitle: 'مختارات المتجر',
    },
    invoice: {
      title: 'فاتورة', print: 'طباعة / حفظ PDF', back: 'رجوع للطلب', pdfHint: 'لحفظها PDF: اضغط «طباعة» ثم اختر «حفظ كـ PDF».',
      paid: 'مدفوعة', cancelled: 'ملغاة', unpaid: 'لم تُدفع بعد', billedTo: 'إلى', payment: 'طريقة الدفع', deliveredOn: 'سُلّمت في {d}',
      item: 'البيان', qty: 'الكمية', amount: 'المبلغ', itemAfter: 'ثمن السلعة بعد الخصم: {amount}', footer: 'فاتورة صادرة عبر {site}', open: 'الفاتورة',
    },
  },
  errors: {
    out_of_stock: 'نفدت الكمية المتوفرة من هذا المنتج.', coupon_invalid: 'رمز الخصم غير صحيح.', coupon_expired: 'انتهت صلاحية رمز الخصم.',
    coupon_used_up: 'استُعمل رمز الخصم بالكامل.', coupon_min_total: 'هذا الكوبون يتطلب سلعة بثمن {min} على الأقل.', coupon_exists: 'لديك كوبون بهذا الرمز.',
    too_many_coupons: 'لديك 30 كوبوناً مفعّلاً، أوقف بعضها أولاً.', coupon_not_found: 'الكوبون غير موجود.', seller_only: 'هذه الأداة للبائعين.', store_not_found: 'المتجر غير موجود.',
  },
  fields: { max_90: 'النسبة القصوى 90٪', invalid: 'قيمة غير صحيحة' },
  notifications: { types: { stock_low: '📦 باقي {n} فقط من «{title}». حدّث المخزون' } },
});
deepMerge(fr, {
  pro: {
    nav: 'Souk Pro', title: 'Souk Pro : outils vendeur', subtitle: 'Stock, codes promo, rapports de ventes et vitrine de votre boutique. Tout est gratuit.',
    tabs: { stock: '📦 Stock', coupons: '🏷️ Codes promo', reports: '📊 Rapports', look: '🎨 Vitrine' },
    stock: {
      intro: 'Indiquez le nombre d’unités de chaque annonce. Il baisse à chaque livraison ; à la dernière unité l’annonce passe « vendue ». Laissez vide pour un article unique non suivi.',
      lowWarning: '{n} annonce(s) bientôt en rupture.', none: 'Aucune annonce.', reserved: '{n} réservée(s)', sold: '{n} vendue(s) en livraison', units: 'Unités',
      formLabel: 'Quantité disponible', formHint: 'Facultatif. Pour les vendeurs ayant plusieurs unités du même article.', onlyLeft: 'Plus que {n} !', inStock: 'En stock',
    },
    coupon: {
      intro: 'Créez un code que l’acheteur saisit lors de la commande avec livraison. La remise s’applique au prix de l’article et réduit ce qui vous revient.',
      code: 'Code', kind: 'Type', percent: 'Pourcentage', amount: 'Montant fixe', valuePct: 'Pourcentage (%)', valueMru: 'Montant (MRU)',
      minTotal: 'Prix minimum de l’article', maxUses: 'Nombre d’utilisations', expires: 'Expire le', public: 'Afficher sur ma boutique', create: 'Créer le code',
      used: 'Utilisé {n}', from: 'dès {amount}', until: 'jusqu’au {d}', active: 'Actif', onStore: 'Sur la boutique', deleteConfirm: 'Supprimer le code {code} ?', none: 'Aucun code.',
      discount: 'Remise {code}', have: 'Un code promo ?', apply: 'Appliquer', copied: 'Code copié : saisissez-le à la commande.', onDelivery: 'à la commande avec livraison',
    },
    report: {
      days: '{n} derniers jours', revenue: 'Ventes', orders: 'Commandes livrées', average: 'Panier moyen', buyers: 'Acheteurs', discounts: 'Remises',
      cancelRate: 'Taux d’annulation', open: 'En cours', manual: 'Ventes saisies à la main', empty: 'Aucune commande livrée sur la période.',
      top: 'Meilleures ventes', coupons: 'Codes utilisés', manualHint: 'Vous avez aussi marqué {n} annonce(s) « vendue(s) » vous-même ({amount}) sans commande.',
    },
    look: {
      noStore: 'Créez d’abord votre boutique.', banner: 'Image de couverture', tagline: 'Slogan', hours: 'Horaires', hoursPh: 'ex. tous les jours 9h–22h',
      color: 'Couleur', defaultColor: 'Couleur par défaut', pinned: 'Annonces épinglées', pinnedHint: 'Jusqu’à 4 annonces affichées en premier.',
      view: 'Voir la boutique', pinnedTitle: 'Sélection de la boutique',
    },
    invoice: {
      title: 'Facture', print: 'Imprimer / PDF', back: 'Retour à la commande', pdfHint: 'Pour un PDF : « Imprimer » puis « Enregistrer en PDF ».',
      paid: 'Payée', cancelled: 'Annulée', unpaid: 'Non payée', billedTo: 'Facturé à', payment: 'Paiement', deliveredOn: 'Livrée le {d}',
      item: 'Désignation', qty: 'Qté', amount: 'Montant', itemAfter: 'Prix de l’article après remise : {amount}', footer: 'Facture émise via {site}', open: 'Facture',
    },
  },
  errors: {
    out_of_stock: 'Plus de stock pour ce produit.', coupon_invalid: 'Code promo invalide.', coupon_expired: 'Code promo expiré.',
    coupon_used_up: 'Code promo épuisé.', coupon_min_total: 'Ce code demande un article d’au moins {min}.', coupon_exists: 'Vous avez déjà ce code.',
    too_many_coupons: 'Vous avez déjà 30 codes actifs.', coupon_not_found: 'Code introuvable.', seller_only: 'Outil réservé aux vendeurs.', store_not_found: 'Boutique introuvable.',
  },
  fields: { max_90: '90 % maximum', invalid: 'Valeur invalide' },
  notifications: { types: { stock_low: '📦 Plus que {n} « {title} » en stock. Mettez à jour' } },
});
deepMerge(en, {
  pro: {
    nav: 'Souk Pro', title: 'Souk Pro: seller tools', subtitle: 'Stock, discount codes, sales reports and your store page. All free.',
    tabs: { stock: '📦 Stock', coupons: '🏷️ Coupons', reports: '📊 Reports', look: '🎨 Store page' },
    stock: {
      intro: 'Set how many units of each listing you have. It goes down with every delivered order; the last unit marks the listing sold. Leave empty for a single, untracked item.',
      lowWarning: '{n} listing(s) about to run out.', none: 'No listings yet.', reserved: '{n} reserved by open orders', sold: '{n} sold by delivery', units: 'Units',
      formLabel: 'Quantity in stock', formHint: 'Optional. For sellers with several units of the same item.', onlyLeft: 'Only {n} left!', inStock: 'In stock',
    },
    coupon: {
      intro: 'Create a code buyers type when ordering with delivery. The discount comes off the item price and from what you receive.',
      code: 'Code', kind: 'Type', percent: 'Percentage', amount: 'Fixed amount', valuePct: 'Percentage (%)', valueMru: 'Amount (MRU)',
      minTotal: 'Minimum item price', maxUses: 'Number of uses', expires: 'Expires on', public: 'Show on my store page', create: 'Create coupon',
      used: 'Used {n}', from: 'from {amount}', until: 'until {d}', active: 'Active', onStore: 'On store page', deleteConfirm: 'Delete coupon {code}?', none: 'No coupons yet.',
      discount: 'Coupon {code}', have: 'Have a coupon code?', apply: 'Apply', copied: 'Code copied: type it when ordering.', onDelivery: 'on delivery orders',
    },
    report: {
      days: 'Last {n} days', revenue: 'Sales', orders: 'Delivered orders', average: 'Average order', buyers: 'Buyers', discounts: 'Coupon discounts',
      cancelRate: 'Cancellation rate', open: 'Open orders', manual: 'Sales recorded by hand', empty: 'No delivered orders in this period.',
      top: 'Best sellers', coupons: 'Coupons used', manualHint: 'You also marked {n} listing(s) sold yourself ({amount}) without a delivery order.',
    },
    look: {
      noStore: 'Create your store first.', banner: 'Cover image', tagline: 'Tagline', hours: 'Opening hours', hoursPh: 'e.g. every day 9am–10pm',
      color: 'Store colour', defaultColor: 'Default colour', pinned: 'Pinned listings', pinnedHint: 'Up to 4 listings shown first on your store page.',
      view: 'View store page', pinnedTitle: 'Store picks',
    },
    invoice: {
      title: 'Invoice', print: 'Print / Save PDF', back: 'Back to order', pdfHint: 'For a PDF: tap “Print” and choose “Save as PDF”.',
      paid: 'Paid', cancelled: 'Cancelled', unpaid: 'Not paid yet', billedTo: 'Billed to', payment: 'Payment', deliveredOn: 'Delivered on {d}',
      item: 'Item', qty: 'Qty', amount: 'Amount', itemAfter: 'Item price after discount: {amount}', footer: 'Invoice issued through {site}', open: 'Invoice',
    },
  },
  errors: {
    out_of_stock: 'This product is out of stock.', coupon_invalid: 'Invalid coupon code.', coupon_expired: 'This coupon has expired.',
    coupon_used_up: 'This coupon has been used up.', coupon_min_total: 'This coupon needs an item of at least {min}.', coupon_exists: 'You already have this code.',
    too_many_coupons: 'You already have 30 active coupons.', coupon_not_found: 'Coupon not found.', seller_only: 'This tool is for sellers.', store_not_found: 'Store not found.',
  },
  fields: { max_90: '90% at most', invalid: 'Invalid value' },
  notifications: { types: { stock_low: '📦 Only {n} “{title}” left. Update your stock' } },
});

// v47: Hassaniya (الحسانية) – Arabic with the most visible phrases in the Mauritanian dialect.
// Everything not listed here stays in standard Arabic; the admin can refine any text (Admin → Texts).
const hs = deepMerge(structuredClone(ar), {
  brand: { tagline: 'سوقك الموريتاني، كل شي فبلاصة وحدة' },
  nav: {
    post: 'حطّ إعلانك', messages: 'الرسايل', login: 'ادخل', loginShort: 'ادخل', register: 'افتح حساب', myAccount: 'حسابي',
    allProducts: 'كاع الإعلانات',
  },
  common: { viewAll: 'شوف كاع', search: 'دوّر', searchPlaceholder: 'شنهو اللي تدور؟', sold: 'اتباع' },
  search: { headerPlaceholder: 'شنهو اللي تدور؟' },
  home: {
    latest: 'إعلانات جداد', browseCategories: 'شوف الأصناف', allCategories: 'كاع الأصناف', featured: 'إعلانات مميّزة', promoCta: 'حطّ إعلانك',
    noListingsYet: 'مازال ماه ثمّ إعلانات. كون انت لوّل ينشر على {site}!',
  },
  product: {
    contactSeller: 'كلّم البايع', loginToContact: 'ادخل حسابك باش تكلّم البايع', messagePlaceholder: 'اكتب للبايع…', share: 'شارك', showPhone: 'ورّيني النمرة',
  },
  form: { newTitle: 'إعلان جديد', publish: 'انشر إعلانك', descriptionPh: 'قول حالتها ومواصفاتها وكل شي يهم الشاري…' },
  ai: { assistantHello: 'مرحبا 👋 شنهو اللي تدور اليوم؟' },
  eid: { daysLeft: 'العيد بعد {n} يوم' },
  pay: { nav: 'محفظتي', received: 'آه، وصلني', notReceived: 'ما وصلني' },
  auction: { bid: 'زايد', leading: 'انت اللي فوق الحين.', youWon: 'مبروك! ربحت المزاد بـ {amount}. كلّم البايع باش تتفاهمو على التسليم.', chatSeller: 'كلّم البايع' },
});

export const messages = { ar, fr, en, hs };
export const LANGS = [
  { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar-MR' },
  { code: 'hs', label: 'الحسانية', dir: 'rtl', locale: 'ar-MR', base: 'ar' },
  { code: 'fr', label: 'Français', dir: 'ltr', locale: 'fr-FR' },
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
];
