const DEFAULT_CATEGORIES = [
  'Pet Food',
  'Pet Accessories',
  'Pet Toys',
  'Health & Wellness',
  'Grooming Supplies',
  'Feeding Supplies',
  'Housing & Cages',
];

const ensureDefaultCategories = async (CategoryModel) => {
  const operations = DEFAULT_CATEGORIES.map((name) => ({
    updateOne: {
      filter: { name },
      update: { $setOnInsert: { name, isActive: true } },
      upsert: true,
    },
  }));

  await CategoryModel.bulkWrite(operations, { ordered: false });
};

module.exports = {
  DEFAULT_CATEGORIES,
  ensureDefaultCategories,
};
