import { createContext, useContext, useEffect, useState } from 'react'

// Add a new language: copy the `en` block, translate values, add to LANGS.
const STRINGS = {
  en: {
    app_subtitle: 'Tree Plantation Tracker',
    nav_home: 'Home', nav_sites: 'Sites', nav_near: 'Near Me', nav_trees: 'Trees', nav_map: 'Map',
    loading: 'Loading…',
    status_healthy: 'Healthy', status_needs_attention: 'Needs Care', status_sick: 'Sick', status_dead: 'Dead',

    trees_planted: 'Trees planted', survival_rate: 'Survival rate',
    add_new_tree: 'Add New Tree', view_map: 'View Map', recent_activity: 'Recent activity',
    no_updates_yet: 'No updates yet. Visit a tree and add its first progress update.',

    all_trees: 'All Trees', search_placeholder: 'Search by ID, species, planter…', all: 'All',
    no_trees_found: 'No trees found. Tap + to add your first tree.',
    site_filter: 'Site filter', clear: 'Clear', planted: 'Planted',

    add_progress_update: 'Add Progress Update',
    status: 'Status', height: 'Height', planted_on: 'Planted on', planted_by: 'Planted by',
    site: 'Site', position: 'Position', latitude: 'Latitude', longitude: 'Longitude', notes: 'Notes',
    navigate_gmaps: 'Navigate with Google Maps',
    tree_qr: 'Tree QR Code',
    qr_hint: 'Print & tie this tag to the tree. Scanning opens this page instantly.',
    download_qr: 'Download QR', growth_timeline: 'Growth timeline',
    no_tree_updates: 'No updates yet — add the first one.',
    delete_tree: 'Delete tree', delete_confirm: 'Delete this tree? This cannot be undone.',

    species: 'Species', local_name: 'Local name', no_site: '— Independent tree (no site) —',
    planted_date: 'Planted date', height_cm: 'Height (cm)', location: 'Location',
    save_tree: 'Save Tree', saving: 'Saving…',
    tree_condition: 'Tree condition', your_name: 'Your name',
    location_verify: 'Location (verifies the visit)',
    block_row_pos: 'Block / Row / Position (optional — set once)',
    note: 'Note', save_update: 'Save Update', cancel: 'Cancel',
    field_worker_name: 'Field worker name',

    plantation_map: 'Plantation Map', trees_located: 'trees located',

    near_hint: 'Stand near a tree and tap the button — nearby registered trees appear sorted by distance.',
    find_near: 'Find trees near me', locating: 'Locating…', refresh_location: 'Refresh location',
    gps_accuracy: 'GPS accuracy',
    near_empty: 'No registered trees found in this radius. Increase the radius, or register/GPS-update this tree first.',
    away: 'away',

    sites_title: 'Plantation Sites', new_site: 'New Site',
    site_name: 'Site name', site_location: 'Location / address', target_trees: 'Trees planted (target)',
    plantation_date: 'Plantation date', site_gps: 'Site location (GPS)', create_site: 'Create Site',
    no_sites: 'No sites yet. Tap "New Site" to add your first plantation land.',
    registered: 'registered',

    bulk_register: 'Bulk Register Trees', print_qr_tags: 'Print QR Tags', view_all_trees: 'View All Trees',
    bulk_hint: 'Register all trees at once — IDs are auto-generated. Photo/GPS get added per tree in the field later.',
    count_label: 'How many trees?', block_name: 'Block name (optional)', per_row: 'Trees per row (optional)',
    block_hint: 'With block + per-row, every tree automatically gets a Row/Position (like Block A · Row 3 · #12) — easy to find even without GPS. Run one batch per block.',
    register_all: 'Register All Trees', registering: 'Registering…', trees_word: 'trees',
    have_gps: 'trees have GPS locations (field workers add them via progress updates)',

    qr_tags: 'QR Tags',
    tag_print_hint: 'Print on A4, laminate or flex-print, then tie loosely to the tree with a zip-tie. Even if the QR fades, the printed ID can still be searched in the app.',
    print: 'Print', preparing: 'preparing…', prev: 'Prev', next: 'Next', back: 'Back',
    batch: 'Batch', print_each_batch: 'Print each batch separately.',

    photo_tap: 'Tap to take photo',
    use_my_location: 'Use my current location',
    gps_not_supported: 'GPS not supported on this device'
  },

  hi: {
    app_subtitle: 'पेड़ प्लांटेशन ट्रैकर',
    nav_home: 'होम', nav_sites: 'साइट्स', nav_near: 'पास के पेड़', nav_trees: 'पेड़', nav_map: 'नक्शा',
    loading: 'लोड हो रहा है…',
    status_healthy: 'स्वस्थ', status_needs_attention: 'देखभाल चाहिए', status_sick: 'बीमार', status_dead: 'सूख गया',

    trees_planted: 'पेड़ लगाए गए', survival_rate: 'जीवित दर',
    add_new_tree: 'नया पेड़ जोड़ें', view_map: 'नक्शा देखें', recent_activity: 'हाल की गतिविधि',
    no_updates_yet: 'अभी कोई अपडेट नहीं। किसी पेड़ पर जाकर पहला अपडेट डालें।',

    all_trees: 'सभी पेड़', search_placeholder: 'ID, प्रजाति या नाम से खोजें…', all: 'सभी',
    no_trees_found: 'कोई पेड़ नहीं मिला। + दबाकर पहला पेड़ जोड़ें।',
    site_filter: 'साइट फ़िल्टर', clear: 'हटाएं', planted: 'लगाया',

    add_progress_update: 'प्रगति अपडेट डालें',
    status: 'स्थिति', height: 'ऊँचाई', planted_on: 'कब लगाया', planted_by: 'किसने लगाया',
    site: 'साइट', position: 'स्थान', latitude: 'अक्षांश (Lat)', longitude: 'देशांतर (Lng)', notes: 'टिप्पणी',
    navigate_gmaps: 'Google Maps से रास्ता देखें',
    tree_qr: 'पेड़ का QR कोड',
    qr_hint: 'इसे प्रिंट करके पेड़ पर बांधें — स्कैन करते ही पेड़ की पूरी जानकारी खुलेगी।',
    download_qr: 'QR डाउनलोड करें', growth_timeline: 'विकास यात्रा',
    no_tree_updates: 'अभी कोई अपडेट नहीं — पहला डालें।',
    delete_tree: 'पेड़ हटाएं', delete_confirm: 'क्या यह पेड़ हटाना है? यह वापस नहीं होगा।',

    species: 'प्रजाति', local_name: 'स्थानीय नाम', no_site: '— अलग पेड़ (कोई साइट नहीं) —',
    planted_date: 'लगाने की तारीख', height_cm: 'ऊँचाई (cm)', location: 'लोकेशन',
    save_tree: 'पेड़ सेव करें', saving: 'सेव हो रहा है…',
    tree_condition: 'पेड़ की हालत', your_name: 'आपका नाम',
    location_verify: 'लोकेशन (विज़िट की पुष्टि)',
    block_row_pos: 'ब्लॉक / पंक्ति / स्थान (optional — एक बार सेट करें)',
    note: 'टिप्पणी', save_update: 'अपडेट सेव करें', cancel: 'रद्द करें',
    field_worker_name: 'फील्ड वर्कर का नाम',

    plantation_map: 'प्लांटेशन नक्शा', trees_located: 'पेड़ नक्शे पर',

    near_hint: 'पेड़ के पास खड़े होकर बटन दबाएं — आस-पास के पेड़ दूरी के हिसाब से दिखेंगे।',
    find_near: 'मेरे पास के पेड़ ढूंढें', locating: 'लोकेशन ली जा रही है…', refresh_location: 'फिर से देखें',
    gps_accuracy: 'GPS सटीकता',
    near_empty: 'इस दायरे में कोई पेड़ नहीं मिला। दायरा बढ़ाएं, या पहले इस पेड़ को रजिस्टर/GPS-अपडेट करें।',
    away: 'दूर',

    sites_title: 'प्लांटेशन साइट्स', new_site: 'नई साइट',
    site_name: 'साइट का नाम', site_location: 'पता', target_trees: 'कितने पेड़ (लक्ष्य)',
    plantation_date: 'तारीख', site_gps: 'साइट की लोकेशन (GPS)', create_site: 'साइट बनाएं',
    no_sites: 'अभी कोई साइट नहीं। "नई साइट" दबाकर अपनी पहली ज़मीन जोड़ें।',
    registered: 'रजिस्टर्ड',

    bulk_register: 'सारे पेड़ एक साथ रजिस्टर करें', print_qr_tags: 'QR टैग प्रिंट करें', view_all_trees: 'सभी पेड़ देखें',
    bulk_hint: 'सारे पेड़ एक क्लिक में रजिस्टर करें — ID अपने आप बनेंगे। फोटो/GPS बाद में फील्ड में हर पेड़ पर जुड़ेगी।',
    count_label: 'कितने पेड़?', block_name: 'ब्लॉक का नाम (optional)', per_row: 'एक पंक्ति में कितने पेड़? (optional)',
    block_hint: 'ब्लॉक + पंक्ति देने पर हर पेड़ को अपने आप Row/Position मिलेगी (जैसे Block A · Row 3 · #12) — बिना GPS के भी पेड़ ढूंढना आसान। हर ब्लॉक के लिए अलग बैच चलाएं।',
    register_all: 'सभी पेड़ रजिस्टर करें', registering: 'रजिस्टर हो रहे हैं…', trees_word: 'पेड़',
    have_gps: 'पेड़ों की GPS लोकेशन आ चुकी है (वर्कर अपडेट डालते समय GPS देते हैं)',

    qr_tags: 'QR टैग',
    tag_print_hint: 'A4 पर प्रिंट करें, लैमिनेट या फ्लेक्स-प्रिंट करवाएं, फिर ढीले ज़िप-टाई से पेड़ पर बांधें। QR खराब भी हो जाए तो टैग पर लिखा ID ऐप में खोजा जा सकता है।',
    print: 'प्रिंट करें', preparing: 'तैयार हो रहा है…', prev: 'पिछला', next: 'अगला', back: 'वापस',
    batch: 'बैच', print_each_batch: 'हर बैच अलग से प्रिंट करें।',

    photo_tap: 'फोटो लेने के लिए टैप करें',
    use_my_location: 'मेरी लोकेशन लें',
    gps_not_supported: 'इस डिवाइस में GPS नहीं है'
  }
}

export const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' }
]

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang')
    return STRINGS[saved] ? saved : 'en'
  })
  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])
  const t = (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
