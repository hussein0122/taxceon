/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark, RoadSegment } from '../types/game';

// Geographic coordinates scaled to game world units (meters)
// X-axis: West to East (Qaitbay -> Raml -> Bibliotheca -> Stanley -> Montaza)
// Z-axis: North (Mediterranean Sea) to South (Inland City)
// Y-axis: Elevation (0 is sea level, Stanley bridge rises over bay)

export const ALEXANDRIA_LANDMARKS: Landmark[] = [
  {
    id: 'qaitbay',
    nameAr: 'قلعة قايتباي',
    nameEn: 'Citadel of Qaitbay',
    descriptionAr: 'حصن دفاعي تاريخي شيّده السلطان قايتباي عام 1477م على شبه جزيرة رأس التين.',
    position: { x: -380, y: 0, z: -160 },
    radius: 35,
    type: 'fort'
  },
  {
    id: 'anfoushi',
    nameAr: 'الأنفوشي ومسجد أبو العباس',
    nameEn: 'Anfoushi & Abu El Abbas Mosque',
    descriptionAr: 'منطقة الصيادين العريقة وأشهر مساجد الإسكندرية بمآذنه الأندلسية الشامخة.',
    position: { x: -280, y: 0, z: -80 },
    radius: 30,
    type: 'mosque'
  },
  {
    id: 'mansheya',
    nameAr: 'ميدان المنشية وسعد زغلول',
    nameEn: 'El Mansheya & Saad Zaghloul',
    descriptionAr: 'قلب الإسكندرية التجاري والتاريخي، بنوك ومقاهٍ عريقة وتمثال سعد زغلول المطل على البحر.',
    position: { x: -160, y: 0, z: -30 },
    radius: 32,
    type: 'plaza'
  },
  {
    id: 'raml',
    nameAr: 'محطة الرمل وترام الإسكندرية',
    nameEn: 'Raml Station & Blue Tram',
    descriptionAr: 'المحطة المركزية لترام الإسكندرية الأزرق الشهير، وميدان المحطة الصاخب بالمطاعم والسينمات.',
    position: { x: -50, y: 0, z: 10 },
    radius: 30,
    type: 'station'
  },
  {
    id: 'library',
    nameAr: 'مكتبة الإسكندرية',
    nameEn: 'Bibliotheca Alexandrina',
    descriptionAr: 'صرح ثقافي عالمي بهيكله الدائري المائل وحوائطه الجرانيتية المنقوشة بحروف العالم.',
    position: { x: 70, y: 0, z: -35 },
    radius: 36,
    type: 'library'
  },
  {
    id: 'shatby',
    nameAr: 'شاطئ الشاطبي وكامب شيزار',
    nameEn: 'Shatby & Camp Cesar Beaches',
    descriptionAr: 'كازينو الشاطبي وكورنيش كامب شيزار الرملي حيث يتجمع محبو البحر.',
    position: { x: 190, y: 0, z: -55 },
    radius: 28,
    type: 'beach'
  },
  {
    id: 'sidi_gaber',
    nameAr: 'محطة قطار سيدي جابر',
    nameEn: 'Sidi Gaber Station Hub',
    descriptionAr: 'ثاني أهم محطات قطارات الإسكندرية، شريان السفر وشارع المشير وسبورتنج.',
    position: { x: 260, y: 0, z: 90 },
    radius: 34,
    type: 'station'
  },
  {
    id: 'stanley',
    nameAr: 'كوبري ستانلي الشهير',
    nameEn: 'Stanley Bridge',
    descriptionAr: 'تحفة معمارية ممتدة فوق خليج ستانلي بأبراجه الأربعة المستوحاة من الطراز الفلورنسي.',
    position: { x: 370, y: 3.5, z: -85 },
    radius: 38,
    type: 'bridge'
  },
  {
    id: 'gleem_montaza',
    nameAr: 'خليج جليم',
    nameEn: 'Gleem Bay',
    descriptionAr: 'خليج جليم وشاطئه الصغير والمباني السكنية المطلة على البحر.',
    position: { x: 490, y: 0, z: -60 },
    radius: 30,
    type: 'beach'
  },
  {
    id: 'san_stefano',
    nameAr: 'سان ستيفانو',
    nameEn: 'San Stefano',
    descriptionAr: 'منطقة ساحلية تضم مباني سكنية وفنادق ومركز سان ستيفانو.',
    position: { x: 555, y: 0, z: -54 },
    radius: 28,
    type: 'beach'
  },
  {
    id: 'miami',
    nameAr: 'ميامي',
    nameEn: 'Miami',
    descriptionAr: 'منطقة شاطئية سكنية شرق الإسكندرية على امتداد الكورنيش.',
    position: { x: 620, y: 0, z: -49 },
    radius: 28,
    type: 'beach'
  },
  {
    id: 'sidi_bishr',
    nameAr: 'سيدي بشر',
    nameEn: 'Sidi Bishr',
    descriptionAr: 'منطقة سكنية ساحلية ذات شوارع جانبية ومحلات محلية.',
    position: { x: 670, y: 0, z: -50 },
    radius: 28,
    type: 'beach'
  },
  {
    id: 'asafra',
    nameAr: 'العصافرة',
    nameEn: 'Asafra',
    descriptionAr: 'منطقة العصافرة على الطريق الساحلي شرق الإسكندرية.',
    position: { x: 710, y: 0, z: -53 },
    radius: 27,
    type: 'beach'
  },
  {
    id: 'montaza',
    nameAr: 'حدائق المنتزه',
    nameEn: 'Montaza Gardens',
    descriptionAr: 'المنتزه وحدائقه الساحلية في الطرف الشرقي من مسار اللعب.',
    position: { x: 745, y: 0, z: -70 },
    radius: 38,
    type: 'beach'
  },
  {
    id: 'gas_corniche',
    nameAr: 'محطة بنزين مصر للبترول — الكورنيش',
    nameEn: 'Misr Petroleum Gas Station',
    descriptionAr: 'محطة تموين وقود متكاملة على الكورنيش لخدمة سيارات الأجرة.',
    position: { x: 130, y: 0, z: -10 },
    radius: 18,
    type: 'gas'
  },
  {
    id: 'gas_inland',
    nameAr: 'محطة بنزين موبيل — طريق الحرية',
    nameEn: 'Mobil Gas Station Inland',
    descriptionAr: 'محطة وقود وخدمات سريعة بالقرب من سيدي جابر ومحطة الرمل.',
    position: { x: 15, y: 0, z: 75 },
    radius: 18,
    type: 'gas'
  }
];

