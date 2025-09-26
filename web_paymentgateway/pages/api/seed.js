import dbConnect from "../../lib/dbConnect";
import Product from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  // Clear previous products
  await Product.deleteMany({});

const sample = [
  { 
    name: "Espresso", 
    description: "Strong black coffee", 
    price: 20000, 
    category: "Coffee", 
    image: "https://bubblebeecoffeehouse.ca/wp-content/uploads/2023/04/Expresso1.jpg" 
  },
  { 
    name: "Cappuccino", 
    description: "Coffee with steamed milk and foam", 
    price: 25000, 
    category: "Coffee", 
    image: "https://noir.web.id/wp-content/uploads/2022/04/jual-cappucino-terdekat.jpg" 
  },
  { 
    name: "Latte", 
    description: "Creamy milk coffee with a smooth finish", 
    price: 25000, 
    category: "Coffee", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Latte_with_winged_tulip_art.jpg/1200px-Latte_with_winged_tulip_art.jpg" 
  },
  { 
    name: "Mocha", 
    description: "Chocolate flavored coffee delight", 
    price: 27000, 
    category: "Coffee", 
    image: "https://gatherforbread.com/wp-content/uploads/2014/10/Dark-Chocolate-Mocha-Square.jpg" 
  },
  { 
    name: "Americano", 
    description: "Espresso diluted with hot water", 
    price: 22000, 
    category: "Coffee", 
    image: "https://mocktail.net/wp-content/uploads/2022/03/homemade-Iced-Americano-recipe_1.jpg" 
  },

  // Tea
  { name: "Green Tea", description: "Refreshing hot tea", price: 18000, category: "Tea", image: "https://hsph.harvard.edu/wp-content/uploads/2024/03/green-tea-1200x800-1.jpg" },
  { name: "Milk Tea", description: "Sweet tea with milk", price: 20000, category: "Tea", image: "https://worldlytreat.com/wp-content/uploads/2024/04/Tiger-milk-tea-3.jpg" },
  { name: "Chamomile Tea", description: "Relaxing floral tea", price: 21000, category: "Tea", image: "https://media.post.rvohealth.io/wp-content/uploads/2020/09/chamomile-tea-thumb.jpg" },

  // Milk-based drinks
  { name: "Banana Milk", description: "Fresh banana blended with milk", price: 20000, category: "Milk", image: "https://sixhungryfeet.com/wp-content/uploads/2024/01/Banana-Milk-Recipe-Vegan-4.jpg" },
  { name: "Chocolate Milk", description: "Rich chocolate blended with milk", price: 22000, category: "Milk", image: "https://www.asparkleofgenius.com/wp-content/uploads/2024/03/Whipped-Chocolate-Milk-735x735.png" },
  { name: "Strawberry Milk", description: "Fresh strawberry blended with milk", price: 22000, category: "Milk", image: "https://cookingformysoul.com/wp-content/uploads/2022/08/feat-strawberry-milk-min.jpg" },
  { name: "Honey Milk", description: "Milk with a touch of natural honey", price: 24000, category: "Milk", image: "https://www.liquor.com/thmb/l83gV7xA_vmOPcoYY8h5q5W4axw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/milk-and-honey-720x720-primary-e0e374745b8642d4ba2f90475c5dcbcd.jpg" },

  // Dessert
  { name: "Ice Cream", description: "Vanilla ice cream scoop", price: 15000, category: "Dessert", image: "https://carveyourcraving.com/wp-content/uploads/2021/06/chocolate-icecream-in-an-icecream-maker.jpg" },
  { name: "Chocolate Cake", description: "Rich chocolate cake slice", price: 30000, category: "Dessert", image: "https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/chelsweets.com/wp-content/uploads/2021/09/death-by-chocolate-cakev4-4-1024x1024.jpg" },
  { name: "Cheesecake", description: "Creamy cheesecake slice", price: 35000, category: "Dessert", image: "https://somebodyfeedseb.com/wp-content/uploads/2022/08/2022.10.21-Biscoff-Cheesecake-4344.jpg" },
  { name: "Macaron Set", description: "Colorful assorted macarons", price: 45000, category: "Dessert", image: "https://www.jordanwinery.com/wp-content/uploads/2020/04/French-Macaron-Cookie-Recipe-WebHero-6435.jpg" },
  { name: "Brownie", description: "Fudgy chocolate brownie", price: 18000, category: "Dessert", image: "https://www.recipetineats.com/tachyon/2020/03/Brownies_0-SQ.jpg" },

  // Smoothies / Shakes
  { name: "Strawberry Smoothie", description: "Fresh strawberry blended with milk", price: 25000, category: "Smoothies", image: "https://media.bluediamond.com/uploads/2023/01/24174916/Strawberry_Banana_Smoothie_sm.jpg" },
  { name: "Mango Smoothie", description: "Fresh mango blended with milk", price: 25000, category: "Smoothies", image: "https://www.purelykaylie.com/wp-content/uploads/2021/07/mango-banana-smoothie-3.jpg" },
  { 
    name: "Blueberry Smoothie", 
    description: "Fresh blueberries blended with milk for a refreshing taste", 
    price: 26000, 
    category: "Smoothies", 
    image: "https://www.allrecipes.com/thmb/mvAOZswlesIze_VZJ_kBp8QS1N4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/215184-blueberry-smoothie-ddmfs-0407-3x4-hero-2dc0563113084f1faea7ad1d7fe58d38.jpg" 
  },
];


  await Product.insertMany(sample);

  return res.status(201).json({ message: "Cafe menu seeded successfully" });
}
