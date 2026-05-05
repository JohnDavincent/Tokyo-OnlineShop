export type UnitList = {
  unit: string;
  convertQuantity: number;
  sellPrice: number;
  status: string;
};

export type ApiProduct = {
  productId?: string;
  id?: string;
  productName: string;
  status: string;
  url: string;
  altText: string;
  category: string;
  subCategory?: string;
  unitList: UnitList[];
};

export type ApiCategory = {
  id: string;
  categoryName: string;
  altText: string | null;
  imageUrl: string | null;
};

export type ApiSubCategory = {
  id: string;
  subCategory: string;
};

export type ApiImage = {
  url: string;
  productName: string | null;
  altText: string | null;
  isPrimary: boolean;
  slug: string | null;
};

export type ApiUnit = {
  id: string | null;
  unit: string;
  convertUnit: string | null;
  basePrice: number | null;
  sellPrice: number | null;
  convertQuantity?: number;
  status?: string;
};

export type ApiProductDetail = {
  baseWeight: number;
  brand: string;
  category: string;
  description: string;
  imageList: ApiImage[];
  name: string;
  sku: string;
  stock: number | null;
  subCategory: string;
  unitList: ApiUnit[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  value: number;
  data: T;
};
