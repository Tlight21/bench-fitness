// Store mapping for each ingredient
const STORE_MAP = {
  // Lidl
  'Eggs (scrambled)': 'Lidl', 'Eggs (omelette)': 'Lidl', 'Eggs (poached)': 'Lidl', 'Eggs (any style)': 'Lidl',
  'Chicken breast': 'Lidl', 'Beef mince (5% fat)': 'Lidl', 'Turkey mince': 'Lidl', 'Salmon fillet': 'Lidl',
  'Greek yoghurt': 'Lidl', 'Cottage cheese': 'Lidl', 'Whole milk': 'Lidl',
  'Sweet potato': 'Lidl', 'White rice': 'Lidl',
  'Roasted mixed veg': 'Lidl', 'Roasted veg': 'Lidl', 'Roasted veg medley': 'Lidl',
  'Roasted peppers & courgette': 'Lidl', 'Roasted peppers & onion': 'Lidl',
  'Roasted courgette & tomatoes': 'Lidl',
  'Broccoli': 'Lidl', 'Spinach': 'Lidl', 'Green beans': 'Lidl', 'Asparagus': 'Lidl', 'Green veg': 'Lidl',
  'Mixed salad & cucumber': 'Lidl',
  'Frozen berries': 'Lidl',
  'Avocado': 'Lidl', 'Banana': 'Lidl',
  'Mixed nuts': 'Lidl',
  'Olive oil': 'Lidl', 'Olive oil & lemon': 'Lidl',
  // Sainsbury's
  'Sourdough toast': "Sainsbury's",
  'Rice cakes': "Sainsbury's",
  'Orange juice': "Sainsbury's",
  'Peanut butter': "Sainsbury's",
  'Honey': "Sainsbury's",
  'Electrolyte drink': "Sainsbury's",
  // Online
  'Whey protein': 'Online',
  'Casein shake': 'Online',
}

// Normalise egg variants into one item
const normaliseItem = (name) => {
  if (name.startsWith('Eggs')) return 'Eggs'
  if (name === 'Sourdough toast') return 'Sourdough loaf'
  if (name === 'Olive oil & lemon') return 'Olive oil'
  return name
}

// Parse quantity to extract numeric value
const parseQty = (qty) => {
  const match = qty.match(/([\d./]+)/)
  if (!match) return 1
  if (match[1].includes('/')) {
    const [a, b] = match[1].split('/')
    return Number(a) / Number(b)
  }
  return Number(match[1])
}

// Get unit from quantity string
const getUnit = (qty, name) => {
  if (/scoop/i.test(qty)) return 'scoops'
  if (/slice/i.test(qty)) return 'slices'
  if (/tbsp/i.test(qty)) return 'tbsp'
  if (/tsp/i.test(qty)) return 'tsp'
  if (/ml/i.test(qty)) return 'ml'
  if (/\d+g/i.test(qty)) return 'g'
  if (/medium|large/i.test(qty)) return ''
  return ''
}

// Pack size rounding
const PACK_SIZES = {
  'Eggs': { size: 30, unit: '', label: '30-pack' },
  'Chicken breast': { size: 700, unit: 'g', label: '700g pack' },
  'Beef mince (5% fat)': { size: 500, unit: 'g', label: '500g pack' },
  'Turkey mince': { size: 500, unit: 'g', label: '500g pack' },
  'Salmon fillet': { size: 180, unit: 'g', label: 'fillet' },
  'Greek yoghurt': { size: 500, unit: 'g', label: '500g pot' },
  'Cottage cheese': { size: 300, unit: 'g', label: '300g pot' },
  'Whole milk': { size: 1136, unit: 'ml', label: '2-pint' },
  'Sweet potato': { size: 1000, unit: 'g', label: '1kg bag' },
  'White rice': { size: 1000, unit: 'g', label: '1kg bag' },
  'Frozen berries': { size: 500, unit: 'g', label: '500g bag' },
  'Avocado': { size: 1, unit: '', label: '' },
  'Banana': { size: 1, unit: '', label: '' },
  'Mixed nuts': { size: 500, unit: 'g', label: '500g bag' },
  'Olive oil': { size: 750, unit: 'ml', label: '750ml bottle' },
  'Sourdough loaf': { size: 1, unit: '', label: 'loaf' },
  'Rice cakes': { size: 15, unit: '', label: 'pack' },
  'Orange juice': { size: 1000, unit: 'ml', label: '1L carton' },
  'Peanut butter': { size: 1, unit: '', label: 'jar' },
  'Honey': { size: 1, unit: '', label: 'jar' },
  'Electrolyte drink': { size: 12, unit: '', label: 'pack' },
  'Whey protein': { size: 1, unit: '', label: '1kg bag' },
  'Casein shake': { size: 1, unit: '', label: '1kg bag' },
}

export function generateShoppingList(phasePlan) {
  if (!phasePlan || !phasePlan.days) return []

  // Aggregate all items across 7 days
  const agg = {}

  phasePlan.days.forEach(day => {
    day.meals.forEach(meal => {
      meal.items.forEach(item => {
        const normName = normaliseItem(item.name)
        const qty = parseQty(item.quantity)
        const unit = getUnit(item.quantity, item.name)

        if (!agg[normName]) {
          agg[normName] = { totalQty: 0, unit, store: STORE_MAP[item.name] || 'Lidl' }
        }
        agg[normName].totalQty += qty
      })
    })
  })

  // Group by store
  const stores = {
    'Lidl': [],
    "Sainsbury's": [],
    'Online': [],
  }

  Object.entries(agg).forEach(([name, { totalQty, unit, store }]) => {
    const pack = PACK_SIZES[name]
    let displayQty
    if (pack && pack.size > 1) {
      const packs = Math.ceil(totalQty / pack.size)
      displayQty = packs === 1 ? `1 × ${pack.label}` : `${packs} × ${pack.label}`
    } else if (pack && pack.label) {
      displayQty = totalQty > 1 ? `${Math.ceil(totalQty)} × ${pack.label}` : `1 ${pack.label}`
    } else if (unit) {
      displayQty = `${Math.ceil(totalQty)}${unit}`
    } else {
      displayQty = `${Math.ceil(totalQty)}`
    }

    const s = stores[store] || stores['Lidl']
    s.push({ name, quantity: displayQty, checked: false })
  })

  return [
    { name: 'Lidl', items: stores['Lidl'] },
    { name: "Sainsbury's", items: stores["Sainsbury's"] },
    { name: 'Online', items: stores['Online'] },
  ]
}

export const DEFAULT_SHOPPING = {
  weekStartDate: null,
  resetDay: 'Sunday',
  stores: [],
}
