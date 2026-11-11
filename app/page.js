import { query } from '@/lib/db';
import Link from 'next/link';

export default async function Home() {
  let products = [];
  try {
    const result = await query('SELECT * FROM products ORDER BY id DESC');
    products = result.rows;
  } catch (err) {
    console.log('Database not connected yet or tables missing.');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-md flex justify-between items-center px-8">
        <h1 className="text-2xl font-bold tracking-wide">🧸 KHELNA BAZAR</h1>
        <Link href="/admin" className="bg-white text-red-600 px-4 py-2 rounded font-semibold hover:bg-gray-100">
          Admin Panel
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12 px-8 text-center">
        <h2 className="text-4xl font-extrabold mb-2">Find the Best Toys for Your Kids!</h2>
        <p className="text-lg opacity-90">Explore our massive collection of fun, safe, and affordable toys.</p>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto p-8">
        <h3 className="text-xl font-bold mb-6 border-b pb-2">Featured Toys</h3>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found yet. Go to the Admin Panel to add some toys!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition">
                <img 
                  src={product.image_url || "https://via.placeholder.com/200"} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-semibold">{product.category}</span>
                <h4 className="font-bold text-lg mt-2">{product.name}</h4>
                <p className="text-red-600 font-extrabold text-xl mt-1">৳ {product.price}</p>
                <button className="w-full mt-4 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700">
                  Order Now
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}