// Connected multi-lane drivable road network
export const ALEXANDRIA_ROADS: RoadSegment[] = [
  // 1. Primary Coastal Corniche Boulevard (El Geish Road)
  {
    id: 'corniche_main',
    nameAr: 'طريق الجيش — كورنيش الإسكندرية',
    speedLimit: 60,
    points: [
      { x: -420, z: -180, width: 24, lanes: 4, isCorniche: true }, // Ras El Tin Tip
      { x: -360, z: -150, width: 24, lanes: 4, isCorniche: true }, // Qaitbay bay
      { x: -280, z: -105, width: 24, lanes: 4, isCorniche: true }, // Anfoushi
      { x: -200, z: -70, width: 24, lanes: 4, isCorniche: true },  // Eastern Harbor curve
      { x: -140, z: -55, width: 24, lanes: 4, isCorniche: true },  // Mansheya
      { x: -50, z: -45, width: 24, lanes: 4, isCorniche: true },   // Raml Station seaside
      { x: 30, z: -50, width: 24, lanes: 4, isCorniche: true },    // Azarita
      { x: 80, z: -60, width: 24, lanes: 4, isCorniche: true },    // Bibliotheca Alexandrina
      { x: 170, z: -75, width: 24, lanes: 4, isCorniche: true },   // Shatby
      { x: 260, z: -90, width: 24, lanes: 4, isCorniche: true },   // Camp Cesar / Ibrahimiya
      { x: 340, z: -100, width: 22, lanes: 4, isCorniche: true },  // Stanley Bridge Approach
      { x: 375, z: -105, width: 20, lanes: 4, isCorniche: true },  // Stanley Bridge Span
      { x: 420, z: -95, width: 22, lanes: 4, isCorniche: true },   // Stanley Exit
      { x: 480, z: -75, width: 24, lanes: 4, isCorniche: true },   // Gleem
      { x: 540, z: -65, width: 24, lanes: 4, isCorniche: true },   // San Stefano approach
      { x: 590, z: -58, width: 24, lanes: 4, isCorniche: true },   // San Stefano / Miami
      { x: 630, z: -52, width: 24, lanes: 4, isCorniche: true },   // Miami
      { x: 675, z: -50, width: 22, lanes: 4, isCorniche: true },   // Sidi Bishr
      { x: 715, z: -56, width: 22, lanes: 4, isCorniche: true },   // Asafra
      { x: 750, z: -64, width: 22, lanes: 4, isCorniche: true }    // Montaza entrance
    ]
  },
  // 2. Inland Avenue: Tareeq El Horreya / Fouad Street (Avenue of Freedom)
  {
    id: 'horreya_avenue',
    nameAr: 'شارع طريق الحرية وفؤاد',
    speedLimit: 50,
    points: [
      { x: -150, z: -10, width: 18, lanes: 2 },
      { x: -50, z: 25, width: 20, lanes: 2 }, // Raml inland
      { x: 60, z: 45, width: 20, lanes: 2 },  // Shallalat gardens
      { x: 160, z: 65, width: 20, lanes: 2 }, // Sporting
      { x: 260, z: 85, width: 22, lanes: 4 }, // Sidi Gaber Station
      { x: 360, z: 50, width: 20, lanes: 2 }, // Cleo / Roushdy inland
      { x: 460, z: 15, width: 18, lanes: 2 }, // San Stefano connection
      { x: 530, z: 18, width: 18, lanes: 2 },
      { x: 600, z: 12, width: 18, lanes: 2 }, // Miami inland streets
      { x: 665, z: 5, width: 18, lanes: 2 },  // Sidi Bishr
      { x: 720, z: 12, width: 18, lanes: 2 }  // Montaza access
    ]
  },
  // 3. Mansheya to Port connector
  {
    id: 'mansheya_connector',
    nameAr: 'محور المنشية ومحطة مصر',
    speedLimit: 40,
    points: [
      { x: -140, z: -55, width: 16, lanes: 2 },
      { x: -150, z: -10, width: 16, lanes: 2 },
      { x: -155, z: 40, width: 16, lanes: 2 }
    ]
  },
  // 4. Raml Station seaside-to-inland boulevard (Saad Zaghloul connector)
  {
    id: 'raml_connector',
    nameAr: 'شارع سعد زغلول ومحطة الرمل',
    speedLimit: 40,
    points: [
      { x: -50, z: -45, width: 16, lanes: 2 },
      { x: -50, z: -10, width: 16, lanes: 2 },
      { x: -50, z: 25, width: 16, lanes: 2 }
    ]
  },
  // 5. Bibliotheca / Azarita connector
  {
    id: 'azarita_connector',
    nameAr: 'شارع سوتر والأزاريطة',
    speedLimit: 40,
    points: [
      { x: 80, z: -60, width: 16, lanes: 2 },
      { x: 75, z: -10, width: 16, lanes: 2 },
      { x: 60, z: 45, width: 16, lanes: 2 }
    ]
  },
  // 6. Sidi Gaber to Corniche connector (Mostafa Kamel avenue)
  {
    id: 'sidi_gaber_connector',
    nameAr: 'شارع المشير أحمد إسماعيل وسيدي جابر',
    speedLimit: 50,
    points: [
      { x: 260, z: -90, width: 18, lanes: 2 },
      { x: 260, z: -5, width: 18, lanes: 2 },
      { x: 260, z: 85, width: 20, lanes: 2 }
    ]
  },
  // 7. Stanley to Roushdy cross-street
  {
    id: 'stanley_connector',
    nameAr: 'محور ستانلي ورشدي',
    speedLimit: 45,
    points: [
      { x: 420, z: -95, width: 16, lanes: 2 },
      { x: 395, z: -30, width: 16, lanes: 2 },
      { x: 360, z: 50, width: 16, lanes: 2 }
    ]
  }
  // 8. East Corniche links into the inland neighborhood grid.
  {
    id: 'miami_connector',
    nameAr: 'شارع ميامي الداخلي',
    speedLimit: 40,
    points: [
      { x: 620, z: -49, width: 16, lanes: 2 },
      { x: 615, z: -15, width: 16, lanes: 2 },
      { x: 600, z: 12, width: 16, lanes: 2 }
    ]
  },
  {
    id: 'sidi_bishr_connector',
    nameAr: 'محور سيدي بشر',
    speedLimit: 40,
    points: [
      { x: 670, z: -50, width: 16, lanes: 2 },
      { x: 672, z: -18, width: 16, lanes: 2 },
      { x: 665, z: 5, width: 16, lanes: 2 }
    ]
  },
  {
    id: 'montaza_connector',
    nameAr: 'مدخل حدائق المنتزه',
    speedLimit: 35,
    points: [
      { x: 745, z: -72, width: 18, lanes: 2 },
      { x: 742, z: -28, width: 18, lanes: 2 },
      { x: 720, z: 12, width: 18, lanes: 2 }
    ]
  }
];

