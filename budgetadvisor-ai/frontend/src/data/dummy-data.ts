// budgetadvisor.ai dummy data — realistic UK/European grocery data for Sarah Mitchell

export const CATEGORIES = [
  { key: "dairy", label: "Dairy", color: "#6366F1" },
  { key: "meat", label: "Meat", color: "#F43F5E" },
  { key: "fresh_produce", label: "Fresh Produce", color: "#22C55E" },
  { key: "bakery", label: "Bakery", color: "#F59E0B" },
  { key: "processed_foods", label: "Processed Foods", color: "#8B5CF6" },
  { key: "household", label: "Household", color: "#06B6D4" },
  { key: "personal_care", label: "Personal Care", color: "#EC4899" },
  { key: "beverages", label: "Beverages", color: "#14B8A6" },
  { key: "other", label: "Other", color: "#6B7280" },
] as const;

export type CategoryKey = typeof CATEGORIES[number]["key"];

export const currentUser = {
  id: "usr_1",
  name: "Sarah Mitchell",
  email: "sarah.mitchell@email.com",
  avatar: "SM",
  country: "United Kingdom",
  currency: "GBP",
  currencySymbol: "£",
  householdSize: 3,
  monthlyBudget: 500,
  joinedAt: "2024-09-15",
};

export interface LineItem {
  id: string;
  rawDescription: string;
  cleanDescription: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  category: CategoryKey;
  onPromotion: boolean;
  promotionSaving: number;
  flagged?: boolean;
}

export interface Receipt {
  id: string;
  merchant: string;
  merchantType: string;
  date: string;
  total: number;
  currency: string;
  currencySymbol: string;
  itemCount: number;
  items: LineItem[];
  totalSaved: number;
  scanMethod: "AI Vision" | "OCR + AI";
  scannedAt: string;
  flaggedItems: number;
  topCategories: CategoryKey[];
}

