import { v4 as uuidv4 } from 'uuid';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { MenuItemRepository } from '../repositories/MenuItemRepository';
import { getDatabase } from '../database';
import { MenuItemInput, MenuItemRow, CategoryRow } from '../types';
import { BadRequestError, NotFoundError } from './errors';

export interface MenuCategory extends CategoryRow {
  items: MenuItemRow[];
}

export class MenuService {
  constructor(
    private categories = new CategoryRepository(),
    private menuItems = new MenuItemRepository()
  ) {}

  getCategories(storeId: string): CategoryRow[] {
    return this.categories.findByStore(storeId);
  }

  // 카테고리별 그룹화된 메뉴 (고객용: 판매 가능만)
  getMenu(storeId: string, categoryId?: string, onlyAvailable = true): MenuCategory[] {
    const categories = this.categories.findByStore(storeId);
    const items = this.menuItems.findByStore(storeId, { onlyAvailable, categoryId });
    return categories.map((category) => ({
      ...category,
      items: items.filter((item) => item.category_id === category.id),
    }));
  }

  getMenuItem(storeId: string, itemId: string): MenuItemRow {
    const item = this.menuItems.findById(storeId, itemId);
    if (!item) throw new NotFoundError('Menu item not found');
    return item;
  }

  private validateInput(input: Partial<MenuItemInput>, requireAll: boolean): void {
    if (requireAll) {
      if (!input.name || !input.categoryId || input.price === undefined) {
        throw new BadRequestError('name, price, categoryId are required');
      }
    }
    if (input.price !== undefined) {
      if (!Number.isInteger(input.price) || input.price < 0) {
        throw new BadRequestError('price must be an integer >= 0');
      }
    }
  }

  createMenuItem(storeId: string, input: MenuItemInput): MenuItemRow {
    this.validateInput(input, true);
    const category = this.categories.findById(storeId, input.categoryId);
    if (!category) throw new BadRequestError('Invalid categoryId');

    const id = uuidv4();
    this.menuItems.insert({
      id,
      store_id: storeId,
      category_id: input.categoryId,
      name: input.name,
      price: input.price,
      description: input.description ?? null,
      image_url: input.imageUrl ?? null,
      sort_order: input.sortOrder ?? 0,
      is_available: input.isAvailable === false ? 0 : 1,
    });
    return this.getMenuItem(storeId, id);
  }

  updateMenuItem(storeId: string, itemId: string, input: Partial<MenuItemInput>): MenuItemRow {
    this.validateInput(input, false);
    const existing = this.menuItems.findById(storeId, itemId);
    if (!existing) throw new NotFoundError('Menu item not found');

    const fields: Record<string, unknown> = {};
    if (input.categoryId !== undefined) fields.category_id = input.categoryId;
    if (input.name !== undefined) fields.name = input.name;
    if (input.price !== undefined) fields.price = input.price;
    if (input.description !== undefined) fields.description = input.description;
    if (input.imageUrl !== undefined) fields.image_url = input.imageUrl;
    if (input.sortOrder !== undefined) fields.sort_order = input.sortOrder;
    if (input.isAvailable !== undefined) fields.is_available = input.isAvailable ? 1 : 0;

    this.menuItems.update(storeId, itemId, fields);
    return this.getMenuItem(storeId, itemId);
  }

  deleteMenuItem(storeId: string, itemId: string): void {
    const changes = this.menuItems.delete(storeId, itemId);
    if (changes === 0) throw new NotFoundError('Menu item not found');
  }

  reorderMenuItems(storeId: string, orderedIds: string[]): void {
    const db = getDatabase();
    const tx = db.transaction(() => {
      orderedIds.forEach((id, index) => {
        this.menuItems.updateSortOrder(storeId, id, index + 1);
      });
    });
    tx();
  }

  createCategory(storeId: string, name: string, sortOrder: number): CategoryRow {
    if (!name) throw new BadRequestError('Category name is required');
    const id = uuidv4();
    this.categories.insert(id, storeId, name, sortOrder);
    return this.categories.findById(storeId, id)!;
  }
}
