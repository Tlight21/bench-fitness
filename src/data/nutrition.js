// Default nutrition plans keyed by phase ID
// GPP is the user's exact spec; other phases start as copies for editing

const GPP_MEALS = {
  mon: {
    dayOfWeek: 'mon',
    sessionType: 'gym-lower',
    targetKcal: 2850,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (scrambled)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:00', name: 'Lunch', highlight: 'pre', kcal: 750,
        items: [
          { name: 'Chicken breast', quantity: '200g' },
          { name: 'White rice', quantity: '160g' },
          { name: 'Roasted mixed veg', quantity: '150g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-training snack', highlight: 'pre', kcal: 100,
        items: [
          { name: 'Banana', quantity: '1 medium' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-training shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 600,
        items: [
          { name: 'Beef mince (5% fat)', quantity: '150g' },
          { name: 'Sweet potato', quantity: '200g' },
          { name: 'Broccoli', quantity: '100g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 330,
        items: [
          { name: 'Greek yoghurt', quantity: '200g' },
          { name: 'Mixed nuts', quantity: '30g' },
        ],
      },
    ],
  },
  tue: {
    dayOfWeek: 'tue',
    sessionType: 'track',
    targetKcal: 2730,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (scrambled)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:30', name: 'Lunch', highlight: 'pre', kcal: 670,
        items: [
          { name: 'Chicken breast', quantity: '180g' },
          { name: 'White rice', quantity: '150g' },
          { name: 'Roasted peppers & courgette', quantity: '120g' },
          { name: 'Olive oil', quantity: '1 tsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-track top-up', highlight: 'pre', kcal: 90,
        items: [
          { name: 'Banana', quantity: '1 medium' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-track shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 580,
        items: [
          { name: 'Salmon fillet', quantity: '180g' },
          { name: 'Sweet potato', quantity: '180g' },
          { name: 'Spinach', quantity: '80g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 320,
        items: [
          { name: 'Casein shake', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Frozen berries', quantity: '80g' },
        ],
      },
    ],
  },
  wed: {
    dayOfWeek: 'wed',
    sessionType: 'gym-upper',
    targetKcal: 2840,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (omelette)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:00', name: 'Lunch', highlight: 'pre', kcal: 720,
        items: [
          { name: 'Chicken breast', quantity: '200g' },
          { name: 'White rice', quantity: '150g' },
          { name: 'Roasted veg', quantity: '150g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-training snack', highlight: 'pre', kcal: 160,
        items: [
          { name: 'Rice cakes', quantity: '2' },
          { name: 'Peanut butter', quantity: '1 tbsp' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-training shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 560,
        items: [
          { name: 'Turkey mince', quantity: '150g' },
          { name: 'Sweet potato', quantity: '180g' },
          { name: 'Green beans', quantity: '100g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 330,
        items: [
          { name: 'Greek yoghurt', quantity: '200g' },
          { name: 'Mixed nuts', quantity: '30g' },
        ],
      },
    ],
  },
  thu: {
    dayOfWeek: 'thu',
    sessionType: 'track',
    targetKcal: 2740,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (scrambled)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:30', name: 'Lunch', highlight: 'pre', kcal: 670,
        items: [
          { name: 'Beef mince (5% fat)', quantity: '150g' },
          { name: 'White rice', quantity: '150g' },
          { name: 'Roasted peppers & onion', quantity: '120g' },
          { name: 'Olive oil', quantity: '1 tsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-track top-up', highlight: 'pre', kcal: 90,
        items: [
          { name: 'Banana', quantity: '1 medium' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-track shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 590,
        items: [
          { name: 'Salmon fillet', quantity: '180g' },
          { name: 'Sweet potato', quantity: '200g' },
          { name: 'Asparagus', quantity: '100g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 320,
        items: [
          { name: 'Casein shake', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Frozen berries', quantity: '80g' },
        ],
      },
    ],
  },
  fri: {
    dayOfWeek: 'fri',
    sessionType: 'gym-olympic',
    targetKcal: 2880,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (poached)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:00', name: 'Lunch', highlight: 'pre', kcal: 750,
        items: [
          { name: 'Chicken breast', quantity: '200g' },
          { name: 'White rice', quantity: '160g' },
          { name: 'Roasted courgette & tomatoes', quantity: '150g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-training snack', highlight: 'pre', kcal: 100,
        items: [
          { name: 'Banana', quantity: '1 medium' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-training shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 630,
        items: [
          { name: 'Beef mince (5% fat)', quantity: '180g' },
          { name: 'Sweet potato', quantity: '200g' },
          { name: 'Spinach', quantity: '80g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 330,
        items: [
          { name: 'Greek yoghurt', quantity: '200g' },
          { name: 'Mixed nuts', quantity: '30g' },
        ],
      },
    ],
  },
  sat: {
    dayOfWeek: 'sat',
    sessionType: 'gym-conditioning',
    targetKcal: 2760,
    meals: [
      {
        time: '07:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (any style)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '13:00', name: 'Lunch', highlight: 'pre', kcal: 720,
        items: [
          { name: 'Chicken breast', quantity: '200g' },
          { name: 'White rice', quantity: '150g' },
          { name: 'Roasted veg medley', quantity: '150g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '16:00', name: 'Pre-conditioning snack', highlight: 'pre', kcal: 100,
        items: [
          { name: 'Banana', quantity: '1 medium' },
          { name: 'Electrolyte drink', quantity: '500ml' },
        ],
      },
      {
        time: '19:30', name: 'Post-training shake', highlight: 'post', kcal: 350,
        items: [
          { name: 'Whey protein', quantity: '1 scoop (30g)' },
          { name: 'Whole milk', quantity: '300ml' },
          { name: 'Rice cakes', quantity: '2' },
        ],
      },
      {
        time: '20:30', name: 'Dinner', highlight: null, kcal: 570,
        items: [
          { name: 'Turkey mince', quantity: '150g' },
          { name: 'Sweet potato', quantity: '200g' },
          { name: 'Broccoli', quantity: '100g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 300,
        items: [
          { name: 'Cottage cheese', quantity: '200g' },
          { name: 'Mixed nuts', quantity: '30g' },
        ],
      },
    ],
  },
  sun: {
    dayOfWeek: 'sun',
    sessionType: 'rest',
    targetKcal: 2400,
    meals: [
      {
        time: '08:00', name: 'Breakfast', highlight: null, kcal: 720,
        items: [
          { name: 'Eggs (any style)', quantity: '4' },
          { name: 'Sourdough toast', quantity: '2 slices' },
          { name: 'Avocado', quantity: '1/2 medium' },
          { name: 'Orange juice', quantity: '200ml' },
        ],
      },
      {
        time: '12:00', name: 'Lunch', highlight: null, kcal: 620,
        items: [
          { name: 'Salmon fillet', quantity: '180g' },
          { name: 'White rice', quantity: '100g' },
          { name: 'Mixed salad & cucumber', quantity: '100g' },
          { name: 'Olive oil & lemon', quantity: '1 tbsp' },
        ],
      },
      {
        time: '15:00', name: 'Snack', highlight: null, kcal: 220,
        items: [
          { name: 'Greek yoghurt', quantity: '200g' },
          { name: 'Frozen berries', quantity: '80g' },
          { name: 'Honey', quantity: '1 tsp' },
        ],
      },
      {
        time: '19:00', name: 'Dinner', highlight: null, kcal: 550,
        items: [
          { name: 'Beef mince (5% fat)', quantity: '150g' },
          { name: 'Sweet potato', quantity: '160g' },
          { name: 'Green veg', quantity: '100g' },
          { name: 'Olive oil', quantity: '1 tbsp' },
        ],
      },
      {
        time: '22:00', name: 'Before bed', highlight: null, kcal: 290,
        items: [
          { name: 'Cottage cheese', quantity: '200g' },
          { name: 'Mixed nuts', quantity: '20g' },
        ],
      },
    ],
  },
}

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj))

// Build phase plans — GPP is the source, others start as copies
const buildPhaseDays = (meals) => {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return days.map(d => meals[d])
}

export const DEFAULT_NUTRITION = {
  gpp: { phase: 'gpp', days: buildPhaseDays(GPP_MEALS) },
  spp: { phase: 'spp', days: buildPhaseDays(clone(GPP_MEALS)) },
  precomp: { phase: 'precomp', days: buildPhaseDays(clone(GPP_MEALS)) },
  comp: { phase: 'comp', days: buildPhaseDays(clone(GPP_MEALS)) },
}