const today = new Date();
const d = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const receipts: Receipt[] = [
  {
    id: "rec_1",
    merchant: "Tesco",
    merchantType: "Supermarket",
    date: d(0),
    total: 42.50,
    currency: "GBP",
    currencySymbol: "£",
    itemCount: 12,
    totalSaved: 2.40,
    scanMethod: "AI Vision",
    scannedAt: new Date(today.getTime() - 3600000).toISOString(),
    flaggedItems: 0,
    topCategories: ["dairy", "fresh_produce"],
    items: [
      { id: "i1", rawDescription: "TESCO BRIT S/MILK 2PT", cleanDescription: "British Semi-Skimmed Milk 2 Pint", quantity: 2, unitPrice: 1.15, lineTotal: 2.30, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i2", rawDescription: "TESCO MATURE CHEDDR", cleanDescription: "Mature Cheddar Cheese 400g", quantity: 1, unitPrice: 3.50, lineTotal: 3.50, category: "dairy", onPromotion: true, promotionSaving: 0.80 },
      { id: "i3", rawDescription: "TESCO CHICKEN BRST", cleanDescription: "Chicken Breast Fillets 600g", quantity: 1, unitPrice: 4.50, lineTotal: 4.50, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i4", rawDescription: "TESCO BEEF MINCE 500", cleanDescription: "Beef Mince 5% Fat 500g", quantity: 1, unitPrice: 3.80, lineTotal: 3.80, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i5", rawDescription: "TESCO BANANAS LOOSE", cleanDescription: "Bananas Loose", quantity: 6, unitPrice: 0.15, lineTotal: 0.90, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i6", rawDescription: "TESCO BROCCOLI", cleanDescription: "Broccoli 350g", quantity: 1, unitPrice: 0.89, lineTotal: 0.89, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i7", rawDescription: "TESCO WHOLEMEAL LRG", cleanDescription: "Wholemeal Bread Large 800g", quantity: 1, unitPrice: 1.10, lineTotal: 1.10, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i8", rawDescription: "TESCO GREEK YOGHURT", cleanDescription: "Greek Style Yoghurt 500g", quantity: 1, unitPrice: 1.80, lineTotal: 1.80, category: "dairy", onPromotion: true, promotionSaving: 0.40 },
      { id: "i9", rawDescription: "TESCO PASTA PENNE", cleanDescription: "Penne Pasta 500g", quantity: 2, unitPrice: 0.85, lineTotal: 1.70, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i10", rawDescription: "TESCO WASH LIQ TABS", cleanDescription: "Washing Liquid Tablets 30pk", quantity: 1, unitPrice: 5.50, lineTotal: 5.50, category: "household", onPromotion: true, promotionSaving: 1.20 },
      { id: "i11", rawDescription: "TESCO TOMATOES VINE", cleanDescription: "Vine Ripened Tomatoes 400g", quantity: 1, unitPrice: 1.20, lineTotal: 1.20, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i12", rawDescription: "TESCO ORANGE JCE 1L", cleanDescription: "Pure Orange Juice 1L", quantity: 1, unitPrice: 1.50, lineTotal: 1.50, category: "beverages", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_2",
    merchant: "Waitrose",
    merchantType: "Supermarket",
    date: d(3),
    total: 84.20,
    currency: "GBP",
    currencySymbol: "£",
    itemCount: 15,
    totalSaved: 0,
    scanMethod: "AI Vision",
    scannedAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
    flaggedItems: 1,
    topCategories: ["meat", "dairy"],
    items: [
      { id: "i13", rawDescription: "WR ORGANIC SALMON", cleanDescription: "Organic Scottish Salmon Fillets 280g", quantity: 1, unitPrice: 6.50, lineTotal: 6.50, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i14", rawDescription: "WR FREE RANGE EGGS", cleanDescription: "Free Range Eggs Large x12", quantity: 1, unitPrice: 3.80, lineTotal: 3.80, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i15", rawDescription: "WR SOURDOUGH LOAF", cleanDescription: "Artisan Sourdough Loaf 500g", quantity: 1, unitPrice: 3.20, lineTotal: 3.20, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i16", rawDescription: "WR LAMB LEG JOINT", cleanDescription: "British Lamb Leg Joint 1.2kg", quantity: 1, unitPrice: 14.00, lineTotal: 14.00, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i17", rawDescription: "WR KITCHENWARE TONG", cleanDescription: "Stainless Steel Kitchen Tongs", quantity: 1, unitPrice: 8.50, lineTotal: 8.50, category: "other", onPromotion: false, promotionSaving: 0, flagged: true },
      { id: "i18", rawDescription: "WR AVOCADOS 4PK", cleanDescription: "Ripe Avocados Pack of 4", quantity: 1, unitPrice: 3.00, lineTotal: 3.00, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i19", rawDescription: "WR PARMESAN WEDGE", cleanDescription: "Parmigiano Reggiano Wedge 200g", quantity: 1, unitPrice: 4.50, lineTotal: 4.50, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i20", rawDescription: "WR OLIVE OIL EV", cleanDescription: "Extra Virgin Olive Oil 500ml", quantity: 1, unitPrice: 6.00, lineTotal: 6.00, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i21", rawDescription: "WR ROCKET SALAD", cleanDescription: "Wild Rocket Salad 100g", quantity: 2, unitPrice: 1.50, lineTotal: 3.00, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i22", rawDescription: "WR RIBEYE STEAK", cleanDescription: "28-Day Aged Ribeye Steak 300g", quantity: 1, unitPrice: 8.00, lineTotal: 8.00, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i23", rawDescription: "WR BUTTER UNSLTD", cleanDescription: "Unsalted Butter 250g", quantity: 1, unitPrice: 2.20, lineTotal: 2.20, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i24", rawDescription: "WR CROISSANTS 4PK", cleanDescription: "All Butter Croissants Pack of 4", quantity: 1, unitPrice: 2.80, lineTotal: 2.80, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i25", rawDescription: "WR SPARKLING WATER", cleanDescription: "Italian Sparkling Water 1L", quantity: 2, unitPrice: 1.20, lineTotal: 2.40, category: "beverages", onPromotion: false, promotionSaving: 0 },
      { id: "i26", rawDescription: "WR HAND CREAM", cleanDescription: "Shea Butter Hand Cream 75ml", quantity: 1, unitPrice: 4.50, lineTotal: 4.50, category: "personal_care", onPromotion: false, promotionSaving: 0 },
      { id: "i27", rawDescription: "WR CHERRY TOMATO", cleanDescription: "Cherry Tomatoes on Vine 250g", quantity: 1, unitPrice: 1.80, lineTotal: 1.80, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_3",
    merchant: "Lidl",
    merchantType: "Discounter",
    date: d(7),
    total: 12.40,
    currency: "GBP",
    currencySymbol: "£",
    itemCount: 6,
    totalSaved: 3.20,
    scanMethod: "OCR + AI",
    scannedAt: new Date(today.getTime() - 7 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["fresh_produce", "bakery"],
    items: [
      { id: "i28", rawDescription: "LIDL MILK WHOLE 4PT", cleanDescription: "Whole Milk 4 Pint", quantity: 1, unitPrice: 1.35, lineTotal: 1.35, category: "dairy", onPromotion: true, promotionSaving: 0.30 },
      { id: "i29", rawDescription: "LIDL APPLES GALA", cleanDescription: "Gala Apples 6 Pack", quantity: 1, unitPrice: 1.29, lineTotal: 1.29, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i30", rawDescription: "LIDL TIGER BREAD", cleanDescription: "Tiger Bread Loaf", quantity: 1, unitPrice: 0.99, lineTotal: 0.99, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i31", rawDescription: "LIDL CARROTS 1KG", cleanDescription: "Carrots 1kg", quantity: 1, unitPrice: 0.59, lineTotal: 0.59, category: "fresh_produce", onPromotion: true, promotionSaving: 0.20 },
      { id: "i32", rawDescription: "LIDL SAUSAGES 8PK", cleanDescription: "Pork Sausages 8 Pack", quantity: 1, unitPrice: 1.89, lineTotal: 1.89, category: "meat", onPromotion: true, promotionSaving: 0.70 },
      { id: "i33", rawDescription: "LIDL BISCUITS CHOC", cleanDescription: "Chocolate Digestive Biscuits", quantity: 2, unitPrice: 0.89, lineTotal: 1.78, category: "processed_foods", onPromotion: true, promotionSaving: 2.00 },
    ],
  },
  {
    id: "rec_4",
    merchant: "Aldi",
    merchantType: "Discounter",
    date: d(5),
    total: 38.90,
    currency: "GBP",
    currencySymbol: "£",
    itemCount: 10,
    totalSaved: 0,
    scanMethod: "AI Vision",
    scannedAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["dairy", "meat"],
    items: [
      { id: "i34", rawDescription: "ALDI CHEDDAR MILD", cleanDescription: "Mild Cheddar 400g", quantity: 1, unitPrice: 2.19, lineTotal: 2.19, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i35", rawDescription: "ALDI CHICKEN THIGH", cleanDescription: "Chicken Thigh Fillets 1kg", quantity: 1, unitPrice: 3.49, lineTotal: 3.49, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i36", rawDescription: "ALDI PEPPERS MIX", cleanDescription: "Mixed Peppers 3 Pack", quantity: 1, unitPrice: 0.99, lineTotal: 0.99, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i37", rawDescription: "ALDI RICE BASMATI", cleanDescription: "Basmati Rice 1kg", quantity: 1, unitPrice: 1.65, lineTotal: 1.65, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i38", rawDescription: "ALDI BUTTER SLTED", cleanDescription: "Salted Butter 250g", quantity: 1, unitPrice: 1.89, lineTotal: 1.89, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i39", rawDescription: "ALDI MINCE BEEF 20", cleanDescription: "Beef Mince 20% Fat 500g", quantity: 1, unitPrice: 2.99, lineTotal: 2.99, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i40", rawDescription: "ALDI MUSHROOMS 250", cleanDescription: "Chestnut Mushrooms 250g", quantity: 1, unitPrice: 0.89, lineTotal: 0.89, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i41", rawDescription: "ALDI TOOTHPASTE", cleanDescription: "Whitening Toothpaste 100ml", quantity: 1, unitPrice: 0.79, lineTotal: 0.79, category: "personal_care", onPromotion: false, promotionSaving: 0 },
      { id: "i42", rawDescription: "ALDI KITCHEN ROLL", cleanDescription: "Kitchen Roll 4 Pack", quantity: 1, unitPrice: 2.49, lineTotal: 2.49, category: "household", onPromotion: false, promotionSaving: 0 },
      { id: "i43", rawDescription: "ALDI COLA 2L", cleanDescription: "Cola 2L Bottle", quantity: 1, unitPrice: 0.69, lineTotal: 0.69, category: "beverages", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_5",
    merchant: "Sainsbury's",
    merchantType: "Supermarket",
    date: d(10),
    total: 56.30,
    currency: "GBP",
    currencySymbol: "£",
    itemCount: 11,
    totalSaved: 1.80,
    scanMethod: "AI Vision",
    scannedAt: new Date(today.getTime() - 10 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["meat", "processed_foods"],
    items: [
      { id: "i44", rawDescription: "JS PORK CHOPS 2PK", cleanDescription: "Pork Loin Chops 2 Pack", quantity: 1, unitPrice: 4.00, lineTotal: 4.00, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i45", rawDescription: "JS CRISPS MULTI 12", cleanDescription: "Variety Crisps Multipack 12pk", quantity: 1, unitPrice: 3.50, lineTotal: 3.50, category: "processed_foods", onPromotion: true, promotionSaving: 1.00 },
      { id: "i46", rawDescription: "JS FROZEN PEAS 1KG", cleanDescription: "Garden Peas Frozen 1kg", quantity: 1, unitPrice: 1.50, lineTotal: 1.50, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i47", rawDescription: "JS COFFEE INSTANT", cleanDescription: "Instant Coffee 200g", quantity: 1, unitPrice: 3.80, lineTotal: 3.80, category: "beverages", onPromotion: false, promotionSaving: 0 },
      { id: "i48", rawDescription: "JS DOUBLE CREAM", cleanDescription: "Double Cream 300ml", quantity: 1, unitPrice: 1.40, lineTotal: 1.40, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i49", rawDescription: "JS LAMB MINCE 500G", cleanDescription: "Lamb Mince 500g", quantity: 1, unitPrice: 4.50, lineTotal: 4.50, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i50", rawDescription: "JS PASTA SAUCE JAR", cleanDescription: "Tomato & Basil Pasta Sauce 500g", quantity: 2, unitPrice: 1.50, lineTotal: 3.00, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i51", rawDescription: "JS SHAMPOO 400ML", cleanDescription: "Daily Care Shampoo 400ml", quantity: 1, unitPrice: 2.50, lineTotal: 2.50, category: "personal_care", onPromotion: true, promotionSaving: 0.80 },
      { id: "i52", rawDescription: "JS BIN BAGS 50PK", cleanDescription: "Recycling Bin Bags 50 Pack", quantity: 1, unitPrice: 3.00, lineTotal: 3.00, category: "household", onPromotion: false, promotionSaving: 0 },
      { id: "i53", rawDescription: "JS BAGELS PLAIN 5", cleanDescription: "Plain Bagels Pack of 5", quantity: 1, unitPrice: 1.20, lineTotal: 1.20, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i54", rawDescription: "JS STEAK SIRLOIN", cleanDescription: "Sirloin Steak 250g", quantity: 1, unitPrice: 5.90, lineTotal: 5.90, category: "meat", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_6",
    merchant: "Carrefour",
    merchantType: "Hypermarket",
    date: d(14),
    total: 32.10,
    currency: "EUR",
    currencySymbol: "€",
    itemCount: 8,
    totalSaved: 0,
    scanMethod: "OCR + AI",
    scannedAt: new Date(today.getTime() - 14 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["dairy", "fresh_produce"],
    items: [
      { id: "i55", rawDescription: "CRF BRIE 250G", cleanDescription: "Brie de Meaux 250g", quantity: 1, unitPrice: 3.20, lineTotal: 3.20, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i56", rawDescription: "CRF BAGUETTE TRAD", cleanDescription: "Baguette Tradition", quantity: 2, unitPrice: 1.10, lineTotal: 2.20, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i57", rawDescription: "CRF POULET ENTIER", cleanDescription: "Whole Chicken 1.5kg", quantity: 1, unitPrice: 5.50, lineTotal: 5.50, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i58", rawDescription: "CRF HARICOTS VERTS", cleanDescription: "French Green Beans 500g", quantity: 1, unitPrice: 2.30, lineTotal: 2.30, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i59", rawDescription: "CRF YAOURT NATURE", cleanDescription: "Natural Yoghurt 4x125g", quantity: 1, unitPrice: 1.80, lineTotal: 1.80, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i60", rawDescription: "CRF VIN ROUGE", cleanDescription: "Red Wine Côtes du Rhône 750ml", quantity: 1, unitPrice: 4.50, lineTotal: 4.50, category: "beverages", onPromotion: false, promotionSaving: 0 },
      { id: "i61", rawDescription: "CRF COURGETTES", cleanDescription: "Courgettes 500g", quantity: 1, unitPrice: 1.90, lineTotal: 1.90, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i62", rawDescription: "CRF SAVON MAINS", cleanDescription: "Hand Soap 250ml", quantity: 1, unitPrice: 2.10, lineTotal: 2.10, category: "personal_care", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_7",
    merchant: "Rewe",
    merchantType: "Supermarket",
    date: d(21),
    total: 28.60,
    currency: "EUR",
    currencySymbol: "€",
    itemCount: 7,
    totalSaved: 0,
    scanMethod: "AI Vision",
    scannedAt: new Date(today.getTime() - 21 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["processed_foods", "dairy"],
    items: [
      { id: "i63", rawDescription: "REWE VOLLMILCH 1L", cleanDescription: "Whole Milk 1L", quantity: 2, unitPrice: 1.09, lineTotal: 2.18, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i64", rawDescription: "REWE BRATWURST 5ST", cleanDescription: "Bratwurst 5 Pack", quantity: 1, unitPrice: 3.49, lineTotal: 3.49, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i65", rawDescription: "REWE PUMPERNICKEL", cleanDescription: "Pumpernickel Bread 500g", quantity: 1, unitPrice: 1.29, lineTotal: 1.29, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i66", rawDescription: "REWE SPAGHETTI 500", cleanDescription: "Spaghetti 500g", quantity: 2, unitPrice: 0.99, lineTotal: 1.98, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i67", rawDescription: "REWE KARTOFFELN 2K", cleanDescription: "Potatoes 2kg", quantity: 1, unitPrice: 1.99, lineTotal: 1.99, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i68", rawDescription: "REWE MÜSLI KNUSPR", cleanDescription: "Crunchy Muesli 750g", quantity: 1, unitPrice: 2.79, lineTotal: 2.79, category: "processed_foods", onPromotion: false, promotionSaving: 0 },
      { id: "i69", rawDescription: "REWE SPÜLMITTEL", cleanDescription: "Washing Up Liquid 500ml", quantity: 1, unitPrice: 1.49, lineTotal: 1.49, category: "household", onPromotion: false, promotionSaving: 0 },
    ],
  },
  {
    id: "rec_8",
    merchant: "Leclerc",
    merchantType: "Hypermarket",
    date: d(28),
    total: 45.00,
    currency: "EUR",
    currencySymbol: "€",
    itemCount: 9,
    totalSaved: 0,
    scanMethod: "OCR + AI",
    scannedAt: new Date(today.getTime() - 28 * 86400000).toISOString(),
    flaggedItems: 0,
    topCategories: ["meat", "fresh_produce"],
    items: [
      { id: "i70", rawDescription: "LCL CAMEMBERT", cleanDescription: "Camembert de Normandie 250g", quantity: 1, unitPrice: 2.80, lineTotal: 2.80, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i71", rawDescription: "LCL FILET SAUMON", cleanDescription: "Salmon Fillet 200g", quantity: 2, unitPrice: 4.50, lineTotal: 9.00, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i72", rawDescription: "LCL TOMATES GRAPPE", cleanDescription: "Vine Tomatoes 500g", quantity: 1, unitPrice: 2.10, lineTotal: 2.10, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i73", rawDescription: "LCL PAIN COMPLET", cleanDescription: "Wholemeal Bread Loaf", quantity: 1, unitPrice: 1.50, lineTotal: 1.50, category: "bakery", onPromotion: false, promotionSaving: 0 },
      { id: "i74", rawDescription: "LCL LAIT DEMI-ECR", cleanDescription: "Semi-Skimmed Milk 1L", quantity: 3, unitPrice: 0.95, lineTotal: 2.85, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i75", rawDescription: "LCL POULET CUISSE", cleanDescription: "Chicken Thighs 1kg", quantity: 1, unitPrice: 4.90, lineTotal: 4.90, category: "meat", onPromotion: false, promotionSaving: 0 },
      { id: "i76", rawDescription: "LCL EPINARDS FRAIS", cleanDescription: "Fresh Spinach 200g", quantity: 1, unitPrice: 1.80, lineTotal: 1.80, category: "fresh_produce", onPromotion: false, promotionSaving: 0 },
      { id: "i77", rawDescription: "LCL CREME FRAICHE", cleanDescription: "Crème Fraîche 200ml", quantity: 1, unitPrice: 1.40, lineTotal: 1.40, category: "dairy", onPromotion: false, promotionSaving: 0 },
      { id: "i78", rawDescription: "LCL JUS POMME 1L", cleanDescription: "Apple Juice 1L", quantity: 2, unitPrice: 1.50, lineTotal: 3.00, category: "beverages", onPromotion: false, promotionSaving: 0 },
    ],
  },
];

// Dashboard aggregated data
export const dashboardStats = {
  thisMonth: 342.80,
  budget: 500,
  budgetPercent: 69,
  saved: 24.60,
  receiptCount: 8,
};

export const categoryBreakdown = [
  { key: "dairy", label: "Dairy", amount: 68, color: "#6366F1" },
  { key: "meat", label: "Meat", amount: 82, color: "#F43F5E" },
  { key: "fresh_produce", label: "Fresh Produce", amount: 54, color: "#22C55E" },
  { key: "bakery", label: "Bakery", amount: 31, color: "#F59E0B" },
  { key: "processed_foods", label: "Processed Foods", amount: 47, color: "#8B5CF6" },
  { key: "household", label: "Household", amount: 38, color: "#06B6D4" },
  { key: "personal_care", label: "Personal Care", amount: 22, color: "#EC4899" },
];

export const weeklyTrend = [
  { week: "W1", amount: 42 },
  { week: "W2", amount: 38 },
  { week: "W3", amount: 56 },
  { week: "W4", amount: 44 },
  { week: "W5", amount: 62 },
  { week: "W6", amount: 35 },
  { week: "W7", amount: 48 },
  { week: "W8", amount: 52 },
];

export const europeanCountries = [
  "United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands",
  "Belgium", "Sweden", "Denmark", "Poland", "Austria", "Ireland",
  "Portugal", "Finland", "Norway", "Switzerland", "Czech Republic", "Romania",
];

export const currencies = [
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "PLN", symbol: "zł", label: "Polish Złoty" },
  { code: "SEK", symbol: "kr", label: "Swedish Krona" },
  { code: "DKK", symbol: "kr", label: "Danish Krone" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
  { code: "CZK", symbol: "Kč", label: "Czech Koruna" },
  { code: "RON", symbol: "lei", label: "Romanian Leu" },
];

// Admin data
export const adminStats = {
  totalUsers: 12480,
  receiptsToday: 342,
  failedScans: 8,
  activeUsers7d: 3251,
};

export const adminUsers = [
  { id: "u1", name: "Sarah Mitchell", email: "sarah.m@email.com", country: "United Kingdom", joined: "2024-09-15", receipts: 48, status: "Active" as const },
  { id: "u2", name: "Marcus Weber", email: "m.weber@email.de", country: "Germany", joined: "2024-10-02", receipts: 32, status: "Active" as const },
  { id: "u3", name: "Isabelle Dupont", email: "i.dupont@email.fr", country: "France", joined: "2024-10-18", receipts: 27, status: "Active" as const },
  { id: "u4", name: "Jan Kowalski", email: "j.kowalski@email.pl", country: "Poland", joined: "2024-11-05", receipts: 15, status: "Active" as const },
  { id: "u5", name: "Emma Johansson", email: "e.johansson@email.se", country: "Sweden", joined: "2024-11-20", receipts: 8, status: "Inactive" as const },
  { id: "u6", name: "Pietro Rossi", email: "p.rossi@email.it", country: "Italy", joined: "2024-12-01", receipts: 3, status: "Active" as const },
];

export const processingLogs = [
  { id: "log_001a", user: "Sarah Mitchell", scanMethod: "AI Vision" as const, status: "success" as const, model: "gpt-4o", processingTime: 1240, flaggedItems: 0, timestamp: d(0) + "T14:32:00Z" },
  { id: "log_002b", user: "Marcus Weber", scanMethod: "AI Vision" as const, status: "success" as const, model: "gpt-4o", processingTime: 980, flaggedItems: 1, timestamp: d(0) + "T13:15:00Z" },
  { id: "log_003c", user: "Isabelle Dupont", scanMethod: "OCR + AI" as const, status: "failed" as const, model: "gpt-4o-mini", processingTime: 3200, flaggedItems: 0, timestamp: d(0) + "T12:45:00Z" },
  { id: "log_004d", user: "Jan Kowalski", scanMethod: "AI Vision" as const, status: "success" as const, model: "gpt-4o", processingTime: 1100, flaggedItems: 0, timestamp: d(1) + "T09:20:00Z" },
  { id: "log_005e", user: "Emma Johansson", scanMethod: "OCR + AI" as const, status: "flagged" as const, model: "gpt-4o-mini", processingTime: 2100, flaggedItems: 3, timestamp: d(1) + "T08:05:00Z" },
];

export const adminCategories = CATEGORIES.map((c, i) => ({
  ...c,
  active: true,
  displayOrder: i + 1,
}));

export const receiptsPerDay = [
  { day: "Mon", count: 48 },
  { day: "Tue", count: 52 },
  { day: "Wed", count: 45 },
  { day: "Thu", count: 61 },
  { day: "Fri", count: 55 },
  { day: "Sat", count: 42 },
  { day: "Sun", count: 39 },
];
