import { getAdminProducts } from "@/server/actions/product-actions";
import { getCategoriesAction } from "@/server/actions/category-actions";
import { AdminProductsClient } from "@/components/admin/admin-products-client";
import { requireStaff } from "@/lib/authorization-guards";

export const metadata = {
  title: "Toy Catalog — Admin Console | Khelna Bazar",
};

export default async function AdminProductsPage() {
  await requireStaff("/admin/products");

  const [productsRes, categoriesRes] = await Promise.all([
    getAdminProducts(),
    getCategoriesAction(),
  ]);

  return (
    <div className="space-y-6">
      <AdminProductsClient
        initialProducts={productsRes.products || []}
        categories={(categoriesRes as any).categories || []}
      />
    </div>
  );
}
