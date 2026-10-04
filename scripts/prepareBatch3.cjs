const fs = require('fs');

const rawBatch3 = [
  // 1: Standard Sweets -> KEEP (1)
  {
    name: "Standard Sweets",
    short_description: "Century-old heritage sweet and savory restaurant in Chawri Bazar famous for Poori Chole in pure desi ghee and Nagori Halwa.",
    long_description: "Located on Hakim Baka Street in the heart of Chawri Bazar, Standard Sweets is a revered destination for authentic Old Delhi vegetarian breakfast and traditional confections. Featuring cozy indoor dining tables, it has delighted patrons for generations with its famous breakfast of crisp pooris paired with spicy Pindi chole, nagori halwa, and an extensive array of desi ghee sweets like Karachi halwa and sohan halwa.",
    cuisine_types: ["North Indian", "Pure Vegetarian", "Breakfast", "Sweets", "Thalis"],
    meal_types: ["Breakfast", "Lunch", "Snacks"],
    price_range: "₹₹",
    average_cost_for_two: 300,
    address_line1: "3510, Hakim Baka Street, Chawri Bazar, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6496,
    longitude: 77.2285,
    phone: "+91 98109 08690",
    opening_hours: "Monday - Sunday: 7:30 AM - 10:00 PM",
    facilities: ["Indoor Table Seating", "Air Conditioned Dining Area", "Takeout", "Bulk Sweet Gifting"],
    dietary_options: ["Pure Veg"],
    rating_avg: 3.9,
    rating_count: 720,
    cover_image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Puri Chole & Suji Halwa", "Nagori Halwa Plate", "Standard Naan Thali", "Kachori Pithi Wali", "Shahi Sohan Halwa"],
    menu_categories: [
      {
        category_name: "Heritage Breakfast & Combos",
        items: [
          { name: "Poori Chole & Suji Halwa Combo", description: "Crisp puffed pooris fried in pure desi ghee served with spicy Pindi chana, aloo sabzi, sweet suji halwa, and pickle", price: 120, dietary_tag: "Veg", spice_level: 3, portion_size: "2 Pooris + Halwa + Chole" },
          { name: "Nagori Halwa Plate", description: "Three crispy puffed semolina nagoris served with aromatic sooji halwa and spicy potato curry", price: 95, dietary_tag: "Veg", spice_level: 0, portion_size: "3 Nagoris + Halwa + Sabzi" },
          { name: "Chana Bhature Special", description: "Two golden bhaturas served with robustly spiced Punjabi chickpeas, onions, and green chillies", price: 130, dietary_tag: "Veg", spice_level: 3, portion_size: "2 Bhaturas + Chana" },
          { name: "Kachori Pithi Wali with Aloo Subzi", description: "Crisp flaky round kachoris stuffed with spiced dal pithi, drenched in steaming potato curry with mint and tamarind chutneys", price: 60, dietary_tag: "Veg", spice_level: 3, portion_size: "2 Pieces with Gravy" },
          { name: "Paneer Pakora", description: "Cottage cheese slice layered with mint chutney, coated in spiced gram flour batter and fried crisp", price: 45, dietary_tag: "Veg", spice_level: 1, portion_size: "Single Large Piece" },
          { name: "Aloo Samosa (Desi Ghee)", description: "Crisp golden triangle pastry with whole coriander potato filling, served with saunth chutney", price: 25, dietary_tag: "Veg", spice_level: 2, portion_size: "Single Piece" }
        ]
      },
      {
        category_name: "Lunch Thalis & Rice Combos",
        items: [
          { name: "Standard Naan Thali", description: "Dal Makhani, Shahi Paneer, seasonal vegetable, basmati pulao, boondi raita, salad, papad, sweet, and stuffed naan", price: 240, dietary_tag: "Veg", spice_level: 2, portion_size: "Full Thali Platter" },
          { name: "Chole Chawal Combo", description: "Pindi chole topped over fragrant basmati pulao rice, served with raw onion salad and mango pickle", price: 110, dietary_tag: "Veg", spice_level: 2, portion_size: "Bowl" },
          { name: "Rajma Jammu Wale with Rice", description: "Rich red kidney bean curry cooked with traditional spices over steamed rice", price: 110, dietary_tag: "Veg", spice_level: 2, portion_size: "Bowl" }
        ]
      },
      {
        category_name: "Traditional Desi Ghee Sweets & Halwas",
        items: [
          { name: "Moong Dal Halwa (Desi Ghee)", description: "Slow-roasted yellow moong dal with khoya, cardamom, and pure ghee", price: 120, dietary_tag: "Veg", spice_level: 0, portion_size: "100g Bowl" },
          { name: "Shahi Sohan Halwa (Special)", description: "Dense, crisp, brittle caramelised disc confection loaded with almonds, pistachios, and saffron", price: 160, dietary_tag: "Veg", spice_level: 0, portion_size: "100g Disc" },
          { name: "Karachi Halwa (Cornflour)", description: "Translucent chewy jelly sweet made with pure ghee, sugar, and toasted cashews", price: 110, dietary_tag: "Veg", spice_level: 0, portion_size: "100g" },
          { name: "Special Mawa Pinni (Urad Dal)", description: "Signature Punjabi winter confection of roasted urad dal, mawa, ghee, and mixed dry fruits", price: 130, dietary_tag: "Veg", spice_level: 0, portion_size: "100g (2 Pieces)" },
          { name: "Shahi Imarti", description: "Geometric floral urad dal fritter fried in desi ghee and steeped in saffron syrup", price: 60, dietary_tag: "Veg", spice_level: 0, portion_size: "Single Piece" },
          { name: "Kesar Rasmalai (2 Pieces)", description: "Cottage cheese discs swimming in rich saffron and cardamom reduced milk", price: 90, dietary_tag: "Veg", spice_level: 0, portion_size: "2 Pieces" },
          { name: "Balushahi (Desi Ghee)", description: "Flaky glazed disc pastry with crisp layered texture soaked in cardamom syrup", price: 90, dietary_tag: "Veg", spice_level: 0, portion_size: "2 Pieces (100g)" },
          { name: "Kala Jamun (Round)", description: "Dark caramelised mawa dumplings stuffed with saffron and nuts", price: 60, dietary_tag: "Veg", spice_level: 0, portion_size: "2 Pieces" },
          { name: "Dodha Barfi (Rich Milk)", description: "Chewy Punjabi sprouted wheat and milk fudge loaded with cashews", price: 120, dietary_tag: "Veg", spice_level: 0, portion_size: "100g" },
          { name: "Kaju Katli Special", description: "Diamond-shaped cashew nut fudge garnished with pure silver foil", price: 180, dietary_tag: "Veg", spice_level: 0, portion_size: "100g" },
          { name: "Milk Cake (Alwar Style)", description: "Caramelised granular reduced milk cake with rich browned core", price: 110, dietary_tag: "Veg", spice_level: 0, portion_size: "100g" }
        ]
      },
      {
        category_name: "Traditional Beverages",
        items: [
          { name: "Sweet Malai Lassi", description: "Thick curd whipped with kewda water and sugar, topped with dense fresh malai", price: 65, dietary_tag: "Veg", spice_level: 0, portion_size: "Glass (300ml)" },
          { name: "Kesar Pista Badam Milk", description: "Boiled saffron-infused full-cream milk topped with pistachios and crushed almonds", price: 80, dietary_tag: "Veg", spice_level: 0, portion_size: "Glass (250ml)" }
        ]
      },
      {
        category_name: "Traditional Namkeens & Snacks",
        items: [
          { name: "Dal Biji Special", description: "Crispy fried gram flour strands mixed with melon seeds and cantaloupe seeds in special spices", price: 80, dietary_tag: "Veg", spice_level: 2, portion_size: "200g Pack" },
          { name: "Kashmiri Mixture", description: "Mild sweet-savory mixture with puffed rice, roasted cashews, and raisins", price: 85, dietary_tag: "Veg", spice_level: 1, portion_size: "200g Pack" },
          { name: "Aloo Laccha (Spicy)", description: "Ultra-thin potato crisps seasoned with rock salt and red chilli powder", price: 70, dietary_tag: "Veg", spice_level: 2, portion_size: "200g Pack" }
        ]
      }
    ]
  },
  // NOTE: 2nd place was Haji Mohd. Hussain -> EXCLUDED AS INSTRUCTED!
  // 3: Manohar Dhaba -> KEEP (2)
  {
    name: "Manohar Dhaba",
    short_description: "Famous 1949 establishment in Lajpat Rai Market renowned for inventing Delhi's unique layered Japani Samosa.",
    long_description: "Operating since 1949 along Diwan Hall Road in Lajpat Rai Market, Manohar Dhaba is an enduring institution for innovative Old Delhi snacks. It is famous nationwide for the 'Japani Samosa'—a multi-layered, puff-pastry samosa baked in desi ghee and served beneath a hearty ladle of spicy Punjabi chole and pickled onions. The dhaba also features seated dining serving chole bhature, kulchas, and tandoori naans.",
    cuisine_types: ["North Indian", "Pure Vegetarian", "Street Food", "Snacks"],
    meal_types: ["Breakfast", "Lunch", "Snacks"],
    price_range: "₹",
    average_cost_for_two: 180,
    address_line1: "Shop 38, 240, Diwan Hall Rd, Lajpat Rai Market, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6558,
    longitude: 77.2359,
    phone: "+91 98101 86175",
    opening_hours: "Monday - Sunday: 9:00 AM - 9:00 PM",
    facilities: ["Indoor Table Seating", "Outdoor Covered Seating", "Takeout", "Quick Service"],
    dietary_options: ["Pure Veg"],
    rating_avg: 3.6,
    rating_count: 1000,
    cover_image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Japani Samosa with Chole", "Chole Bhature", "Paneer Naan with Gravy", "Amritsari Kulcha", "Lassi"],
    menu_categories: [
      {
        category_name: "Specialty Samosas & Snacks",
        items: [
          { name: "The Famous Japani Samosa (2 Pieces with Chole)", description: "Sixty-layer flaky, puff-pastry samosa stuffed with spiced potato and lentils, drowned in spicy pindi chole and raw onion rings", price: 80, dietary_tag: "Veg", spice_level: 3, portion_size: "2 Samosas with Gravy" },
          { name: "Single Japani Samosa with Chole", description: "Single piece of the legendary layered flaky samosa served with hot chickpea curry", price: 40, dietary_tag: "Veg", spice_level: 3, portion_size: "1 Samosa with Chole" },
          { name: "Chole Bhature (Special Plate)", description: "Two golden puffed bhaturas served with spicy dark chickpeas, pickled amla, and onions", price: 90, dietary_tag: "Veg", spice_level: 3, portion_size: "2 Bhaturas with Chole" }
        ]
      },
      {
        category_name: "Tandoori Naans & Kulchas",
        items: [
          { name: "Paneer Stuffed Naan with Dal & Chole", description: "Clay-oven baked naan stuffed with seasoned paneer, served with dal makhani, chole, and raita", price: 120, dietary_tag: "Veg", spice_level: 2, portion_size: "Single Naan Thali" },
          { name: "Aloo Pyaz Amritsari Kulcha Thali", description: "Crisp flaky kulcha stuffed with spiced potato and onion, served with chole and tamarind chutney", price: 100, dietary_tag: "Veg", spice_level: 2, portion_size: "Single Kulcha Thali" },
          { name: "Sweet Lassi (Glass)", description: "Hand churned creamy sweet yogurt drink in a tall glass", price: 50, dietary_tag: "Veg", spice_level: 0, portion_size: "Glass (250ml)" },
          { name: "Stuffed Tandoori Parantha with Chole", description: "Clay-oven baked whole wheat paratha stuffed with spiced potatoes and onions, served with chole", price: 90, dietary_tag: "Veg", spice_level: 2, portion_size: "1 Paratha with Chole" },
          { name: "Salted Masala Chaach", description: "Spiced churned buttermilk with roasted cumin and mint", price: 30, dietary_tag: "Veg", spice_level: 1, portion_size: "Glass (250ml)" }
        ]
      }
    ]
  },
  // 4: Noora Nihari -> KEEP (3)
  {
    name: "Noora Nihari",
    short_description: "Legendary morning and evening pit-oven nihari institution in Bara Hindu Rao simmering rich desi ghee shank stew.",
    long_description: "Operating for generations in the Pahari Dhiraj neighbourhood of Bara Hindu Rao, Noora Nihari is regarded as a sacred pilgrimage for traditional beef and mutton nihari aficionados. Patrons arrive before 7:00 AM and again in the late afternoon to secure seats in its rustic seated dining room. Shank meat is slow-cooked overnight with bone marrow and clarified butter, served bubbling hot with fresh green chillies and warm tandoori rotis.",
    cuisine_types: ["Mughlai", "Traditional Nihari", "Heritage", "Street Food"],
    meal_types: ["Breakfast", "Dinner"],
    price_range: "₹",
    average_cost_for_two: 220,
    address_line1: "Pahari Dhiraj, Gali Bahuji, Bara Hindu Rao, Sadar Bazar",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6601,
    longitude: 77.2089,
    phone: "+91 99535 22481",
    opening_hours: "Monday - Sunday: 6:30 AM - 9:00 AM, 5:30 PM - 8:30 PM (Until Sold Out)",
    facilities: ["Indoor Floor & Bench Seating", "Takeout", "Quick Service", "Iconic Clay Pot"],
    dietary_options: ["Halal"],
    rating_avg: 4.2,
    rating_count: 2409,
    cover_image_url: "https://images.unsplash.com/photo-1545247181-516773cae754?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Desi Ghee Nihari", "Nalli Nihari", "Beef Nihari", "Khamiri Roti", "Magaz Portion"],
    menu_categories: [
      {
        category_name: "Pit-Oven Slow Cooked Nihari",
        items: [
          { name: "Noora Special Desi Ghee Nihari (Full Plate)", description: "Shank meat stewed for 8+ hours in clay pit oven, enriched with desi ghee rogan and julienned ginger", price: 140, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Full Plate (Serves 1-2)" },
          { name: "Noora Special Desi Ghee Nihari (Half Plate)", description: "Single portion of rich spiced broth with meltingly tender beef shank meat", price: 80, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Half Plate" },
          { name: "Nalli Nihari (with Extra Bone Marrow)", description: "Nihari bowl enriched with molten bone marrow poured fresh from roasted bone shafts", price: 180, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Full Plate with Nalli" },
          { name: "Magaz (Brain Topping)", description: "Tender boiled brain portion added to the steaming nihari curry", price: 70, dietary_tag: "Non-veg", spice_level: 2, portion_size: "Portion" }
        ]
      },
      {
        category_name: "Tandoori Breads",
        items: [
          { name: "Khamiri Tandoori Roti", description: "Thick sourdough leavened bread baked on the hot clay walls of the tandoor", price: 10, dietary_tag: "Veg", spice_level: 0, portion_size: "1 Piece" },
          { name: "Tandoori Wheat Roti", description: "Crisp whole wheat flatbread", price: 8, dietary_tag: "Veg", spice_level: 0, portion_size: "1 Piece" },
          { name: "Extra Rogan Fat Portion", description: "Extra rich spiced clarified fat and broth reduction ladle", price: 25, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Bowl" },
          { name: "Hot Spiced Tea", description: "Strong morning milk tea brewed with ginger and cardamom", price: 15, dietary_tag: "Veg", spice_level: 0, portion_size: "Cup" }
        ]
      }
    ]
  },
  // 5: Hotel Hilal -> KEEP (4)
  {
    name: "Hotel Hilal",
    short_description: "Atmospheric side-street hotel in Matia Mahal famed for morning Paya, Nalli Nihari, and Brain Curry.",
    long_description: "Situated in the historic lanes of Matia Mahal near Jama Masjid, Hotel Hilal is a cherished local haunt for hearty Mughlai breakfasts and dinners. The clean, straightforward dining room features comfortable tables and attentive service. Foodies praise its unpretentious, deeply flavorful nalli nihari and slow-simmered trotters (paya), paired with soft khamiri rotis.",
    cuisine_types: ["Mughlai", "Traditional Paya & Nihari", "North Indian"],
    meal_types: ["Breakfast", "Dinner", "Late Night"],
    price_range: "₹₹",
    average_cost_for_two: 300,
    address_line1: "965, Matia Mahal Rd, Kalan Mehal, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6504,
    longitude: 77.2349,
    phone: "+91 85889 40038",
    opening_hours: "Monday - Sunday: 7:00 AM - 12:00 PM, 6:00 PM - 12:30 AM",
    facilities: ["Indoor Table Seating", "High-Grade Family Seating", "Takeout", "Late Night Dining"],
    dietary_options: ["Halal"],
    rating_avg: 3.8,
    rating_count: 256,
    cover_image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Nalli Nihari", "Mutton Paya", "Brain Curry (Bheja)", "Mutton Korma", "Khamiri Roti"],
    menu_categories: [
      {
        category_name: "Heritage Morning & Evening Specialties",
        items: [
          { name: "Nalli Nihari (Full Plate)", description: "Tender meat shank cooked in rich bone marrow reduction with ginger matchsticks and chillies", price: 160, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Full Plate (Serves 1-2)" },
          { name: "Nalli Nihari (Quarter Plate)", description: "Budget single portion of tender meat and rich rogan gravy", price: 70, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Quarter Plate" },
          { name: "Mutton Paya (Slow Cooked Trotters)", description: "Traditional goat trotters stewed overnight in a gelatinous, aromatic broth with cracked black pepper", price: 180, dietary_tag: "Non-veg", spice_level: 2, portion_size: "Bowl (Serves 1-2)" },
          { name: "Brain Curry (Bheja Masala)", description: "Fresh mutton brain simmered in spicy tomato, onion, and cumin gravy", price: 160, dietary_tag: "Non-veg", spice_level: 3, portion_size: "Plate" },
          { name: "Mutton Korma Gravy", description: "Classic Old Delhi red korma prepared with browned onions and curd", price: 180, dietary_tag: "Non-veg", spice_level: 2, portion_size: "Bowl (Serves 1-2)" },
          { name: "Chicken Korma Gravy", description: "Slow cooked chicken in rich red onion and yogurt curry", price: 150, dietary_tag: "Non-veg", spice_level: 2, portion_size: "Serves 1-2" },
          { name: "Extra Bone Marrow Nalli", description: "Extra portion of soft roasted marrow poured over nihari", price: 50, dietary_tag: "Non-veg", spice_level: 2, portion_size: "Marrow Serving" }
        ]
      },
      {
        category_name: "Tandoori Breads",
        items: [
          { name: "Khamiri Roti", description: "Traditional thick sourdough bread with soft spongy crumb", price: 12, dietary_tag: "Veg", spice_level: 0, portion_size: "1 Piece" },
          { name: "Rumali Roti", description: "Thin flatbread cooked over inverted dome tawa", price: 10, dietary_tag: "Veg", spice_level: 0, portion_size: "1 Piece" }
        ]
      }
    ]
  },
  // NOTE: 6th place was Zahra Restaurant & Café -> EXCLUDED AS INSTRUCTED!
  // 7: Bishan Swaroop Chaat -> KEEP (5)
  {
    name: "Bishan Swaroop Chaat",
    short_description: "50-year-old hidden gem on Chandni Chowk road celebrated for tangy pan-fried Aloo Chaat and Kachalu Chaat.",
    long_description: "Hidden down a quiet alcove near Haldiram on main Chandni Chowk road, Bishan Swaroop Chaat has operated since the 1970s. It features a traditional wooden counter with clean indoor bench seating. The master chaat maker shallow-fries boiled potato cubes on a large flat tawa, tossing them vigorously in a metal bowl with diced kachalu (taro root), fresh lemon juice, cumin, red chili, and ginger matchsticks—free of heavy commercial sauces.",
    cuisine_types: ["Chaat", "North Indian Street Food", "Pure Vegetarian"],
    meal_types: ["Breakfast", "Lunch", "Snacks"],
    price_range: "₹",
    average_cost_for_two: 120,
    address_line1: "1421, Main Road, near Haldiram, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6567,
    longitude: 77.2305,
    phone: "+91 98183 64070",
    opening_hours: "Monday - Sunday: 11:30 AM - 8:30 PM",
    facilities: ["Indoor Bench Seating", "Quick Dining", "Takeout", "Cash & UPI Payments"],
    dietary_options: ["Pure Veg", "Vegan Options", "Gluten-Free Options"],
    rating_avg: 3.8,
    rating_count: 342,
    cover_image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Crispy Aloo Chaat", "Kachalu Chaat", "Aloo Kachalu Mix Chaat", "Fresh Seasonal Fruit Chaat"],
    menu_categories: [
      {
        category_name: "Signature Heritage Chaat",
        items: [
          { name: "Special Tawa Crispy Aloo Chaat", description: "Boiled potato cubes shallow-fried crisp on flat tawa, tossed with black salt, cumin, dried ginger, and lemon juice", price: 50, dietary_tag: "Vegan", spice_level: 3, portion_size: "Dona / Bowl" },
          { name: "Kachalu (Taro Root) Chaat", description: "Sliced taro root tossed in spicy homemade chaat masala and fresh sour lemon juice", price: 60, dietary_tag: "Vegan", spice_level: 3, portion_size: "Bowl" },
          { name: "Aloo Kachalu Mix Chaat", description: "Crisp fried potato cubes and soft tart kachalu combined with green chillies and ginger slivers", price: 60, dietary_tag: "Vegan", spice_level: 3, portion_size: "Bowl" },
          { name: "Fresh Seasonal Mixed Fruit Chaat", description: "Diced seasonal fruits (apples, bananas, guava, cucumber) tossed in tangy lemon chaat masala", price: 70, dietary_tag: "Vegan", spice_level: 1, portion_size: "Bowl" },
          { name: "Roasted Shakarkandi (Sweet Potato) Chaat", description: "Charcoal roasted sweet potato cubes tossed with rock salt, amchur, and fresh lemon juice", price: 60, dietary_tag: "Vegan", spice_level: 2, portion_size: "Bowl" },
          { name: "Kala Khatta Lemon Soda", description: "Refreshing sparkling soda with black plum concentrate, cumin, and mint", price: 40, dietary_tag: "Vegan", spice_level: 1, portion_size: "Glass (250ml)" }
        ]
      }
    ]
  },
  // 8: Haryana Paneer Bhandar -> KEEP (6)
  {
    name: "Haryana Paneer Bhandar",
    short_description: "Prominent dairy and vegetarian kitchen on Church Mission Road famous for fresh paneer pakoras, samosas, and soya chaap.",
    long_description: "Established for decades on Church Mission Road near Fatehpuri Chowk, Haryana Paneer Bhandar is a cornerstone dairy and hot snack institution. Featuring indoor table seating and high snack counters, it prepares piping-hot snacks throughout the day using freshly made dairy paneer and pure ghee, including paneer-stuffed samosas, bread pakoras, and tandoori soya chaap curries.",
    cuisine_types: ["Dairy", "Fast Food", "North Indian Snacks", "Pure Vegetarian"],
    meal_types: ["Breakfast", "Lunch", "Snacks"],
    price_range: "₹",
    average_cost_for_two: 180,
    address_line1: "Shop No: 18, Church Mission Rd, Bagh Deewar, Fatehpuri, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6578,
    longitude: 77.2238,
    phone: "+91 11 2393 4763",
    opening_hours: "Monday - Sunday: 8:00 AM - 10:00 PM",
    facilities: ["Indoor Seating", "Counter Service", "Takeout", "Fresh Dairy Retail"],
    dietary_options: ["Pure Veg"],
    rating_avg: 3.9,
    rating_count: 100,
    cover_image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Stuffed Paneer Bread Pakora", "Paneer Samosa", "Malai Soya Chaap", "Sweet Lassi", "Fresh Malai Paneer"],
    menu_categories: [
      {
        category_name: "Hot Snacks & Pakoras",
        items: [
          { name: "Stuffed Paneer Bread Pakora", description: "Large bread pakora stuffed with thick fresh malai paneer slab and green chutney, fried golden", price: 40, dietary_tag: "Veg", spice_level: 1, portion_size: "Single Large Piece" },
          { name: "Desi Ghee Paneer Samosa", description: "Crispy samosa filled with diced paneer, green peas, and whole spices, served with tamarind chutney", price: 30, dietary_tag: "Veg", spice_level: 2, portion_size: "Single Piece" },
          { name: "Paneer Cutlet", description: "Crumb-coated potato and paneer patty seasoned with herbs and fried crisp", price: 35, dietary_tag: "Veg", spice_level: 2, portion_size: "Single Piece" },
          { name: "Fresh Malai Paneer (Per 250g)", description: "Freshly coagulated whole milk cottage cheese, ultra soft and creamy", price: 110, dietary_tag: "Veg", spice_level: 0, portion_size: "250g Block" },
          { name: "Masala Paneer Cubes (Ready to Eat)", description: "Fresh raw paneer cubes sprinkled with chaat masala and black pepper", price: 60, dietary_tag: "Veg", spice_level: 1, portion_size: "100g Plate" }
        ]
      },
      {
        category_name: "Soya Chaap & Dairy Delights",
        items: [
          { name: "Malai Soya Chaap (Roasted)", description: "Tandoori soya chaap marinated in rich cashew cream and roasted till tender", price: 140, dietary_tag: "Veg", spice_level: 1, portion_size: "Platter" },
          { name: "Masala Soya Chaap Gravy", description: "Spicy tomato and onion gravy with tender soya chaap chunks", price: 150, dietary_tag: "Veg", spice_level: 3, portion_size: "Bowl" },
          { name: "Special Sweet Malai Lassi", description: "Rich churned yogurt drink topped with thick dairy malai in a glass", price: 50, dietary_tag: "Veg", spice_level: 0, portion_size: "Glass (250ml)" }
        ]
      }
    ]
  },
  // NOTE: 9th place was Zahid Biryani Wale -> EXCLUDED AS INSTRUCTED!
  // 10: Marwadi Bhojnalaya -> KEEP (7)
  {
    name: "Marwadi Bhojnalaya",
    short_description: "Heritage pure vegetarian Rajasthani dining hall in Khari Baoli serving authentic unlimited Marwadi thalis.",
    long_description: "Situated at Peeli Kothi near Khari Baoli in Chandni Chowk, Marwadi Bhojnalaya has catered to spice merchants, travelers, and traditional families for decades. It features comfortable air-cooled indoor community dining tables where guests are served authentic home-style Marwadi food prepared without excessive grease, including unlimited thalis of Dal Baati Churma, Gatta curry, Kadhi Pakoda, and ghee-brushed phulkas.",
    cuisine_types: ["Rajasthani", "North Indian", "Pure Vegetarian", "Thalis"],
    meal_types: ["Lunch", "Dinner"],
    price_range: "₹",
    average_cost_for_two: 250,
    address_line1: "Peeli Kothi, Shyama Prasad Mukherjee Marg, Khari Baoli, Chandni Chowk",
    city: "Old Delhi, New Delhi",
    state: "Delhi",
    pincode: "110006",
    latitude: 28.6582,
    longitude: 77.2215,
    phone: "+91 11 2395 8741",
    opening_hours: "Monday - Sunday: 11:30 AM - 10:30 PM",
    facilities: ["Indoor Table Seating", "Traditional Sit-down Dining", "Takeout", "Cash & Digital Payments"],
    dietary_options: ["Pure Veg", "Jain Friendly"],
    rating_avg: 4.4,
    rating_count: 40,
    cover_image_url: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1000&auto=format&fit=crop&q=80",
    known_for_dishes: ["Special Marwadi Thali", "Dal Baati Churma", "Gatta Curry", "Rajasthani Kadhi", "Desi Ghee Phulka"],
    menu_categories: [
      {
        category_name: "Authentic Marwadi Thalis & Curries",
        items: [
          { name: "Special Marwadi Bhoj Thali (Unlimited Refills)", description: "Authentic platter of Gatta Curry, Dal Tadka, Rajasthani Kadhi, seasonal dry subzi, steamed rice, 4 desi ghee phulkas, papad, and sweet churma", price: 160, dietary_tag: "Veg", spice_level: 2, portion_size: "Full Thali (Unlimited Curries)" },
          { name: "Dal Baati Churma Special", description: "Two crisp baked wheat baatis soaked in desi ghee, served with Panchmel spicy dal and sweetened jaggery churma", price: 140, dietary_tag: "Veg", spice_level: 2, portion_size: "2 Baatis + Dal + Churma" },
          { name: "Gatta Curry with 4 Phulkas", description: "Steamed gram flour dumplings in spiced yogurt and coriander gravy served with hot rotis", price: 110, dietary_tag: "Veg", spice_level: 2, portion_size: "Curry Bowl + 4 Phulkas" },
          { name: "Rajasthani Kadhi Pakoda with Rice", description: "Tangy fenugreek and mustard tempered yogurt kadhi with crisp besan pakodas over steamed rice", price: 100, dietary_tag: "Veg", spice_level: 2, portion_size: "Bowl" },
          { name: "Sweet Jaggery Churma Bowl", description: "Crushed wheat bread cooked with pure desi ghee and cardamom jaggery", price: 60, dietary_tag: "Veg", spice_level: 0, portion_size: "Bowl (100g)" },
          { name: "Desi Masala Chaach (Glass)", description: "Traditional churned buttermilk with roasted cumin, rock salt, and mint", price: 25, dietary_tag: "Veg", spice_level: 1, portion_size: "Glass (250ml)" },
          { name: "Besan Gatta Pulao", description: "Aromatic basmati rice prepared with spiced gram flour gattas and whole cumin", price: 100, dietary_tag: "Veg", spice_level: 2, portion_size: "Plate" },
          { name: "Desi Ghee Phulka (Set of 4)", description: "Whole wheat puffed thin rotis brushed with pure clarified butter", price: 40, dietary_tag: "Veg", spice_level: 0, portion_size: "4 Rotis" }
        ]
      }
    ]
  }
];

console.log('Approved 7 restaurants to add:', rawBatch3.length);
fs.writeFileSync('scripts/batch3_7Cafes.json', JSON.stringify(rawBatch3, null, 2), 'utf8');
