import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function addProduct(formData) {
  'use server';
  const name = formData.get('name');
  const price = formData.get('price');
  const category = formData.get('category');
  const image_url = formData.get('image_url');

  await query(
    'INSERT INTO products (name, price, category, image_url) VALUES ($1, $2, $3, $4)',
    [name, price, category, image_url]
  );
  revalidatePath('/');
  revalidatePath('/admin');
}

export default async function AdminPanel() {
  let products = [];
  try {
    const result = await query('SELECT * FROM products ORDER BY id DESC');
    products = result.rows;
  } catch (err) {
    console.log('Database not connected yet.');
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-red-600">🛠️ KHELNA BAZAR - Admin Dashboard</h1>
          <Link href="/" className="bg-gray-800 text-white px-4 py-2 rounded font-semibold">
            View Store
          </Link>
        </div>

        {/* Add Product Form */}
        <form action={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border mb-8">
          <h2 className="md:col-span-2 font-bold text-lg text-gray-700">Add New Toy Product</h2>
          <input name="name" placeholder="Toy Name (e.g., Remote Control Car)" required className="border p-2 rounded" />
          <input name="price" type="number" placeholder="Price in BDT (e.g., 1200)" required className="border p-2 rounded" />
          <input name="category" placeholder="Category (e.g., Electronic / Action Figures)" required className="border p-2 rounded" />
          <input name="image_url" placeholder="Image URL (Direct link to image)" required className="border p-2 rounded" />
          <button type="submit" className="md:col-span-2 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">
            Publish Product
          </button>
        </form>

        {/* Inventory List */}
        <h2 className="font-bold text-lg mb-4">Current Inventory ({products.length} items)</h2>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center border p-3 rounded bg-white shadow-sm">
              <div className="flex items-center space-x-4">
                <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-gray-500">৳ {p.price} | {p.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}