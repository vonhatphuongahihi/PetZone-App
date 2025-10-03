-- CreateTable
CREATE TABLE "public"."stores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatar_url" TEXT,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "public"."stores"("slug");

-- AddForeignKey
ALTER TABLE "public"."stores" ADD CONSTRAINT "stores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
