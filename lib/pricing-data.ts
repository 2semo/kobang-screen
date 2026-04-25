// 안전방충망 단가표 데이터
// 가격은 가로(mm) x 세로(mm) 기준

export type BrandType = 'goguryeo' | 'js';
export type MeshType = '0.4mm-16mesh' | '0.4mm-20mesh' | '0.6mm' | '0.7mm-14mesh';
export type InstallType = 'lowFloor' | 'highFloor';
export type SpaceType = 'living' | 'room' | 'utility';

export interface BrandInfo {
  id: BrandType;
  name: string;
  nameKo: string;
  description: string;
  features: string[];
  warranty: string;
  highlight: string;
}

export interface MeshInfo {
  id: MeshType;
  name: string;
  thickness: string;
  mesh: string;
  description: string;
  recommended: InstallType;
}

export interface SpaceInfo {
  id: SpaceType;
  name: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const brands: BrandInfo[] = [
  {
    id: 'goguryeo',
    name: '고구려시스템',
    nameKo: '고구려시스템',
    description: '국내 최다 시공 실적으로 검증된 품질',
    features: ['표준형', '검증된 품질', '프리미엄', '안정형', '빠른 결정', '내구성 우수', '3년 A/S'],
    warranty: '3년 A/S',
    highlight: '안전과 내구성을 최우선으로 생각하는 분'
  },
  {
    id: 'js',
    name: 'JS안전방충망',
    nameKo: 'JS안전방충망',
    description: '합리적인 가격으로 실용적인 선택',
    features: ['합리적 가격', '빠른 시공', '다양한 색상', '실용적 선택', '경제적', '2년 A/S'],
    warranty: '2년 A/S',
    highlight: '가성비를 중요시하는 분'
  }
];

export const meshTypes: Record<BrandType, MeshInfo[]> = {
  goguryeo: [
    {
      id: '0.4mm-16mesh',
      name: '0.4mm 안전방충망 (16mesh)',
      thickness: '0.4mm',
      mesh: '16mesh',
      description: '촘촘한 망으로 추락방지에 적합',
      recommended: 'highFloor'
    },
    {
      id: '0.6mm',
      name: '0.6mm 방범방충망',
      thickness: '0.6mm',
      mesh: '16mesh',
      description: '두꺼운 망으로 방범에 적합',
      recommended: 'lowFloor'
    }
  ],
  js: [
    {
      id: '0.4mm-16mesh',
      name: '0.4mm 안전방충망 (16mesh)',
      thickness: '0.4mm',
      mesh: '16mesh',
      description: '촘촘한 망으로 추락방지에 적합',
      recommended: 'highFloor'
    },
    {
      id: '0.4mm-20mesh',
      name: '0.4mm 안전방충망 (20mesh)',
      thickness: '0.4mm',
      mesh: '20mesh',
      description: '더 촘촘한 망으로 미세먼지 차단',
      recommended: 'highFloor'
    },
    {
      id: '0.6mm',
      name: '0.6mm 방범방충망 (16mesh)',
      thickness: '0.6mm',
      mesh: '16mesh',
      description: '두꺼운 망으로 방범에 적합',
      recommended: 'lowFloor'
    },
    {
      id: '0.7mm-14mesh',
      name: '0.7mm 안전방충망 (14mesh)',
      thickness: '0.7mm',
      mesh: '14mesh',
      description: '가장 두꺼운 망으로 최고 내구성',
      recommended: 'lowFloor'
    }
  ]
};

export const installTypes = [
  {
    id: 'lowFloor' as InstallType,
    name: '저층 / 방범 방충',
    subtitle: '방범 우선',
    description: '1~3층, 외부에서 접근 가능한 창문',
    recommendation: '0.6mm 두꺼운 망 추천'
  },
  {
    id: 'highFloor' as InstallType,
    name: '고층 / 추락방지',
    subtitle: '추락방지 우선',
    description: '4층 이상, 추락 위험이 있는 창문',
    recommendation: '0.4mm 촘촘한 망 추천'
  }
];

export const spaces: SpaceInfo[] = [
  { id: 'living', name: '거실', defaultWidth: 1000, defaultHeight: 2100 },
  { id: 'room', name: '방', defaultWidth: 800, defaultHeight: 1200 },
  { id: 'utility', name: '다용도실', defaultWidth: 600, defaultHeight: 1000 }
];

// 번호키 가격
export const NUMBER_KEY_PRICE = 25000;

// 제휴카드 혜택
export const CARD_BENEFITS = {
  firstDiscount: 30000,
  monthlyCashback: 11000,
  installmentMonths: 24
};

// 가격표 데이터 (가로 x 세로 기준, 100mm 단위)
// 행: 세로(height), 열: 가로(width)
// 가로: 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500
// 세로: 300 ~ 2700 (100mm 단위)

const widthKeys = [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];
const heightKeys = [
  300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500,
  1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700
];

// 고구려시스템 0.6mm 방범방충망
const goguryeo_06mm: number[][] = [
  [194000, 197000, 200000, 206000, 255000, 259000, 263000, 271000, 281000, 285000, 295000, 301000, 305000],
  [202000, 207000, 210000, 213000, 267000, 269000, 275000, 282000, 293000, 298000, 310000, 316000, 321000],
  [211000, 215000, 219000, 222000, 276000, 282000, 285000, 294000, 307000, 310000, 325000, 331000, 336000],
  [220000, 223000, 228000, 232000, 286000, 293000, 298000, 307000, 320000, 324000, 343000, 346000, 350000],
  [279000, 284000, 288000, 294000, 299000, 304000, 308000, 317000, 333000, 336000, 356000, 360000, 367000],
  [291000, 295000, 299000, 305000, 310000, 316000, 320000, 330000, 346000, 350000, 372000, 374000, 381000],
  [301000, 307000, 311000, 316000, 321000, 325000, 331000, 343000, 357000, 362000, 385000, 392000, 396000],
  [311000, 317000, 322000, 329000, 331000, 336000, 343000, 355000, 372000, 377000, 401000, 407000, 409000],
  [324000, 329000, 333000, 337000, 344000, 347000, 352000, 364000, 383000, 390000, 417000, 421000, 426000],
  [334000, 338000, 344000, 348000, 355000, 359000, 364000, 377000, 398000, 404000, 431000, 437000, 443000],
  [346000, 350000, 356000, 360000, 364000, 370000, 374000, 390000, 409000, 417000, 447000, 451000, 457000],
  [357000, 360000, 367000, 372000, 377000, 381000, 385000, 400000, 425000, 427000, 462000, 467000, 471000],
  [369000, 373000, 377000, 382000, 386000, 393000, 396000, 413000, 437000, 443000, 477000, 483000, 487000],
  [379000, 383000, 390000, 393000, 398000, 404000, 408000, 425000, 451000, 454000, 492000, 497000, 501000],
  [390000, 395000, 400000, 405000, 408000, 414000, 419000, 436000, 463000, 469000, 507000, 513000, 518000],
  [401000, 405000, 409000, 417000, 421000, 426000, 430000, 447000, 475000, 481000, 523000, 527000, 533000],
  [413000, 418000, 422000, 426000, 431000, 437000, 443000, 461000, 489000, 495000, 537000, 542000, 549000],
  [422000, 427000, 434000, 439000, 443000, 447000, 452000, 470000, 501000, 507000, 553000, 558000, 562000],
  [436000, 439000, 444000, 449000, 454000, 458000, 463000, 483000, 515000, 522000, 567000, 573000, 577000],
  [445000, 451000, 454000, 461000, 465000, 470000, 475000, 495000, 528000, 534000, 584000, 588000, 592000],
  [457000, 462000, 467000, 471000, 475000, 481000, 487000, 506000, 542000, 546000, 598000, 602000, 608000],
  [467000, 471000, 477000, 483000, 488000, 492000, 497000, 518000, 555000, 560000, 612000, 620000, 624000],
  [480000, 485000, 488000, 493000, 498000, 505000, 507000, 531000, 568000, 573000, 628000, 633000, 637000],
  [489000, 495000, 500000, 505000, 510000, 514000, 519000, 540000, 582000, 586000, 644000, 648000, 654000],
  [500000, 506000, 511000, 515000, 519000, 524000, 531000, 553000, 595000, 599000, 659000, 664000, 669000]
];

// 고구려시스템 0.4mm 안전방충망 (16mesh)
const goguryeo_04mm_16mesh: number[][] = [
  [187000, 190000, 194000, 197000, 245000, 249000, 256000, 260000, 268000, 272000, 282000, 286000, 293000],
  [194000, 197000, 200000, 206000, 255000, 259000, 263000, 269000, 279000, 284000, 293000, 298000, 304000],
  [198000, 202000, 208000, 211000, 262000, 268000, 271000, 279000, 286000, 293000, 304000, 308000, 311000],
  [207000, 210000, 213000, 216000, 269000, 275000, 281000, 286000, 295000, 301000, 312000, 320000, 322000],
  [259000, 263000, 269000, 272000, 279000, 284000, 288000, 295000, 307000, 311000, 324000, 330000, 333000],
  [268000, 271000, 276000, 282000, 286000, 291000, 295000, 305000, 316000, 321000, 334000, 338000, 344000],
  [275000, 281000, 285000, 291000, 294000, 299000, 305000, 312000, 324000, 330000, 346000, 350000, 355000],
  [284000, 288000, 293000, 298000, 304000, 308000, 312000, 322000, 334000, 337000, 356000, 360000, 364000],
  [293000, 295000, 301000, 307000, 311000, 316000, 321000, 330000, 344000, 348000, 367000, 372000, 374000],
  [299000, 305000, 310000, 316000, 320000, 324000, 330000, 337000, 352000, 357000, 377000, 382000, 385000],
  [308000, 312000, 317000, 322000, 329000, 333000, 337000, 347000, 362000, 367000, 386000, 393000, 396000],
  [317000, 321000, 325000, 331000, 336000, 338000, 346000, 356000, 372000, 377000, 398000, 404000, 407000],
  [324000, 330000, 334000, 338000, 344000, 348000, 355000, 364000, 381000, 385000, 408000, 414000, 418000],
  [333000, 337000, 343000, 347000, 352000, 357000, 362000, 373000, 392000, 395000, 419000, 422000, 427000],
  [343000, 346000, 350000, 356000, 360000, 364000, 370000, 382000, 400000, 405000, 430000, 434000, 439000],
  [348000, 355000, 359000, 364000, 369000, 373000, 379000, 392000, 408000, 414000, 440000, 444000, 449000],
  [357000, 362000, 367000, 372000, 377000, 382000, 386000, 398000, 419000, 422000, 451000, 454000, 461000],
  [367000, 370000, 374000, 381000, 385000, 390000, 395000, 407000, 427000, 434000, 462000, 465000, 470000],
  [373000, 379000, 383000, 390000, 393000, 398000, 404000, 417000, 437000, 443000, 471000, 475000, 481000],
  [382000, 386000, 392000, 396000, 401000, 407000, 413000, 425000, 447000, 451000, 483000, 487000, 492000],
  [392000, 395000, 400000, 405000, 409000, 414000, 419000, 434000, 457000, 462000, 493000, 497000, 501000],
  [398000, 404000, 408000, 414000, 418000, 422000, 427000, 443000, 465000, 470000, 505000, 507000, 513000],
  [407000, 413000, 417000, 421000, 426000, 431000, 436000, 451000, 475000, 480000, 514000, 518000, 523000],
  [417000, 419000, 425000, 430000, 436000, 439000, 444000, 461000, 485000, 489000, 524000, 528000, 534000],
  [422000, 427000, 434000, 437000, 443000, 447000, 452000, 469000, 493000, 498000, 534000, 539000, 545000]
];

// JS안전방충망 0.4mm (16mesh)
const js_04mm_16mesh: number[][] = [
  [170000, 173000, 176000, 179000, 222000, 226000, 232000, 236000, 243000, 247000, 256000, 260000, 266000],
  [176000, 179000, 182000, 187000, 231000, 235000, 239000, 244000, 253000, 258000, 266000, 271000, 276000],
  [180000, 184000, 189000, 192000, 238000, 243000, 246000, 253000, 260000, 266000, 276000, 280000, 283000],
  [188000, 191000, 194000, 197000, 244000, 250000, 255000, 260000, 268000, 274000, 284000, 291000, 293000],
  [235000, 239000, 244000, 247000, 253000, 258000, 262000, 268000, 279000, 283000, 295000, 299000, 302000],
  [243000, 246000, 251000, 256000, 260000, 264000, 268000, 277000, 287000, 292000, 303000, 307000, 312000],
  [250000, 255000, 259000, 264000, 267000, 272000, 277000, 284000, 295000, 299000, 314000, 318000, 322000],
  [258000, 262000, 266000, 271000, 276000, 280000, 284000, 293000, 303000, 306000, 323000, 327000, 330000],
  [266000, 268000, 274000, 279000, 283000, 287000, 292000, 299000, 312000, 316000, 333000, 338000, 340000],
  [272000, 277000, 282000, 287000, 291000, 295000, 299000, 306000, 319000, 324000, 342000, 347000, 350000],
  [280000, 284000, 288000, 293000, 298000, 302000, 306000, 315000, 329000, 333000, 351000, 357000, 360000],
  [288000, 292000, 296000, 300000, 305000, 307000, 314000, 323000, 338000, 342000, 362000, 367000, 370000],
  [295000, 299000, 303000, 307000, 312000, 316000, 322000, 330000, 346000, 350000, 371000, 376000, 380000],
  [302000, 306000, 311000, 315000, 319000, 324000, 329000, 339000, 356000, 359000, 381000, 384000, 388000],
  [311000, 314000, 318000, 323000, 327000, 330000, 336000, 347000, 363000, 368000, 391000, 395000, 398000],
  [316000, 322000, 326000, 330000, 335000, 339000, 344000, 356000, 371000, 376000, 399000, 403000, 407000],
  [324000, 329000, 333000, 338000, 342000, 347000, 351000, 362000, 381000, 384000, 409000, 412000, 418000],
  [333000, 336000, 340000, 346000, 350000, 354000, 359000, 370000, 388000, 395000, 419000, 422000, 427000],
  [339000, 344000, 348000, 354000, 357000, 362000, 367000, 379000, 396000, 402000, 428000, 431000, 437000],
  [347000, 351000, 356000, 360000, 364000, 370000, 375000, 386000, 406000, 409000, 439000, 442000, 447000],
  [356000, 359000, 363000, 368000, 372000, 376000, 381000, 395000, 415000, 419000, 448000, 451000, 455000],
  [362000, 367000, 371000, 376000, 380000, 384000, 388000, 402000, 422000, 427000, 459000, 461000, 466000],
  [370000, 375000, 379000, 383000, 387000, 392000, 396000, 409000, 431000, 436000, 467000, 471000, 475000],
  [379000, 381000, 386000, 391000, 396000, 398000, 403000, 418000, 440000, 444000, 476000, 480000, 485000],
  [384000, 388000, 395000, 396000, 402000, 406000, 410000, 426000, 448000, 452000, 485000, 490000, 495000]
];

// JS안전방충망 0.4mm (20mesh)
const js_04mm_20mesh: number[][] = [
  [185000, 188000, 192000, 195000, 242000, 246000, 253000, 257000, 265000, 269000, 279000, 283000, 290000],
  [192000, 195000, 198000, 203000, 252000, 256000, 260000, 266000, 276000, 281000, 290000, 295000, 300000],
  [196000, 199000, 205000, 208000, 259000, 265000, 268000, 276000, 283000, 290000, 300000, 304000, 307000],
  [204000, 207000, 210000, 213000, 266000, 272000, 278000, 283000, 292000, 297000, 308000, 316000, 318000],
  [256000, 260000, 266000, 269000, 276000, 281000, 285000, 292000, 303000, 307000, 320000, 326000, 329000],
  [265000, 268000, 273000, 279000, 283000, 288000, 292000, 301000, 312000, 317000, 330000, 334000, 340000],
  [272000, 278000, 282000, 288000, 291000, 296000, 301000, 308000, 320000, 326000, 342000, 346000, 351000],
  [281000, 285000, 290000, 295000, 300000, 304000, 308000, 318000, 330000, 333000, 352000, 356000, 360000],
  [290000, 292000, 297000, 303000, 307000, 312000, 317000, 326000, 340000, 344000, 363000, 368000, 370000],
  [296000, 301000, 306000, 312000, 316000, 320000, 326000, 333000, 348000, 353000, 373000, 378000, 381000],
  [304000, 308000, 313000, 318000, 325000, 329000, 333000, 343000, 358000, 363000, 382000, 389000, 392000],
  [313000, 317000, 321000, 327000, 332000, 334000, 342000, 352000, 368000, 373000, 394000, 399000, 402000],
  [320000, 326000, 330000, 334000, 340000, 344000, 351000, 360000, 377000, 381000, 403000, 409000, 413000],
  [329000, 333000, 339000, 343000, 348000, 353000, 358000, 369000, 388000, 391000, 414000, 417000, 422000],
  [339000, 342000, 346000, 352000, 356000, 360000, 366000, 378000, 396000, 400000, 425000, 429000, 434000],
  [344000, 351000, 355000, 360000, 365000, 369000, 375000, 388000, 403000, 409000, 435000, 439000, 444000],
  [353000, 358000, 363000, 368000, 373000, 378000, 382000, 394000, 414000, 417000, 446000, 449000, 456000],
  [363000, 366000, 370000, 377000, 381000, 386000, 391000, 402000, 422000, 429000, 457000, 460000, 465000],
  [369000, 375000, 379000, 386000, 389000, 394000, 399000, 412000, 432000, 438000, 466000, 470000, 476000],
  [378000, 382000, 388000, 392000, 396000, 402000, 408000, 420000, 442000, 446000, 478000, 482000, 487000],
  [388000, 391000, 396000, 400000, 404000, 409000, 414000, 429000, 452000, 457000, 488000, 492000, 495000],
  [394000, 399000, 403000, 409000, 413000, 417000, 422000, 438000, 460000, 465000, 499000, 501000, 507000],
  [402000, 408000, 412000, 416000, 421000, 426000, 431000, 446000, 470000, 475000, 508000, 512000, 517000],
  [412000, 414000, 420000, 425000, 431000, 434000, 439000, 456000, 480000, 484000, 518000, 522000, 528000],
  [417000, 422000, 429000, 432000, 438000, 442000, 447000, 464000, 488000, 493000, 528000, 533000, 539000]
];

// JS안전방충망 0.6mm 방범방충망
const js_06mm: number[][] = [
  [176000, 179000, 182000, 187000, 231000, 235000, 239000, 246000, 255000, 259000, 268000, 274000, 277000],
  [184000, 188000, 191000, 194000, 242000, 244000, 250000, 256000, 266000, 271000, 282000, 287000, 292000],
  [192000, 196000, 198000, 201000, 251000, 256000, 259000, 267000, 279000, 282000, 296000, 300000, 305000],
  [199000, 202000, 207000, 210000, 260000, 266000, 271000, 279000, 291000, 295000, 311000, 314000, 318000],
  [253000, 258000, 262000, 267000, 272000, 276000, 280000, 288000, 302000, 305000, 323000, 327000, 333000],
  [264000, 268000, 272000, 277000, 282000, 287000, 291000, 299000, 314000, 318000, 338000, 340000, 346000],
  [274000, 279000, 283000, 287000, 292000, 296000, 300000, 311000, 324000, 329000, 350000, 356000, 360000],
  [283000, 288000, 293000, 298000, 300000, 305000, 311000, 322000, 338000, 342000, 364000, 370000, 372000],
  [295000, 298000, 302000, 306000, 312000, 315000, 319000, 330000, 348000, 354000, 379000, 383000, 387000],
  [303000, 307000, 312000, 316000, 322000, 326000, 330000, 342000, 362000, 367000, 392000, 396000, 402000],
  [314000, 318000, 323000, 327000, 330000, 336000, 340000, 354000, 372000, 379000, 406000, 409000, 415000],
  [324000, 327000, 333000, 338000, 342000, 346000, 350000, 363000, 386000, 388000, 419000, 424000, 428000],
  [335000, 339000, 342000, 347000, 351000, 357000, 360000, 375000, 396000, 402000, 433000, 439000, 442000],
  [344000, 348000, 354000, 357000, 362000, 367000, 371000, 386000, 409000, 412000, 447000, 451000, 455000],
  [354000, 359000, 363000, 368000, 371000, 376000, 381000, 396000, 420000, 426000, 461000, 466000, 471000],
  [364000, 368000, 372000, 379000, 383000, 387000, 391000, 406000, 431000, 437000, 475000, 479000, 484000],
  [375000, 380000, 384000, 387000, 392000, 396000, 402000, 418000, 444000, 450000, 488000, 493000, 498000],
  [384000, 388000, 395000, 398000, 402000, 406000, 410000, 427000, 455000, 461000, 502000, 506000, 510000],
  [396000, 398000, 403000, 407000, 412000, 416000, 420000, 439000, 468000, 474000, 515000, 520000, 524000],
  [404000, 409000, 412000, 418000, 422000, 427000, 431000, 450000, 480000, 485000, 530000, 534000, 538000],
  [415000, 419000, 424000, 428000, 431000, 437000, 442000, 460000, 493000, 495000, 543000, 547000, 552000],
  [424000, 428000, 433000, 439000, 443000, 447000, 451000, 471000, 504000, 508000, 556000, 563000, 567000],
  [436000, 440000, 443000, 448000, 452000, 459000, 461000, 483000, 516000, 520000, 571000, 575000, 579000],
  [444000, 450000, 454000, 459000, 463000, 467000, 472000, 491000, 528000, 532000, 585000, 589000, 594000],
  [454000, 460000, 464000, 468000, 472000, 476000, 483000, 502000, 540000, 544000, 598000, 603000, 607000]
];

// JS안전방충망 0.7mm (14mesh)
const js_07mm_14mesh: number[][] = [
  [208000, 212000, 215000, 219000, 273000, 278000, 286000, 290000, 298000, 303000, 314000, 319000, 326000],
  [215000, 219000, 223000, 229000, 284000, 289000, 294000, 299000, 310000, 317000, 326000, 333000, 339000],
  [220000, 225000, 231000, 235000, 293000, 298000, 302000, 310000, 319000, 326000, 339000, 344000, 347000],
  [230000, 234000, 238000, 241000, 299000, 307000, 313000, 319000, 329000, 336000, 349000, 357000, 360000],
  [289000, 294000, 299000, 303000, 310000, 317000, 321000, 329000, 342000, 347000, 362000, 368000, 372000],
  [298000, 302000, 308000, 314000, 319000, 324000, 329000, 340000, 352000, 358000, 373000, 378000, 384000],
  [307000, 313000, 318000, 324000, 328000, 334000, 340000, 349000, 362000, 368000, 387000, 392000, 396000],
  [317000, 321000, 326000, 333000, 339000, 344000, 349000, 360000, 373000, 377000, 397000, 402000, 405000],
  [326000, 329000, 336000, 342000, 347000, 352000, 358000, 368000, 384000, 389000, 409000, 415000, 418000],
  [334000, 340000, 346000, 352000, 357000, 362000, 368000, 377000, 393000, 398000, 420000, 426000, 430000],
  [344000, 349000, 353000, 360000, 367000, 372000, 377000, 388000, 404000, 409000, 431000, 439000, 442000],
  [353000, 358000, 363000, 369000, 376000, 378000, 387000, 397000, 415000, 420000, 445000, 451000, 455000],
  [362000, 368000, 373000, 378000, 384000, 389000, 396000, 405000, 425000, 430000, 456000, 462000, 467000],
  [372000, 377000, 383000, 388000, 393000, 398000, 404000, 416000, 437000, 441000, 468000, 472000, 477000],
  [383000, 387000, 392000, 397000, 402000, 405000, 413000, 426000, 446000, 452000, 480000, 485000, 490000],
  [389000, 396000, 400000, 405000, 411000, 416000, 423000, 437000, 456000, 462000, 491000, 495000, 500000],
  [398000, 404000, 409000, 415000, 420000, 426000, 431000, 445000, 468000, 472000, 503000, 506000, 514000],
  [409000, 413000, 418000, 425000, 430000, 435000, 441000, 455000, 477000, 485000, 515000, 519000, 525000],
  [416000, 423000, 427000, 435000, 439000, 445000, 451000, 466000, 488000, 495000, 526000, 530000, 537000],
  [426000, 431000, 437000, 442000, 447000, 455000, 461000, 474000, 499000, 503000, 540000, 543000, 549000],
  [437000, 441000, 446000, 452000, 457000, 462000, 468000, 485000, 510000, 515000, 551000, 554000, 559000],
  [445000, 451000, 456000, 462000, 467000, 472000, 477000, 495000, 519000, 525000, 564000, 567000, 573000],
  [455000, 461000, 466000, 471000, 475000, 482000, 487000, 503000, 530000, 536000, 574000, 579000, 584000],
  [466000, 468000, 474000, 480000, 487000, 490000, 495000, 514000, 541000, 546000, 585000, 590000, 595000],
  [472000, 477000, 485000, 488000, 495000, 499000, 504000, 524000, 551000, 556000, 595000, 601000, 608000]
];

// 가격표 매핑
export const priceTables: Record<BrandType, Record<MeshType, number[][] | null>> = {
  goguryeo: {
    '0.4mm-16mesh': goguryeo_04mm_16mesh,
    '0.4mm-20mesh': null,
    '0.6mm': goguryeo_06mm,
    '0.7mm-14mesh': null
  },
  js: {
    '0.4mm-16mesh': js_04mm_16mesh,
    '0.4mm-20mesh': js_04mm_20mesh,
    '0.6mm': js_06mm,
    '0.7mm-14mesh': js_07mm_14mesh
  }
};

// 대표 사이즈 가격 (빠른 참조용)
export const representativePrices: Record<BrandType, Record<MeshType, { utility: number; room: number; living: number } | null>> = {
  goguryeo: {
    '0.4mm-16mesh': { utility: 298000, room: 324000, living: 417000 },
    '0.4mm-20mesh': null,
    '0.6mm': { utility: 329000, room: 359000, living: 483000 },
    '0.7mm-14mesh': null
  },
  js: {
    '0.4mm-16mesh': { utility: 271000, room: 295000, living: 379000 },
    '0.4mm-20mesh': { utility: 295000, room: 320000, living: 412000 },
    '0.6mm': { utility: 298000, room: 326000, living: 466000 },
    '0.7mm-14mesh': { utility: 333000, room: 362000, living: 466000 }
  }
};

// 100mm 단위로 올림
export function roundUpTo100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

// 가격 조회 함수
export function getPrice(
  brand: BrandType,
  meshType: MeshType,
  width: number,
  height: number
): number | null {
  const table = priceTables[brand][meshType];
  if (!table) return null;

  // 100mm 단위로 올림
  const roundedWidth = roundUpTo100(width);
  const roundedHeight = roundUpTo100(height);

  // 인덱스 찾기
  const widthIndex = widthKeys.indexOf(roundedWidth);
  const heightIndex = heightKeys.indexOf(roundedHeight);

  // 범위 체크
  if (widthIndex === -1 || heightIndex === -1) {
    // 범위를 벗어난 경우 가장 가까운 값 사용
    const clampedWidth = Math.min(Math.max(roundedWidth, 300), 1500);
    const clampedHeight = Math.min(Math.max(roundedHeight, 300), 2700);
    
    const clampedWidthIndex = widthKeys.indexOf(clampedWidth);
    const clampedHeightIndex = heightKeys.indexOf(clampedHeight);
    
    if (clampedWidthIndex === -1 || clampedHeightIndex === -1) return null;
    
    return table[clampedHeightIndex][clampedWidthIndex];
  }

  return table[heightIndex][widthIndex];
}

// 설치 유형에 따른 추천 메쉬 타입
export function getRecommendedMeshType(brand: BrandType, installType: InstallType): MeshType {
  if (installType === 'lowFloor') {
    return '0.6mm';
  }
  return '0.4mm-16mesh';
}

// ==================== 유리난간 가격 데이터 ====================

export type GlassRailingPurchaseType = 'group' | 'general'; // 공동구매 / 일반
export type GlassRailingType = 'steelRemoval' | 'windowRemoval'; // 철제난간 철거 / 입면분할창 철거
export type GlassRailingWindowCount = '3w' | '2w';
export type GlassRailingWindowSize = 'large1700up' | 'large1700down'; // 대창 1700이상 / 1700미만 (입면분할용)

export interface GlassRailingPriceInfo {
  purchaseType: GlassRailingPurchaseType;
  railingType: GlassRailingType;
  windowCount: GlassRailingWindowCount;
  windowSize?: GlassRailingWindowSize; // 입면분할창 전용
  price: number;
}

// 유리난간 가격표
export const glassRailingPrices: GlassRailingPriceInfo[] = [
  // 철제난간 철거 후 유리난간 설치 (거실)
  { purchaseType: 'general', railingType: 'steelRemoval', windowCount: '3w', price: 4000000 },
  { purchaseType: 'general', railingType: 'steelRemoval', windowCount: '2w', price: 3700000 },
  { purchaseType: 'group', railingType: 'steelRemoval', windowCount: '3w', price: 3000000 },
  { purchaseType: 'group', railingType: 'steelRemoval', windowCount: '2w', price: 2800000 },

  // 입면분할창 철거 후 유리난간 설치 - 대창 1700이상
  { purchaseType: 'general', railingType: 'windowRemoval', windowCount: '3w', windowSize: 'large1700up', price: 6200000 },
  { purchaseType: 'general', railingType: 'windowRemoval', windowCount: '2w', windowSize: 'large1700up', price: 5700000 },
  { purchaseType: 'group', railingType: 'windowRemoval', windowCount: '3w', windowSize: 'large1700up', price: 5700000 },
  { purchaseType: 'group', railingType: 'windowRemoval', windowCount: '2w', windowSize: 'large1700up', price: 5200000 },

  // 입면분할창 철거 후 유리난간 설치 - 대창 1700미만
  { purchaseType: 'general', railingType: 'windowRemoval', windowCount: '3w', windowSize: 'large1700down', price: 5700000 },
  { purchaseType: 'general', railingType: 'windowRemoval', windowCount: '2w', windowSize: 'large1700down', price: 5200000 },
  { purchaseType: 'group', railingType: 'windowRemoval', windowCount: '3w', windowSize: 'large1700down', price: 5100000 },
  { purchaseType: 'group', railingType: 'windowRemoval', windowCount: '2w', windowSize: 'large1700down', price: 4900000 },
];

// 유리난간 가격 조회 함수
export function getGlassRailingPrice(
  purchaseType: GlassRailingPurchaseType,
  railingType: GlassRailingType,
  windowCount: GlassRailingWindowCount,
  windowSize?: GlassRailingWindowSize
): number {
  const priceInfo = glassRailingPrices.find(
    (p) =>
      p.purchaseType === purchaseType &&
      p.railingType === railingType &&
      p.windowCount === windowCount &&
      (railingType === 'windowRemoval' ? p.windowSize === windowSize : true)
  );
  return priceInfo?.price || 0;
}

// 유리난간 구매방식 옵션
export const glassRailingPurchaseOptions = [
  {
    id: 'group' as GlassRailingPurchaseType,
    name: '공동구매견적',
    subtitle: '단지내 3세대 이상',
    description: '같은 아파트 단지 내 3세대 이상 함께 시공시 할인 적용',
  },
  {
    id: 'general' as GlassRailingPurchaseType,
    name: '일반견적',
    subtitle: '개별 시공',
    description: '개별 세대 단독 시공',
  },
];

// 유리난간 타입 옵션
export const glassRailingTypeOptions = [
  {
    id: 'steelRemoval' as GlassRailingType,
    name: '철제난간 철거 후 유리난간 설치',
    description: '기존 철제난간을 철거하고 유리난간으로 교체',
  },
  {
    id: 'windowRemoval' as GlassRailingType,
    name: '입면분할 창 철거 후 유리난간 설치',
    description: '입면분할 창을 철거하고 유리난간으로 교체',
  },
];

// 유리난간 거실창수 옵션
export const glassRailingWindowCountOptions = [
  {
    id: '3w' as GlassRailingWindowCount,
    name: '3W',
    description: '거실창 3연동',
  },
  {
    id: '2w' as GlassRailingWindowCount,
    name: '2W',
    description: '거실창 2연동',
  },
];

// 대창 사이즈 옵션 (입면분할용)
export const glassRailingWindowSizeOptions = [
  {
    id: 'large1700up' as GlassRailingWindowSize,
    name: '대창 1700 이상',
    description: '대창 높이 1700mm 이상',
  },
  {
    id: 'large1700down' as GlassRailingWindowSize,
    name: '대창 1700 미만',
    description: '대창 높이 1700mm 미만',
  },
];

// ==================== 유리난간 방추가 가격 데이터 ====================

// 철제난간 방추가 사이즈
export type SteelRoomAddSize = '2w_1500down' | '2w_1800down' | '2w_2500down' | '2w_2500up' | '3w';

export const steelRoomAddPrices: Record<SteelRoomAddSize, number> = {
  '2w_1500down': 1400000,
  '2w_1800down': 1800000,
  '2w_2500down': 2100000,
  '2w_2500up':   2300000,
  '3w':          2400000,
};

export function getSteelRoomAddPrice(size: SteelRoomAddSize): number {
  return steelRoomAddPrices[size] || 0;
}

export const steelRoomAddOptions = [
  { id: '2w_1500down' as SteelRoomAddSize, name: '2W (폭 1,500미만)', description: '방 거실창 2연동, 폭 1,500mm 미만' },
  { id: '2w_1800down' as SteelRoomAddSize, name: '2W (폭 1,800미만)', description: '방 거실창 2연동, 폭 1,800mm 미만' },
  { id: '2w_2500down' as SteelRoomAddSize, name: '2W (폭 2,500미만)', description: '방 거실창 2연동, 폭 2,500mm 미만' },
  { id: '2w_2500up'   as SteelRoomAddSize, name: '2W (폭 2,500이상)', description: '방 거실창 2연동, 폭 2,500mm 이상' },
  { id: '3w'          as SteelRoomAddSize, name: '3W',                description: '방 거실창 3연동' },
];

// 입면분할 방추가 사이즈
export type WindowRoomAddSize = '2w_1800down' | '2w_1800up' | '2w_2500up' | '2w_3600up' | '3w';

export const windowRoomAddPrices: Record<WindowRoomAddSize, number> = {
  '2w_1800down': 2700000,
  '2w_1800up':   2900000,
  '2w_2500up':   3400000,
  '2w_3600up':   4500000,
  '3w':          4500000,
};

export function getWindowRoomAddPrice(size: WindowRoomAddSize): number {
  return windowRoomAddPrices[size] || 0;
}

export const windowRoomAddOptions = [
  { id: '2w_1800down' as WindowRoomAddSize, name: '2W (폭 1,800미만)', description: '방 거실창 2연동, 폭 1,800mm 미만' },
  { id: '2w_1800up'   as WindowRoomAddSize, name: '2W (폭 1,800이상)', description: '방 거실창 2연동, 폭 1,800mm 이상' },
  { id: '2w_2500up'   as WindowRoomAddSize, name: '2W (폭 2,500이상)', description: '방 거실창 2연동, 폭 2,500mm 이상' },
  { id: '2w_3600up'   as WindowRoomAddSize, name: '2W (폭 3,600이상)', description: '방 거실창 2연동, 폭 3,600mm 이상' },
  { id: '3w'          as WindowRoomAddSize, name: '3W',                description: '방 거실창 3연동' },
];

// ==================== 후퍼옵틱 열차단필름 가격 데이터 ====================

export type HuperOptikPurchaseType = 'group' | 'general'; // 공동구매 / 일반
export type HuperOptikFilmType = 'hybrid' | 'ceramic' | 'ceramicHC70'; // HBR15/35 / HC50 / HC70
export type HuperOptikSizeType = '59' | '74' | '84'; // 전용면적 타입
export type HuperOptikRoomId = 'livingRoom' | 'bedroom1' | 'bedroom2' | 'bedroom3' | 'kitchen' | 'utility';

export interface HuperOptikPriceInfo {
  purchaseType: HuperOptikPurchaseType;
  filmType: HuperOptikFilmType;
  sizeType: HuperOptikSizeType;
  price: number;
}

export interface HuperOptikRoomPrice {
  id: HuperOptikRoomId;
  name: string;
  prices: Record<HuperOptikSizeType, Record<HuperOptikFilmType, number>>;
}

// 후퍼옵틱 공동구매 세트 가격표
export const huperOptikPrices: HuperOptikPriceInfo[] = [
  // 전용59타입
  { purchaseType: 'group', filmType: 'hybrid', sizeType: '59', price: 1340000 },
  { purchaseType: 'group', filmType: 'ceramic', sizeType: '59', price: 2390000 },
  { purchaseType: 'group', filmType: 'ceramicHC70', sizeType: '59', price: 2550000 },
  // 전용74타입
  { purchaseType: 'group', filmType: 'hybrid', sizeType: '74', price: 1640000 },
  { purchaseType: 'group', filmType: 'ceramic', sizeType: '74', price: 2890000 },
  { purchaseType: 'group', filmType: 'ceramicHC70', sizeType: '74', price: 3060000 },
  // 전용84타입
  { purchaseType: 'group', filmType: 'hybrid', sizeType: '84', price: 1790000 },
  { purchaseType: 'group', filmType: 'ceramic', sizeType: '84', price: 3190000 },
  { purchaseType: 'group', filmType: 'ceramicHC70', sizeType: '84', price: 3400000 },
];

// 후퍼옵틱 가격 조회 함수 (공동구매용)
export function getHuperOptikPrice(
  purchaseType: HuperOptikPurchaseType,
  filmType: HuperOptikFilmType,
  sizeType: HuperOptikSizeType
): number {
  const priceInfo = huperOptikPrices.find(
    (p) => p.purchaseType === purchaseType && p.filmType === filmType && p.sizeType === sizeType
  );
  return priceInfo?.price || 0;
}

// 후퍼옵틱 방별 개별 단가 (일반견적용)
export const huperOptikRoomPrices: HuperOptikRoomPrice[] = [
  {
    id: 'livingRoom',
    name: '거실',
    prices: {
      '59': { hybrid: 513000, ceramic: 864000, ceramicHC70: 914000 },
      '74': { hybrid: 648000, ceramic: 1100000, ceramicHC70: 1167000 },
      '84': { hybrid: 688000, ceramic: 1208000, ceramicHC70: 1288000 },
    },
  },
  {
    id: 'bedroom1',
    name: '침실1 (발코니)',
    prices: {
      '59': { hybrid: 308000, ceramic: 518000, ceramicHC70: 548000 },
      '74': { hybrid: 410000, ceramic: 688000, ceramicHC70: 731000 },
      '84': { hybrid: 400000, ceramic: 670000, ceramicHC70: 740000 },
    },
  },
  {
    id: 'bedroom2',
    name: '침실2',
    prices: {
      '59': { hybrid: 308000, ceramic: 518000, ceramicHC70: 548000 },
      '74': { hybrid: 340000, ceramic: 565000, ceramicHC70: 605000 },
      '84': { hybrid: 400000, ceramic: 670000, ceramicHC70: 740000 },
    },
  },
  {
    id: 'bedroom3',
    name: '침실3',
    prices: {
      '59': { hybrid: 309000, ceramic: 518000, ceramicHC70: 548000 },
      '74': { hybrid: 340000, ceramic: 565000, ceramicHC70: 605000 },
      '84': { hybrid: 400000, ceramic: 670000, ceramicHC70: 740000 },
    },
  },
  {
    id: 'kitchen',
    name: '주방/식당',
    prices: {
      '59': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
      '74': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
      '84': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
    },
  },
  {
    id: 'utility',
    name: '다용도실',
    prices: {
      '59': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
      '74': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
      '84': { hybrid: 51000, ceramic: 86000, ceramicHC70: 91000 },
    },
  },
];

export const HUPER_OPTIK_MIN_GENERAL_PRICE = 1000000; // 일반견적 최소 계약금액

// 후퍼옵틱 구매방식 옵션
export const huperOptikPurchaseOptions = [
  {
    id: 'group' as HuperOptikPurchaseType,
    name: '공동구매견적',
    subtitle: '단지내 3세대 이상',
    description: '같은 아파트 단지 내 3세대 이상 함께 시공시 할인 적용',
  },
  {
    id: 'general' as HuperOptikPurchaseType,
    name: '일반견적',
    subtitle: '개별 시공',
    description: '시공할 공간을 직접 선택 (최소 계약금액 100만원)',
  },
];

// 후퍼옵틱 평형 옵션
export const huperOptikSizeOptions = [
  {
    id: '59' as HuperOptikSizeType,
    name: '전용59타입',
    description: '전용면적 59㎡',
  },
  {
    id: '74' as HuperOptikSizeType,
    name: '전용74타입',
    description: '전용면적 74㎡',
  },
  {
    id: '84' as HuperOptikSizeType,
    name: '전용84타입',
    description: '전용면적 84㎡',
  },
];

// 후퍼옵틱 필름 타입 옵션
export const huperOptikFilmOptions = [
  {
    id: 'hybrid' as HuperOptikFilmType,
    name: '가성비 하이브리드 열차단필름 HBR15/35',
    subtitle: '10년 보증',
    description: '사생활 보호 강화',
    model: 'HBR15/35',
  },
  {
    id: 'ceramic' as HuperOptikFilmType,
    name: '프리미엄 나노세라믹 열차단필름 HC50 시그니처',
    subtitle: '평생 보증',
    description: '뛰어난 열차단 성능과 반영구적인 내구성',
    model: 'HC50',
  },
  {
    id: 'ceramicHC70' as HuperOptikFilmType,
    name: '프리미엄 나노세라믹 열차단필름 HC70 멀티레이어',
    subtitle: '평생 보증',
    description: '뛰어난 열차단 성능과 반영구적인 내구성',
    model: 'HC70',
  },
];

// ==================== 블랙스텐 미세촘촘 방충망 가격 데이터 ====================

export type BlackScreenServiceType = 'meshOnly' | 'frameAndMesh' | 'rollScreen';

export interface BlackScreenUnitPrice {
  serviceType: 'meshOnly' | 'frameAndMesh';
  quantityTier: 'low' | 'high';
  large: number;
  medium: number;
  largeCode: string;
  mediumCode: string;
}

// 블랙스텐망 교체: 3-5장=low / 6장이상=high
// 틀제작+망 교체: 1-5장=low / 6장이상=high
export const blackScreenUnitPrices: BlackScreenUnitPrice[] = [
  { serviceType: 'meshOnly',     quantityTier: 'low',  large: 90000,  medium: 70000,  largeCode: 'INS-CH-SCREEN(24)(B)',    mediumCode: 'INS-CH-SCREEN(24)(M)'    },
  { serviceType: 'meshOnly',     quantityTier: 'high', large: 85000,  medium: 65000,  largeCode: 'INS-CH-SCREEN(24)(B)(G)', mediumCode: 'INS-CH-SCREEN(24)(M)(G)' },
  { serviceType: 'frameAndMesh', quantityTier: 'low',  large: 180000, medium: 150000, largeCode: 'INS-MCH-SCREEN(24)(B)',   mediumCode: 'INS-MCH-SCREEN(24)(M)'   },
  { serviceType: 'frameAndMesh', quantityTier: 'high', large: 160000, medium: 130000, largeCode: 'INS-MCH-SCREEN(24)(B)(G)',mediumCode: 'INS-MCH-SCREEN(24)(M)(G)'},
];

export function getBlackScreenPrice(
  serviceType: 'meshOnly' | 'frameAndMesh',
  largeCount: number,
  mediumCount: number
): { largeUnitPrice: number; mediumUnitPrice: number; total: number; largeCode: string; mediumCode: string } {
  const totalCount = largeCount + mediumCount;
  const tier: 'low' | 'high' = totalCount >= 6 ? 'high' : 'low';
  const priceInfo = blackScreenUnitPrices.find(
    (p) => p.serviceType === serviceType && p.quantityTier === tier
  )!;
  return {
    largeUnitPrice: priceInfo.large,
    mediumUnitPrice: priceInfo.medium,
    total: largeCount * priceInfo.large + mediumCount * priceInfo.medium,
    largeCode: priceInfo.largeCode,
    mediumCode: priceInfo.mediumCode,
  };
}

export function getRollScreenPrice(count: number): { unitPrice: number; total: number; code: string } {
  const isHigh = count >= 6;
  return {
    unitPrice: isHigh ? 120000 : 150000,
    total: count * (isHigh ? 120000 : 150000),
    code: isHigh ? 'INS-CH-SCREEN(ROLL)(G)' : 'INS-CH-SCREEN(ROLL)',
  };
}

export const BLACK_SCREEN_MIN_PRICE = 200000;

export const blackScreenServiceOptions = [
  {
    id: 'meshOnly' as BlackScreenServiceType,
    name: '블랙스텐망 교체',
    subtitle: '한국메탈 블랙 0.18*24메쉬',
    description: '기존 틀에 블랙스텐 미세촘촘 망만 교체\n포함: 망교체·모헤어·가스켓·물구멍스티커·롤러',
    as: '망불량 10년 / 시공불량 1년',
    priceTierLow: '3-5장',
    priceTierHigh: '6장 이상',
  },
  {
    id: 'frameAndMesh' as BlackScreenServiceType,
    name: '틀제작 + 블랙스텐망 교체',
    subtitle: 'PVC(KCC·영림·한화) / 알루미늄(청송·대신)',
    description: '새 틀 제작 후 블랙스텐 미세촘촘 망 설치\n포함: 망교체·모헤어·가스켓·물구멍스티커·롤러',
    as: '10년',
    priceTierLow: '1-5장',
    priceTierHigh: '6장 이상',
  },
  {
    id: 'rollScreen' as BlackScreenServiceType,
    name: '롤방충망',
    subtitle: '대신 알루텍 / 1000×1000mm 이내',
    description: '롤방충망 설치 · 무상철거 포함 (설치대수 동일수량)\n외부설치 시 장당 1만원 추가 / 10장이상 대량 작업은 별도 견적',
    as: '1년',
    priceTierLow: '1-5장',
    priceTierHigh: '6장 이상',
  },
];

export const BLACK_SCREEN_FEATURES = [
  { title: '벌레 완벽 차단', description: '초파리·날파리까지 차단 (일반망 대비 우수)' },
  { title: '반영구 내구성', description: '스테인리스 소재 → 녹 없음, 찢어짐 거의 없음' },
  { title: '시야 깨끗', description: '블랙망 → 반사 적고 선명한 시야' },
  { title: '통풍 유지', description: '촘촘하지만 바람은 충분히 통과' },
];
