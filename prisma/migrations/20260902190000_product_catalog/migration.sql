-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "requiresCartorio" BOOLEAN NOT NULL DEFAULT true,
    "hasSearchFee" BOOLEAN NOT NULL DEFAULT false,
    "searchFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hasApostilleOption" BOOLEAN NOT NULL DEFAULT false,
    "apostillePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hasShippingOption" BOOLEAN NOT NULL DEFAULT false,
    "shippingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "priceMode" TEXT NOT NULL DEFAULT 'national',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductField" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "placeholder" TEXT,
    "helperText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "visibleWhen" JSONB,
    "dataSource" TEXT,
    "price" DECIMAL(10,2),
    "priceByUf" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_sortOrder_idx" ON "Product"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductField_productId_fieldKey_key" ON "ProductField"("productId", "fieldKey");

-- CreateIndex
CREATE INDEX "ProductField_productId_sortOrder_idx" ON "ProductField"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_kind_state_format_key" ON "ProductPrice"("productId", "kind", "state", "format");

-- CreateIndex
CREATE INDEX "ProductPrice_productId_idx" ON "ProductPrice"("productId");

-- AddForeignKey
ALTER TABLE "ProductField" ADD CONSTRAINT "ProductField_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