// Fixed stops for the microbus line, ordered from Montaza toward Bahary / Qaitbay.
export const MICROBUS_ROUTE_STOP_IDS = [
  'montaza',
  'asafra',
  'sidi_bishr',
  'miami',
  'san_stefano',
  'gleem_montaza',
  'stanley',
  'sidi_gaber',
  'shatby',
  'library',
  'raml',
  'mansheya',
  'anfoushi',
  'qaitbay'
] as const;

// Realistic Egyptian passenger archetypes & destination pairings
export const PASSENGER_POOL = [
  {
    nameAr: 'عم صلاح الصياد',
    avatarIcon: '🎣',
    quoteAr: 'على الأنفوشي وحلقة السمك يا أسطى، السمك طازة وراسي!',
    pickupId: 'mansheya',
    dropoffId: 'anfoushi',
    urgency: 'normal' as const,
    personality: 'friendly' as const
  },
  {
    nameAr: 'دكتورة نورهان (باحثة)',
    avatarIcon: '📚',
    quoteAr: 'مكتبة الإسكندرية لو سمحت، عندي مؤتمر علمي بعد نص ساعة.',
    pickupId: 'raml',
    dropoffId: 'library',
    urgency: 'rush' as const,
    personality: 'student' as const
  },
  {
    nameAr: 'كريم وندى (عروسين)',
    avatarIcon: '📸',
    quoteAr: 'كوبري ستانلي بسرعة يا كابتن عايزين نلحق الغروب ونتصور!',
    pickupId: 'shatby',
    dropoffId: 'stanley',
    urgency: 'rush' as const,
    personality: 'tourist' as const
  },
  {
    nameAr: 'الحاج توفيق',
    avatarIcon: '👴',
    quoteAr: 'محطة سيدي جابر يا بني على مهلك، القطر رايح القاهرة كمان ساعة.',
    pickupId: 'library',
    dropoffId: 'sidi_gaber',
    urgency: 'relaxed' as const,
    personality: 'elderly' as const
  },
  {
    nameAr: 'سائح فرنسي (بيير)',
    avatarIcon: '🗺️',
    quoteAr: 'Citadel of Qaitbay please! قلعة قايتباي يا ريس.',
    pickupId: 'stanley',
    dropoffId: 'qaitbay',
    urgency: 'normal' as const,
    personality: 'tourist' as const
  },
  {
    nameAr: 'أستاذ سامي المدرس',
    avatarIcon: '👨‍🏫',
    quoteAr: 'محطة الرمل عشان ألحق الترام رايح أصحح امتحانات.',
    pickupId: 'anfoushi',
    dropoffId: 'raml',
    urgency: 'normal' as const,
    personality: 'friendly' as const
  },
  {
    nameAr: 'المهندس شريف',
    avatarIcon: '💼',
    quoteAr: 'طالع على جليم والمنتزه يا أسطى، خود الكورنيش كله.',
    pickupId: 'mansheya',
    dropoffId: 'gleem_montaza',
    urgency: 'normal' as const,
    personality: 'friendly' as const
  }
];
