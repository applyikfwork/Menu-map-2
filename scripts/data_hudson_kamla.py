# Hudson Lane & Kamla Nagar North Campus Data
import json

# We will populate the restaurants from the user prompt
VENUES_BATCH_1 = [
  {
    "official_name": "QD's Restaurant",
    "category_ambience": "Iconic Indo-Chinese, Tandoori & Multi-Cuisine Student Diner",
    "seating_capacity_size": "Large (100–120 seats across two floors)",
    "full_offline_address": "2520, 1st & 2nd Floor, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Opposite Laxmi Dairy / 200m from GTB Nagar Metro Station Gate 4",
    "phone_number": "+91 11 4559 9777",
    "opening_hours": "11:30 AM – 11:00 PM, all days",
    "average_cost_for_two": 650,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Two Dining Floors, High-Speed WiFi, Comfortable Booth Seating, Fast Table Service, Digital Payments",
    "signature_dishes": [
      "Original Tandoori Chicken Momos",
      "Tandoori Veg Paneer Momos",
      "Crispy Chilli Potatoes",
      "QD's Sizzling Chocolate Walnut Brownie"
    ],
    "menu_breakdown": {
      "Handcrafted Beverages & Signature Coolers": [
        {"dish_name": "Classic Mint Virgin Mojito", "price": 139, "type": "Veg", "description": "Crushed fresh mint sprigs, lime chunks, and demerara sugar topped with chilled sparkling club soda."},
        {"dish_name": "QD's Special Thick Cold Coffee", "price": 149, "type": "Veg", "description": "Dark roasted espresso blended with whole cream milk and chocolate fudge drizzle."},
        {"dish_name": "Oreo Crunch Thick Shake", "price": 169, "type": "Veg", "description": "Blended vanilla ice cream, whole milk, and crushed Oreo cookies with chocolate ganache."}
      ],
      "The Original Tandoori Momos & Starters": [
        {"dish_name": "Original Tandoori Chicken Momos (6 Pcs)", "price": 249, "type": "Non-Veg", "description": "Legendary clay-oven roasted chicken dumplings basted in fiery tandoori masala and lemon butter."},
        {"dish_name": "Tandoori Veg Paneer Momos (6 Pcs)", "price": 219, "type": "Veg", "description": "Charcoal grilled cottage cheese dumplings with spiced curd marinade and mint chutney."},
        {"dish_name": "Crispy Chilli Honey Potatoes", "price": 189, "type": "Veg", "description": "Double-fried finger potatoes coated in sesame honey chilli glaze and spring onions."}
      ],
      "Wok Fried Noodles, Rice & Chinese Platters": [
        {"dish_name": "QD's Special Hakka Noodles with Chicken", "price": 239, "type": "Non-Veg", "description": "Wok-tossed noodles with shredded chicken, crunchy cabbage, bell peppers, and light soy."},
        {"dish_name": "Chilli Garlic Veg Fried Rice", "price": 199, "type": "Veg", "description": "Fragrant long-grain rice stir-fried with burnt garlic, scallions, and garden vegetables."}
      ],
      "Italian Pastas & Oven Pizzas": [
        {"dish_name": "Creamy Alfredo Penne Veg", "price": 259, "type": "Veg", "description": "Penne pasta folded in rich garlic butter, fresh cream, and shredded parmesan."},
        {"dish_name": "Tandoori Chicken Tikka Pizza (10 Inch)", "price": 349, "type": "Non-Veg", "description": "Hand-stretched crust topped with spicy roasted chicken, red onion rings, and mozzarella."},
        {"dish_name": "Farmhouse Supreme Veggie Pizza (10 Inch)", "price": 319, "type": "Veg", "description": "Loaded with mushrooms, sweet golden corn, crunchy capsicum, and melted mozzarella."}
      ],
      "Sizzlers, Brownies & Desserts": [
        {"dish_name": "QD's Sizzling Chocolate Walnut Brownie", "price": 189, "type": "Veg", "description": "Warm walnut fudge brownie served on a cast-iron sizzler with vanilla ice cream and hot chocolate."},
        {"dish_name": "Nutella Belgian Waffle", "price": 199, "type": "Veg", "description": "Freshly baked malt grid waffle generously layered with warm Nutella and toasted almonds."}
      ]
    }
  },
  {
    "official_name": "The Hudson Cafe",
    "category_ambience": "Vintage European Floral Cafe & Multi-Cuisine Student Bistro",
    "seating_capacity_size": "Large (75–90 seats)",
    "full_offline_address": "2524, 1st Floor, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Beside Laxmi Dairy / 150m from GTB Nagar Metro Station Gate 4",
    "phone_number": "+91 11 4702 1733",
    "opening_hours": "11:00 AM – 11:00 PM, all days",
    "average_cost_for_two": 750,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Vintage Floral Mirrors, Plush Velvet Seating, High-Speed Free WiFi, Power Sockets for Laptops, Digital Payments",
    "signature_dishes": [
      "Hudson Signature Lasagne",
      "Mushroom & Cheese Cigar Rolls",
      "Fiery Red Sauce Penne Arrabiata",
      "Red Velvet Monster Shake"
    ],
    "menu_breakdown": {
      "Signature Shakes, Coolers & Coffees": [
        {"dish_name": "Red Velvet Monster Shake", "price": 209, "type": "Veg", "description": "Rich crimson cocoa shake blended with cream cheese frosting and topped with red velvet cake crumbles."},
        {"dish_name": "Belgian Chocolate Ganache Frappe", "price": 189, "type": "Veg", "description": "Chilled double-shot espresso whipped with dark melted chocolate and fresh dairy milk."},
        {"dish_name": "Wild Berry Iced Tea", "price": 149, "type": "Veg", "description": "Slow-brewed black tea infused with forest raspberries, blackberries, lemon juice, and mint."}
      ],
      "Artisanal Burgers, Finger Starters & Fries": [
        {"dish_name": "Mushroom & Cheese Cigar Rolls (6 Pcs)", "price": 229, "type": "Veg", "description": "Crisp flaky spring roll sheets stuffed with sautéed wild mushrooms and molten mozzarella."},
        {"dish_name": "Hudson Crispy Chicken Burger", "price": 259, "type": "Non-Veg", "description": "Buttermilk-brined fried chicken breast with pickled jalapeños and herb aioli in a brioche bun."},
        {"dish_name": "Peri Peri Cheesy Crinkle Fries", "price": 189, "type": "Veg", "description": "Deep-fried crinkle cut potatoes dusted with peri peri chili and smothered in warm cheddar cheese sauce."}
      ],
      "Gourmet Pizzas & Oven-Baked Pastas": [
        {"dish_name": "Hudson Signature Baked Chicken Lasagne", "price": 349, "type": "Non-Veg", "description": "Tender layers of pasta sheets stacked with seasoned minced chicken bolognese, béchamel, and melted cheese."},
        {"dish_name": "Quattro Formaggi Four Cheese Pizza", "price": 349, "type": "Veg", "description": "Thin crust baked with mozzarella, english cheddar, gouda, and aged parmesan with fresh basil."}
      ],
      "Continental Mains & Rice Specialties": [
        {"dish_name": "Grilled Lemon Rosemary Chicken Breast", "price": 389, "type": "Non-Veg", "description": "Succulent pan-seared chicken breast served with garlic mashed potatoes, butter greens, and pepper sauce."},
        {"dish_name": "Cottage Cheese Steak Sizzler", "price": 349, "type": "Veg", "description": "Herb marinated paneer slab served sizzling on buttered cilantro rice with grilled tomato and fries."}
      ],
      "Decadent Crepes, Waffles & Desserts": [
        {"dish_name": "Classic New York Blueberry Cheesecake", "price": 239, "type": "Veg", "description": "Silky baked cream cheese slice over buttery graham cracker crust topped with wild blueberry compote."},
        {"dish_name": "Sizzling Brownie with Vanilla Bean Gelato", "price": 209, "type": "Veg", "description": "Warm dark cocoa walnut brownie served sizzling on cast iron under hot chocolate fudge."}
      ]
    }
  },
  {
    "official_name": "Big Yellow Door (BYD)",
    "category_ambience": "Cult Iconic Student Bistro & Casual Comfort Diner",
    "seating_capacity_size": "Medium (~65 seats)",
    "full_offline_address": "2521, 2nd Floor, Kingsway Camp, Hudson Lane, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Opposite NDPL Office / Beside Laxmi Dairy, Hudson Lane",
    "phone_number": "+91 97173 92123",
    "opening_hours": "11:00 AM – 11:00 PM, all days",
    "average_cost_for_two": 600,
    "price_range": "₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Asymmetrical Iconic Yellow Door, Cozy Wooden Benches, Fast Dining Service, Free WiFi, Digital Payments",
    "signature_dishes": [
      "BYD Cheese Bomb Burger",
      "Baked Cheesy Nachos Grande",
      "Pink Sauce Pasta Mamma Rosa",
      "Rocky Road Thick Shake"
    ],
    "menu_breakdown": {
      "Signature Shakes, Frappes & Coolers": [
        {"dish_name": "Rocky Road Thick Shake", "price": 179, "type": "Veg", "description": "Decadent chocolate shake loaded with brownie crumbles, roasted peanuts, and mini marshmallows."},
        {"dish_name": "BYD Special Hazelnut Cold Coffee", "price": 149, "type": "Veg", "description": "Freshly pulled espresso whipped with ice-cold milk, vanilla, and roasted hazelnut syrup."},
        {"dish_name": "Kit Kat Chocolate Shake", "price": 169, "type": "Veg", "description": "Rich whole milk shake blended with crunchy Kit Kat bars and chocolate syrup."}
      ],
      "Iconic Burgers, Sandwiches & Loaded Starters": [
        {"dish_name": "The Famous BYD Cheese Bomb Burger", "price": 189, "type": "Veg", "description": "Crispy seasoned vegetable patty stuffed with a molten cheese center that bursts on the first bite."},
        {"dish_name": "Baked Cheesy Nachos Grande", "price": 199, "type": "Veg", "description": "Tortilla chips loaded with refried beans, pico de gallo, jalapeños, and baked cheese crust."},
        {"dish_name": "Grilled BBQ Chicken Burger", "price": 219, "type": "Non-Veg", "description": "Juicy chicken patty basted in smoky barbecue glaze topped with grilled onions and cheddar."}
      ],
      "Fresh Dough Pizzas & Baked Pastas": [
        {"dish_name": "Pink Sauce Pasta Mamma Rosa Veg", "price": 239, "type": "Veg", "description": "Penne pasta tossed in an exquisite blend of rich dairy cream and tangy marinara with Italian herbs."},
        {"dish_name": "BYD Special Smoked Chicken Pizza (9 Inch)", "price": 319, "type": "Non-Veg", "description": "Crisp thin crust topped with smoked chicken morsels, jalapeños, bell peppers, and mozzarella."}
      ],
      "Desserts & Sweet Endings": [
        {"dish_name": "Nutella Chocolate Overload Waffle", "price": 179, "type": "Veg", "description": "Golden-baked Belgian waffle covered in thick Nutella spread and crunchy chocolate pearls."},
        {"dish_name": "Hot Chocolate Walnut Brownie with Ice Cream", "price": 159, "type": "Veg", "description": "Fudgy warm chocolate brownie topped with a scoop of vanilla ice cream and warm fudge."}
      ]
    }
  },
  {
    "official_name": "By The Bay",
    "category_ambience": "Beach-Themed Coastal Lounge with Paddle Pool Seating",
    "seating_capacity_size": "Large (80–100 seats)",
    "full_offline_address": "2522, 1st Floor, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Near Laxmi Dairy / 200m from GTB Nagar Metro Station Gate 4",
    "phone_number": "+91 99994 48232",
    "opening_hours": "11:30 AM – 11:30 PM, all days",
    "average_cost_for_two": 950,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Novelty Water Paddle Pool Tables, Swing Chairs, Full Bar Setup, Free WiFi, Digital Payments",
    "signature_dishes": [
      "Coastal Butter Garlic Prawns",
      "Bay Special Seafood Platter",
      "Cocktail Chicken Tikka",
      "Coconut Palm Cooler"
    ],
    "menu_breakdown": {
      "Coastal Mocktails & Tropical Coolers": [
        {"dish_name": "Coconut Palm Cooler", "price": 169, "type": "Veg", "description": "Tender coconut water blended with pineapple nectar, mint leaves, and lime juice."},
        {"dish_name": "Bay Breeze Cranberry Sparkler", "price": 159, "type": "Veg", "description": "Chilled cranberry and grapefruit juice topped with lemon-lime soda and crushed ice."}
      ],
      "Coastal Starters & Seafood Bites": [
        {"dish_name": "Coastal Butter Garlic Prawns", "price": 389, "type": "Non-Veg", "description": "Juicy king prawns pan-tossed in garlic butter, white pepper, and fresh parsley."},
        {"dish_name": "Cocktail Chicken Tikka Skewers", "price": 299, "type": "Non-Veg", "description": "Clay oven charred chicken morsels basted in a tangy cocktail tandoori marinade."}
      ],
      "Italian Pastas & Seaside Pizzas": [
        {"dish_name": "Seafood Marinara Spaghetti", "price": 399, "type": "Non-Veg", "description": "Spaghetti tossed with prawns, calamari rings, and crushed tomato garlic sauce with herbs."},
        {"dish_name": "Classic Margherita Bocconcini", "price": 319, "type": "Veg", "description": "Crushed plum tomato sauce base, fresh bocconcini cheese, and fresh torn basil."}
      ],
      "Tropical Desserts & Sizzling Delights": [
        {"dish_name": "Sizzling Chocolate Walnut Brownie", "price": 219, "type": "Veg", "description": "Decadent chocolate brownie served sizzling with vanilla ice cream and dark chocolate fudge."}
      ]
    }
  },
  {
    "official_name": "Indus Flavour",
    "category_ambience": "Pure Vegetarian North Indian & Mughlai Fine Diner",
    "seating_capacity_size": "Medium (~60 seats)",
    "full_offline_address": "2510, Ground Floor, Kingsway Camp, Hudson Lane, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Near GTB Nagar Metro Station Gate 4 / Opposite Laxmi Dairy",
    "phone_number": "+91 92666 04953",
    "opening_hours": "11:30 AM – 11:30 PM, all days",
    "average_cost_for_two": 700,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": True,
    "dining_facilities": "Air Conditioned, 100% Pure Vegetarian Kitchen, Elegant Fairy-Lit Dining Hall, High Chairs, Digital Payments",
    "signature_dishes": [
      "Indus Dal Makhani Fondue",
      "Dahi Ke Sholey",
      "Paneer Makhani Tandoori Momos",
      "Matka Phirni"
    ],
    "menu_breakdown": {
      "Traditional Mocktails & Royal Chhach": [
        {"dish_name": "Shahi Rose Gulkand Shake", "price": 159, "type": "Veg", "description": "Thick sweetened milk blended with organic rose petal preserves and crushed almonds."},
        {"dish_name": "Spiced Matka Buttermilk (Chhach)", "price": 89, "type": "Veg", "description": "Churned yogurt tempered with roasted cumin, rock salt, fresh mint, and ginger."}
      ],
      "Royal Vegetarian Tandoori Starters": [
        {"dish_name": "Dahi Ke Sholey (4 Pcs)", "price": 239, "type": "Veg", "description": "Golden crisp bread rolls stuffed with seasoned spiced hung curd, bell peppers, and coriander."},
        {"dish_name": "Paneer Malai Peshawari Tikka", "price": 269, "type": "Veg", "description": "Creamy cottage cheese cubes marinated in cashew nut paste, double cream, and cardamom."}
      ],
      "Fusion Gravy Momos & Platters": [
        {"dish_name": "Paneer Makhani Tandoori Momos (6 Pcs)", "price": 239, "type": "Veg", "description": "Clay oven grilled paneer dumplings simmered in rich creamy tomato butter gravy."},
        {"dish_name": "Indus Royal Veg Kebab Platter", "price": 369, "type": "Veg", "description": "Assortment of paneer tikka, dahi ke sholey, malai chaap, and stuffed mushrooms with mint dip."}
      ],
      "Pure Veg Mughlai Gravies & Tandoori Breads": [
        {"dish_name": "Indus Dal Makhani Fondue", "price": 289, "type": "Veg", "description": "Overnight slow-simmered velvety black lentils served fondue-style with mini butter naans."},
        {"dish_name": "Paneer Lababdar", "price": 299, "type": "Veg", "description": "Soft cottage cheese chunks cooked in rich tomato gravy enriched with grated paneer and butter."}
      ],
      "Traditional Indian Desserts": [
        {"dish_name": "Matka Kesar Pista Phirni", "price": 119, "type": "Veg", "description": "Creamy ground rice pudding slow-reduced with milk, saffron, cardamom, and pistachios in clay pot."},
        {"dish_name": "Gulab Jamun with Rabri", "price": 139, "type": "Veg", "description": "Hot khoya dumplings served over a bed of thick chilled saffron-scented rabri."}
      ]
    }
  },
  {
    "official_name": "Woodbox Cafe",
    "category_ambience": "Rustic Industrial Wood-Themed Student Cafe",
    "seating_capacity_size": "Medium (~55 seats)",
    "full_offline_address": "2521, 1st Floor, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi, 110009",
    "nearby_landmark": "Near Big Yellow Door / Hudson Lane Market, GTB Nagar",
    "phone_number": "+91 93505 07004",
    "opening_hours": "11:00 AM – 11:00 PM, all days",
    "average_cost_for_two": 650,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Upcycled Wooden Interiors, Cozy Nooks, Free WiFi, Digital Payments",
    "signature_dishes": [
      "Herb Chicken Platter",
      "Flying Saucer Pizza",
      "Caramel Kit Kat Shake",
      "Cheesy Garlic Breadsticks"
    ],
    "menu_breakdown": {
      "Monster Shakes, Coolers & Iced Brews": [
        {"dish_name": "Caramel Kit Kat Freak Shake", "price": 189, "type": "Veg", "description": "Monster thick milkshake blended with Kit Kat bars, golden caramel syrup, and whipped cream."},
        {"dish_name": "Woodbox Iced Cold Coffee", "price": 139, "type": "Veg", "description": "Strong blended iced coffee topped with chocolate syrup drizzle and cocoa powder."}
      ],
      "Giant Platters & Finger Starters": [
        {"dish_name": "Woodbox Herb Chicken Platter", "price": 349, "type": "Non-Veg", "description": "Generous platter of herb grilled chicken strips, crispy wings, onion rings, fries, and dip."},
        {"dish_name": "Cheesy Garlic Breadsticks with Dip", "price": 179, "type": "Veg", "description": "Freshly baked dough breadsticks loaded with herb garlic butter and molten mozzarella."}
      ],
      "Signature Flying Saucer Pizzas": [
        {"dish_name": "Flying Saucer Chicken Pizza", "price": 369, "type": "Non-Veg", "description": "Double-decker pizza crust stuffed with cheese and chicken, topped with spiced toppings."},
        {"dish_name": "Flying Saucer Veg Supreme Pizza", "price": 329, "type": "Veg", "description": "Two crisp crusts layered with cheese sauce, topped with mushrooms, corn, capsicum, and olives."}
      ],
      "Waffles, Pancakes & Desserts": [
        {"dish_name": "Nutella Banana Belgian Waffle", "price": 189, "type": "Veg", "description": "Warm crispy grid waffle topped with pure Nutella spread and fresh banana slices."},
        {"dish_name": "Sizzling Chocolate Walnut Brownie", "price": 179, "type": "Veg", "description": "Fudgy warm chocolate brownie served on a sizzler plate with vanilla ice cream."}
      ]
    }
  },
  {
    "official_name": "Cafeteria & Co.",
    "category_ambience": "Continental, Mexican & Italian Multi-Cuisine Aesthetic Bistro",
    "seating_capacity_size": "Large (100–120 seats)",
    "full_offline_address": "G-14, Hudson Lane, Kingsway Camp, GTB Nagar, New Delhi, Delhi, 110033",
    "nearby_landmark": "Near GTB Nagar Metro Station Gate 4 / Beside Laxmi Dairy",
    "phone_number": "+91 70428 68704",
    "opening_hours": "11:30 AM – 11:30 PM, all days",
    "average_cost_for_two": 850,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, High-Speed Free WiFi, Digital Payments, Valet Parking, Family Seating Area",
    "signature_dishes": [
      "Peri Peri Chicken Tikka",
      "Fajita Spiced Loaded Fries",
      "Caramel Nut Brownie Sundae",
      "Texas BBQ Burger"
    ],
    "menu_breakdown": {
      "Handcrafted Coffees & Artisanal Shakes": [
        {"dish_name": "Tiramisu Shake", "price": 189, "type": "Veg", "description": "Rich espresso blended with mascarpone cream and dusting of Belgian cocoa."},
        {"dish_name": "Iced Hazelnut Latte", "price": 169, "type": "Veg", "description": "Chilled slow-drip espresso over milk infused with roasted hazelnut syrup."}
      ],
      "Artisanal Burgers, Wraps & Loaded Fries": [
        {"dish_name": "Fajita Spiced Loaded Fries", "price": 219, "type": "Veg", "description": "Crisp skin-on fries tossed in Mexican spices topped with jalapeño cheese sauce."},
        {"dish_name": "Texas BBQ Cottage Cheese Burger", "price": 249, "type": "Veg", "description": "Charred paneer steak coated in smoky barbecue sauce in a brioche bun."}
      ],
      "Gourmet Pizzas & Hand-Rolled Pastas": [
        {"dish_name": "Peri Peri Chicken Tikka Pizza", "price": 389, "type": "Non-Veg", "description": "Wood-style thin crust loaded with spiced tandoori chicken chunks and mozzarella."},
        {"dish_name": "Truffled Wild Mushroom Alfredo", "price": 349, "type": "Veg", "description": "Penne pasta in a velvety parmesan garlic cream sauce scented with truffle oil."}
      ],
      "Gourmet Crepes, Waffles & Desserts": [
        {"dish_name": "Caramel Nut Brownie Sundae", "price": 249, "type": "Veg", "description": "Warm walnut fudge brownie served with vanilla bean gelato and salted caramel."},
        {"dish_name": "Nutella Banana Belgian Waffle", "price": 239, "type": "Veg", "description": "Crispy malt waffle smothered in melted Nutella and caramelized banana slices."}
      ]
    }
  },
  {
    "official_name": "Echoes Living Room",
    "category_ambience": "Inclusive Social Theme Cafe & Youth Lounge",
    "seating_capacity_size": "Large (80–90 seats)",
    "full_offline_address": "1st Floor, 2520, Hudson Lane, Kingsway Camp, GTB Nagar, New Delhi, Delhi, 110033",
    "nearby_landmark": "Next to Hudson Cafe / 200m from GTB Nagar Metro Station",
    "phone_number": "+91 98990 60655",
    "opening_hours": "11:00 AM – 11:30 PM, all days",
    "average_cost_for_two": 800,
    "price_range": "₹₹",
    "city": "North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Dedicated Sign-Language Bell System, Free WiFi, Cozy Sofa Booths, Group Dining Tables",
    "signature_dishes": [
      "Living Room Chicken Tandoori Momos",
      "Classic Woodfired Garlic Bread",
      "Indonesian Chilli Paneer",
      "Iconic Dragon Cheese Spring Rolls"
    ],
    "menu_breakdown": {
      "Handcrafted Beverages & Signature Coolers": [
        {"dish_name": "Kala Khatta Chuski Slush", "price": 159, "type": "Veg", "description": "Tangy blackberry cumin blend crushed over shaved ice with chat masala."},
        {"dish_name": "Ferrero Rocher Decadence Shake", "price": 219, "type": "Veg", "description": "Hazelnut chocolate shake topped with whole Ferrero Rocher and whipped cream."}
      ],
      "Fusion Starters, Momos & Appetizers": [
        {"dish_name": "Living Room Chicken Tandoori Momos", "price": 259, "type": "Non-Veg", "description": "Char-roasted minced chicken dumplings marinated in spicy yogurt tandoori masala."},
        {"dish_name": "Classic Woodfired Garlic Bread", "price": 179, "type": "Veg", "description": "Crusty baguette slices toasted with herb garlic butter and melted mozzarella."}
      ],
      "Italian Pastas & Oven-Baked Pizzas": [
        {"dish_name": "Baked Chicken Lasagne", "price": 339, "type": "Non-Veg", "description": "Layered pasta sheets packed with minced chicken bolognese, bechamel, and cheese."},
        {"dish_name": "Paneer Makhani Fusion Pizza", "price": 319, "type": "Veg", "description": "Crisp crust topped with rich makhani gravy, marinated paneer, and peppers."}
      ],
      "Desserts & Sweet Indulgences": [
        {"dish_name": "Sizzling Brownie with Ice Cream", "price": 229, "type": "Veg", "description": "Fudgy walnut brownie sizzling on a hot cast iron skillet under warm fudge."}
      ]
    }
  },
  {
    "official_name": "Momo's Point",
    "category_ambience": "Legendary Indo-Chinese & Tibetan Student Diner",
    "seating_capacity_size": "Medium (~50 seats)",
    "full_offline_address": "47 UA, Block UA, Jawahar Nagar, Kamla Nagar, New Delhi, Delhi, 110007",
    "nearby_landmark": "Near Hansraj College Road / Kolhapur Road Market",
    "phone_number": "+91 88513 30111",
    "opening_hours": "11:00 AM – 10:30 PM, all days",
    "average_cost_for_two": 500,
    "price_range": "₹",
    "city": "Kamla Nagar, North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Cozy Booths, Multi-Cuisine Chinese & Tibetan Specials, Fast Service, Digital Payments",
    "signature_dishes": [
      "Butter Chicken Momos",
      "Crispy Chilly Potato Dry",
      "Steamed Pork & Chicken Momos",
      "Mafia Mojito"
    ],
    "menu_breakdown": {
      "Authentic Steamed & Fried Tibetan Momos": [
        {"dish_name": "Steamed Chicken Momos (8 Pcs)", "price": 169, "type": "Non-Veg", "description": "Delicate handmade flour parcels stuffed with juicy seasoned chicken and scallions."},
        {"dish_name": "Steamed Veg Paneer Momos (8 Pcs)", "price": 149, "type": "Veg", "description": "Thin-wrapper steamed dumplings filled with grated paneer and herbs."}
      ],
      "Famous Fusion & Gravy Momos": [
        {"dish_name": "Legendary Butter Chicken Momos", "price": 239, "type": "Non-Veg", "description": "Fried chicken momos generously coated in rich, creamy Delhi-style butter chicken gravy."},
        {"dish_name": "Paneer Makhani Gravy Momos", "price": 209, "type": "Veg", "description": "Fried paneer momos drenched in sweet and creamy tomato cashew gravy."}
      ],
      "Indo-Chinese Noodles, Rice & Starters": [
        {"dish_name": "Crispy Chilly Potato Dry", "price": 159, "type": "Veg", "description": "Crisp fried potato fingers tossed with green chilies, onions, and spicy dark soy."},
        {"dish_name": "Chicken Hakka Noodles", "price": 189, "type": "Non-Veg", "description": "Wok-fried egg noodles with shredded chicken, crunchy carrots, and cabbage."}
      ]
    }
  },
  {
    "official_name": "Bille Di Hatti",
    "category_ambience": "70-Year Heritage North Indian Breakfast & Pure Veg Diner",
    "seating_capacity_size": "Medium (~40 seats)",
    "full_offline_address": "72-D, Kamla Nagar, New Delhi, Delhi, 110007",
    "nearby_landmark": "Near Kamla Nagar Clock Tower (Ghanta Ghar) / Behind Bunglow Road",
    "phone_number": "+91 98106 67788",
    "opening_hours": "7:00 AM – 9:00 PM, all days",
    "average_cost_for_two": 300,
    "price_range": "₹",
    "city": "Kamla Nagar, North Campus, Delhi",
    "is_pure_veg": True,
    "dining_facilities": "Air Conditioned Indoor Seating, Traditional Dining Tables, Quick Counter Service, Pure Vegetarian Kitchen",
    "signature_dishes": [
      "Signature Puri Chole Plate",
      "Giant Kulhad Sweet Lassi",
      "Special Bedmi Poori with Aloo Sabzi",
      "Hot Gulab Jamun"
    ],
    "menu_breakdown": {
      "Traditional Punjabi Lassi & Beverages": [
        {"dish_name": "Bille Di Special Giant Kulhad Sweet Lassi", "price": 80, "type": "Veg", "description": "Thick hand-churned sweet yogurt served in heavy earthen kulhad, topped with a thick slab of malai."},
        {"dish_name": "Salted Roasted Jeera Chhach", "price": 40, "type": "Veg", "description": "Refreshing buttermilk seasoned with roasted cumin powder, black salt, and fresh mint."}
      ],
      "Iconic Puris & Chole Combos": [
        {"dish_name": "Signature Puri Chole Plate (2 Puris)", "price": 90, "type": "Veg", "description": "Piping hot fluffy wheat puris served with robust, dark spiced Punjabi chickpeas and spicy pickle."},
        {"dish_name": "Crispy Bedmi Poori with Hing Wale Aloo", "price": 90, "type": "Veg", "description": "Urad dal stuffed crispy wheat puris served with hot tangy asafoetida potato curry and methi chutney."}
      ],
      "Heritage Desi Ghee Sweets": [
        {"dish_name": "Desi Ghee Hot Gulab Jamun (2 Pcs)", "price": 60, "type": "Veg", "description": "Soft khoya milk dumplings fried in pure clarified butter and soaked in rose cardamom syrup."}
      ]
    }
  },
  {
    "official_name": "Ricos - Kamla Nagar",
    "category_ambience": "Iconic Continental & American Student Diner",
    "seating_capacity_size": "Medium (~60 seats)",
    "full_offline_address": "24, Block UA, Jawahar Nagar, Kamla Nagar, Delhi, 110007",
    "nearby_landmark": "Near Gauri Nursing Home / Near Spark Mall, Kamla Nagar",
    "phone_number": "+91 93117 75853",
    "opening_hours": "11:00 AM – 11:00 PM, all days",
    "average_cost_for_two": 750,
    "price_range": "₹₹",
    "city": "Kamla Nagar, North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Wooden Booths, Free WiFi, Extensive Beverage Bar, Fast Casual Dining",
    "signature_dishes": [
      "Pita Pocket with Hummus",
      "Godfather Burger",
      "Waffle Tower with Maple",
      "Ricos Special Platter"
    ],
    "menu_breakdown": {
      "Gourmet Milkshakes & Cold Brews": [
        {"dish_name": "Ricos Special Mud Cake Shake", "price": 185, "type": "Veg", "description": "Rich dark chocolate cake blended directly into creamy milkshake with fudge."},
        {"dish_name": "Classic Hazelnut Cold Coffee", "price": 155, "type": "Veg", "description": "Strong chilled espresso whipped with milk and aromatic roasted hazelnut syrup."}
      ],
      "American Burgers & Artisan Sandwiches": [
        {"dish_name": "The Godfather Chicken Burger", "price": 255, "type": "Non-Veg", "description": "Double grilled chicken patties topped with melted cheddar, and fried egg."},
        {"dish_name": "Pita Pockets with Hummus & Falafel", "price": 225, "type": "Veg", "description": "Fresh warm pita stuffed with crisp falafels, pickled veggies, and tahini dip."}
      ],
      "Gourmet Waffles, Pancakes & Desserts": [
        {"dish_name": "The Waffle Tower with Maple & Ice Cream", "price": 225, "type": "Veg", "description": "Triple stacked Belgian waffles with maple syrup, whipped cream, and vanilla scoop."},
        {"dish_name": "New York Blueberry Cheesecake", "price": 215, "type": "Veg", "description": "Classic baked cream cheesecake finished with wild blueberry compote."}
      ]
    }
  },
  {
    "official_name": "Charcha",
    "category_ambience": "Experimental Swing Seating Cafe & Cocktail/Coffee Bistro",
    "seating_capacity_size": "Medium (~40 seats)",
    "full_offline_address": "Plot No. 38, Bungalow Road, opposite Amitabh banquet hall, Kamla Nagar, Delhi, 110007",
    "nearby_landmark": "Opposite Amitabh Banquet Hall / Near Delhi University North Campus",
    "phone_number": "+91 11 4701 4287",
    "opening_hours": "11:00 AM – 1:00 AM, all days",
    "average_cost_for_two": 800,
    "price_range": "₹₹",
    "city": "Kamla Nagar, North Campus, Delhi",
    "is_pure_veg": False,
    "dining_facilities": "Air Conditioned, Quirky Swing Seating, Outdoor Garden Area, Free WiFi, Digital Payments",
    "signature_dishes": [
      "Bhut Jolokia Spicy Momos",
      "Baked Mushroom Mix Sauce Pasta",
      "Disco Delight Pizza",
      "Charcha Dessert Platter"
    ],
    "menu_breakdown": {
      "Handcrafted Coffees & Experimental Coolers": [
        {"dish_name": "Charcha Hazelnut Iced Frappe", "price": 169, "type": "Veg", "description": "Double shot espresso blended with chilled milk and roasted hazelnut syrup."},
        {"dish_name": "Watermelon Basil Cooler", "price": 149, "type": "Veg", "description": "Fresh crushed watermelon with fragrant sweet basil and sparkling soda."}
      ],
      "Fiery Starters & Finger Bites": [
        {"dish_name": "Bhut Jolokia Fiery Steamed Momos", "price": 229, "type": "Veg", "description": "Vegetable dumplings glazed in ghost pepper chili sauce (extra spicy)."},
        {"dish_name": "Crispy Loaded Cheese Nachos", "price": 209, "type": "Veg", "description": "Corn tortilla chips layered with molten cheddar, jalapeños, and salsa."}
      ],
      "Signature Thin-Crust Pizzas": [
        {"dish_name": "Disco Delight Cheese Pizza (10 Inch)", "price": 319, "type": "Veg", "description": "Thin crust topped with mozzarella, spicy paneer chunks, and bell peppers."},
        {"dish_name": "Smoked Chicken & Onion Pizza", "price": 369, "type": "Non-Veg", "description": "Topped with herb-smoked chicken shreds, caramelized onions, and cheese."}
      ]
    }
  }
]
