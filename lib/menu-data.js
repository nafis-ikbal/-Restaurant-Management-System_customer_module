import { db } from "@/lib/db";

const formatPreparationTime = (minimum, maximum) =>
  minimum === maximum ? `${minimum} min` : `${minimum}-${maximum} min`;

export async function getMenuData() {
  const [
    categories,
    menuItems,
    ingredients,
    menuItemIngredients,
    customizationGroups,
    customizationOptions,
    menuItemCustomizationGroups,
  ] = await Promise.all([
    db.orm.public.Category.where({ isActive: true }).all(),
    db.orm.public.MenuItem.where({ isAvailable: true }).all(),
    db.orm.public.Ingredient.all(),
    db.orm.public.MenuItemIngredient.all(),
    db.orm.public.CustomizationGroup.all(),
    db.orm.public.CustomizationOption.where({ isAvailable: true }).all(),
    db.orm.public.MenuItemCustomizationGroup.all(),
  ]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const ingredientById = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
  const groupById = new Map(customizationGroups.map((group) => [group.id, group]));
  const optionsByGroupId = new Map();
  for (const option of customizationOptions) {
    const options = optionsByGroupId.get(option.groupId) ?? [];
    options.push({
      id: option.id,
      name: option.name,
      priceDelta: Number(option.priceDelta),
      displayOrder: option.displayOrder,
    });
    optionsByGroupId.set(option.groupId, options);
  }

  const groupsByMenuItemId = new Map();
  for (const link of menuItemCustomizationGroups) {
    const group = groupById.get(link.groupId);
    if (!group) continue;
    const groups = groupsByMenuItemId.get(link.menuItemId) ?? [];
    groups.push({
      id: group.id,
      name: group.name,
      displayOrder: group.displayOrder,
      isRequired: link.isRequired,
      minimumSelections: link.minimumSelections,
      maximumSelections: link.maximumSelections,
      options: (optionsByGroupId.get(group.id) ?? []).sort(
        (left, right) => left.displayOrder - right.displayOrder,
      ),
    });
    groupsByMenuItemId.set(link.menuItemId, groups);
  }
  const ingredientsByMenuItemId = new Map();

  for (const link of menuItemIngredients) {
    const ingredient = ingredientById.get(link.ingredientId);
    if (!ingredient) continue;

    const itemIngredients = ingredientsByMenuItemId.get(link.menuItemId) ?? [];
    itemIngredients[link.displayOrder] = ingredient.name;
    ingredientsByMenuItemId.set(link.menuItemId, itemIngredients);
  }

  return {
    categories: ["All", ...categories.map((category) => category.name)],
    menuItems: menuItems
      .map((item) => {
        const category = categoryById.get(item.categoryId);
        if (!category) return null;

        return {
          id: item.slug,
          name: item.name,
          price: Number(item.price),
          image: item.imageUrl,
          description: item.description,
          category: category.name,
          buildable: item.isBuildable,
          ingredients: (ingredientsByMenuItemId.get(item.id) ?? []).filter(Boolean),
          preparationTime: formatPreparationTime(
            item.preparationTimeMin,
            item.preparationTimeMax,
          ),
          customizationGroups: (groupsByMenuItemId.get(item.id) ?? []).sort(
            (left, right) => left.displayOrder - right.displayOrder,
          ),
        };
      })
      .filter(Boolean),
  };
}