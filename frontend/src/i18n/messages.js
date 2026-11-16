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
    howTitle: 'كيف يعمل MauriMarket؟', how1: 'انشر إعلانك', how1Text: 'أضف الصور والسعر بالأوقية والمدينة.',
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
    registerSubtitle: 'انضم إلى MauriMarket وابدأ البيع والشراء', name: 'الاسم الكامل', email: 'البريد الإلكتروني',
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
    title: 'المتاجر', subtitle: 'متاجر التجار الموثوقين على MauriMarket', empty: 'لا توجد متاجر بعد.', products: '{n} منتج',
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
    about: 'منصة موريتانية للبيع والشراء عبر الإنترنت تجمع الأفراد والتجار في مكان واحد.', links: 'روابط', help: 'المساعدة',
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
    statsProducts: 'annonces actives', statsUsers: 'utilisateurs', statsStores: 'boutiques', howTitle: 'Comment fonctionne MauriMarket ?',
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
    registerSubtitle: 'Rejoignez MauriMarket pour acheter et vendre', name: 'Nom complet', email: 'E-mail', phone: 'Téléphone', password: 'Mot de passe',
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
    title: 'Boutiques', subtitle: 'Les boutiques des commerçants sur MauriMarket', empty: 'Aucune boutique.', products: '{n} produits', settings: 'Paramètres de la boutique',
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
  footer: { about: 'Plateforme mauritanienne d’achat et de vente en ligne réunissant particuliers et commerçants.', links: 'Liens', help: 'Aide', safety: 'Conseils de sécurité', guide: 'Guide d’utilisation', rights: 'Tous droits réservés.' },
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
    statsStores: 'stores', howTitle: 'How MauriMarket works', how1: 'Post your ad', how1Text: 'Add photos, a price in MRU and your city.',
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
    loginTitle: 'Welcome back', loginSubtitle: 'Log in to manage your listings and messages', registerTitle: 'Create your account', registerSubtitle: 'Join MauriMarket to buy and sell',
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
    title: 'Stores', subtitle: 'Merchant stores on MauriMarket', empty: 'No stores yet.', products: '{n} products', settings: 'Store settings', name: 'Store name',
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
  footer: { about: 'A Mauritanian online marketplace bringing individuals and merchants together in one place.', links: 'Links', help: 'Help', safety: 'Safety tips', guide: 'User guide', rights: 'All rights reserved.' },
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
      share: 'مشاركة', copyLink: 'نسخ الرابط', linkCopied: 'تم نسخ الرابط', shareText: '{title} — {price} على MauriMarket',
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
      install: 'ثبّت التطبيق', installText: 'أضف MauriMarket إلى شاشتك الرئيسية وافتحه بلمسة واحدة كتطبيق.',
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
      share: 'Partager', copyLink: 'Copier le lien', linkCopied: 'Lien copié', shareText: '{title} — {price} sur MauriMarket',
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
      install: 'Installer l’app', installText: 'Ajoutez MauriMarket à votre écran d’accueil et ouvrez-le comme une application.',
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
      share: 'Share', copyLink: 'Copy link', linkCopied: 'Link copied', shareText: '{title} — {price} on MauriMarket',
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
      install: 'Install the app', installText: 'Add MauriMarket to your home screen and open it like an app.',
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
deepMerge(ar, v11.ar);
deepMerge(fr, v11.fr);
deepMerge(en, v11.en);

export const messages = { ar, fr, en };
export const LANGS = [
  { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar-MR' },
  { code: 'fr', label: 'Français', dir: 'ltr', locale: 'fr-FR' },
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
];
