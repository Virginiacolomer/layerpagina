-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "colors" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colorCount" INTEGER NOT NULL DEFAULT 0;
