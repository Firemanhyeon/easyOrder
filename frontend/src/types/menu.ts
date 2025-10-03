export interface MenuCategory {
  id: number;
  name: string;
  display_order: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  is_available: boolean;
}
